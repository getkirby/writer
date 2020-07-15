import Clone from "./Clone.js";
import History from "./History.js";
import Parser from "./Parser.js";

export default (element, params = {}) => {

  const defaults = {
    formats: {},
    history: 100,
    onCommit: () => {},
    onRedo: () => {},
    onUndo: () => {}
  };

  const options = { ...defaults, ...params };
  const history = History(options.history);

  let doc = element ? Parser(element, options.formats) : [];

  const activeFormats = (start, length) => {
    start  = startAt(start);
    length = length || lengthAfter(start);

    let formats = [];

    for (let x = start; x < start + length; x++) {
      const character = doc[x];
      if (character) {
        Object.keys(character.format).forEach(formatName => {
          if (formats.includes(formatName) === false) {
            /**
            * check if this format applies to all
            * characters in the selection
            */
            if (hasFormat(formatName, start, length)) {
              formats.push(formatName);
            }
          }
        });
      };
    }

    return formats;
  };

  const activeLink = (start, length) => {
    let link = false;

    get(start, length).forEach(char => {
      Object.keys(char.format).forEach(formatName => {
        if (formatName === "link") {
          link = char.format.link;
        }
      });
    });

    return link;
  };

  const addFormat = (format, start, length, attributes) => {
    start  = startAt(start);
    length = length || lengthAfter(start);

    for (let x = start; x < start + length; x++) {
      if (doc[x]) {
        doc[x].format[format] = attributes || true;
      }
    }

    commit(doc, "addFormat", {
      format,
      attributes,
      start,
      length
    })
  };

  const append = (content) => {
    doc = doc.concat(content);
    commit(doc, "append", { content });
  };

  const clone = () => {
    return Clone(doc);
  };

  const commit = (doc, action, args) => {
    remember(doc, action, args);
    options.onCommit(doc, action, args);
    replace(doc);
  };

  const endAt = (end) => {
    if (Number.isInteger(end) === false || end === -1) {
      return doc.length - 1;
    }

    return end;
  };

  const get = (start, length) => {
    start  = startAt(start);
    length = length || lengthAfter(start);
    let result = [];

    for (let x = start; x < start + length; x++) {
      if (doc[x]) {
        result.push(doc[x]);
      }
    }

    return result;
  };

  const hasFormat = (format, start, length) => {
    start = startAt(start);
    length = length || lengthAfter(start);

    for (let x = start; x < start + length; x++) {
      if (doc[x].format[format] != undefined === false) {
        return false;
      }
    }

    return true;
  };

  const htmlElement = (element) => {

    const elementFormats = Object.keys(element.format || {});

    /**
    * Make sure that HTML entities
    * in strings don't cause any unexpected
    * issues and unwanted XSS injections
    */
    let p = document.createElement("p");
    p.textContent = element.text;

    let html = p.innerHTML;

    if (elementFormats.length === 0) {
      return html;
    }

    elementFormats.forEach(formatName => {
      if (options.formats[formatName]) {
        html = options.formats[formatName].html(html, element.format[formatName]);
      } else {
        html = element.text;
      }
    });

    return html;
  };

  const inject = (items, start) => {
    start = endAt(start);

    doc = [
      ...doc.slice(0, start),
      ...items,
      ...doc.slice(start)
    ];

    commit(doc, "inject", { items, start: start + 1 });
  };

  const insertText = (text, position) => {
    if (text.length === 0) {
      return;
    }

    // insert multiple characters at once
    if (text.length > 1) {
      [...text].forEach(character => {
        insertText(character, position);
        position++;
      });
      return;
    }

    // sanitize the position
    position = Number.isInteger(position) ? position : doc.length;

    // copy the format at the starting position
    const format = doc[position] ? doc[position].format : {};

    doc.splice(position, 0, {
      text: text,
      format: format
    });

    commit(doc, "insertText", { text, start: position + 1 });
  };

  const length = () => {
    return doc.length;
  };

  const lengthAfter = (start) => {
    start = start || 0;
    let lengthAfter = length() - start;
    return lengthAfter < 0 ? 0 : lengthAfter;
  };

  const recall = (action, callback) => {
    const memory = history[action]();
    if (memory) {
      doc = Clone(memory.doc);
      callback(memory.doc, memory.action, memory.args);
    }
  };

  const redo = () => {
    recall("redo", options.onRedo);
  };

  const remember = (doc, action, args) => {
    history.push({
      doc: Clone(doc),
      action: action,
      args: args
    });
  };

  const removeFormat = (format, start, length) => {
    start  = startAt(start);
    length = length || lengthAfter(start);

    for (let x = start; x < start + length; x++) {
      delete doc[x].format[format];
    }

    commit(doc, "removeFormat", { format, start, length });
  };

  const removeFormats = (start, length) => {
    start  = startAt(start);
    length = length || lengthAfter(start);

    for (let x = start; x < start + length; x++) {
      doc[x].format = {};
    }

    commit(doc, "removeFormats", { start, length });
  };

  const removeText = (position, length) => {
    position = endAt(position);
    length   = (!length || length < 1) ? 1 : length;

    doc.splice(position, length);

    commit(doc, "removeText", { position, length });
  };

  const replace = (newDoc) => {
    doc = Clone(newDoc);
    return doc;
  };

  const startAt = (start) => {
    return Number.isInteger(start) ? start : 0;
  };

  const toggleFormat = (format, start, length, attributes) => {
    if (hasFormat(format, start, length)) {
      removeFormat(format, start, length);
    } else {
      addFormat(format, start, length, attributes);
    }
  };

  const toHtml = (start, length) => {
    start  = startAt(start);
    length = length || lengthAfter(start);

    let html = [];

    toJson(start, length).forEach(curr => {
      html.push(htmlElement(curr));
    });

    html = html.join("");

    if (html.slice(-1) === "\n") {
      html += "&nbsp;";
    }

    return html;
  };

  const toJson = (start, length) => {
    start  = startAt(start);
    length = length || lengthAfter(start);

    const d = clone().slice(start, length);

    let json = [];
    let step = -1;

    d.forEach((curr, index) => {

      const prev = d[index - 1] || {};

      const prevId = JSON.stringify({ format: prev.format });
      const currId = JSON.stringify({ format: curr.format });

      if (!d[index - 1] || prevId !== currId) {
        json.push({...curr});
        step++;
      } else if (json[step]) {
        json[step].text += curr.text;
      }

    });

    return json;
  };

  const toText = (start, length) => {
    start  = startAt(start);
    length = length || lengthAfter(start);

    let text = "";

    clone().slice(start, length).forEach(curr => {
      text += curr.text;
    });

    return text;
  };

  const undo = () => {
    recall("undo", options.onUndo);
  };

  /**
   * Keep the initial state of the document
   * in history
   */
  remember(doc, "init", {});

  return {
    activeFormats,
    activeLink,
    addFormat,
    append,
    clone,
    doc,
    get,
    hasFormat,
    inject,
    insertText,
    length,
    lengthAfter,
    redo,
    removeFormat,
    removeFormats,
    removeText,
    replace,
    toggleFormat,
    toHtml,
    toJson,
    toText,
    undo
  };

};

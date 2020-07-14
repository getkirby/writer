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

  let doc = Parser(element, options.formats);

  const activeFormats = (start, end) => {
    start = startAt(start);
    end = startAt(end);

    let formats = [];

    for (let x = start; x < end; x++) {
      const character = doc[x];
      if (character) {
        Object.keys(character.format).forEach(formatName => {
          if (formats.includes(formatName) === false) {
            /**
            * check if this format applies to all
            * characters in the selection
            */
            if (hasFormat(formatName, start, end)) {
              formats.push(formatName);
            }
          }
        });
      };
    }

    return formats;
  };

  const activeLink = (start, end) => {
    start = startAt(start);
    end = startAt(end);

    let link = false;

    get(start, end).forEach(char => {
      Object.keys(char.format).forEach(formatName => {
        if (formatName === "link") {
          link = char.format.link;
        }
      });
    });

    return link;
  };

  const addFormat = (format, attributes, start, end) => {
    start = startAt(start);
    end   = endAt(end);

    for (let x = start; x < end; x++) {
      if (doc[x]) {
        doc[x].format[format] = attributes || true;
      }
    }

    commit(doc, "addFormat", {
      format,
      attributes,
      start,
      end
    })
  };

  const append = (content) => {
    doc.concat(content);
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
    if (end === undefined || end === false) {
      return doc.length - 1;
    }

    return end;
  };

  const get = (start, end) => {
    start = startAt(start);
    end = endAt(end);
    let result = [];

    for (let x = start; x < end; x++) {
      if (doc[x]) {
        result.push(doc[x]);
      }
    }

    return result;
  };

  const hasFormat = (format, start, end) => {
    start = startAt(start);
    end = endAt(end);

    for (let x = start; x < end; x++) {
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
      html = options.formats[formatName].html(html, element.format[formatName]);
    });

    return html;
  };

  const insertText = (text, start) => {
    start = endAt(start);

    const format = doc[start] ? doc[start].format : {};

    doc.splice(start, 0, {
      text: text,
      format: format
    });

    commit(doc, "insertText", { text, start: start + 1 });
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

  const removeFormat = (format, start, end) => {
    start = startAt(start);
    end   = endAt(end);

    for (let x = start; x < end; x++) {
      delete doc[x].format[format];
    }

    commit(doc, "removeFormat", { format, start, end });
  };

  const removeFormats = (start, end) => {
    start = startAt(start);
    end   = endAt(end);

    for (let x = start; x < end; x++) {
      doc[x].format = {};
    }

    commit(doc, "removeFormats", { start, end });
  };

  const removeText = (start, length) => {
    start  = endAt(start);
    length = (!length || length < 1) ? 1 : length;

    doc.splice(start, length);

    commit(doc, "removeText", { start, length });
  };

  const replace = (newDoc) => {
    doc = Clone(newDoc);
    return doc;
  };

  const startAt = (start) => {
    return start || 0;
  };

  const toggleFormat = (format, attributes, start, end) => {
    start = startAt(start);
    end   = endAt(end);

    if (hasFormat(format, start, end)) {
      removeFormat(format, start, end);
    } else {
      addFormat(format, attributes, start, end);
    }
  };

  const toHtml = (start, end) => {
    start = startAt(start);
    end = endAt(end);

    let html = [];

    toJson(start, end).forEach(curr => {
      html.push(htmlElement(curr));
    });

    html = html.join("");

    if (html.slice(-1) === "\n") {
      html += "&nbsp;";
    }

    return html;
  };

  const toJson = (start, end) => {
    start = startAt(start);
    end = endAt(end);

    const d = clone().slice(start, end);

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

  const toText = (start, end) => {
    let text = "";

    clone().slice(start, end).forEach(curr => {
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
    insertText,
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

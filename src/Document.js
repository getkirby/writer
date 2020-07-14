import Clone from "./Clone.js";
import Parser from "./Parser.js";

export default (element, formats = {}) => {

  let doc = Parser(element, formats);

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
      addFormatAt(format, attributes, x);
    }
  };

  const addFormatAt = (format, attributes, index) => {
    if (doc[index]) {
      doc[index].format[format] = attributes || true;
    }

    replace(doc);
  };

  const append = (content) => {
    replace(doc.concat(content));
  };

  const clone = () => {
    return Clone(doc);
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
      if (hasFormatAt(format, x) === false) {
        return false;
      }
    }

    return true;
  };

  const hasFormatAt = (format, index) => {
    return doc[index].format[format] != undefined;
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
      html = formats[formatName].html(html, element.format[formatName]);
    });

    return html;
  };

  const insertTextAt = (text, at) => {
    at = endAt(at);

    const format = doc[at] ? doc[at].format : {};

    doc.splice(at, 0, {
      text: text,
      format: format
    });

    replace(doc);
  };

  const removeFormat = (format, start, end) => {
    start = startAt(start);
    end   = endAt(end);

    for (let x = start; x < end; x++) {
      removeFormatAt(format, x);
    }
  };

  const removeFormatAt = (format, index) => {
    delete doc[index].format[format];

    replace(doc);
  };

  const removeFormats = (start, end) => {
    start = startAt(start);
    end   = endAt(end);

    for (let x = start; x < end; x++) {
      doc[x].format = {};
    }

    replace(doc);
  };

  const removeTextAt = (at, length) => {
    at = at !== undefined ? at : doc.length - 1;
    length = (!length || length < 1) ? 1 : length;

    doc.splice(at, length);
    replace(doc);
  };

  const replace = (newDocument) => {
    doc = Clone(newDocument);
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

  const toggleFormatAt = (format, attributes, index) => {
    if (hasFormatAt(format, index)) {
      removeFormatAt(format, index);
    } else {
      addFormatAt(format, attributes, index);
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

  return {
    activeFormats,
    activeLink,
    addFormat,
    addFormatAt,
    append,
    clone,
    doc,
    get,
    hasFormat,
    hasFormatAt,
    insertTextAt,
    removeFormat,
    removeFormatAt,
    removeFormats,
    removeTextAt,
    replace,
    toggleFormat,
    toggleFormatAt,
    toHtml,
    toJson,
    toText
  };

};

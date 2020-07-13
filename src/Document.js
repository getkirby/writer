import Parser from "./Parser.js";
import Formats from "./Formats.js";

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
  };

  const append = (content) => {
    doc = doc.concat(content);
  };

  const endAt = (end) => {
    if (end === undefined || end === false) {
      return doc.length - 1;
    }

    return end;
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
  };

  const removeFormats = (start, end) => {
    start = startAt(start);
    end   = endAt(end);

    for (let x = start; x < end; x++) {
      doc[x].format = {};
    }
  };

  const removeTextAt = (at, length) => {
    at = at !== undefined ? at : doc.length - 1;
    length = (!length || length < 1) ? 1 : length;

    doc.splice(at, length);
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

  const toHtml = () => {
    let html = [];

    toJson().forEach(curr => {
      html.push(htmlElement(curr));
    });

    html = html.join("");

    if (html.slice(-1) === "\n") {
      html += "&nbsp;";
    }

    return html;
  };

  const toJson = () => {
    let json = [];
    let step = -1;

    doc.forEach((curr, index) => {

      const prev = doc[index - 1] || {};

      const prevId = JSON.stringify({ format: prev.format });
      const currId = JSON.stringify({ format: curr.format });

      if (!doc[index - 1] || prevId !== currId) {
        json.push({...curr});
        step++;
      } else if (json[step]) {
        json[step].text += curr.text;
      }

    });

    return json;
  };

  const toText = () => {
    let text = "";

    doc.forEach(curr => {
      text += curr.text;
    });

    return text;
  };

  return {
    activeFormats,
    addFormat,
    addFormatAt,
    append,
    doc,
    hasFormat,
    hasFormatAt,
    insertTextAt,
    removeFormat,
    removeFormatAt,
    removeFormats,
    removeTextAt,
    toggleFormat,
    toggleFormatAt,
    toHtml,
    toJson,
    toText
  };

};

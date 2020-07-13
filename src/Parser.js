export default (node, formats = {}) => {

  if (typeof node === "string") {
    node = document.querySelector(node);
  }

  const inline = [
    "b",
    "big",
    "i",
    "small",
    "tt",
    "abbr",
    "acronym",
    "cite",
    "code",
    "dfn",
    "em",
    "kbd",
    "strong",
    "samp",
    "var",
    "a",
    "bdo",
    "br",
    "img",
    "map",
    "object",
    "q",
    "script",
    "span",
    "sub",
    "sup",
    "button",
    "input",
    "label",
    "select",
    "textarea"
  ];

  /**
  * Walk through every character in the text
  * node and apply the format from the parent node to it.
  */
  const charsInTextNode = (node, format = {}) => {
    let chars = [];

    Object.keys(format).forEach(key => {
      if (format[key] === false) {
        delete format[key];
      }
    });

    [...node.data].forEach(char => {
      chars.push({
        text: char,
        format: format
      });
    });

    return chars;
  };

  /**
  * Walk through all children,
  * extract all characters and apply
  * the correct formats
  */
  const charsInNode = (node, parentFormats = {}) => {
    let chars = [];

    Array.from(node.childNodes).forEach(child => {
      if (child.nodeName === "#text") {
        chars.push(...charsInTextNode(child, parentFormats));
      } else if (child.nodeName === "BR") {
        chars.push({
          text: "\n",
          format: {}
        });
      } else {
        const childFormats = nodeFormats(child, parentFormats);
        chars.push(...charsInNode(child, childFormats));

        if (inline.includes(child.nodeName.toLowerCase()) === false) {
          chars.push({
            text: "\n",
            format: {}
          });
        }
      }
    });

    return chars;
  };

  /**
  * Detect all node formats and return
  * an object with each applied format.
  */
  const nodeFormats = (node, parentFormats) => {
    let result = {};

    Object.keys(formats).forEach(formatName => {
      if (parentFormats[formatName] === true || typeof parentFormats[formatName] === "object") {
        result[formatName] = parentFormats[formatName];
        return;
      }

      if (!formats[formatName] || !formats[formatName].parser) {
        console.error(`The parser for ${formatName} does not exist`);
      } else {
        const format = formats[formatName].parser(node, parentFormats);

        if (format) {
          result[formatName] = format;
        }
      }

    });

    return result;
  };

  /**
  * for some reason we need to clone the array
  * with the JSON trick here to avoid some weird
  * reference issues later. I guess it has something
  * to do with merging arrays
  */
  return JSON.parse(JSON.stringify(charsInNode(node)));

};

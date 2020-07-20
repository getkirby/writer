import Clone from "./Clone.js";
import Inliner from "./Inliner.js";

export default (node, formats = {}) => {

  if (typeof node === "string") {
    node = document.querySelector(node);
  }

  const inline = [
    "a",
    "abbr",
    "acronym",
    "b",
    "bdi",
    "bdo",
    "big",
    "br",
    "button",
    "cite",
    "code",
    "del",
    "dfn",
    "em",
    "i",
    "img",
    "input",
    "kbd",
    "label",
    "map",
    "object",
    "q",
    "samp",
    "script",
    "select",
    "small",
    "span",
    "strong",
    "sub",
    "sup",
    "textarea",
    "tt",
    "var",
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
      } else {
        const childFormats = nodeFormats(child, parentFormats);
        chars.push(...charsInNode(child, childFormats));
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
   * Remove all block elements from the given node
   */
  const html = Inliner(node, inline);

  /**
   * Create a temporary node container
   * for the next steps
   */
  let container = document.createElement("div");
  container.innerHTML = html;

  /**
   * for some reason we need to clone the array
   * with the JSON trick here to avoid some weird
   * reference issues later. I guess it has something
   * to do with merging arrays
   */
  return Clone(charsInNode(container));

};

var Cursor = (container, selection) => {

  if (typeof container === "string") {
    container = document.querySelector(container);
  }

  return {
    isInFirstLine() {
      const containerRect = selection.containerRect();
      const cursorRect = this.rect();
      return cursorRect.top === containerRect.top;
    },
    isInLastLine() {
      const containerRect = selection.containerRect();
      const cursorRect = this.rect();
      return cursorRect.bottom === containerRect.bottom;
    },
    rect() {
      let range = selection.range().cloneRange();
      range.collapse();
      return range.getBoundingClientRect();
    },
    set(position) {
      return selection.select(position);
    },
    position() {
      return selection.start();
    },
  };

};

var DefaultFormats = {
  bold: {
    html(content) {
      return `<strong>${content}</strong>`;
    },
    parser(node) {

      const boldElements = [
        "B",
        "H1",
        "H2",
        "H3",
        "H4",
        "H5",
        "H6",
        "STRONG"
      ];

      if (boldElements.includes(node.nodeName)) {
        return true;
      }

      const bold = ["bold", "bolder", "500", "600", "700", "800", "900"];

      if (bold.includes(node.style.fontWeight)) {
        return true;
      }

      return false;
    }
  },
  code: {
    html(content) {
      return `<code>${content}</code>`;
    },
    parser(node) {
      return node.nodeName === "CODE";
    }
  },
  italic: {
    html(content) {
      return `<em>${content}</em>`;
    },
    parser(node) {
      if (["I", "EM"].includes(node.nodeName)) {
        return true;
      }

      if (node.style.fontStyle === "italic") {
        return true;
      }

      return false;
    }
  },
  link: {
    html(content, attr = {}) {
      if (!attr.href) {
        return content;
      }

      let attrs = `href="${attr.href}"`;
      let rel   = `rel="noopener noreferrer"`;

      if (attr.rel) {
        rel = `rel="noopener noreferrer ${attr.rel}"`;
      }

      if (attr.target) {
        attrs += ` target="${attr.target}"`;
      }

      if (attr.title) {
        attrs += ` title="${attr.title}"`;
      }

      return `<a ${attrs} ${rel}>${content}</a>`;
    },
    parser(node) {
      if (node.nodeName !== "A") {
        return false;
      }

      const href = node.getAttribute("href");

      if (!href) {
        return false;
      }

      return {
        href: href,
        rel: node.getAttribute("rel"),
        target: node.getAttribute("target"),
        title: node.getAttribute("title"),
      };
    }
  },
  strikeThrough: {
    html(content) {
      return `<del>${content}</del>`;
    },
    parser(node) {
      if (node.nodeName === "DEL") {
        return true;
      }

      if (node.style.textDecoration === "line-through") {
        return true;
      }

      return false;
    }
  },
  subscript: {
    html(content) {
      return `<sub>${content}</sub>`;
    },
    parser(node) {
      if (node.nodeName === "SUB") {
        return true;
      }

      if (node.style.verticalAlign === "sub") {
        return true;
      }

      return false;
    }
  },
  superscript: {
    html(content) {
      return `<sup>${content}</sup>`;
    },
    parser(node) {
      if (node.nodeName === "SUP") {
        return true;
      }

      if (node.style.verticalAlign === "super") {
        return true;
      }

      return false;
    }
  },
};

var Clone = (object) => {
  return JSON.parse(JSON.stringify(object));
};

/**
 * Created by tushar.mathur on 08/01/16.
 */

/**
 * The module works only when an immutable object is being pushed.
 * This helps in detecting changes faster and also pushing it on the stack only if there is a real change.
 *
 * Immutable JS is one such library, but you can use it any other immutable library such as —
 * {@link https://github.com/rtfeldman/seamless-immutable seamless-immutable}
 * or even the native immutables such as `string` , `Boolean`, `RegEx` etc.
 *
 *  @external Immutable
 * @see {@link https://facebook.github.io/immutable-js}
 */

/**
 * @example
 * ```javascript
 * const histable = require('histable')
 * const history = histable.create()
 * history.push(1)
 * history.push(2)
 * history.push(3)
 * history.undo() // 2
 * history.undo() // 1
 * history.undo() // undefined
 * ```
 * @module histable
 */
const getLast = list => list[list.length - 1];
const toArray = (x, i) => Array.prototype.slice.call(x, i);

/**
 * Creates a new {@link History}
 * @class
 * @param {number} [limit=100] - Limits the maximum number of {@link undo} operations.
 */
class History {
  constructor(limit) {
    this.UNDO_HISTORY = [];
    this.REDO_HISTORY = [];
    this.limit = limit > 0 ? limit + 1 : 100;
  }

  /**
   * Adds the `value` to the history data structure.
   * Addition only happens if the new value is not the same as the last one.
   * @param {...external:Immutable} value - the {@link external:Immutable} that needs to be saved.
   * @returns {History}
   */
  push() {
    const values = toArray(arguments);
    values.forEach(value => {
      const isDefined = value !== undefined;
      const last = getLast(this.UNDO_HISTORY);
      const isDiff = last !== value;
      if ([isDefined, isDiff].every(Boolean)) {
        this.UNDO_HISTORY.push(value);
      }
      if (this.UNDO_HISTORY.length > this.limit) {
        this.UNDO_HISTORY.shift();
      }
      this.REDO_HISTORY = [];
    });
    return this
  }

  /**
   * Moves the state one step forward if possible
   * @returns {external:Immutable}
   */
  redo() {
    if (this.REDO_HISTORY.length > 0) {
      const pop = this.REDO_HISTORY.pop();
      this.UNDO_HISTORY.push(pop);
      return pop
    }
  }

  /**
   * Moves the state one step backwords if possible
   * @returns {external:Immutable}
   */
  undo() {
    if (this.UNDO_HISTORY.length > 0) {
      const pop = this.UNDO_HISTORY.pop();
      this.REDO_HISTORY.push(pop);
      return getLast(this.UNDO_HISTORY)
    }
  }

  /**
   * Determines if {@link undo} is possible or not
   * @returns {boolean}
   */
  get canUndo() {
    return this.UNDO_HISTORY.length > 1
  }

  /**
   * Determines if {@link redo} is possible or not
   * @returns {boolean}
   */
  get canRedo() {
    return this.REDO_HISTORY.length > 0
  }

  /**
   * A logging Util to view whats in the history data structure
   */
  log() {
    console.log('UNDO:', this.UNDO_HISTORY);
    console.log('REDO:', this.REDO_HISTORY);
  }

}

/**
 * Creates a new history object
 * @param {number} [limit] - Sets the maximum number of {@link undo} operations that one can perform.
 * Prevents the system from causing a memory leaks because of keeping an infinitely large history.
 * @returns {History}
 */
var History$1 = limit => new History(limit);

/**
 * Removes all block elements from the HTML
 * and trims the result
 */
var Inliner = (node, inline) => {

  const unwrapElement = (node) => {
    // get the element's parent node
    const parent = node.parentNode;

    // move all children out of the element
    while (node.firstChild) parent.insertBefore(node.firstChild, node);

    // remove the empty element
    parent.removeChild(node);
  };

  const isInline = (node) => {
    return inline.includes(node.nodeName.toLowerCase());
  };

  const hasBlockElements = (node) => {
    if (node.children.length === 0) {
      return false;
    }

    let result = false;

    Array.from(node.children).forEach(child => {
      // check child
      if (isInline(child) === false) {
        result = true;
        return;
      }

      // check children of child
      if (hasBlockElements(child)) {
        result = true;
      }
    });

    return result;
  };

  let blocks = [];

  const trimNode = (node) => {
    let html = node.innerHTML
      .trim()
      .replace(/[ ]{2,}/g, "")
      .replace(/[\n]{3,}/g, "\n\n");

    node.innerHTML = html;
    return node;
  };

  const keep = [
    "H1", "H2", "H3", "H4", "H5", "H6"
  ];

  const kill = [
    "area",
    "base",
    "col",
    "command",
    "embed",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "menuitem",
    "meta",
    "param",
    "object",
    "source",
    "svg",
    "track",
    "video",
    "wbr",
  ];

  // kill the following nodes
  Array.from(node.querySelectorAll(kill.join(","))).forEach(childNode => {
    childNode.parentNode.removeChild(childNode);
  });

  const removeBlockElements = (node) => {

    if (hasBlockElements(node) === false) {
      trimNode(node);

      if (node.innerHTML === "") {
        return;
      }

      if (keep.includes(node.nodeName)) {
        blocks.push(node.outerHTML);
      } else {
        blocks.push(node.innerHTML);
      }
      return;
    }

    Array.from(node.children).forEach(child => {
      removeBlockElements(child);

      if (isInline(child) === false) {
        trimNode(child);

        if (keep.includes(child.nodeName) === false) {
          unwrapElement(child);
        }
      }
    });
  };

  removeBlockElements(node);

  return blocks.join("\n\n");
};

var Parser = (node, formats = {}) => {

  if (typeof node === "string") {
    node = document.querySelector(node);
  }

  const inline = [
    "a",
    "abbr",
    "acronym",
    "b",
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

var Document = (element, params = {}) => {

  const defaults = {
    formats: {},
    history: 100,
    onCommit: () => {},
    onRedo: () => {},
    onUndo: () => {},
    triggers: {}
  };

  const options = { ...defaults, ...params };
  const history = History$1(options.history);
  const triggers = { ... defaults.triggers, ... params.triggers || {} };
  const triggerKeys = Object.keys(triggers);
  const triggerMaxLength = Math.max(...triggerKeys.map(key => key.length));

  let doc;

  if (Array.isArray(element) === true) {
    doc = element;
  } else {
    doc = element ? Parser(element, options.formats) : [];
  }

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
      }    }

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
    });
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

    /**
     * Trigger custom events based on inserted
     * text. This can be used to trigger a command
     * when "/ " is entered into the writer or
     * trigger Markdown conversions based on Markdown syntax
     */
     if (triggerKeys.length && doc.length <= triggerMaxLength) {
      const currentText = doc.map(char => char.text).join("");
      triggerKeys.some(key => {
        if (currentText === key) {
          triggers[key]();
          return true;
        }
      });
    }

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

(function () {
  var ContentSelect, SELF_CLOSING_NODE_NAMES, exports, _containedBy, _getChildNodeAndOffset, _getNodeRange, _getOffsetOfChildNode,
    __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ContentSelect = {};

  ContentSelect.Range = (function () {
    function Range(from, to) {
      this.set(from, to);
    }

    Range.prototype.isCollapsed = function () {
      return this._from === this._to;
    };

    Range.prototype.span = function () {
      return this._to - this._from;
    };

    Range.prototype.collapse = function () {
      return this._to = this._from;
    };

    Range.prototype.eq = function (range) {
      return this.get()[0] === range.get()[0] && this.get()[1] === range.get()[1];
    };

    Range.prototype.get = function () {
      return [this._from, this._to];
    };

    Range.prototype.select = function (element) {
      var docRange, endNode, endNodeLen, endOffset, startNode, startNodeLen, startOffset, _ref, _ref1;
      ContentSelect.Range.unselectAll();
      docRange = document.createRange();
      _ref = _getChildNodeAndOffset(element, this._from), startNode = _ref[0], startOffset = _ref[1];
      _ref1 = _getChildNodeAndOffset(element, this._to), endNode = _ref1[0], endOffset = _ref1[1];
      startNodeLen = startNode.length || 0;
      endNodeLen = endNode.length || 0;
      docRange.setStart(startNode, Math.min(startOffset, startNodeLen));
      docRange.setEnd(endNode, Math.min(endOffset, endNodeLen));
      return window.getSelection().addRange(docRange);
    };

    Range.prototype.set = function (from, to) {
      from = Math.max(0, from);
      to = Math.max(0, to);
      this._from = Math.min(from, to);
      return this._to = Math.max(from, to);
    };

    Range.prepareElement = function (element) {
      var i, node, selfClosingNodes, _i, _len, _results;
      selfClosingNodes = element.querySelectorAll(SELF_CLOSING_NODE_NAMES.join(', '));
      _results = [];
      for (i = _i = 0, _len = selfClosingNodes.length; _i < _len; i = ++_i) {
        node = selfClosingNodes[i];
        node.parentNode.insertBefore(document.createTextNode(''), node);
        if (i < selfClosingNodes.length - 1) {
          _results.push(node.parentNode.insertBefore(document.createTextNode(''), node.nextSibling));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Range.query = function (element) {
      var docRange, endNode, endOffset, range, startNode, startOffset, _ref;
      range = new ContentSelect.Range(0, 0);
      try {
        docRange = window.getSelection().getRangeAt(0);
      } catch (_error) {
        return range;
      }
      if (element.firstChild === null && element.lastChild === null) {
        return range;
      }
      if (!_containedBy(docRange.startContainer, element)) {
        return range;
      }
      if (!_containedBy(docRange.endContainer, element)) {
        return range;
      }
      _ref = _getNodeRange(element, docRange), startNode = _ref[0], startOffset = _ref[1], endNode = _ref[2], endOffset = _ref[3];
      range.set(_getOffsetOfChildNode(element, startNode) + startOffset, _getOffsetOfChildNode(element, endNode) + endOffset);
      return range;
    };

    Range.rect = function () {
      var docRange, marker, rect;
      try {
        docRange = window.getSelection().getRangeAt(0);
      } catch (_error) {
        return null;
      }
      if (docRange.collapsed) {
        marker = document.createElement('span');
        docRange.insertNode(marker);
        rect = marker.getBoundingClientRect();
        marker.parentNode.removeChild(marker);
        return rect;
      } else {
        return docRange.getBoundingClientRect();
      }
    };

    Range.unselectAll = function () {
      if (window.getSelection()) {
        return window.getSelection().removeAllRanges();
      }
    };

    return Range;

  })();

  SELF_CLOSING_NODE_NAMES = ['br', 'img', 'input'];

  _containedBy = function (nodeA, nodeB) {
    while (nodeA) {
      if (nodeA === nodeB) {
        return true;
      }
      nodeA = nodeA.parentNode;
    }
    return false;
  };

  _getChildNodeAndOffset = function (parentNode, parentOffset) {
    var childNode, childOffset, childStack, n, _ref;
    if (parentNode.childNodes.length === 0) {
      return [parentNode, parentOffset];
    }
    childNode = null;
    childOffset = parentOffset;
    childStack = (function () {
      var _i, _len, _ref, _results;
      _ref = parentNode.childNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        _results.push(n);
      }
      return _results;
    })();
    while (childStack.length > 0) {
      childNode = childStack.shift();
      switch (childNode.nodeType) {
        case Node.TEXT_NODE:
          if (childNode.textContent.length >= childOffset) {
            return [childNode, childOffset];
          }
          childOffset -= childNode.textContent.length;
          break;
        case Node.ELEMENT_NODE:
          if (_ref = childNode.nodeName.toLowerCase(), __indexOf.call(SELF_CLOSING_NODE_NAMES, _ref) >= 0) {
            if (childOffset === 0) {
              return [childNode, 0];
            } else {
              childOffset = Math.max(0, childOffset - 1);
            }
          } else {
            if (childNode.childNodes) {
              Array.prototype.unshift.apply(childStack, (function () {
                var _i, _len, _ref1, _results;
                _ref1 = childNode.childNodes;
                _results = [];
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                  n = _ref1[_i];
                  _results.push(n);
                }
                return _results;
              })());
            }
          }
      }
    }
    return [childNode, childOffset];
  };

  _getOffsetOfChildNode = function (parentNode, childNode) {
    var childStack, n, offset, otherChildNode, _ref, _ref1;
    if (parentNode.childNodes.length === 0) {
      return 0;
    }
    offset = 0;
    childStack = (function () {
      var _i, _len, _ref, _results;
      _ref = parentNode.childNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        _results.push(n);
      }
      return _results;
    })();
    while (childStack.length > 0) {
      otherChildNode = childStack.shift();
      if (otherChildNode === childNode) {
        if (_ref = otherChildNode.nodeName.toLowerCase(), __indexOf.call(SELF_CLOSING_NODE_NAMES, _ref) >= 0) {
          return offset + 1;
        }
        return offset;
      }
      switch (otherChildNode.nodeType) {
        case Node.TEXT_NODE:
          offset += otherChildNode.textContent.length;
          break;
        case Node.ELEMENT_NODE:
          if (_ref1 = otherChildNode.nodeName.toLowerCase(), __indexOf.call(SELF_CLOSING_NODE_NAMES, _ref1) >= 0) {
            offset += 1;
          } else {
            if (otherChildNode.childNodes) {
              Array.prototype.unshift.apply(childStack, (function () {
                var _i, _len, _ref2, _results;
                _ref2 = otherChildNode.childNodes;
                _results = [];
                for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                  n = _ref2[_i];
                  _results.push(n);
                }
                return _results;
              })());
            }
          }
      }
    }
    return offset;
  };

  _getNodeRange = function (element, docRange) {
    var childNode, childNodes, endNode, endOffset, endRange, i, startNode, startOffset, startRange, _i, _j, _len, _len1, _ref;
    childNodes = element.childNodes;
    startRange = docRange.cloneRange();
    startRange.collapse(true);
    endRange = docRange.cloneRange();
    endRange.collapse(false);
    startNode = startRange.startContainer;
    startOffset = startRange.startOffset;
    endNode = endRange.endContainer;
    endOffset = endRange.endOffset;
    if (!startRange.comparePoint) {
      return [startNode, startOffset, endNode, endOffset];
    }
    if (startNode === element) {
      startNode = childNodes[childNodes.length - 1];
      startOffset = startNode.textContent.length;
      for (i = _i = 0, _len = childNodes.length; _i < _len; i = ++_i) {
        childNode = childNodes[i];
        if (startRange.comparePoint(childNode, 0) !== 1) {
          continue;
        }
        if (i === 0) {
          startNode = childNode;
          startOffset = 0;
        } else {
          startNode = childNodes[i - 1];
          startOffset = childNode.textContent.length;
        }
        if (_ref = startNode.nodeName.toLowerCase, __indexOf.call(SELF_CLOSING_NODE_NAMES, _ref) >= 0) {
          startOffset = 1;
        }
        break;
      }
    }
    if (docRange.collapsed) {
      return [startNode, startOffset, startNode, startOffset];
    }
    if (endNode === element) {
      endNode = childNodes[childNodes.length - 1];
      endOffset = endNode.textContent.length;
      for (i = _j = 0, _len1 = childNodes.length; _j < _len1; i = ++_j) {
        childNode = childNodes[i];
        if (endRange.comparePoint(childNode, 0) !== 1) {
          continue;
        }
        if (i === 0) {
          endNode = childNode;
        } else {
          endNode = childNodes[i - 1];
        }
        endOffset = childNode.textContent.length + 1;
      }
    }
    return [startNode, startOffset, endNode, endOffset];
  };

  if (typeof window !== 'undefined') {
    window.ContentSelect = ContentSelect;
  }

  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = ContentSelect;
  }

}).call(undefined);

var Selection = (container) => {

  if (typeof container === "string") {
    container = document.querySelector(container);
  }

  return {
    ancestor() {
      const range = this.range();
      return range ? range.commonAncestorContainer : container;
    },
    container() {
      return container;
    },
    containerRect() {
      const range = document.createRange();
      range.selectNodeContents(container);
      return range.getBoundingClientRect();
    },
    end() {
      return this.start() + this.length();
    },
    /**
     * Checks if the selection is within
     * the container
     */
    isWithin() {
      if (!this.range()) {
        return false;
      }
      const ancestor = this.ancestor();
      return ancestor === container || container.contains(ancestor);
    },
    length() {
      return this.text().length;
    },
    object() {
      return document.getSelection();
    },
    range(clone = false) {
      const selection = this.object();
      let range = null;

      if (!selection) {
        return null;
      }

      try {
        range = selection.getRangeAt(0);
      } catch (e) {
        return null;
      }

      return clone === true ? range.cloneRange() : range;
    },
    rangeAfterCursor() {
      const range = this.range();
      const copy = this.range(true);

      if (!range || !copy) {
        return null;
      }

      copy.selectNodeContents(container);
      copy.setStart(range.endContainer, range.endOffset);
      return copy;
    },
    rangeBeforeCursor() {
      const range = this.range();
      const copy = this.range(true);

      if (!range || !copy) {
        return null;
      }

      copy.selectNodeContents(container);
      copy.setEnd(range.startContainer, range.startOffset);
      return copy;
    },
    rect() {
      const range = this.range();
      return range ? range.getBoundingClientRect() : false;
    },
    select(start, end) {
      end = end || start;

      // Create a new range
      let range = new ContentSelect.Range(start, end);

      // Select some content
      range.select(container);
    },
    start() {
      const rangeBeforeCursor = this.rangeBeforeCursor();

      if (!rangeBeforeCursor) {
        return 0;
      }

      return rangeBeforeCursor.toString().length;
    },
    text() {
      const range = this.range();
      return range ? range.toString() : "";
    },
  };
};

var Writer = (element, params) => {

  if (typeof element === "string") {
    element = document.querySelector(element);
  }

  /**
   * Default options and events
   */
  const defaults = {
    autofocus: false,
    breaks: true,
    formats: {},
    history: 100,
    onBlur: () => {},
    onChange: () => {},
    onFocus: () => {},
    onKeydown: () => {},
    onKeyup: () => {},
    onMousedown: () => {},
    onMouseup: () => {},
    onRedo: () => {},
    onSelection: () => {},
    onSelectionEnd: () => {},
    onSelectionStart: () => {},
    onUndo: () => {},
    placeholder: "",
    shortcuts: {},
    spellcheck: true,
    triggers: {},
  };

  const options = { ...defaults, ...params };
  const formats = { ...DefaultFormats, ...options.formats };

  const onHistory = (doc, action, args) => {
    update();
    if (args && args.start) {
      select(args.start, args.length);
    }
  };

  const doc = Document(element, {
    formats: formats,
    history: options.history,
    onRedo: (doc, action, args) => {
      onHistory(doc, action, args);
      options.onRedo(doc, action, args);
    },
    onUndo: (doc, action, args) => {
      onHistory(doc, action, args);
      options.onUndo(doc, action, args);
    },
    triggers: options.triggers
  });

  const selection = Selection(element);
  const cursor = Cursor(element, selection);

  let isSelecting = false;

  element.setAttribute("contenteditable", true);
  element.setAttribute("data-placeholder", options.placeholder);
  element.setAttribute("spellcheck", options.spellcheck);

  /**
   * All available editor commands
   */
  const commands = {
    bold() {
      format("bold");
    },
    code() {
      format("code");
    },
    delete() {
      let start  = selection.start();
      let length = selection.length();

      /**
       * With single character selections
       * the character before the cursor
       * should be removed
       */
      if (length === 0) {
        start  = start - 1;
        length = 1;

        /**
         * If the cursor is at the beginning
         * of the element, no character should
         * be removed. Otherwise it deletes
         * from the end, which leads to weird effects
         */
        if (start < 0) {
          return;
        }
      }

      doc.removeText(start, length);
      update();
      select(start);
    },
    deleteForward() {
      let start  = selection.start();
      let length = selection.length();

      if (length === 0) {
        length = 1;
      }

      doc.removeText(start, length);
      update();
      select(start);
    },
    enter() {
      if (options.breaks !== true) {
        return false;
      }

      const cursorPosition = cursor.position();
      doc.insertText("\n", cursorPosition);
      update();
      select(cursorPosition + 1);
    },
    insert(text, at) {
      doc.insertText(text, at);
      update();
      select(at + text.length);
    },
    italic() {
      format("italic");
    },
    link(href) {
      const start  = selection.start();
      const length = selection.length();

      doc.addFormat("link", start, length, { href });
      update();
      select(start, length);
    },
    paste(html) {
      let cursorPosition = cursor.position();
      let container = document.createElement("div");
      container.innerHTML = html;

      const parsed = Parser(container, formats);

      doc.inject(parsed, cursorPosition);
      update();
      select(cursorPosition + parsed.length);
    },
    strikeThrough() {
      format("strikeThrough");
    },
    subscript() {
      format("subscript");
    },
    superscript() {
      format("superscript");
    },
    unlink() {
      const start  = selection.start();
      const length = selection.length();

      doc.removeFormat("link", start, length);
      update();
      select(start, length);
    }
  };

  /**
   * Get all active formats in the selection
   */
  const activeFormats = () => {
    const start = selection.start();
    const length = selection.length();
    return doc.activeFormats(start, length);
  };

  /**
   * Get the last link and all its attributes
   * in the document selection
   */
  const activeLink = () => {
    const start  = selection.start();
    const length = selection.length();
    return doc.activeLink(start, length);
  };

  /**
   * Apply one of the registered commands
   */
  const command = (command, ...args) => {
    if (typeof command === "function") {
      return command.call(...args);
    } else if (commands[command]) {
      return commands[command](...args);
    }
  };

  /**
   * Focus the Writer element
   * at the given position (optional)
   */
  const focus = (position) => {
    select(position);
  };

  /**
   * Apply the given format
   * and optional attributes
   */
  const format = (format, attributes) => {
    const start  = selection.start();
    const length = selection.length();

    doc.toggleFormat(format, start, length, attributes);
    update();
    select(start, length);
  };

  const onSelectionEnd = () => {
    if (isSelecting === true) {
      isSelecting = false;
      options.onSelectionEnd(event);
    }
  };

  const onSelectionStart = () => {
    if (isSelecting === false) {
      isSelecting = true;
      options.onSelectionStart(event);
    }
  };

  /**
   * Redo the last step in history
   */
  const redo = () => {
    doc.redo();
  };

  /**
   * Select text in the editor
   */
  const select = (start, length) => {
    switch (start) {
      case "end":
        start = doc.length();
        break;
      case "start":
        start = 0;
        break;
    }

    isSelecting = true;
    selection.select(start, start + (length || 0));
  };

  /**
   * Undo the last step in history
   */
  const undo = () => {
    doc.undo();
  };

  /**
   * Update the HTML in the editor
   * after content changes or commands
   */
  const update = () => {
    const html = doc.toHtml();
    element.innerHTML = html;
    options.onChange(html);
  };

  /**
   * Some standard events
   */
  element.addEventListener("blur", options.onBlur);
  element.addEventListener("focus", options.onFocus);
  element.addEventListener("mousedown", options.onMousedown);

  /**
   * Use the document selectionchange event
   * to detect and trigger selection changes
   * for the editor
   */
  document.addEventListener("selectionchange", (event) => {
    if (selection.isWithin()) {
      onSelectionStart();
      options.onSelection(event);
    } else {
      onSelectionEnd();
    }
  });

  /**
  * Check if the selection ends on mouseup
  */
  element.addEventListener("mouseup", (event) => {
    options.onMouseup(event);
    onSelectionEnd();
  });

  /**
  * Check if the selection ends on keyup
  */
  element.addEventListener("keyup", (event) => {
    options.onKeyup(event);
    onSelectionEnd();
  });

  /**
  * Keyboard shortcut map
  */
  const shortcuts = {
    "Delete": "deleteForward",
    "Backspace": "delete",
    "Enter": "enter",
    "Meta+b": "bold",
    "Meta+i": "italic",
    "Meta+x": "delete",
    "Shift+Enter": "enter",
    ...options.shortcuts || {}
  };

  /**
   * Handle pasting content from
   * clipboard
   */
  element.addEventListener("paste", (event) => {
    event.preventDefault();

    const clipboardData = event.clipboardData || window.clipboardData;
    const html = clipboardData.getData('text/html') || clipboardData.getData("text");

    if (selection.length() > 0) {
      command("delete");
    }

    command("paste", html);
  });

  /**
   * Re-map all shortcuts to gain more control over the results
   */
  element.addEventListener("keydown", (event) => {
    options.onKeydown(event);

    let pressed = [];

    /**
     * Collect all special keys and
     * combine them into something like
     * Meta+Alt+Shift+b to be able
     * to build simple shortcut maps
     */
    if (event.metaKey === true) {
      pressed.push("Meta");
    }

    if (event.altKey === true) {
      pressed.push("Alt");
    }

    if (event.ctrlKey === true) {
      pressed.push("Ctrl");
    }

    if (event.shiftKey === true) {
      pressed.push("Shift");
    }

    pressed.push(event.key);
    pressed = pressed.join("+");

    /**
     * Backspace and Delete should ignore
     * all modifier keys
     */
    if (["Backspace", "Delete"].includes(event.key)) {
      pressed = event.key;
    }

    /**
     * History
     */
    if (pressed === "Meta+z") {
      event.preventDefault();
      undo();
      return;
    }

    if (pressed === "Meta+Shift+z") {
      event.preventDefault();
      redo();
      return;
    }

    /**
     * Delete selected text before
     * new text is entered, but
     * only if this is not a special key
     */
    if (
      // if there's an existing selection
      selection.length() > 0 &&
      // the control key must not be pressed: could be a shortcut
      event.ctrlKey === false &&
      // the meta key must not be pressed: could be a shortcut
      event.metaKey === false &&
      // the added character should only be one character long
      // this will filter out arrow keys and other special commands
      event.key.length === 1
    ) {
      command("delete");
    }

    /**
     * Find and apply keyboard shortcuts
     */
    if (shortcuts[pressed]) {
      const result = command(shortcuts[pressed]);

      if (!result) {
        event.preventDefault();
      }
    }
  });

  /**
   * It's easier to recognize text input
   * in the input event instead of the keydown
   * event.
   */
  element.addEventListener("input", (event) => {
    switch (event.inputType) {
      case "historyRedo":
        redo();
        break;
      case "historyUndo":
        undo();
        break;
      case "insertText":
        command("insert", event.data, cursor.position() - 1);
        break;
    }
  });

  /**
   * make sure the element has the correct HTML
   */
  element.innerHTML = doc.toHtml();

  /**
   * Auto-focus the element
   */
  if (options.autofocus) {
    focus();
  }

  /**
   * Public commands and properties
   */
  return {
    activeFormats,
    activeLink,
    command,
    cursor,
    doc,
    element,
    focus,
    options,
    redo,
    select,
    selection,
    toHtml(start, length) {
      return doc.toHtml(start, length);
    },
    toJson(start, length) {
      return doc.toJson(start, length);
    },
    toText(start, length) {
      return doc.toText(start, length);
    },
    undo,
    update
  };
};

export default Writer;

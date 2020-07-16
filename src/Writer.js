import Cursor from "./Cursor.js";
import DefaultFormats from "./Formats.js";
import Document from "./Document.js";
import Selection from "./Selection.js";
import Parser from "./Parser.js";

export default (element, params) => {

  if (typeof element === "string") {
    element = document.querySelector(element);
  }

  /**
   * Default options and events
   */
  const defaults = {
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
    spellcheck: true
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
    }
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

      if (length === 0) {
        start  = start - 1;
        length = 1;
      }

      doc.removeText(start, length);
      update(start);
      select(start);
    },
    deleteForward() {
      let start  = selection.start();
      let length = selection.length();

      if (length === 0) {
        length = 1;
      }

      doc.removeText(start, length);
      update(start);
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
      onSelectionEnd(event);
    }
  });

  /**
  * Check if the selection ends on mouseup
  */
  element.addEventListener("mouseup", (event) => {
    options.onMouseup(event);
    onSelectionEnd(event);
  });

  /**
  * Check if the selection ends on keyup
  */
  element.addEventListener("keyup", (event) => {
    options.onKeyup(event);
    onSelectionEnd(event);
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
    const start = selection.start();
    const end = selection.end();

    if (
      // if there's an existing selection
      start !== end &&
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
   * Public commands and properties
   */
  return {
    activeFormats,
    activeLink,
    command,
    cursor,
    doc,
    element,
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

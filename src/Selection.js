import "./ContentSelect.js";

export default (container) => {

  if (typeof container === "string") {
    container = document.querySelector(container);
  }

  return {
    ancestor() {
      return this.range().commonAncestorContainer;
    },
    containerRect() {
      let range = document.createRange();
      range.selectNodeContents(container);
      const rect = range.getBoundingClientRect();
      return rect;
    },
    start() {
      return this.rangeBeforeCursor().toString().length;
    },
    end() {
      return this.start() + this.length();
    },
    /**
    * Checks if the selection is within
    * the container
    */
    isWithin() {
      const ancestor = this.ancestor();
      return (ancestor == container || container.contains(ancestor));
    },
    length() {
      return this.text().length;
    },
    object() {
      return window.getSelection() || {};
    },
    range() {
      return this.object().getRangeAt(0);
    },
    rangeAfterCursor() {
      const range = this.range();
      const copy = range.cloneRange();
      copy.selectNodeContents(container);
      copy.setStart(range.endContainer, range.endOffset);
      return copy;
    },
    rangeBeforeCursor() {
      const range = this.range();
      const copy = range.cloneRange();
      copy.selectNodeContents(container);
      copy.setEnd(range.startContainer, range.startOffset);
      return copy;
    },
    rect() {
      return this.range().getBoundingClientRect();
    },
    select(start, end) {
      end = end || start;

      // Create a new range
      let range = new ContentSelect.Range(start, end);

      // Select some content
      range.select(container);
    },
    text() {
      return this.range().toString();
    }
  };
};

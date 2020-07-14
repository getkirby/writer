import "./ContentSelect.js";

export default (container) => {

  if (typeof container === "string") {
    container = document.querySelector(container);
  }

  return {
    ancestor() {
      const range = this.range();
      return range ? range.commonAncestorContainer : null;
    },
    containerRect() {
      const range = document.createRange();
      range.selectNodeContents(container);
      return range.getBoundingClientRect();
    },
    start() {
      const rangeBeforeCursor = this.rangeBeforeCursor();

      if (!rangeBeforeCursor) {
        return 0;
      }

      return rangeBeforeCursor.toString().length;
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
      return window.getSelection();
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
      const copy  = this.range(true);

      if (!range || !copy) {
        return null;
      }

      copy.selectNodeContents(container);
      copy.setStart(range.endContainer, range.endOffset);
      return copy;
    },
    rangeBeforeCursor() {
      const range = this.range();
      const copy  = this.range(true);

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
    text() {
      const range = this.range();
      return range ? range.toString() : "";
    },
  };
};

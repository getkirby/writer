export default (container, selection) => {

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

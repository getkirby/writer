import Selection from "../../src/Selection.js";

const div = (html) => {
  let div = document.createElement("div");
  div.setAttribute("contenteditable", true);
  div.innerHTML = html || "";
  document.body.append(div);
  return div;
};

describe("Selection", () => {

  beforeEach(() => {
    window.getSelection().removeAllRanges();
  });

  describe("Selection.ancestor()", () => {
    it("should return the container if unselected", () => {
      const container = div();
      const selection = Selection(container);

      expect(selection.ancestor()).to.equal(selection.container());
    });

    it("should return the ancestor if selected", () => {
      const container = div('Hello world');
      const selection = Selection(container);

      selection.select(1, 2);

      expect(selection.ancestor().nodeName).to.equal("#text");
      expect(selection.ancestor().data).to.equal("Hello world");
    });
  });

  describe("Selection.container()", () => {
    it("should find the container", () => {
      const container = div();
      const selection = Selection(container);

      expect(selection.container()).to.equal(container);
    });
  });

  describe("Selection.containerRect()", () => {

  });

  describe("Selection.end()", () => {
    it("should return the correct end", () => {
      const container = div("Hello");
      const selection = Selection(container);

      selection.select(0, 4);
      expect(selection.end()).to.equal(4);

      selection.select(0, 1);
      expect(selection.end()).to.equal(1);

      selection.select(0, 0);
      expect(selection.end()).to.equal(0);
    });
  });

  describe("Selection.isWithin()", () => {
    it("should no be within if nothing is focused", () => {
      const container = div("Hello");
      const selection = Selection(container);

      expect(selection.isWithin()).to.be.false;
    });

    it("should be within", () => {
      const container = div("Hello");
      const selection = Selection(container);

      container.focus();

      expect(selection.isWithin()).to.be.true;
    });

    it("should not be within if other container is focused", () => {
      const container = div("Hello");
      const selection = Selection(container);

      const otherContainer = div("World");
      otherContainer.focus();

      expect(selection.isWithin()).to.be.false;
    });
  });

  describe("Selection.length()", () => {
    it("should return the correct length", () => {
      const container = div("Hello");
      const selection = Selection(container);

      selection.select(0, 5);
      expect(selection.length()).to.equal(5);

      selection.select(0, 1);
      expect(selection.length()).to.equal(1);

      selection.select(0, 0);
      expect(selection.length()).to.equal(0);
    });
  });

  describe("Selection.object()", () => {

  });

  describe("Selection.range()", () => {
    it("should not return a range when unselected", () => {

      const container = div("Hello world");
      const selection = Selection(container);
      const range = selection.range();

      expect(range).to.be.null;
    });

    it("should return a range when focused", () => {
      const container = div("Hello world");
      container.focus();

      const selection = Selection(container);
      const range = selection.range();

      expect(range).to.be.a("Range");
      expect(range.startOffset).to.equal(0);
      expect(range.endOffset).to.equal(0);
      expect(range.collapsed).to.be.true;
    });

    it("should return a range when selected", () => {
      const container = div("Hello world");
      const selection = Selection(container);

      selection.select(0, 4);

      const range = selection.range();

      expect(range).to.be.a("Range");
      expect(range.startOffset).to.equal(0);
      expect(range.endOffset).to.equal(4);
    });
  });

  describe("Selection.rangeAfterCursor()", () => {

  });

  describe("Selection.rangeBeforeCursor()", () => {

  });

  describe("Selection.rect()", () => {

  });

  describe("Selection.select()", () => {

  });

  describe("Selection.start()", () => {
    it("should return the correct start", () => {
      const container = div("Hello");
      const selection = Selection(container);

      selection.select(0, 4);
      expect(selection.start()).to.equal(0);

      selection.select(1, 1);
      expect(selection.start()).to.equal(1);

      selection.select(2, 4);
      expect(selection.start()).to.equal(2);

      selection.select(5, 5);
      expect(selection.start()).to.equal(5);
    });
  });

  describe("Selection.text()", () => {
    it("should return the correct text", () => {
      const container = div("Hello");
      const selection = Selection(container);

      selection.select(0, 4);
      expect(selection.text()).to.equal("Hell");

      selection.select(1, 2);
      expect(selection.text()).to.equal("e");

      selection.select(2, 4);
      expect(selection.text()).to.equal("ll");

      selection.select(4, 5);
      expect(selection.text()).to.equal("o");
    });

  });

});


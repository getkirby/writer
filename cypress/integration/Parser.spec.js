import Formats from "../../src/Formats.js";
import Parser from "../../src/Parser.js";

const Container = (html) => {
  let element = document.createElement("div");
  element.innerHTML = html || "";
  return element;
};

describe("Parser", () => {

  it("should parse empty containers", () => {
    const container = Container();
    const result = Parser(container, Formats);
    expect(result).to.be.an("array");
    expect(result).to.be.empty;
  });

  it("should parse plain text", () => {
    const container = Container("Hello");
    const result = Parser(container, Formats);
    const expected = [
      { text: "H", format: {} },
      { text: "e", format: {} },
      { text: "l", format: {} },
      { text: "l", format: {} },
      { text: "o", format: {} },
    ];
    expect(result).to.deep.equal(expected);
  });

  it("should parse adjacant formats", () => {
    const container = Container("<strong>A</strong><i>B</i><del>C</del>");
    const result = Parser(container, Formats);
    const expected = [
      { text: "A", format: { bold: true } },
      { text: "B", format: { italic: true } },
      { text: "C", format: { strikeThrough: true } },
    ];
    expect(result).to.deep.equal(expected);
  });

  it("should parse nested formats", () => {
    const container = Container("<strong><i><del>A</del></i></strong>");
    const result = Parser(container, Formats);
    const expected = [
      {
        text: "A",
        format: {
          bold: true,
          italic: true,
          strikeThrough: true
        }
      },
    ];
    expect(result).to.deep.equal(expected);
  });

  it("should parse nested style attributes", () => {
    const container = Container(
      `<span style="font-weight: 500; text-decoration: line-through; font-style: italic; vertical-align: super">A</span>`
    );
    const result = Parser(container, Formats);
    const expected = [
      {
        text: "A",
        format: {
          bold: true,
          italic: true,
          strikeThrough: true,
          superscript: true
        },
      },
    ];
    expect(result).to.deep.equal(expected);
  });

  describe("bold", () => {

    it("should parse <strong> elements", () => {
      const container = Container("<strong>A</strong>");
      const result = Parser(container, Formats);
      const expected = [
        { text: "A", format: { bold: true } },
      ];
      expect(result).to.deep.equal(expected);
    });

    it("should parse <b> elements", () => {
      const container = Container("<b>A</b>");
      const result = Parser(container, Formats);
      const expected = [
        { text: "A", format: { bold: true } },
      ];
      expect(result).to.deep.equal(expected);
    });

    it("should parse fontWeight", () => {
      const container = Container(`<span style="font-weight: bold">A</span>`);
      const result = Parser(container, Formats);
      const expected = [
        { text: "A", format: { bold: true } },
      ];
      expect(result).to.deep.equal(expected);
    });

  });

  describe("code", () => {
    it("should parse <code> elements", () => {
      const container = Container("<code>A</code>");
      const result = Parser(container, Formats);
      const expected = [{ text: "A", format: { code: true } }];
      expect(result).to.deep.equal(expected);
    });
  });

  describe("italic", () => {
    it("should parse <em> elements", () => {
      const container = Container("<em>A</em>");
      const result = Parser(container, Formats);
      const expected = [
        { text: "A", format: { italic: true } },
      ];
      expect(result).to.deep.equal(expected);
    });

    it("should parse <i> elements", () => {
      const container = Container("<i>A</i>");
      const result = Parser(container, Formats);
      const expected = [
        { text: "A", format: { italic: true } },
      ];
      expect(result).to.deep.equal(expected);
    });

    it("should parse fontStyle", () => {
      const container = Container(`<span style="font-style: italic">A</span>`);
      const result = Parser(container, Formats);
      const expected = [
        { text: "A", format: { italic: true } },
      ];
      expect(result).to.deep.equal(expected);
    });
  });

  describe("link", () => {
    it("should parse <a> elements", () => {
      const container = Container(`<a href="https://getkirby.com">A</a>`);
      const result = Parser(container, Formats);
      const expected = [
        {
          text: "A",
          format: {
            link: {
              href: "https://getkirby.com",
              rel: null,
              target: null,
              title: null
            }
          }
        }
      ];
      expect(result).to.deep.equal(expected);
    });

    it("should parse all <a> attributes", () => {
      const container = Container(
        `<a href="https://getkirby.com" title="Kirby" target="_blank" rel="me">A</a>`
      );

      const result = Parser(container, Formats);
      const expected = [
        {
          text: "A",
          format: {
            link: {
              href: "https://getkirby.com",
              rel: "me",
              target: "_blank",
              title: "Kirby",
            },
          },
        },
      ];

      expect(result).to.deep.equal(expected);
    });
  });

  describe("strikeThrough", () => {
    it("should parse <del> elements", () => {
      const container = Container("<del>A</del>");
      const result = Parser(container, Formats);
      const expected = [{ text: "A", format: { strikeThrough: true } }];
      expect(result).to.deep.equal(expected);
    });

    it("should parse textDecoration", () => {
      const container = Container(`<span style="text-decoration: line-through">A</span>`);
      const result = Parser(container, Formats);
      const expected = [{ text: "A", format: { strikeThrough: true } }];
      expect(result).to.deep.equal(expected);
    });
  });

  describe("subscript", () => {
    it("should parse <sub> elements", () => {
      const container = Container("<sub>A</sub>");
      const result    = Parser(container, Formats);
      const expected  = [{ text: "A", format: { subscript: true } }];
      expect(result).to.deep.equal(expected);
    });

    it("should parse verticalAlign", () => {
      const container = Container(`<span style="vertical-align: sub">A</span>`);
      const result = Parser(container, Formats);
      const expected = [{ text: "A", format: { subscript: true } }];
      expect(result).to.deep.equal(expected);
    });
  });

  describe("superscript", () => {
    it("should parse <sup> elements", () => {
      const container = Container("<sup>A</sup>");
      const result = Parser(container, Formats);
      const expected = [{ text: "A", format: { superscript: true } }];
      expect(result).to.deep.equal(expected);
    });

    it("should parse verticalAlign", () => {
      const container = Container(`<span style="vertical-align: super">A</span>`);
      const result = Parser(container, Formats);
      const expected = [{ text: "A", format: { superscript: true } }];
      expect(result).to.deep.equal(expected);
    });
  });

});


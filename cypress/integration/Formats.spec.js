import Formats from "../../src/Formats.js";

const el = (type, html) => {
  let element = document.createElement(type);
  element.innerHTML = html;

  return element;
}

describe("Formats", () => {

  describe("Formats.bold.html()", () => {
    it("should create a bold element", () => {
      const html = Formats.bold.html("Test");
      expect(html).to.equal("<strong>Test</strong>");
    });
  });

  describe("Formats.bold.parse()", () => {
    it("should not detect a span", () => {
      const element = el("span", "Test");
      expect(Formats.bold.parser(element)).to.be.false;
    });

    it("should detect a strong element", () => {
      const element = el("strong", "Test");
      expect(Formats.bold.parser(element)).to.be.true;
    });

    it("should detect a b element", () => {
      const element = el("b", "Test");
      expect(Formats.bold.parser(element)).to.be.true;
    });

    it("should detect bold font weight", () => {
      ["bold", "bolder", "500", "600", "700", "800", "900"].forEach(fontWeight => {

        let element = el("span", "Test");

        expect(Formats.bold.parser(element)).to.be.false;
        element.style.fontWeight = fontWeight;
        expect(Formats.bold.parser(element)).to.be.true;
      });
    });

  });

  describe("Formats.code.html()", () => {
    it("should create a code element", () => {
      const html = Formats.code.html("Test");
      expect(html).to.equal("<code>Test</code>");
    });
  });

  describe("Formats.code.parse()", () => {
    it("should not detect a span", () => {
      const element = el("span", "Test");
      expect(Formats.code.parser(element)).to.be.false;
    });

    it("should detect a code element", () => {
      const element = el("code", "Test");
      expect(Formats.code.parser(element)).to.be.true;
    });
  });

  describe("Formats.italic.html()", () => {
    it("should create a italic element", () => {
      const html = Formats.italic.html("Test");
      expect(html).to.equal("<em>Test</em>");
    });
  });

  describe("Formats.italic.parse()", () => {
    it("should not detect a span", () => {
      const element = el("span", "Test");
      expect(Formats.italic.parser(element)).to.be.false;
    });

    it("should detect an i element", () => {
      const element = el("i", "Test");
      expect(Formats.italic.parser(element)).to.be.true;
    });

    it("should detect an em element", () => {
      const element = el("em", "Test");
      expect(Formats.italic.parser(element)).to.be.true;
    });

    it("should detect an italic fontStyle", () => {
      let element = el("span", "Test");
      expect(Formats.italic.parser(element)).to.be.false;

      element.style.fontStyle = "italic";
      expect(Formats.italic.parser(element)).to.be.true;
    });
  });

  describe("Formats.link.html()", () => {
    it("should not create a link element without href", () => {
      const html = Formats.link.html("Test");
      expect(html).to.equal("Test");
    });

    it("should create a link element", () => {
      const html = Formats.link.html("Test", {
        href: "https://getkirby.com"
      });
      expect(html).to.equal(
        `<a href="https://getkirby.com" rel="noopener noreferrer">Test</a>`
      );
    });

    it("should create a link element with target", () => {
      const html = Formats.link.html("Test", {
        href: "https://getkirby.com",
        target: "_blank"
      });
      expect(html).to.equal(
        `<a href="https://getkirby.com" target="_blank" rel="noopener noreferrer">Test</a>`
      );
    });

    it("should create a link element with title", () => {
      const html = Formats.link.html("Test", {
        href: "https://getkirby.com",
        title: "Kirby"
      });
      expect(html).to.equal(
        `<a href="https://getkirby.com" title="Kirby" rel="noopener noreferrer">Test</a>`
      );
    });

    it("should create a link element with rel", () => {
      const html = Formats.link.html("Test", {
        href: "https://getkirby.com",
        rel: "me",
      });
      expect(html).to.equal(
        `<a href="https://getkirby.com" rel="noopener noreferrer me">Test</a>`
      );
    });

  });

  describe("Formats.link.parse()", () => {
    it("should not detect a span", () => {
      const element = el("span", "Test");
      expect(Formats.link.parser(element)).to.be.false;
    });

    it("should not detect an a element without href", () => {
      const element = el("a", "Test");
      expect(Formats.link.parser(element)).to.be.false;
    });

    it("should detect an a element", () => {
      let element = el("a", "Test");
      element.href = "https://getkirby.com";

      const result = Formats.link.parser(element);

      expect(result).to.be.an("object");
      expect(result).to.ownProperty("href");
      expect(result).to.ownProperty("rel");
      expect(result).to.ownProperty("target");
      expect(result).to.ownProperty("title");

      expect(result.href).to.equal("https://getkirby.com");
    });

    it("should detect an a element with target", () => {
      let element    = el("a", "Test");
      element.href   = "https://getkirby.com";
      element.target = "_blank";

      const result = Formats.link.parser(element);

      expect(result.target).to.equal("_blank");
    });

    it("should detect an a element with title", () => {
      let element    = el("a", "Test");
      element.href   = "https://getkirby.com";
      element.title  = "Kirby";

      const result = Formats.link.parser(element);

      expect(result.title).to.equal("Kirby");
    });

    it("should detect an a element with rel", () => {
      let element  = el("a", "Test");
      element.href = "https://getkirby.com";
      element.rel  = "me";

      const result = Formats.link.parser(element);

      expect(result.rel).to.equal("me");
    });

  });

  describe("Formats.strikeThrough.html()", () => {
    it("should create a del element", () => {
      const html = Formats.strikeThrough.html("Test");
      expect(html).to.equal("<del>Test</del>");
    });
  });

  describe("Formats.strikeThrough.parse()", () => {
    it("should not detect a span", () => {
      const element = el("span", "Test");
      expect(Formats.strikeThrough.parser(element)).to.be.false;
    });

    it("should detect a del element", () => {
      const element = el("del", "Test");
      expect(Formats.strikeThrough.parser(element)).to.be.true;
    });

    it("should detect a span with text-decoration: line-through", () => {
      let element = el("span", "Test");
      expect(Formats.strikeThrough.parser(element)).to.be.false;

      element.style.textDecoration = "line-through";
      expect(Formats.strikeThrough.parser(element)).to.be.true;
    });
  });

  describe("Formats.subscript.html()", () => {
    it("should create a sub element", () => {
      const html = Formats.subscript.html("Test");
      expect(html).to.equal("<sub>Test</sub>");
    });
  });

  describe("Formats.subscript.parse()", () => {
    it("should not detect a span", () => {
      const element = el("span", "Test");
      expect(Formats.subscript.parser(element)).to.be.false;
    });

    it("should detect a sub element", () => {
      const element = el("sub", "Test");
      expect(Formats.subscript.parser(element)).to.be.true;
    });

    it("should detect a span with vertical-align: sub", () => {
      let element = el("span", "Test");
      expect(Formats.subscript.parser(element)).to.be.false;

      element.style.verticalAlign = "sub";
      expect(Formats.subscript.parser(element)).to.be.true;
    });
  });

  describe("Formats.superscript.html()", () => {
    it("should create a superscript element", () => {
      const html = Formats.superscript.html("Test");
      expect(html).to.equal("<sup>Test</sup>");
    });
  });

  describe("Formats.superscript.parse()", () => {
    it("should not detect a span", () => {
      const element = el("span", "Test");
      expect(Formats.superscript.parser(element)).to.be.false;
    });

    it("should detect a sup element", () => {
      const element = el("sup", "Test");
      expect(Formats.superscript.parser(element)).to.be.true;
    });

    it("should detect a span with vertical-align: sup", () => {
      let element = el("span", "Test");
      expect(Formats.superscript.parser(element)).to.be.false;

      element.style.verticalAlign = "super";
      expect(Formats.superscript.parser(element)).to.be.true;
    });
  });

});


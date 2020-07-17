import Doc from "../../src/Document.js";
import Formats from "../../src/Formats.js";

describe("Document", () => {

  describe("()", () => {
    it("should work without element", () => {
      const doc = Doc();

      expect(doc.doc).to.be.an("array");
      expect(doc.length()).to.equal(0);
    });
  });

  describe("Document.activeFormats()", () => {
    it("should find all active formats", () => {
      const doc = Doc(null, {
        formats: Formats
      });

      doc.insertText("Hello world");

      // <strong>Hello</strong> world
      doc.addFormat("bold", 0, 5);

      // He<em>llo</em> world
      doc.addFormat("italic", 2, 3);

      expect(doc.activeFormats(0, 5)).to.include("bold");
      expect(doc.activeFormats(2, 3)).to.include("italic");
    });

    it("should ignore mixed formats", () => {
      const doc = Doc(null, {
        formats: Formats
      });

      doc.insertText("Hello world");
      doc.addFormat("bold", 0, 5);

      expect(doc.activeFormats(3, 5)).to.be.empty;
    });
  });

  describe("Document.activeLink()", () => {
    it("should find the link", () => {
      const doc = Doc(null, {
        formats: Formats,
      });

      doc.insertText("Hello world");
      doc.addFormat("link", 0, null, {
        href: "https://getkirby.com"
      });

      expect(doc.activeLink()).to.be.an("object");
      expect(doc.activeLink().href).to.equal("https://getkirby.com");
    });

    it("should find the last link", () => {
      const doc = Doc(null, {
        formats: Formats,
      });

      doc.insertText("Hello world");
      doc.addFormat("link", 0, 5, {
        href: "https://google.com",
      });
      doc.addFormat("link", 6, null, {
        href: "https://getkirby.com",
      });

      // without start and length
      expect(doc.activeLink()).to.be.an("object");
      expect(doc.activeLink().href).to.equal("https://getkirby.com");

      // with start and length
      expect(doc.activeLink(2, 8)).to.be.an("object");
      expect(doc.activeLink(2, 8).href).to.equal("https://getkirby.com");
    });

  });

  describe("Document.addFormat()", () => {
    it("should add format to entire content", () => {
      const doc = new Doc(null, {
        formats: Formats,
      });

      doc.insertText("Hello world");
      doc.addFormat("bold");

      expect(doc.toHtml()).to.equal("<strong>Hello world</strong>");
    });

    it("should add format to a part of the content", () => {
      const doc = new Doc(null, {
        formats: Formats,
      });

      doc.insertText("Hello world");
      doc.addFormat("bold", 0, 5);

      expect(doc.toHtml()).to.equal("<strong>Hello</strong> world");
    });
  });

  describe("Document.append()", () => {
    it("should append all elements to empty document", () => {
      const doc = new Doc();

      doc.append([
        { text: "H" },
        { text: "e" },
        { text: "l" },
        { text: "l" },
        { text: "o" },
      ]);

      expect(doc.toHtml()).to.equal("Hello");
    });

    it("should append all elements to filled document", () => {
      const doc = new Doc();

      doc.insertText("Hello ");

      doc.append([
        { text: "w" },
        { text: "o" },
        { text: "r" },
        { text: "l" },
        { text: "d" },
      ]);

      expect(doc.toHtml()).to.equal("Hello world");
    });
  });

  describe("Document.get()", () => {
    it("should get all characters", () => {
      const doc = Doc();

      doc.insertText("Hello world");

      const snippet = doc.get();

      expect(snippet).to.be.lengthOf(11);
      expect(snippet[0].text).to.equal("H");
      expect(snippet[4].text).to.equal("o");
      expect(snippet[10].text).to.equal("d");
    });

    it("should get all characters after start", () => {
      const doc = Doc();

      doc.insertText("Hello world");

      const snippet = doc.get(6);

      expect(snippet).to.be.lengthOf(5);
      expect(snippet[0].text).to.equal("w");
      expect(snippet[4].text).to.equal("d");
    });

    it("should get the correct characters", () => {
      const doc = Doc();

      doc.insertText("Hello world");

      const snippet = doc.get(0, 5);

      expect(snippet).to.be.lengthOf(5);
      expect(snippet[0].text).to.equal("H");
      expect(snippet[4].text).to.equal("o");
    });
  });

  describe("Document.hasFormat()", () => {
    it("should not find any formats", () => {
      const doc = Doc(null, {
        formats: Formats
      });

      doc.insertText("Hello");
      expect(doc.hasFormat()).to.be.false;
    });

    it("should find format in entire string", () => {
      const doc = Doc(null, {
        formats: Formats,
      });

      doc.insertText("Hello");
      doc.addFormat("bold");
      expect(doc.hasFormat("bold")).to.be.true;
    });

    it("should find format in partial string", () => {
      const doc = Doc(null, {
        formats: Formats,
      });

      doc.insertText("Hello world");
      doc.addFormat("bold", 0, 5);

      // entire bold part
      expect(doc.hasFormat("bold", 0, 5)).to.be.true;

      // part of the bold part
      expect(doc.hasFormat("bold", 2, 3)).to.be.true;

      // partly bold, partly not
      expect(doc.hasFormat("bold", 3, 10)).to.be.false;

      // not bold at all
      expect(doc.hasFormat("bold", 5, 3)).to.be.false;
    });
  });

  describe("Document.inject()", () => {
    it("should inject elements at the end of an empty document", () => {
      const doc = Doc();

      doc.inject([
        { text: "H" },
        { text: "e" },
        { text: "l" },
        { text: "l" },
        { text: "o" },
      ]);

      expect(doc.toText()).to.equal("Hello");
    });

    it("should inject elements in the middle of a filled document", () => {
      const doc = Doc();

      doc.insertText("AC");
      doc.inject([
        { text: "B" },
      ], 1);

      expect(doc.toText()).to.equal("ABC");
    });

    it("should inject elements at the beginning of a filled document", () => {
      const doc = Doc();

      doc.insertText("BC");
      doc.inject([
        { text: "A" }
      ], 0);

      expect(doc.toText()).to.equal("ABC");
    });

  });

  describe("Document.insertText()", () => {
    it("should add character at the end", () => {
      const doc = Doc();

      doc.insertText("T");
      doc.insertText("e");
      doc.insertText("s");
      doc.insertText("t");

      expect(doc.toText()).to.equal("Test");
    });

    it("should add ignore empty strings", () => {
      const doc = Doc();

      doc.insertText("T");
      doc.insertText("e");
      doc.insertText("");
      doc.insertText("s");
      doc.insertText("t");

      expect(doc.toText()).to.equal("Test");
    });

    it("should add character at the beginning", () => {
      const doc = Doc();

      // insert characters without order
      doc.insertText("B");
      doc.insertText("C");

      // inject character between the first two
      doc.insertText("A", 0);

      expect(doc.toText()).to.equal("ABC");
    });

    it("should add character at specific point", () => {
      const doc = Doc();

      // insert characters without order
      doc.insertText("A");
      doc.insertText("C");

      // inject character between the first two
      doc.insertText("B", 1);

      expect(doc.toText()).to.equal("ABC");
    });

    it("should insert multiple characters", () => {
      const doc = Doc();

      doc.insertText("Hello world");

      expect(doc.toText()).to.equal("Hello world");
    });

    it("should insert multiple characters at the end", () => {
      const doc = Doc();

      doc.insertText("Hello");
      doc.insertText(" world");

      expect(doc.toText()).to.equal("Hello world");
    });

    it("should insert multiple characters at a specific point", () => {
      const doc = Doc();

      doc.insertText("A");
      doc.insertText("D");
      doc.insertText("BC", 1);

      expect(doc.toText()).to.equal("ABCD");
    });

    it("should insert multiple characters at the beginning", () => {
      const doc = Doc();

      doc.insertText("world");
      doc.insertText("Hello ", 0);

      expect(doc.toText()).to.equal("Hello world");
    });

  });

  describe("Document.length()", () => {
    it("should get the length of an empty document", () => {
      const doc = Doc();
      expect(doc.length()).to.equal(0);
    });

    it("should get the length of a filled document", () => {
      const doc = Doc();
      doc.insertText("Hello");
      expect(doc.length()).to.equal(5);
    });
  });

  describe("Document.lengthAfter()", () => {
    it("should get the correct remaining length of an empty doc", () => {
      const doc = Doc();
      expect(doc.lengthAfter()).to.equal(0);
    });

    it("should get the correct remaining length of a filled doc", () => {
      const doc = Doc();
      doc.insertText("Hello");
      expect(doc.lengthAfter()).to.equal(5);
    });

    it("should get the correct remaining length after start", () => {
      const doc = Doc();
      doc.insertText("Hello");
      expect(doc.lengthAfter(1)).to.equal(4);
      expect(doc.lengthAfter(4)).to.equal(1);
      expect(doc.lengthAfter(5)).to.equal(0);
    });

    it("should sanitize the length", () => {
      const doc = Doc();
      doc.insertText("Hello");
      expect(doc.lengthAfter(10)).to.equal(0);
    });
  });

  describe("Document.redo()", () => {
    it("should undo and redo the history", () => {
      const doc = Doc();
      expect(doc.toText()).to.equal("");
      doc.insertText("A");
      expect(doc.toText()).to.equal("A");
      doc.undo();
      expect(doc.toText()).to.equal("");
      doc.redo();
      expect(doc.toText()).to.equal("A");
    });
  });

  describe("Document.removeFormat()", () => {

    it("should remove format from entire content", () => {
      const doc = new Doc(null, {
        formats: Formats
      });

      doc.insertText("Hello world");
      doc.addFormat("bold");
      expect(doc.toHtml()).to.equal("<strong>Hello world</strong>");
      doc.removeFormat("bold");
      expect(doc.toHtml()).to.equal("Hello world");
    });

    it("should remove format from a part of the content", () => {
      const doc = new Doc(null, {
        formats: Formats
      });

      doc.insertText("Hello world");
      doc.addFormat("bold", 0, 5);
      // 0:H, 1:e, 2:l, 3:l, 4:o
      expect(doc.toHtml()).to.equal("<strong>Hello</strong> world");
      doc.removeFormat("bold", 0, 5);
      expect(doc.toHtml()).to.equal("Hello world");
    });

  });

  describe("Document.removeFormats()", () => {

    it("should remove all formats from entire content", () => {
      const doc = new Doc(null, {
        formats: Formats
      });

      doc.insertText("Hello world");
      doc.addFormat("bold");
      doc.addFormat("italic");
      expect(doc.toHtml()).to.equal("<em><strong>Hello world</strong></em>");
      doc.removeFormats();
      expect(doc.toHtml()).to.equal("Hello world");
    });

    it("should remove all formats from a part of the content", () => {
      const doc = new Doc(null, {
        formats: Formats,
      });

      doc.insertText("Hello world");
      doc.addFormat("bold", 0, 5);
      doc.addFormat("italic", 0, 5);
      expect(doc.toHtml()).to.equal("<em><strong>Hello</strong></em> world");
      doc.removeFormats();
      expect(doc.toHtml()).to.equal("Hello world");
    });

  });

  describe("Document.removeText()", () => {
    it("should remove character from the end", () => {
      const doc = Doc();

      // create a word first
      doc.insertText("T");
      doc.insertText("e");
      doc.insertText("s");
      doc.insertText("t");

      // remove the last character
      doc.removeText();

      expect(doc.toText()).to.equal("Tes");
    });

    it("should remove character from specific point", () => {
      const doc = Doc();

      // create a word first
      doc.insertText("T");
      doc.insertText("e");
      doc.insertText("s");
      doc.insertText("t");

      // remove the last character
      doc.removeText(1);

      expect(doc.toText()).to.equal("Tst");
    });

    it("should remove multiple characters", () => {
      const doc = Doc();

      // create a word first
      doc.insertText("T");
      doc.insertText("e");
      doc.insertText("s");
      doc.insertText("t");

      // remove the last character
      doc.removeText(1, 2);

      expect(doc.toText()).to.equal("Tt");
    });
  });

  describe("Document.toggleFormat()", () => {
    it("should toggle format on entire unformated document", () => {
      const doc = new Doc(null, {
        formats: Formats,
      });

      doc.insertText("Hello world");
      expect(doc.toHtml()).to.equal("Hello world");
      doc.toggleFormat("bold");
      expect(doc.toHtml()).to.equal("<strong>Hello world</strong>");
      doc.toggleFormat("bold");
      expect(doc.toHtml()).to.equal("Hello world");
    });

    it("should toggle format on partial document", () => {
      const doc = new Doc(null, {
        formats: Formats,
      });

      doc.insertText("Hello world");
      expect(doc.toHtml()).to.equal("Hello world");
      doc.toggleFormat("bold", 0, 5);
      expect(doc.toHtml()).to.equal("<strong>Hello</strong> world");
      doc.toggleFormat("bold", 0, 5);
      expect(doc.toHtml()).to.equal("Hello world");
    });

    it("should toggle format on partial document with mixed formats", () => {
      const doc = new Doc(null, {
        formats: Formats,
      });

      doc.insertText("Hello world");
      doc.addFormat("bold", 0, 5);
      expect(doc.toHtml()).to.equal("<strong>Hello</strong> world");
      doc.toggleFormat("bold", 0, 8);
      expect(doc.toHtml()).to.equal("<strong>Hello wo</strong>rld");
      doc.toggleFormat("bold", 0, 8);
      expect(doc.toHtml()).to.equal("Hello world");
    });

  });

  describe("Document.toHtml()", () => {
    it("should keep simple strings", () => {
      const doc = Doc();

      doc.insertText("T");
      doc.insertText("e");
      doc.insertText("s");
      doc.insertText("t");

      expect(doc.toHtml()).to.equal("Test");
    });

    it("should work with wrapping formats", () => {
      const doc = Doc(null, {
        formats: Formats
      });

      doc.inject([
        { text: "T", format: { bold: true } },
        { text: "e", format: { bold: true } },
        { text: "s", format: { bold: true } },
        { text: "t", format: { bold: true } },
      ]);

      expect(doc.toHtml()).to.equal("<strong>Test</strong>");
    });

    it("should work with nested formats", () => {
      const doc = Doc(null, {
        formats: Formats
      });

      doc.insertText("Test");
      doc.addFormat("italic");
      doc.addFormat("bold", 0, 2);

      expect(doc.toHtml()).to.equal("<strong><em>Te</em></strong><em>st</em>");
    });

    it("should render links", () => {
      const doc = Doc(null, {
        formats: Formats,
      });

      doc.insertText("Test");
      doc.addFormat("link", 0, null, {
        href: "https://getkirby.com"
      });

      expect(doc.toHtml()).to.equal(`<a href="https://getkirby.com" rel="noopener noreferrer">Test</a>`);
    });

  });

  describe.only("Document.triggers", () => {
    it("should fire custom trigger", () => {
      let triggered = false;
      const doc = Doc(null, {
        triggers: {
          "- ": () => {
            triggered = true;
          }
        }
      })

      doc.insertText("- ");
      expect(triggered).to.be.true;
    });

    it("should fire custom trigger in right order", () => {
      let triggered = false;
      const doc = Doc(null, {
        triggers: {
          "### ": () => {
            triggered = "H3";
          },
          "## ": () => {
            triggered = "H2";
          },
          "# ": () => {
            triggered = "H1";
          }
        }
      })

      doc.insertText("# ");

      expect(triggered).to.equal("H1");

      doc.removeText(0, 2);
      doc.insertText("### ");

      expect(triggered).to.equal("H3");
    });

  });

  describe("Document.undo()", () => {
    it("should undo the last step", () => {
      const doc = Doc();
      expect(doc.toText()).to.equal("");
      doc.insertText("A");
      expect(doc.toText()).to.equal("A");
      doc.undo();
      expect(doc.toText()).to.equal("");
    });
  });

});

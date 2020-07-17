const button = (command) => {
  return cy.get("@toolbar").find(`[data-command="${command}"]`);
};

const toolbar = () => {
  return cy.get("@toolbar");
};

const write = (text) => {
  return cy.get("@writer").type(text);
};

const writer = (callback) => {
  cy.window().then(win => {
    callback(win.writer);
  });
};

describe("Writer", () => {

  beforeEach(() => {
    cy.visit("http://127.0.0.1:8181");
    cy.get(".writer").as("writer");
    cy.get(".toolbar").as("toolbar");
  });

  it("should insert text", () => {
    write("Hello");
    writer(writer => {
      expect(writer.toText()).to.equal("Hello");
    });
  });

  it("should delete on backspace", () => {
    write("Hello");
    writer(writer => {
      expect(writer.toText()).to.equal("Hello");
    });
    write("{backspace}");
    writer((writer) => {
      expect(writer.toText()).to.equal("Hell");
    });
  });

  it("should not delete on backspace when the cursor is at the beginning of the element", () => {
    write("Hello{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}");
    write("{backspace}");
    writer((writer) => {
      expect(writer.toText()).to.equal("Hello");
    });
  });

  it("should forward delete", () => {
    write("Hello");
    writer((writer) => {
      expect(writer.toText()).to.equal("Hello");

      // set the focus on the first character
      writer.select(0);
    });
    write("{del}");
    writer((writer) => {
      expect(writer.toText()).to.equal("ello");
    });
  });

  it("should show toolbar", () => {
    toolbar().should("not.be.visible");
    write("Hello{selectall}").trigger("keyup");
    toolbar().should("be.visible");
  });

  it("should make text bold", () => {
    write("Hello{selectall}").trigger("keyup")
    button("bold").click();
    writer(writer => {
      expect(writer.toHtml()).to.equal("<strong>Hello</strong>");
    });
  });

  it("should wrap text in code element", () => {
    write("Hello{selectall}").trigger("keyup");
    button("code").click();
    writer((writer) => {
      expect(writer.toHtml()).to.equal("<code>Hello</code>");
    });
  });

  it("should make text italic", () => {
    write("Hello{selectall}").trigger("keyup");
    button("italic").click();
    writer((writer) => {
      expect(writer.toHtml()).to.equal("<em>Hello</em>");
    });
  });

  it("should create a link", () => {
    write("Hello{selectall}").trigger("keyup");
    cy.window().then((win) => {
      cy.stub(win, "prompt").returns("https://getkirby.com");
      button("link").click();
      writer((writer) => {
        expect(writer.toHtml()).to.equal(`<a href="https://getkirby.com" rel="noopener noreferrer">Hello</a>`);
      });
    });
  });

  it("should wrap text in del element", () => {
    write("Hello{selectall}").trigger("keyup");
    button("strikeThrough").click();
    writer((writer) => {
      expect(writer.toHtml()).to.equal("<del>Hello</del>");
    });
  });

  it("should ignore meta key on backspace", () => {
    write("Hello");
    write("{meta}{backspace}");
    writer((writer) => {
      expect(writer.toText()).to.equal("Hell");
    });
  });

  it("should ignore meta key on delete", () => {
    write("Hello");
    write("{leftarrow}{meta}{del}");
    writer((writer) => {
      expect(writer.toText()).to.equal("Hell");
    });
  });

  it("should ignore alt key on backspace", () => {
    write("Hello");
    write("{alt}{backspace}");
    writer((writer) => {
      expect(writer.toText()).to.equal("Hell");
    });
  });

  it("should ignore alt key on delete", () => {
    write("Hello");
    write("{leftarrow}{alt}{del}");
    writer((writer) => {
      expect(writer.toText()).to.equal("Hell");
    });
  });

  it("should ignore ctrl key on backspace", () => {
    write("Hello");
    write("{ctrl}{backspace}");
    writer((writer) => {
      expect(writer.toText()).to.equal("Hell");
    });
  });

  it("should ignore ctrl key on delete", () => {
    write("Hello");
    write("{leftarrow}{ctrl}{del}");
    writer((writer) => {
      expect(writer.toText()).to.equal("Hell");
    });
  });

  it("should ignore shift key on backspace", () => {
    write("Hello");
    write("{shift}{backspace}");
    writer((writer) => {
      expect(writer.toText()).to.equal("Hell");
    });
  });

  it("should ignore shift key on delete", () => {
    write("Hello");
    write("{leftarrow}{shift}{del}");
    writer((writer) => {
      expect(writer.toText()).to.equal("Hell");
    });
  });

  it("should focus at the start", () => {
    write("Hello");

    writer((writer) => {
      writer.focus("start");

      expect(writer.selection.start()).to.equal(0);
      expect(writer.selection.end()).to.equal(0);
    });
  });

  it("should focus at the end", () => {
    write("Hello");

    writer((writer) => {
      writer.focus("end");

      expect(writer.selection.start()).to.equal(5);
      expect(writer.selection.end()).to.equal(5);
    });
  });

  it("should focus at a specific position", () => {
    write("Hello");

    writer((writer) => {
      writer.focus(2);

      expect(writer.selection.start()).to.equal(2);
      expect(writer.selection.end()).to.equal(2);
    });
  });

});

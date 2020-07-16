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
    cy.visit("http://127.0.0.1:8080");
    cy.get(".k-writer").as("writer");
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

});


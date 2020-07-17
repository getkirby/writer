export default {
  bold: {
    html(content) {
      return `<strong>${content}</strong>`;
    },
    parser(node) {

      const boldElements = [
        "B",
        "H1",
        "H2",
        "H3",
        "H4",
        "H5",
        "H6",
        "STRONG"
      ];

      if (boldElements.includes(node.nodeName)) {
        return true;
      }

      const bold = ["bold", "bolder", "500", "600", "700", "800", "900"];

      if (bold.includes(node.style.fontWeight)) {
        return true;
      }

      return false;
    }
  },
  code: {
    html(content) {
      return `<code>${content}</code>`;
    },
    parser(node) {
      return node.nodeName === "CODE";
    }
  },
  italic: {
    html(content) {
      return `<em>${content}</em>`;
    },
    parser(node) {
      if (["I", "EM"].includes(node.nodeName)) {
        return true;
      }

      if (node.style.fontStyle === "italic") {
        return true;
      }

      return false;
    }
  },
  link: {
    html(content, attr = {}) {
      if (!attr.href) {
        return content;
      }

      let attrs = `href="${attr.href}"`;
      let rel   = `rel="noopener noreferrer"`;

      if (attr.rel) {
        rel = `rel="noopener noreferrer ${attr.rel}"`;
      }

      if (attr.target) {
        attrs += ` target="${attr.target}"`;
      }

      if (attr.title) {
        attrs += ` title="${attr.title}"`;
      }

      return `<a ${attrs} ${rel}>${content}</a>`;
    },
    parser(node) {
      if (node.nodeName !== "A") {
        return false;
      }

      const href = node.getAttribute("href");

      if (!href) {
        return false;
      }

      return {
        href: href,
        rel: node.getAttribute("rel"),
        target: node.getAttribute("target"),
        title: node.getAttribute("title"),
      };
    }
  },
  strikeThrough: {
    html(content) {
      return `<del>${content}</del>`;
    },
    parser(node) {
      if (node.nodeName === "DEL") {
        return true;
      }

      if (node.style.textDecoration === "line-through") {
        return true;
      }

      return false;
    }
  },
  subscript: {
    html(content) {
      return `<sub>${content}</sub>`;
    },
    parser(node) {
      if (node.nodeName === "SUB") {
        return true;
      }

      if (node.style.verticalAlign === "sub") {
        return true;
      }

      return false;
    }
  },
  superscript: {
    html(content) {
      return `<sup>${content}</sup>`;
    },
    parser(node) {
      if (node.nodeName === "SUP") {
        return true;
      }

      if (node.style.verticalAlign === "super") {
        return true;
      }

      return false;
    }
  },
};

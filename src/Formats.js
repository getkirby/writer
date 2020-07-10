export default {
    bold: {
        html(content) {
            return `<strong>${content}</strong>`;
        },
        parser(node) {
            return ["B", "STRONG"].includes(node.nodeName);
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
            return ["I", "EM"].includes(node.nodeName);
        }
    },
    link: {
        html(content, attr) {
            return `<a href="${attr.href}">${content}</a>`;
        },
        parser(node) {
            if (node.nodeName !== "A") {
                return false;
            }

            return {
                href: node.getAttribute("href"),
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
            return node.nodeName === "DEL";
        }
    },
    subscript: {
        html(content) {
            return `<sub>${content}</sub>`;
        },
        parser(node) {
            return node.nodeName === "SUB";
        }
    },
    superscript: {
        html(content) {
            return `<sup>${content}</sup>`;
        },
        parser(node) {
            return node.nodeName === "SUP";
        }
    },
};

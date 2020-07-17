/**
 * Removes all block elements from the HTML
 * and trims the result
 */
export default (node, inline) => {

  const unwrapElement = (node) => {
    // get the element's parent node
    const parent = node.parentNode;

    // move all children out of the element
    while (node.firstChild) parent.insertBefore(node.firstChild, node);

    // remove the empty element
    parent.removeChild(node);
  };

  const isInline = (node) => {
    return inline.includes(node.nodeName.toLowerCase());
  };

  const hasBlockElements = (node) => {
    if (node.children.length === 0) {
      return false;
    }

    let result = false;

    Array.from(node.children).forEach(child => {
      // check child
      if (isInline(child) === false) {
        result = true;
        return;
      }

      // check children of child
      if (hasBlockElements(child)) {
        result = true;
      }
    });

    return result;
  };

  let blocks = [];

  const trimNode = (node) => {
    let html = node.innerHTML
      .trim()
      .replace(/[ ]{2,}/g, "")
      .replace(/[\n]{3,}/g, "\n\n");

    node.innerHTML = html;
    return node;
  };

  const keep = [
    "H1", "H2", "H3", "H4", "H5", "H6"
  ];

  const kill = [
    "area",
    "base",
    "col",
    "command",
    "embed",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "menuitem",
    "meta",
    "param",
    "object",
    "source",
    "svg",
    "track",
    "video",
    "wbr",
  ];

  // kill the following nodes
  Array.from(node.querySelectorAll(kill.join(","))).forEach(childNode => {
    childNode.parentNode.removeChild(childNode);
  });

  const removeBlockElements = (node) => {

    if (hasBlockElements(node) === false) {
      trimNode(node);

      if (node.innerHTML === "") {
        return;
      }

      if (keep.includes(node.nodeName)) {
        blocks.push(node.outerHTML);
      } else {
        blocks.push(node.innerHTML);
      }
      return;
    }

    Array.from(node.children).forEach(child => {
      removeBlockElements(child);

      if (isInline(child) === false) {
        trimNode(child);

        if (keep.includes(child.nodeName) === false) {
          unwrapElement(child);
        }
      }
    });
  };

  removeBlockElements(node, 1);

  return blocks.join("\n\n");
};

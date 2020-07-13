import "./ContentSelect.js";

export default (toolbar, onCommand) => {

  if (typeof toolbar === "string") {
    toolbar = document.querySelector(toolbar);
  }

  /**
   * Collect all button elements
   */
  const buttons = toolbar.querySelectorAll("button");

  /**
   * Trigger commands when toolbar
   * buttons get clicked
   */
  Array.from(buttons).forEach(button => {

    const command = button.getAttribute("data-command");

    button.addEventListener("click", (event) => {
      event.preventDefault();
      onCommand(command);
    });
  });

  /**
   * Pass an array of active formats / command names
   * to highlight the matching buttons
   */
  const activeFormats = (activeFormats) => {
    buttons.forEach(button => {
      const command = button.getAttribute("data-command");

      if (activeFormats.includes(command)) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  };

  /**
   * Hide the toolbar
   */
  const hide = () => {
    toolbar.style.display = "none";
  };

  /**
   * Show the toolbar at the passed DOMRect
   */
  const show = (rect) => {
    toolbar.style.display = "flex";

    const height = toolbar.offsetHeight;
    const width = toolbar.offsetWidth;

    const top = Math.round(rect.top - height - 4);
    const left = Math.round(((rect.left + rect.right) / 2) - (width / 2));

    toolbar.style.top = top < 0 ? 0 : top;
    toolbar.style.left = left < 0 ? 0 : left;
  };

  return {
    activeFormats,
    hide,
    show
  };

};

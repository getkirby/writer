# Kirby Writer

A small, modern [WYSIWYG editor](https://writer.getkirby.com) for inline formats – by the team of [Kirby CMS](https://getkirby.com)

<a href="https://writer.getkirby.com">![Kirby Writer](https://user-images.githubusercontent.com/24532/87658085-fd122e80-c75b-11ea-87ae-40f9c9da4e4c.png)
</a>

## About this editor

**This library is still experimental and looking for help to get finished. DO NOT USE IN PRODUCTION!**

----

Yes, you read that correctly. We are trying to build our own contenteditable wrapper in Javascript. It seems like a stupid idea. Maybe it is. But **we are drastically limiting the scope of this project**:

### Inline formats only

Modern content editing tools have moved away from the idea to solve everything within a single contenteditable element. Notion's editor, something like Gutenberg or our own [Kirby Editor](https://github.com/getkirby/editor) turn to a new block editor model, in which each block element (heading, images, videos, etc.) are handled seperately and new block types can be added to extend the editor feature set. This has a lot of benefits. It massively reduces the complexity of what each block component has to solve and also leads to a more controllable content structure that can be exported as something like JSON instead of HTML.

For such block editors, a fully fledged WYSIWYG editor is way too much. What they need is a WYSIWYG editor that only handles inline elements (strong, em, code, sub, sup, etc.) in a reliable and clean way. This is exactly what this editor implementation does. By completely ignoring any kind of block elements, we can make this library a lot smaller and simpler and focus on perfect structured inline content, selection and event APIs that help to build great block types.

### Modern browsers only

This library also does not support any legacy browsers. We don't have to care about IE and some outdated selection APIs. It's fully written in ES6 and is aimed at browsers that support ES6 modules by default. https://caniuse.com/#feat=es6-module

## It's pretty small

14 kb compressed / 39 kb uncompressed – we are really proud of its small footprint. 

## Demo

https://writer.getkirby.com

## Usage

```html
<div class="writer" contenteditable>Hello <b>world</b></div>

<script type="module">
import Writer from "https://cdn.jsdelivr.net/gh/getkirby/writer@latest/dist/Writer.min.js";

const writer = Writer(".writer", {
onChange() {
    console.log(writer.toJson());
}
});
</script>
```

### Install via npm 

```
npm i @getkirby/writer
```

Import it into your project …

```js
import Writer from "@getkirby/writer";

const writer = Writer(".writer");
```

## Documentation

> The API is not stable yet. Methods and properties are very likely to change.

### How to create a Writer instance

To create a Writer instance, you need to pass a HTML node or query selector for the element that should be editable.

```html
<div class="writer" contenteditable></div>

<script type="module">
import Writer from "https://cdn.jsdelivr.net/gh/getkirby/writer@latest/dist/Writer.min.js";

const writer = Writer(".writer");
</script>
```

### Options

You can pass additional options to the Writer as second argument

```html
<div class="writer" contenteditable></div>

<script type="module">
import Writer from "https://cdn.jsdelivr.net/gh/getkirby/writer@latest/dist/Writer.min.js";

const writer = Writer(".writer", {
    breaks: false,
    onChange() {
        console.log(writer.toJson());
    }
});
</script>
```

#### `breaks: true`
Enables/disables line breaks within the text. Line breaks are enabled by default.

#### `formats: {}`
You can overwrite or extend the available inline formats with the formats object. Check out `src/Formats.js` for all default formats.

#### `history: 100`
The number of steps that can be undone in the history.

#### `onBlur: () => {}`
Add an event when the Writer looses focus

#### `onChange: () => {}`
React on any content changes in the Writer. This is the method to be used if you want to preview or save the Writer content. You probably want to use `writer.toHtml()`, `writer.toJson()` or `writer.toText()` in this method.

#### `onFocus: () => {}`
Add an event when the Writer gains focus

#### `onKeydown: () => {}`
This event is triggered when a native keydown event happens in the Writer. This event is triggered before the any Writer shortcut.

#### `onKeyup: () => {}`
This event is triggered when a native keyup event happens in the Writer.

#### `onMousedown: () => {}`
This event is triggered when a native mousedown event happens in the Writer.

#### `onMouseup: () => {}`
This event is triggered when a native mouseup event happens in the Writer.

#### `onRedo: () => {}`
This event is triggered when history changes are reverted

#### `onSelection: () => {}`
This event is triggered when a selection is made and changed.

#### `onSelectionEnd: () => {}`
This event is only fired when the selection no longer changes (on mouseup)

#### `onSelectionStart: () => {}`
This event is fired when the selection starts

#### `onUndo: () => {}`
This event is triggered when content changes are undone.

#### `placeholder: ""`
Add a placeholder text to the Writer when there's no content.

#### `shortcuts: {}`
You can pass your own keyboard shortcuts or overwrite existing shortcuts with this object. Keyboard shortcuts are defined like this:

```js
const shortcuts = {
    "Meta+b": () => {
        // make something bold
    }
};
```
The following special keywords for key combinations are automatically injected when pressed (in the following order): `Meta`, `Alt`, `Ctrl`, `Shift`

#### `spellcheck: true`
Enable/disable native spellchecking

### Methods

#### `writer.activeFormats()`

Returns an array of all active formats at the current selection. A format must be present at all characters in the selection to be included.

#### `writer.activeLink()`

Returns an object with attributes of the active link if the selected text has a link. The object contains `href`, `rel`, `title`, and `target`:

```js
// example return value of writer.activeLink() if a link has been found
{
    href: "https://getkirby.com",
    rel: "me",
    target: "_blank",
    title: "Kirby"
}
```

#### `writer.command(commandName, ...args)`

Executes the given command with the optional arguments. Available commands:

-----

##### `writer.command('bold')`

Wraps the selected text in a `<strong>` tag.

##### `writer.command('code')`

Wraps the selected text in a `<code>` tag.

##### `writer.command('delete')`

Deletes the selected text before the cursor

##### `writer.command('deleteForward')`

Deletes the selected text after the cursor

##### `writer.command('enter')`

Adds a line break if breaks are enabled.

##### `writer.command('insert', text, at)`

Inserts text at the given position.

##### `writer.command('italic')`

Wraps the selected text in an `<em>` tag

##### `writer.command('link', href)`

Wraps the selected text in an `<a>` tag with the given value for the `href` attribute.

##### `writer.command('paste', html)`

Pastes any unsanitized html at the given selection/cursor. The html will be handled by the parser and all unwanted formats will be stripped. Block elements are of ignored and converted to line breaks if it makes sense.

##### `writer.command('strikeThrough')`

Wraps the selected text in an `<del>` tag

##### `writer.command('subscript')`

Wraps the selected text in an `<sub>` tag

##### `writer.command('superscript')`

Wraps the selected text in an `<sup>` tag

##### `writer.command('unlink')`

Removes a link from the selected text, if it exists.

-----

#### `writer.cursor()`

Returns the cursor object with additional methods to inspect and manipulate the cursor:

##### `writer.cursor().isInFirstLine()`

Checks if the cursor is in the first line of text

##### `writer.cursor().isInLastLine()`

Checks if the cursor is in the last line of text

##### `writer.cursor().rect()`

Returns the DOMRect object for the absolute cursor position

##### `writer.cursor().set(position)`

Moves the cursor to the given position


-----

#### `writer.redo()`

Reverts the last undo event

#### `writer.select(start, length)`

Select the text from the start position for the given length. If you only specify a start position, the cursor will be set to that point and there will be no spanning selection.

#### `writer.selection()`

Returns the current selection object with additional methods to inspect and manipulate the selection

##### `writer.selection().ancestor()`

Returns the common ancestor element of the current selection

##### `writer.selection().container()`

Returns the writer element

##### `writer.selection().containerRect()`

Returns the largest possible selection DOMRect for the element. This is useful if you want to compare the current selection to the rest of the content

##### `writer.selection().end()`

Returns the position of the selection end

##### `writer.selection().isWithin()`

Checks if the selection is within the writer container

##### `writer.selection().length()`

Returns the length of the selected text

##### `writer.selection().object()`

Returns the native selection object

##### `writer.selection().range(clone = false)`

Returns the currently active range object (or null)

##### `writer.selection().rangeAfterCursor()`

Returns the range object before the cursor

##### `writer.selection().rangeBeforeCursor()`

Returns the range object after the cursor

##### `writer.selection().rect()`

Returns the DOMRect of the current selection

##### `writer.selection().select(start, end)`

Creates a new selection at the start and end point

##### `writer.selection().start()`

Returns the start position of the selection

##### `writer.selection().text()`

Returns the selected text

-----

#### `writer.toHtml(start, length)`

Returns the current Writer content as sanitized HTML

#### `writer.toJson(start, length)`

Returns the current Writer content as JSON object

#### `writer.toText(start, length)`

Returns the current Writer content as plain text.

#### `writer.undo()`

Reverts the last step in history

#### `writer.update()`

Triggers a writer update manually. This will update the HTML in the writer according to the current document state. It will also trigger the `onChange` event.

## CSS

The Writer does not need a lot of CSS to work. You can find the suggested CSS in `writer.css`:

```css
.writer {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  white-space: pre-wrap;
  line-height: 1.5em;
}
.writer:empty::after {
  content: attr(data-placeholder);
  color: rgba(0,0,0, .5);
}
.writer code {
  font-family: "SFMono-Regular", Consolas, Liberation Mono, Menlo, Courier, monospace;
  background: #efefef;
  font-size: .925rem;
  padding: 0 .125em;
  display: inline-block;
  border-radius: 3px;
}
.writer strong {
  font-weight: bold;
}
.writer em {
  font-style: italic;
}
.writer a {
  text-decoration: underline;
  color: currentColor;
}
```

## Contributing

There are still many things to get right before we can launch this project. It would be amazing to have you on board. Just get in contact if you don't know where to start: bastian@getkirby.com

## Developing

1. Clone the repository
2. `npm run i`
3. `npm run start`
4. Start writing code

## Testing

We are using Cypress to run e2e and unit tests. Make sure to install the dependencies first with `npm i`.

### via Cypress app

Open the Cypress app with `npm run cy:open`

### via command line

Start all tests on the command line with `npm run test`

## License
This editor is licensed under the MIT license and will stay open. It will not fall under our proprietary Kirby license. Promised!

## Authors
Bastian Allgeier
<bastian@getkirby.com>

... join me!

# Kirby Writer

A modern opinionated WYSIWYG editor. 

## About this editor

**This library is still experimental and looking for help to get finished. DO NOT USE IN PRODUCTION!** 

----

Yes, you read that correctly. We are trying to build our own contenteditable wrapper in Javascript. It seems like a stupid idea. Maybe it is. But **we are drastically limiting the scope of this project**:

### Inline formats only

Modern content editing tools have moved away from the idea to solve everything within a single contenteditable element. Notion's editor, something like Gutenberg or our own [Kirby Editor](https://github.com/getkirby/editor) turn to a new block editor model, in which each block element (heading, images, videos, etc.) are handled seperately and new block types can be added to extend the editor feature set. This has a lot of benefits. It massively reduces the complexity of what each block component has to solve and also leads to a more controllable content structure that can be exported as something like JSON instead of HTML. 

For such block editors, a fully fledged WYSIWYG editor is way too much. What they need is a WYSIWYG editor that only handles inline elements (strong, em, code, sub, sup, etc.) in a reliable and clean way. This is exactly what this editor implementation does. By completely ignoring any kind of block elements, we can make this library a lot smaller and simpler and focus on perfect structured inline content, selection and event APIs that help to build great block types. 

### Modern browsers only

This library also does not support any legacy browsers. We don't have to care about IE and some outdated selection APIs. It's fully written in ES6 and is aimed at browsers that support ES6 modules by default. https://caniuse.com/#feat=es6-module

## Demo 

https://writer.getkirby.com

## Contributing

There are still many things to get right before we can launch this project. We need help with the history implementation, unit tests, e2e browser testes and more. It would be amazing to have you on board. Just get in contact if you don't know where to start: bastian@getkirby.com

## Developing 

So far, this project does not have a build process or dedicated dev environment. Those are the steps to get started: 

1. Clone the repository
2. `npm run dev` (this requires PHP as we use a simple PHP server so far) You can easily change this to your favorite simple server. Anything that can server HTML files should work. 
3. Start writing code

## License
This editor is licensed under the MIT license and will stay open. It will not fall under our proprietary Kirby license. Promised! 

## Authors
Bastian Allgeier 
<bastian@getkirby.com>

... join me! 

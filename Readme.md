# retext-content [![Build Status](https://travis-ci.org/wooorm/retext-content.svg?branch=master)](https://travis-ci.org/wooorm/retext-content) [![Coverage Status](https://img.shields.io/coveralls/wooorm/retext-content.svg)](https://coveralls.io/r/wooorm/retext-content?branch=master)

[![browser support](https://ci.testling.com/wooorm/retext-content.png) ](https://ci.testling.com/wooorm/retext-content)

See [Browser Support](#browser-support) for more information (a.k.a. don’t worry about those grey icons above).

---

Append, prepend, remove, and replace content into/from  **[retext](https://github.com/wooorm/retext "Retext")** nodes.

## Installation

NPM:
```sh
$ npm install retext-content
```

Component.js:
```sh
$ component install wooorm/retext-content
```

## Usage

```js
var Retext = require('retext'),
    content = require('retext-content');

var root = new Retext()
    .use(content)
    .parse('simple sentence.');

// Prepend:
rootNode.head.head.prependContent('One ');
root.toString(); // "One simple sentence."

// Append:
rootNode.head.appendContent(' Two sentences.');
root.toString(); // "One simple sentence. Two sentences."

// Replace:
rootNode.replaceContent('One paragraph.\n\nTwo paragraphs.');
root.toString(); // "One paragraph.\n\nTwo paragraphs."

// Remove:
rootNode.tail.removeContent();
root.toString(); // "One paragraph.\n\n"

// Remove outer content:
rootNode.head.removeOuterContent();
root.toString(); // "\n\n"

// Replace outer content:
rootNode.head.replaceOuterContent("One paragraph.\n\nTwo paragraphs.");
root.toString(); // "One paragraph.\n\nTwo paragraphs."
```

## API

Note that **retext-content** does not validate, when for example operating on a sentence, if an actual given values could contain more than one sentences. This might result in incorrect trees (such as, a word with its value set to a sentence), but makes it possible to correctly classify values which parsers might classify wrongly.

#### TextOM.Parent#prependContent(value)

```js
var Retext = require('retext'),
    content = require('content'),
    rootNode = new Retext().use(content).parse('simple sentence.');

// Prepend into the first sentence of the first paragraph:
rootNode.head.head.prependContent('A document including a ')
rootNode.toString(); // 'A document including a simple sentence.'
```

Inserts the parsed nodes at the beginning of the node.

- `value` (Non-empty `String`): The to-parse and prepend inside content.

#### TextOM.Parent#appendContent(value)

```js
var Retext = require('retext'),
    content = require('content'),
    rootNode = new Retext().use(content).parse('A document');

// Append into the first sentence of the first paragraph:
rootNode.head.head.appendContent(' including a simple sentence');
rootNode.toString(); // 'A document including a simple sentence.'
```

Inserts the parsed nodes at the end of the node.

- `value` (Non-empty `String`): The to-parse and append inside content.

#### TextOM.Parent#removeContent()

```js
var Retext = require('retext'),
    content = require('content'),
    rootNode = new Retext().use(content).parse('A sentence. Another sentence.');

// Remove the content of the first sentence of the first paragraph:
rootNode.head.head.removeContent();
rootNode.toString(); // ' Another sentence.'
```

Removes all children of the node.

#### TextOM.Parent#replaceContent(value?)

```js
var Retext = require('retext'),
    content = require('content'),
    rootNode = new Retext().use(content).parse('A sentence.');

// Replace the content of the first paragraph:
rootNode.head.replaceContent('One sentence. Two sentences.');
rootNode.toString(); // 'One sentence. Two sentences.'
```

Removes all children of the node, inserts the parsed nodes.

- `value` (`String`): The to-parse and insert inside content.

#### TextOM.Parent#removeOuterContent()

```js
var Retext = require('retext'),
    content = require('content'),
    rootNode = new Retext().use(content).parse('A sentence. Another sentence.');

// Remove the node:
rootNode.head.head.removeOuterContent();
rootNode.toString(); // ' Another sentence.'
```

Removes the node.

#### TextOM.Parent#replaceOuterContent(value?)

```js
var Retext = require('retext'),
    content = require('content'),
    rootNode = new Retext().use(content).parse('A sentence.');

// Replace the content of the first paragraph:
rootNode.head.replaceOuterContent('One sentence.\n\nTwo sentences.');
rootNode.toString(); // 'One sentence.\n\nTwo sentences.'
```

Replaces the node with the parsed nodes.

- `value` (`String`): The to-parse and replace-with content.

## Browser Support
Pretty much every browser (available through browserstack) runs all retext-content unit tests.

## License

  MIT

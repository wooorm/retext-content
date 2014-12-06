# retext-content [![Build Status](https://img.shields.io/travis/wooorm/retext-content.svg?style=flat)](https://travis-ci.org/wooorm/retext-content) [![Coverage Status](https://img.shields.io/coveralls/wooorm/retext-content.svg?style=flat)](https://coveralls.io/r/wooorm/retext-content?branch=master)

Append, prepend, remove, and replace content into/from  **[retext](https://github.com/wooorm/retext "Retext")** nodes.

## Installation

npm:
```sh
$ npm install retext-content
```

Component:
```sh
$ component install wooorm/retext-content
```

Bower:
```sh
$ bower install retext-content
```

## Usage

```js
var Retext = require('retext');
var content = require('retext-content');

var retext = new Retext().use(content);

/**
 * See each method below.
 */
```

## API

Note that **retext-content** does not validate—for example when operating on a sentence—if an actual given values could contain more than one sentences. This might result in incorrect trees (such as, a word with spaces), but makes it possible to correctly classify values which parsers might classify wrongly.

### [TextOM.Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#prependContent(value)

```js
retext.parse('simple sentence.', function (err, tree) {
    /* Prepend into the first sentence. */

    tree.head.head.prependContent('A document including a ');
    tree.toString();
    /* 'A document including a simple sentence.' */
});
```

Inserts the parsed `value` at the beginning of the node.

- `value` (Non-empty `String`): The to-parse and prepend inside content.

### [TextOM.Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#appendContent(value)

```js
retext.parse('A document', function (err, tree) {
    /* Append into the first sentence. */

    tree.head.head.appendContent(' including a simple sentence.');
    tree.toString();
    /* 'A document including a simple sentence.' */
});
```

Inserts the parsed `value` at the end of the node.

- `value` (Non-empty `String`): The to-parse and append inside content.

### [TextOM.Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#removeContent()

```js
retext.parse('A sentence. Another sentence.', function (err, tree) {
    /* Remove the content of the first sentence. */

    tree.head.head.removeContent();
    tree.toString();
    /* ' Another sentence.' */
});
```

Removes all children of the node.

### [TextOM.Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#replaceContent(value?)

```js
retext.parse('A sentence. Another sentence.', function (err, tree) {
    /* Replace the content of the first paragraph. */

    tree.head.replaceContent('One sentence. Two sentences.');
    tree.toString();
    /* 'One sentence. Two sentences.' */
});
```

Removes all children of the node, inserts the parsed nodes.

- `value` (`String`): The to-parse and insert inside content.

### [TextOM.Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#removeOuterContent()

```js
retext.parse('A sentence. Another sentence.', function (err, tree) {
    /* Remove the first sentence. */

    tree.head.head.removeOuterContent();
    tree.toString();
    /* ' Another sentence.' */
});
```

Removes the node.
This is exactly the same as `node.remove()`.

### [TextOM.Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#replaceOuterContent(value?)

```js
retext.parse('A sentence.', function (err, tree) {
    /* Replace the first sentence with two sentences. */

    tree.head.head.replaceOuterContent('One sentence.\n\nTwo sentences.');
    tree.toString();
    /* 'One sentence.\n\nTwo sentences.' */
});
```

Replaces the node with the parsed nodes.

- `value` (`String`): The to-parse and replace-with content.

## License

MIT © [Titus Wormer](http://wooorm.com)

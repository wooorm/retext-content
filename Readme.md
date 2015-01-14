# retext-content [![Build Status](https://img.shields.io/travis/wooorm/retext-content.svg?style=flat)](https://travis-ci.org/wooorm/retext-content) [![Coverage Status](https://img.shields.io/coveralls/wooorm/retext-content.svg?style=flat)](https://coveralls.io/r/wooorm/retext-content?branch=master)

Append, prepend, remove, and replace content into/from  **[retext](https://github.com/wooorm/retext)** nodes.

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
$ npm install retext-content
```

[Component.js](https://github.com/componentjs/component):

```bash
$ component install wooorm/retext-content
```

[Bower](http://bower.io/#install-packages):

```bash
$ bower install retext-content
```

## Usage

```javascript
var Retext = require('retext');
var content = require('retext-content');

var retext = new Retext().use(content);

/* See each method below. */
```

## API

Note that **retext-content** does not validate—for example when operating on a sentence—if a given value could contain multiple sentences. This might result in incorrect trees (such as, a word with spaces), but makes it possible to correctly classify values which parsers might classify wrongly.

### [Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#prependContent(value)

```javascript
retext.parse('simple sentence.', function (err, tree) {
    /* Prepend into the first sentence. */

    tree.head.head.prependContent('A document including a ');
    tree.toString();
    /* 'A document including a simple sentence.' */
});
```

Insert the parsed `value` at the beginning of `parent`.

- `value` (Non-empty `string`): The to-parse and prepend inside content.

### [Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#appendContent(value)

```javascript
retext.parse('A document', function (err, tree) {
    /* Append into the first sentence. */

    tree.head.head.appendContent(' including a simple sentence.');
    tree.toString();
    /* 'A document including a simple sentence.' */
});
```

Insert the parsed `value` at the end of `parent`.

- `value` (Non-empty `string`): The to-parse and append inside content.

### [Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#removeContent()

```javascript
retext.parse('A sentence. Another sentence.', function (err, tree) {
    /* Remove the content of the first sentence. */

    tree.head.head.removeContent();
    tree.toString();
    /* ' Another sentence.' */
});
```

Remove all children of `parent`.

### [Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#replaceContent(value?)

```javascript
retext.parse('A sentence. Another sentence.', function (err, tree) {
    /* Replace the content of the first paragraph. */

    tree.head.replaceContent('One sentence. Two sentences.');
    tree.toString();
    /* 'One sentence. Two sentences.' */
});
```

Remove all children of `parent`. Insert the parsed `value`.

- `value` (`string`, `null`): The to-parse and insert inside content.

### [Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#removeOuterContent()

```javascript
retext.parse('A sentence. Another sentence.', function (err, tree) {
    /* Remove the first sentence. */

    tree.head.head.removeOuterContent();
    tree.toString();
    /* ' Another sentence.' */
});
```

Remove `parent`. This is exactly the same as `node.remove()`.

### [Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#replaceOuterContent(value?)

```javascript
retext.parse('A sentence.', function (err, tree) {
    /* Replace the first sentence with two sentences. */

    tree.head.head.replaceOuterContent('One sentence.\n\nTwo sentences.');
    tree.toString();
    /* 'One sentence.\n\nTwo sentences.' */
});
```

Replace `parent` with the parsed `value`.

- `value` (`string`, optional): The to-parse and replace-with content.

## Performance

```text
           TextOM.Parent#prependContent()
  168 op/s » Prepend a paragraph before an ever growing section
  163 op/s » Prepend a paragraph before an ever growing article

           TextOM.Parent#appendContent()
  171 op/s » Append a paragraph after an ever growing section
  178 op/s » Append a paragraph after an ever growing article

           TextOM.Parent#replaceContent()
  175 op/s » Replace a paragraph in a section
  175 op/s » Replace a paragraph in an article

           TextOM.Parent#replaceOuterContent()
  171 op/s » Replace a paragraph with another paragraph in a section
  174 op/s » Replace a paragraph with another paragraph in an article
```

## License

MIT © [Titus Wormer](http://wooorm.com)

'use strict';

/**
 * Module dependencies.
 */

var retextRange,
    toTextOM;

retextRange = require('retext-range');
toTextOM = require('nlcst-to-textom');

/**
 * Constants.
 */

var slice;

slice = Array.prototype.slice;

/**
 * Detect if a value loosly resembles an array-like
 * value.
 *
 * @param {*} value
 * @return {boolean}
 */

function isArrayLike(value) {
    return typeof value === 'object' && 'length' in value;
}

/**
 * Get a tokenizer for a given node.
 *
 * @param {Object} parser
 * @param {Node} node
 * @return {Function?}
 */

function getTokenizer(parser, node) {
    var type;

    type = node.type.substr(0, node.type.indexOf('Node'));

    if ('tokenize' + type in parser) {
        return parser['tokenize' + type];
    }

    return null;
}

/**
 * Insert the given value after (when given) `node` or
 * the `head` of `parent`.
 *
 * Tries to be smart about which nodes to add: nodes of
 * the same type or without hierarchy.
 *
 * @param {Parent} parent - Node to insert into.
 * @param {Child?} node - Node to insert after.
 * @param {string} value - Value to parse and insert.
 * @return {Range} - Range with its `startContainer` set
 *   to the first inserted node and `endContainer` to
 *   the last inserted node.
 */

function insert(parent, node, value) {
    var TextOM,
        parser,
        range,
        tokenizer,
        tree,
        index;

    if (
        !parent ||
        !parent.TextOM ||
        !(
            parent.nodeName === parent.PARENT ||
            parent.nodeName === parent.ELEMENT
        )
    ) {
        throw new TypeError(
            'TypeError: `' + parent + '` is not a valid ' +
            'parent for `insert(parent, node?, value)`'
        );
    }

    TextOM = parent.TextOM;
    parser = TextOM.parser;

    tokenizer = getTokenizer(parser, parent);

    if (!tokenizer) {
        throw new TypeError(
            'TypeError: `' + parent + '` is not a valid ' +
            'parent for `insert(parent, node?, value)`'
        );
    }

    tree = toTextOM(TextOM, tokenizer.call(parser, value));

    range = new TextOM.Range();

    if (!tree.head) {
        throw new TypeError(
            'Illegal invocation: `' + value +
            '` is not a valid value for `insert`'
        );
    }

    range.setStart(tree.head);
    range.setEnd(tree.tail || tree.head);

    tree = slice.call(tree);

    /**
     * Speed up the node removal by making TextOM
     * think all nodes are detached.
     */

    index = -1;

    while (tree[++index]) {
        tree[index].parent = null;
    }

    if (node) {
        node.afterAll(tree);
    } else {
        parent.prependAll(tree);
    }

    return range;
}

/**
 * Removes each node in `nodes`.
 *
 * @param {Parent|Array.<Child>} nodes
 */

function remove(nodes) {
    var index;

    if (
        !nodes ||
        !('length' in nodes) ||
        !(
            'TextOM' in nodes ||
            isArrayLike(nodes)
        )
    ) {
        throw new TypeError(
            'TypeError: `' + nodes + '` is neither a ' +
            'node nor list of nodes for `remove(nodes)`'
        );
    }

    nodes = slice.call(nodes);
    index = nodes.length;

    while (index--) {
        nodes[index].remove();
    }
}

/**
 * Inserts `value` at the start of the operated on parent.
 *
 * @param {string} value - Value to parse and insert.
 * @return {Range} - Range with its `startContainer` set
 *   to the first inserted node and `endContainer` to
 *   the last inserted node.
 * @this Parent
 */

function prependContent(value) {
    return insert(this, null, value);
}

/**
 * Inserts `value` at the end of the operated on parent.
 *
 * @param {string} value - Value to parse and insert.
 * @return {Range} - Range with its `startContainer` set
 *   to the first inserted node and `endContainer` to
 *   the last inserted node.
 * @this Parent
 */

function appendContent(value) {
    return insert(this, this && (this.tail || this.head), value);
}

/**
 * Removes the content of the operated on parent.
 *
 * @this Parent
 */

function removeContent() {
    remove(this);
}

/**
 * Replaces the content of `parent` with `value`.
 *
 * @param {string} value - Value to parse and insert.
 * @return {Range} - Range with its `startContainer` set
 *   to the first inserted node and `endContainer` to
 *   the last inserted node.
 * @this Parent
 */
function replaceContent(value) {
    var self,
        nodes,
        result;

    self = this;

    if (
        !self ||
        !self.TextOM ||
        !(
            self.nodeName === self.PARENT ||
            self.nodeName === self.ELEMENT
        )
    ) {
        throw new TypeError(
            'TypeError: `' + self + '` is not a valid ' +
            'parent for `Parent#replaceContent(value?)`'
        );
    }

    nodes = slice.call(self);

    /**
     * Do not throw on empty `value`.
     */

    try {
        result = insert(self, null, value);
    } catch (error) {
        if (error.toString().indexOf('valid value') === -1) {
            throw error;
        }

        result = new self.TextOM.Range();
    }

    remove(nodes);

    return result;
}

/**
 * Removes the operated on element (both parent and child).
 *
 * @this Element
 */

function removeOuterContent() {
    var self;

    self = this;

    if (
        !self ||
        !self.TextOM ||
        self.nodeName !== self.ELEMENT
    ) {
        throw new TypeError(
            'TypeError: `' + self + '` is not a valid ' +
            'element for `Element#removeOuterContent()`'
        );
    }

    self.remove();
}

/**
 * Replace the operated on element with `value`.
 *
 * @param {string} value - Value to parse and insert.
 * @return {Range} - Range with its `startContainer` set
 *   to the first inserted node and `endContainer` to
 *   the last inserted node.
 * @this Element
 */

function replaceOuterContent(value) {
    var self,
        result;

    self = this;

    if (
        !self ||
        !self.TextOM ||
        !self.parent ||
        self.nodeName !== self.ELEMENT
    ) {
        throw new TypeError(
            'TypeError: `' + self + '` is not a valid ' +
            'element for `Element#replaceOuterContent(value?)`'
        );
    }

    /**
     * Do not throw on empty `value`.
     */

    try {
        result = insert(self.parent, self, value);
    } catch (error) {
        if (error.toString().indexOf('valid value') === -1) {
            throw error;
        }

        result = new self.TextOM.Range();
    }

    self.remove();

    return result;
}

/**
 * Define `content`.
 *
 * @param {Retext} retext - Instance of Retext.
 */

function content(retext) {
    var TextOM,
        elementPrototype,
        parentPrototype;

    TextOM = retext.TextOM;
    elementPrototype = TextOM.Element.prototype;
    parentPrototype = TextOM.Parent.prototype;

    /**
     * Depend on `retext-range`.
     */

    retext.use(retextRange);

    /**
     * Expose `prependContent` on Parent.
     */

    elementPrototype.prependContent = prependContent;
    parentPrototype.prependContent = prependContent;

    /**
     * Expose `appendContent` on Parent.
     */

    elementPrototype.appendContent = appendContent;
    parentPrototype.appendContent = appendContent;

    /**
     * Expose `removeContent` on Parent.
     */

    elementPrototype.removeContent = removeContent;
    parentPrototype.removeContent = removeContent;

    /**
     * Expose `replaceContent` on Parent.
     */

    elementPrototype.replaceContent = replaceContent;
    parentPrototype.replaceContent = replaceContent;

    /**
     * Expose `removeOuterContent` on (Parent and) Element.
     */

    elementPrototype.removeOuterContent = removeOuterContent;
    parentPrototype.removeOuterContent = removeOuterContent;

    /**
     * Expose `replaceOuterContent` on (Parent and) Element.
     */

    elementPrototype.replaceOuterContent = replaceOuterContent;
    parentPrototype.replaceOuterContent = replaceOuterContent;
}

/**
 * Expose `content`.
 */

module.exports = content;

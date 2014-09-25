'use strict';

/**
 * Module dependencies.
 */

var retextRange;

retextRange = require('retext-range');

/**
 * Constants.
 */

var has,
    slice;

slice = Array.prototype.slice;
has = Object.prototype.hasOwnProperty;

/**
 * Define `content`.
 */

function content() {}

/**
 * Transform a concrete syntax tree into a tree constructed
 * from a given object model.
 *
 * @param {Object} TextOM - the object model.
 * @param {Object} cst - the concrete syntax tree to
 *   transform.
 * @return {Node} the node constructed from the
 *   CST and the object model.
 */

function fromCST(TextOM, cst) {
    var index,
        node,
        children,
        data,
        attribute;

    node = new TextOM[cst.type]();

    if ('children' in cst) {
        index = -1;
        children = cst.children;

        while (children[++index]) {
            node.append(fromCST(TextOM, children[index]));
        }
    } else {
        node.fromString(cst.value);
    }

    /**
     * Currently, `data` properties are not really
     * specified or documented. Therefore, the following
     * branch is ignored by Istanbul.
     *
     * The idea is that plugins and parsers can each
     * attach data to nodes, in a similar fashion to the
     * DOMs dataset, which can be stringified and parsed
     * back and forth between the concrete syntax tree
     * and the node.
     */

    /* istanbul ignore if: TODO, Untestable, will change soon. */
    if ('data' in cst) {
        data = cst.data;

        for (attribute in data) {
            if (has.call(data, attribute)) {
                node.data[attribute] = data[attribute];
            }
        }
    }

    return node;
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
            parent instanceof parent.TextOM.Parent ||
            parent instanceof parent.TextOM.Element
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

    tree = fromCST(TextOM, tokenizer.call(parser, value));

    range = new TextOM.Range();

    if (!tree.head) {
        throw new TypeError(
            'Illegal invocation: `' + value +
            '` is not a valid value for `insert`'
        );
    }

    range.setStart(tree.head);
    range.setEnd(tree.tail || tree.head);

    index = tree.length;

    while (tree[--index]) {
        (node ? node.after : parent.prepend).call(
            node || parent, tree[index]
        );
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
            nodes instanceof Array
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
            self instanceof self.TextOM.Parent ||
            self instanceof self.TextOM.Element
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
        !(
            self instanceof self.TextOM.Element
        )
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
        !(
            self instanceof self.TextOM.Element
        )
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

function attach(retext) {
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
 * Expose `attach`.
 */

content.attach = attach;

/**
 * Expose `content`.
 */

module.exports = content;

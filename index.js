'use strict';

var retextRange = require('retext-range');

exports = module.exports = function () {};

var slice = Array.prototype.slice;

function fromAST(TextOM, ast) {
    var iterator = -1,
        children, node;

    node = new TextOM[ast.type]();

    if ('children' in ast) {
        iterator = -1;
        children = ast.children;

        while (children[++iterator]) {
            node.append(fromAST(TextOM, children[iterator]));
        }
    } else {
        node.fromString(ast.value);
    }

    return node;
}

function getTokenizer(parser, node) {
    var type = node.type.substr(0, node.type.indexOf('Node'));

    if ('tokenize' + type in parser) {
        return parser['tokenize' + type];
    }
}

/**
 * Inserts the given source after (when given), the `item`, and
 * otherwise as the first item of the given parent. Tries to be smart
 * about which nodes to add (i.e., nodes of the same or without
 * hierarchy).
 *
 * @param {Parent} parent - The node to insert into.
 * @param {?Item} item - The node to insert after.
 * @param {string} source - The source to parse and insert.
 * @return {Range} - A range object with its startContainer set to the
 *   first inserted node, and endContainer to the last inserted node.
 * @private
 */
function insert(parent, item, source) {
    var parser, range, tokenizer, tree, iterator;

    if (!parent || !parent.TextOM ||
        !(parent instanceof parent.TextOM.Parent ||
        parent instanceof parent.TextOM.Element)) {
            throw new TypeError(
                'Type Error: \'' + parent +
                '\' is not a valid parent for \'insert\''
            );
    }

    parser = parent.TextOM.parser;
    tokenizer = getTokenizer(parser, parent);

    if (!tokenizer) {
        throw new TypeError(
            'Illegal invocation: \'' + parent +
            '\' is not a valid context object for \'insert\''
        );
    }

    tree = fromAST(parent.TextOM, tokenizer.call(parser, source));

    range = new parent.TextOM.Range();

    if (!tree.head) {
        throw new TypeError(
            'Illegal invocation: \'' + source +
            '\' is not a valid source for \'insert\''
        );
    }

    range.setStart(tree.head);
    range.setEnd(tree.tail || tree.head);

    iterator = tree.length;

    while (tree[--iterator]) {
        (item ? item.after : parent.prepend).call(
            item || parent, tree[iterator]
        );
    }

    return range;
}

/**
 * Removes each item in `items`.
 *
 * @param {Parent|Array.<Child>} items - The nodes to remove.
 * @private
 */
function remove(items) {
    var iterator;

    if (!items || !('length' in items) ||
        !('TextOM' in items || items instanceof Array)) {
            throw new TypeError(
                'Type Error: \'' + items +
                '\' is neither a valid node nor list of nodes for \'remove\''
            );
    }

    items = slice.call(items);
    iterator = items.length;

    while (items[--iterator]) {
        items[iterator].remove();
    }
}

/**
 * Inserts the given `source` at the start of the operated on parent.
 *
 * @param {string} source - The source to parse and insert.
 * @return {Range} - A range object with its startContainer set to the
 *   first prepended node, and endContainer to the last prepended node.
 * @this Parent
 * @private
 */
function prependContent(source) {
    return insert(this, null, source);
}

/**
 * Inserts the given `source` at the end of the operated on parent.
 *
 * @param {string} source - The source to parse and insert.
 * @return {Range} - A range object with its startContainer set to the
 *   first appended node, and endContainer to the last appended node.
 * @this Parent
 * @private
 */
function appendContent(source) {
    return insert(this, this && (this.tail || this.head), source);
}

/**
 * Removes the content of the operated on parent.
 *
 * @this Parent
 * @private
 */
function removeContent() {
    remove(this);
}

/**
 * Inserts the given `source` at the end of the operated on parent and
 * removes its previous content.
 *
 * @param {string} source - The source to parse and insert.
 * @return {Range} - A range object with its startContainer set to the
 *   first inserted node, and endContainer to the last inserted node.
 * @this Parent
 * @private
 */
function replaceContent(source) {
    var self = this,
        items, result;

    if (!self || !self.TextOM || !(self instanceof self.TextOM.Parent ||
        self instanceof self.TextOM.Element)) {
            throw new TypeError(
                'Type Error: the context object is not a valid parent' +
                ' for \'replaceContent\''
            );
    }

    items = slice.call(self);

    /* Do not throw on empty given values. */
    try {
        result = insert(self, null, source);
    } catch (error) {
        if (error.toString().indexOf('valid source') === -1) {
            throw error;
        }

        result = new self.TextOM.Range();
    }

    remove(items);

    return result;
}

/**
 * Removes the operated on element (both parent and child).
 *
 * @this Element
 * @private
 */
function removeOuterContent() {
    var self = this;

    if (!self || !self.TextOM || !(self instanceof self.TextOM.Element)) {
        throw new TypeError(
            'Type Error: the context object is not a valid element' +
            ' for \'removeOuterContent\''
        );
    }

    self.remove();
}

/**
 * Replaced the operated on element (both parent and child) with the given
 * `source`.
 *
 * @param {string} source - The source to parse and insert.
 * @return {Range} - A range object with its startContainer set to the
 *   first inserted node, and endContainer to the last inserted node.
 * @this Element
 * @private
 */
function replaceOuterContent(source) {
    var self = this,
        result;

    if (
        !self || !self.TextOM || !self.parent ||
        !(self instanceof self.TextOM.Element)
    ) {
        throw new TypeError(
            'Type Error: the context object is not a valid element' +
            ' for \'replaceOuterContent\''
        );
    }

    /* Do not throw on empty given values. */
    try {
        result = insert(self.parent, self, source);
    } catch (error) {
        if (error.toString().indexOf('valid source') === -1) {
            throw error;
        }

        result = new self.TextOM.Range();
    }

    self.remove();

    return result;
}

function attach(retext) {
    var TextOM = retext.TextOM,
        elementPrototype = TextOM.Element.prototype,
        parentPrototype = TextOM.Parent.prototype;

    /* Use retext-range */
    retext.use(retextRange);

    /**
     * Expose `prependContent` on Parent.
     * @public
     * @memberof TextOM.Parent.prototype
     */
    elementPrototype.prependContent = parentPrototype.prependContent =
        prependContent;

    /**
     * Expose `appendContent` on Parent.
     * @public
     * @memberof TextOM.Parent.prototype
     */
    elementPrototype.appendContent = parentPrototype.appendContent =
        appendContent;

    /**
     * Expose `removeContent` on Parent.
     * @public
     * @memberof TextOM.Parent.prototype
     */
    elementPrototype.removeContent = parentPrototype.removeContent =
        removeContent;

    /**
     * Expose `replaceContent` on Parent.
     * @public
     * @memberof TextOM.Parent.prototype
     */
    elementPrototype.replaceContent = parentPrototype.replaceContent =
        replaceContent;

    /**
     * Expose `removeOuterContent` on (Parent and) Element.
     * @public
     * @memberof TextOM.Element.prototype
     */
    elementPrototype.removeOuterContent =
        parentPrototype.removeOuterContent = removeOuterContent;

    /**
     * Expose `replaceOuterContent` on (Parent and) Element.
     * @public
     * @memberof TextOM.Element.prototype
     */
    elementPrototype.replaceOuterContent =
        parentPrototype.replaceOuterContent = replaceOuterContent;
}

/**
 * Expose `attach`.
 * @memberof exports
 */
exports.attach = attach;

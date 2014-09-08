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
 * `insert` inserts the given source after (when given), the `item`, and
 * otherwise as the first item of the given parent. Tries to be smart
 * about which nodes to add (i.e., nodes of the same or without
 * hierarchy).
 *
 * @param {Object} parent - The node to insert into.
 * @param {Object?} item - The node to insert after.
 * @param {String} source - The source to parse and insert.
 * @return {Range} - A range object with its startContainer set to the
 *                   first inserted node, and endContainer set to to
 *                   the last inserted node.
 * @api private
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
 * `remove` calls `remove` on each item in `items`.
 *
 * @param {Node|Node[]} items - The nodes to remove.
 * @api private
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
 * `prependContent` inserts the parsed `source` at the start of the
 * operated on node.
 *
 * @param {String} source - The source to parse and insert.
 * @return {Range} - A range object with its startContainer set to the
 *                   first prepended node, and endContainer set to to
 *                   the last prepended node.
 * @global
 * @private
 */
function prependContent(source) {
    return insert(this, null, source);
}

/**
 * `appendContent` inserts the parsed `source` at the end of the operated
 * on node.
 *
 * @param {String} source - The source to parse and insert.
 * @return {Range} - A range object with its startContainer set to the
 *                   first appended node, and endContainer set to to the
 *                   last appended node.
 * @global
 * @private
 */
function appendContent(source) {
    return insert(this, this && (this.tail || this.head), source);
}

/**
 * `removeContent` removes the content of the operated on node.
 *
 * @global
 * @private
 */
function removeContent() {
    remove(this);
}

/**
 * `replaceContent` inserts the parsed `source` at the end of the operated
 * on node, and removes its previous children.
 *
 * @param {String} source - The source to parse and insert.
 * @return {Range} - A range object with its startContainer set to the
 *                   first appended node, and endContainer set to to the
 *                   last appended node.
 * @global
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

    try {
        result = insert(self, null, source);
    } catch (error) {
        if (error.toString().indexOf('context object') !== -1) {
            throw error;
        }
    }

    remove(items);

    return result;
}

function attach(retext) {
    var TextOM = retext.TextOM,
        elementPrototype = TextOM.Element.prototype,
        parentPrototype = TextOM.Parent.prototype;

    /* Use retext-range */
    retext.use(retextRange);

    /**
     * `prependContent` inserts the parsed `source` at the start of the
     * operated on parent.
     *
     * @param {String} source - The source to parse and insert.
     * @return {Range} - A range object with its startContainer set to the
     *                   first prepended node, and endContainer set to to
     *                   the last prepended node.
     * @api public
     * @memberof TextOM.Parent.prototype
     */
    elementPrototype.prependContent = parentPrototype.prependContent =
        prependContent;

    /**
     * `appendContent` inserts the parsed `source` at the end of the operated
     * on parent.
     *
     * @param {String} source - The source to parse and insert.
     * @return {Range} - A range object with its startContainer set to the
     *                   first appended node, and endContainer set to to the
     *                   last appended node.
     * @api public
     * @memberof TextOM.Parent.prototype
     */
    elementPrototype.appendContent = parentPrototype.appendContent =
        appendContent;

    /**
     * `removeContent` removes the content of the operated on parent.
     *
     * @api public
     * @memberof TextOM.Parent.prototype
     */
    elementPrototype.removeContent = parentPrototype.removeContent =
        removeContent;

    /**
     * `replaceContent` inserts the parsed `source` at the end of the operated
     * on parent, and removes its previous children.
     *
     * @param {String} source - The source to parse and insert.
     * @return {Range} - A range object with its startContainer set to the
     *                   first appended node, and endContainer set to to the
     *                   last appended node.
     * @api public
     * @memberof TextOM.Parent.prototype
     */
    elementPrototype.replaceContent = parentPrototype.replaceContent =
        replaceContent;
}

/**
 * Expose `attach`.
 * @memberof exports
 */
exports.attach = attach;

/**
 * Expose `prependContent`.
 * @memberof exports
 */
exports.prependContent = prependContent;

/**
 * Expose `appendContent`.
 * @memberof exports
 */
exports.appendContent = appendContent;

/**
 * Expose `removeContent`.
 * @memberof exports
 */
exports.removeContent = removeContent;

/**
 * Expose `replaceContent`.
 * @memberof exports
 */
exports.replaceContent = replaceContent;

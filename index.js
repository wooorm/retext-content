'use strict';

var retextRange = require('retext-range');

exports = module.exports = function () {};

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
    var hierarchy, child, range, children, iterator;

    if (!parent || !parent.TextOM ||
        !(parent instanceof parent.TextOM.Parent ||
        parent instanceof parent.TextOM.Element)) {
            throw new TypeError('Type Error');
    }

    hierarchy = parent.hierarchy + 1;
    child = parent.parser(source);

    if (!child.length) {
        throw new TypeError('Illegal invocation: \'' + source +
            '\' is not a valid argument for \'insert\'');
    }

    while (child.hierarchy < hierarchy) {
        /* WhiteSpace, and the like, or multiple children. */
        if (child.length > 1) {
            if (!('hierarchy' in child.head) ||
                child.head.hierarchy === hierarchy) {
                    children = [].slice.call(child);
                    break;
            } else {
                throw new TypeError('Illegal invocation: Can\'t ' +
                    'insert from multiple parents');
            }
        } else {
            child = child.head;
        }
    }

    if (!children) {
        children = [child];
    }

    range = new parent.TextOM.Range();
    range.setStart(children[0]);
    range.setEnd(children[children.length - 1]);

    iterator = children.length;

    while (children[--iterator]) {
        (item ? item.after : parent.prepend).call(
            item || parent, children[iterator]
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
            throw new TypeError('Type Error');
    }

    items = [].slice.call(items);
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
            throw new TypeError('Type Error');
    }

    items = [].slice.call(self);

    if (self.parser(source).length) {
        result = insert(self, null, source);
    }

    remove(items);

    return result;
}

function attach(retext) {
    var TextOM = retext.parser.TextOM,
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

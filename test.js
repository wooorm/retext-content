'use strict';

var content,
    retextAST,
    Retext,
    assert,
    TextOM,
    retext;

/**
 * Module dependencies.
 */

content = require('./');
retextAST = require('retext-ast');
Retext = require('retext');
assert = require('assert');

/**
 * Retext.
 */

retext = new Retext()
    .use(retextAST)
    .use(content);

TextOM = retext.TextOM;

/**
 * Tests.
 */

describe('retext-content()', function () {
    it('should be a `function`', function () {
        assert(typeof content === 'function');
    });
});

describe('retext-content.attach()', function () {
    it('should be a `function`', function () {
        assert(typeof content.attach === 'function');
    });

    it('should attach a `prependContent` method to `TextOM.Parent#',
        function () {
            assert('prependContent' in TextOM.Parent.prototype);
            assert('prependContent' in TextOM.Element.prototype);
        }
    );

    it('should attach a `appendContent` method to `TextOM.Parent#',
        function () {
            assert('appendContent' in TextOM.Parent.prototype);
            assert('appendContent' in TextOM.Element.prototype);
        }
    );

    it('should attach a `removeContent` method to `TextOM.Parent#',
        function () {
            assert('removeContent' in TextOM.Parent.prototype);
            assert('removeContent' in TextOM.Element.prototype);
        }
    );

    it('should attach a `replaceContent` method to `TextOM.Parent#',
        function () {
            assert('replaceContent' in TextOM.Parent.prototype);
            assert('replaceContent' in TextOM.Element.prototype);
        }
    );

    it('should attach a `removeOuterContent` method to `TextOM.Parent#',
        function () {
            assert('removeOuterContent' in TextOM.Parent.prototype);
            assert('removeOuterContent' in TextOM.Element.prototype);
        }
    );

    it('should attach a `replaceOuterContent` method to `TextOM.Parent#',
        function () {
            assert('replaceOuterContent' in TextOM.Parent.prototype);
            assert('replaceOuterContent' in TextOM.Element.prototype);
        }
    );
});

describe('Parent#prependContent(value)', function () {
    it('should be a `function`', function () {
        assert(typeof TextOM.Parent.prototype.prependContent === 'function');
    });

    it('should throw when given an empty value', function (done) {
        retext.parse('A document.', function (err, tree) {
            assert.throws(function () {
                tree.prependContent('');
            }, /``/);

            assert.throws(function () {
                tree.prependContent();
            }, /undefined/);

            done(err);
        });
    });

    it('should throw when not opperating on a parent', function (done) {
        retext.parse('A document.', function (err, tree) {
            assert.throws(function () {
                tree.prependContent.call();
            }, /undefined/);

            assert.throws(function () {
                tree.prependContent.call(new TextOM.TextNode('test'));
            }, /test/);

            done(err);
        });
    });

    it('should throw when opperating on an unknown node', function (done) {
        retext.parse('A document.', function (err, tree) {
            tree.type = 'SomeUnknownNode';

            assert.throws(function () {
                tree.prependContent();
            }, /A document\./);

            done(err);
        });
    });

    it('should return a `Range`', function (done) {
        retext.parse('A document.', function (err, tree) {
            assert(
                tree.prependContent('A paragraph.') instanceof TextOM.Range
            );

            done(err);
        });
    });

    it('should return a `Range` with `startContainer` set to the first ' +
        'new node',
        function (done) {
            retext.parse('A document.', function (err, tree) {
                var range;

                range = tree.prependContent(
                    'A first paragraph.\n\nA second paragraph.\n\n'
                );

                assert(
                    range.startContainer instanceof TextOM.ParagraphNode
                );

                assert(
                    range.startContainer.toString() ===
                    'A first paragraph.'
                );

                done(err);
            });
        }
    );

    it('should return a `Range` with `endContainer` set to the last ' +
        'new node',
        function (done) {
            retext.parse('A document.', function (err, tree) {
                var range;

                range = tree.prependContent(
                    'A first paragraph.\n\nA second paragraph.\n\n'
                );

                assert(
                    range.endContainer instanceof TextOM.WhiteSpaceNode
                );

                assert(
                    range.endContainer.toString() ===
                    '\n\n'
                );

                done(err);
            });
        }
    );

    it('should insert one or more `ParagraphNode`s when operating on ' +
        'a `RootNode`',
        function (done) {
            retext.parse('A paragraph.', function (err, tree) {
                tree.prependContent('Another paragraph. ');

                assert(tree.head instanceof TextOM.ParagraphNode);
                assert(tree.toString() === 'Another paragraph. A paragraph.');

                done(err);
            });
        }
    );

    it('should insert one or more `SentenceNode`s when operating on ' +
        'a `ParagraphNode`',
        function (done) {
            retext.parse('A paragraph.', function (err, tree) {
                var node;

                node = tree.head;

                node.prependContent(
                    'A second sentence. A third sentence. '
                );

                assert(node.head instanceof TextOM.SentenceNode);
                assert(
                    node.toString() ===
                    'A second sentence. A third sentence. A paragraph.'
                );

                done(err);
            });
        }
    );

    it('should insert one or more `WordNode`, `PunctuationNode`, ' +
        'and `WhiteSpaceNode`s, when operating on a `SentenceNode`',
        function (done) {
            retext.parse('A sentence.', function (err, tree) {
                var node;

                node = tree.head.head;

                node.prependContent(
                    'Some words, whitespace, and punctuation: '
                );

                assert(node.head instanceof TextOM.WordNode);
                assert(
                    node.toString() ===
                    'Some words, whitespace, and punctuation: A sentence.'
                );

                done(err);
            });
        }
    );

    it('should insert one or more `WhiteSpaceNode`s, when starting or ' +
        'ending the given value',
        function (done) {
            retext.parse('A paragraph.', function (err, tree) {
                tree.prependContent('\n\nAnother paragraph.\n\n');

                assert(tree.head instanceof TextOM.WhiteSpaceNode);
                assert(
                    tree.toString() ===
                    '\n\nAnother paragraph.\n\nA paragraph.'
                );

                done(err);
            });
        }
    );
});

describe('Parent#appendContent(value)', function () {
    it('should be a `function`', function () {
        assert(typeof TextOM.Parent.prototype.appendContent === 'function');
    });

    it('should throw when given an empty value', function (done) {
        retext.parse('A document.', function (err, tree) {
            assert.throws(function () {
                tree.appendContent('');
            }, /``/);

            assert.throws(function () {
                tree.appendContent();
            }, /undefined/);

            done(err);
        });
    });

    it('should throw when not opperating on a parent', function (done) {
        retext.parse('A document.', function (err, tree) {
            assert.throws(function () {
                tree.appendContent.call();
            }, /undefined/);

            assert.throws(function () {
                tree.appendContent.call(new TextOM.TextNode('test'));
            }, /test/);

            done(err);
        });
    });

    it('should throw when opperating on an unknown node', function (done) {
        retext.parse('A document.', function (err, tree) {
            tree.type = 'SomeUnknownNode';

            assert.throws(function () {
                tree.appendContent();
            }, /A document\./);

            done(err);
        });
    });

    it('should return a `Range`', function (done) {
        retext.parse('A document.', function (err, tree) {
            assert(
                tree.appendContent('A paragraph.') instanceof TextOM.Range
            );

            done(err);
        });
    });

    it('should return a `Range` with `startContainer` set to the first ' +
        'new node',
        function (done) {
            retext.parse('A document.', function (err, tree) {
                var range;

                range = tree.appendContent(
                    'A first paragraph.\n\nA second paragraph.\n\n'
                );

                assert(
                    range.startContainer instanceof TextOM.ParagraphNode
                );

                assert(
                    range.startContainer.toString() ===
                    'A first paragraph.'
                );

                done(err);
            });
        }
    );

    it('should return a `Range` with `endContainer` set to the last ' +
        'new node',
        function (done) {
            retext.parse('A document.', function (err, tree) {
                var range;

                range = tree.appendContent(
                    'A first paragraph.\n\nA second paragraph.\n\n'
                );

                assert(
                    range.endContainer instanceof TextOM.WhiteSpaceNode
                );

                assert(
                    range.endContainer.toString() ===
                    '\n\n'
                );

                done(err);
            });
        }
    );

    it('should insert one or more `ParagraphNode`s when operating on ' +
        'a `RootNode`',
        function (done) {
            retext.parse('A paragraph.', function (err, tree) {
                tree.appendContent(' Another paragraph.');

                assert(tree.head instanceof TextOM.ParagraphNode);
                assert(tree.toString() === 'A paragraph. Another paragraph.');

                done(err);
            });
        }
    );

    it('should insert one or more `SentenceNode`s when operating on ' +
        'a `ParagraphNode`',
        function (done) {
            retext.parse('A paragraph.', function (err, tree) {
                var node;

                node = tree.head;

                node.appendContent(
                    ' A second sentence. A third sentence.'
                );

                assert(node.head instanceof TextOM.SentenceNode);
                assert(
                    node.toString() ===
                    'A paragraph. A second sentence. A third sentence.'
                );

                done(err);
            });
        }
    );

    it('should insert one or more `WordNode`, `PunctuationNode`, ' +
        'and `WhiteSpaceNode`s, when operating on a `SentenceNode`',
        function (done) {
            retext.parse('A sentence:', function (err, tree) {
                var node;

                node = tree.head.head;

                node.appendContent(
                    ' some words, whitespace, and punctuation.'
                );

                assert(node.head instanceof TextOM.WordNode);
                assert(
                    node.toString() ===
                    'A sentence: some words, whitespace, and punctuation.'
                );

                done(err);
            });
        }
    );

    it('should insert one or more `WhiteSpaceNode`s, when starting or ' +
        'ending the given value',
        function (done) {
            retext.parse('A paragraph.', function (err, tree) {
                tree.appendContent('\n\nAnother paragraph.\n\n');

                assert(tree.tail instanceof TextOM.WhiteSpaceNode);
                assert(
                    tree.toString() ===
                    'A paragraph.\n\nAnother paragraph.\n\n'
                );

                done(err);
            });
        }
    );
});

describe('Parent#replaceContent(value?)', function () {
    it('should be a `function`', function () {
        assert(typeof TextOM.Parent.prototype.replaceContent === 'function');
    });

    it('should NOT throw when given an empty value', function (done) {
        retext.parse('A document.', function (err, tree) {
            assert.doesNotThrow(function () {
                tree.replaceContent('');
            }, /``/);

            assert.doesNotThrow(function () {
                tree.replaceContent();
            }, /undefined/);

            done(err);
        });
    });

    it('should throw when not opperating on a parent', function (done) {
        retext.parse('A document.', function (err, tree) {
            assert.throws(function () {
                tree.replaceContent.call();
            }, /undefined/);

            assert.throws(function () {
                tree.replaceContent.call(new TextOM.TextNode('test'));
            }, /test/);

            done(err);
        });
    });

    it('should throw when opperating on an unknown node', function (done) {
        retext.parse('A document.', function (err, tree) {
            tree.type = 'SomeUnknownNode';

            assert.throws(function () {
                tree.replaceContent();
            }, /A document\./);

            done(err);
        });
    });

    it('should return a `Range`', function (done) {
        retext.parse('A document.', function (err, tree) {
            assert(
                tree.replaceContent('A paragraph.') instanceof TextOM.Range
            );

            done(err);
        });
    });

    it('should return a `Range` with `startContainer` set to the first ' +
        'new node',
        function (done) {
            retext.parse('A document.', function (err, tree) {
                var range;

                range = tree.replaceContent(
                    'A first paragraph.\n\nA second paragraph.\n\n'
                );

                assert(
                    range.startContainer instanceof TextOM.ParagraphNode
                );

                assert(
                    range.startContainer.toString() ===
                    'A first paragraph.'
                );

                done(err);
            });
        }
    );

    it('should return a `Range` with `endContainer` set to the last ' +
        'new node',
        function (done) {
            retext.parse('A document.', function (err, tree) {
                var range;

                range = tree.replaceContent(
                    'A first paragraph.\n\nA second paragraph.\n\n'
                );

                assert(
                    range.endContainer instanceof TextOM.WhiteSpaceNode
                );

                assert(
                    range.endContainer.toString() ===
                    '\n\n'
                );

                done(err);
            });
        }
    );

    it('should insert one or more `ParagraphNode`s when operating on ' +
        'a `RootNode`',
        function (done) {
            retext.parse('A paragraph.', function (err, tree) {
                tree.replaceContent('Another paragraph.');

                assert(tree.head instanceof TextOM.ParagraphNode);
                assert(tree.toString() === 'Another paragraph.');

                done(err);
            });
        }
    );

    it('should insert one or more `SentenceNode`s when operating on ' +
        'a `ParagraphNode`',
        function (done) {
            retext.parse('A paragraph.', function (err, tree) {
                var node;

                node = tree.head;

                node.replaceContent(
                    'A second sentence. A third sentence.'
                );

                assert(node.head instanceof TextOM.SentenceNode);
                assert(
                    node.toString() ===
                    'A second sentence. A third sentence.'
                );

                done(err);
            });
        }
    );

    it('should insert one or more `WordNode`, `PunctuationNode`, ' +
        'and `WhiteSpaceNode`s, when operating on a `SentenceNode`',
        function (done) {
            retext.parse('A sentence.', function (err, tree) {
                var node;

                node = tree.head.head;

                node.replaceContent(
                    'Some words, whitespace, and punctuation.'
                );

                assert(node.head instanceof TextOM.WordNode);
                assert(
                    node.toString() ===
                    'Some words, whitespace, and punctuation.'
                );

                done(err);
            });
        }
    );

    it('should insert one or more `WhiteSpaceNode`s, when starting or ' +
        'ending the given value',
        function (done) {
            retext.parse('A paragraph.', function (err, tree) {
                tree.replaceContent('\n\nAnother paragraph.\n\n');

                assert(tree.head instanceof TextOM.WhiteSpaceNode);
                assert(tree.tail instanceof TextOM.WhiteSpaceNode);
                assert(
                    tree.toString() ===
                    '\n\nAnother paragraph.\n\n'
                );

                done(err);
            });
        }
    );
});

describe('Parent#removeContent()', function () {
    it('should be a `function`', function () {
        assert(typeof TextOM.Parent.prototype.removeContent === 'function');
    });

    it('should throw when not opperating on a parent', function (done) {
        retext.parse('A document.', function (err, tree) {
            assert.throws(function () {
                tree.removeContent.call();
            }, /undefined/);

            assert.throws(function () {
                tree.removeContent.call(new TextOM.TextNode('test'));
            }, /test/);

            done(err);
        });
    });

    it('should remove all `ParagraphNode`s and `WhiteSpaceNode`s when ' +
        'operating on a `RootNode`',
        function (done) {
            retext.parse(
                'A document.\n\nContaining two paragraphs.',
                function (err, tree) {
                    tree.removeContent();

                    assert(tree.toString() === '');
                    assert(tree.length === 0);

                    done(err);
                }
            );
        }
    );

    it('should remove all `SentenceNode`s and `WhiteSpaceNode`s when ' +
        'operating on a `ParagraphNode`',
        function (done) {
            retext.parse(
                'A document. Containing two paragraphs.\n\n' +
                'The first paragraph contains two sentences.',
                function (err, tree) {
                    tree.head.removeContent();

                    assert(tree.head.toString() === '');
                    assert(tree.head.length === 0);

                    assert(
                        tree.toString() ===
                        '\n\nThe first paragraph contains two sentences.'
                    );

                    done(err);
                }
            );
        }
    );

    it('should remove all `WordNode`, `WhiteSpaceNode`, and ' +
        '`PunctuationNode`s when operating on a `SentenceNode`',
        function (done) {
            retext.parse(
                'A document. Containing two paragraphs.\n\n' +
                'The first paragraph contains two sentences.',
                function (err, tree) {
                    tree.head.head.removeContent();

                    assert(tree.head.head.toString() === '');
                    assert(tree.head.head.length === 0);

                    assert(
                        tree.toString() ===
                        ' Containing two paragraphs.\n\n' +
                        'The first paragraph contains two sentences.'
                    );

                    done(err);
                }
            );
        }
    );
});

describe('Parent#removeOuterContent()', function () {
    it('should be a `function`', function () {
        assert(
            typeof TextOM.Element.prototype.removeOuterContent === 'function'
        );
    });

    it('should throw when not opperating on an `Element`', function (done) {
        retext.parse('A document.', function (err, tree) {
            assert.throws(function () {
                tree.removeOuterContent.call();
            }, /undefined/);

            assert.throws(function () {
                tree.removeOuterContent();
            }, /A document\./);

            assert.throws(function () {
                tree.removeOuterContent.call(new TextOM.TextNode('test'));
            }, /test/);

            done(err);
        });
    });

    it('should remove the operated on node when operating on an element',
        function (done) {
            retext.parse(
                'A document. Containing two paragraphs.\n\n' +
                'The first paragraph contains two sentences.',
                function (err, tree) {
                    tree.head.removeOuterContent();

                    assert(tree.length === 2);
                    assert(
                        tree.toString() ===
                        '\n\nThe first paragraph contains two sentences.'
                    );

                    done(err);
                }
            );
        }
    );
});

describe('Parent#replaceOuterContent(value?)', function () {
    it('should be a `function`', function () {
        assert(
            typeof TextOM.Parent.prototype.replaceOuterContent === 'function'
        );
    });

    it('should NOT throw when given an empty value', function (done) {
        retext.parse(
            'A document.\n\nAnother document.',
            function (err, tree) {
                assert.doesNotThrow(function () {
                    tree.head.replaceOuterContent('');
                });

                assert.doesNotThrow(function () {
                    tree.head.replaceOuterContent();
                });

                done(err);
            }
        );
    });

    it('should throw when not opperating on an `Element`', function (done) {
        retext.parse('A document.', function (err, tree) {
            assert.throws(function () {
                tree.replaceOuterContent.call();
            }, /undefined/);

            assert.throws(function () {
                tree.replaceOuterContent();
            }, /A document\./);

            assert.throws(function () {
                tree.replaceOuterContent.call(new TextOM.TextNode('test'));
            }, /test/);

            done(err);
        });
    });

    it('should throw when the operated on node has an unknown parent',
        function (done) {
            retext.parse('A document.', function (err, tree) {
                tree.type = 'SomeUnknownNode';

                assert.throws(function () {
                    tree.head.replaceOuterContent();
                }, /A document\./);

                done(err);
            });
        }
    );

    it('should replace the operated on node with new siblings',
        function (done) {
            retext.parse(
                'A first paragraph.\n' +
                '\n' +
                'A second paragraph.',
                function (err, tree) {
                    var node;

                    node = tree.tail;

                    node.replaceOuterContent(
                        'A third paragraph.\n' +
                        '\n' +
                        'A fourth paragraph.'
                    );

                    assert(!node.parent);

                    assert(
                        tree.toString() ===
                        'A first paragraph.\n' +
                        '\n' +
                        'A third paragraph.\n' +
                        '\n' +
                        'A fourth paragraph.'
                    );

                    done(err);
                }
            );
        }
    );

    it('should return a `Range`', function (done) {
        retext.parse('A document.', function (err, tree) {
            assert(
                tree.head.replaceOuterContent('A paragraph.') instanceof
                TextOM.Range
            );

            done(err);
        });
    });

    it('should return a range with its start- and end set to the ' +
        'first and last nodes',
        function (done) {
            retext.parse(
                'A first paragraph.\n' +
                '\n' +
                'A second paragraph.',
                function (err, tree) {
                    var range;

                    range = tree.head.replaceOuterContent(
                        'A third paragraph.\n' +
                        '\n' +
                        'A fourth paragraph.'
                    );

                    assert(
                        range.startContainer instanceof TextOM.ParagraphNode
                    );

                    assert(
                        range.endContainer instanceof TextOM.ParagraphNode
                    );

                    assert(
                        range.startContainer.toString() ===
                        'A third paragraph.'
                    );

                    assert(
                        range.endContainer.toString() ===
                        'A fourth paragraph.'
                    );

                    assert(
                        range.toString() ===
                        'A third paragraph.\n' +
                        '\n' +
                        'A fourth paragraph.'
                    );

                    done(err);
                }
            );
        }
    );
});

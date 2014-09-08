'use strict';

var content, retextAST, Retext, assert, TextOM, retext;

content = require('..');
retextAST = require('retext-ast');
Retext = require('retext');
assert = require('assert');

retext = new Retext().use(retextAST).use(content);
TextOM = retext.parser.TextOM;

describe('retext-content', function () {
    it('should be of type `function`', function () {
        assert(typeof content === 'function');
    });

    it('should export an `attach` method', function () {
        assert(typeof content.attach === 'function');
    });
});

describe('retext-content.attach', function () {
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
    it('should be of type `function`', function () {
        assert(typeof TextOM.Parent.prototype.prependContent === 'function');
    });

    it('should throw, when given an empty value', function () {
        var root = retext.parse('A document.');

        assert.throws(function () {
            root.prependContent('');
        }, /''/);

        assert.throws(function () {
            root.prependContent();
        }, /undefined/);
    });

    it('should throw, when not opperating on a parent', function () {
        var root = retext.parse('A document.');

        assert.throws(function () {
            root.prependContent.call();
        }, /Type Error/);

        assert.throws(function () {
            root.prependContent.call(new TextOM.TextNode('test'));
        }, /Type Error/);
    });

    it('should throw, when opperating on an unknown node', function () {
        var node = retext.parse('document').head.head.head;

        node.type = 'SomeUnknownNode';

        assert.throws(function () {
            node.prependContent();
        }, 'context object');
    });

    it('should return a newly initialized `Range` object', function () {
        var root = retext.parse('A document.');
        assert(root.prependContent('A paragraph.') instanceof TextOM.Range);
    });

    it('should return a `Range` with a `startContainer` set to the first ' +
        'prepended node', function () {
            var root = retext.parse('A document.'),
                range = root.prependContent(
                    'A first paragraph.\n\nA second paragraph.\n\n'
                );

            assert(
                range.startContainer instanceof TextOM.ParagraphNode
            );
            assert(
                range.toString() ===
                'A first paragraph.\n\nA second paragraph.\n\n'
            );
        }
    );

    it('should return a `Range` with a `endContainer` set to the last ' +
        'prepended node', function () {
            var root = retext.parse('A document.'),
                range = root.prependContent(
                    'A first paragraph.\n\nA second paragraph.\n\n'
                );

            assert(
                range.endContainer instanceof TextOM.WhiteSpaceNode
            );
            assert(
                range.toString() ===
                'A first paragraph.\n\nA second paragraph.\n\n'
            );
        }
    );

    it('should prepend one or more `ParagraphNode`s when operating on ' +
        'a `RootNode`', function () {
            var root = retext.parse('A document including a paragraph.');
            root.prependContent('Another paragraph. ');

            assert(root.head instanceof TextOM.ParagraphNode);
            assert(
                root.toString() ===
                'Another paragraph. A document including a paragraph.'
            );
        }
    );

    it('should prepend one or more `SentenceNode`s when operating on ' +
        'a `ParagraphNode`', function () {
            var paragraph = retext.parse(
                'A document including a paragraph.'
            ).head;

            paragraph.prependContent('A second sentence. A third sentence. ');

            assert(paragraph.head instanceof TextOM.SentenceNode);
            assert(
                paragraph.toString() ===
                'A second sentence. A third sentence. A document ' +
                'including a paragraph.'
            );
        }
    );

    it('should prepend one or more of `WordNode`, `PunctuationNode`, ' +
        'and `WhiteSpaceNode`, when operating on a `SentenceNode`',
        function () {
            var sentence = retext.parse('A sentence.').head.head;

            sentence.prependContent(
                'Some words, whitespace, and punctuation '
            );

            assert(sentence.head instanceof TextOM.WordNode);
            assert(
                sentence.toString() ===
                'Some words, whitespace, and punctuation A sentence.'
            );
        }
    );

    it('should prepend one or more of `WhiteSpaceNode`s, when starting or ' +
        'ending the given value', function () {
            var root = retext.parse('A document including a paragraph.');
            root.prependContent('\n\nAnother paragraph.\n\n');

            assert(root.head instanceof TextOM.WhiteSpaceNode);
            assert(
                root.toString() ===
                '\n\nAnother paragraph.\n\nA document including a paragraph.'
            );
        }
    );
});

describe('Parent#appendContent(value)', function () {
    it('should be of type `function`', function () {
        assert(typeof TextOM.Parent.prototype.appendContent === 'function');
    });

    it('should throw, when given an empty value', function () {
        var root = retext.parse('A document.');

        assert.throws(function () {
            root.appendContent('');
        }, /''/);

        assert.throws(function () {
            root.appendContent();
        }, /undefined/);
    });

    it('should throw, when not opperating on a parent', function () {
        var root = retext.parse('A document.');

        assert.throws(function () {
            root.appendContent.call();
        }, /Type Error/);

        assert.throws(function () {
            root.appendContent.call(new TextOM.TextNode('test'));
        }, /Type Error/);
    });

    it('should throw, when opperating on an unknown node', function () {
        var node = retext.parse('document').head.head.head;

        node.type = 'SomeUnknownNode';

        assert.throws(function () {
            node.appendContent();
        }, 'context object');
    });

    it('should return a newly initialized `Range` object', function () {
        var root = retext.parse('A document.');
        assert(root.appendContent('A paragraph.') instanceof TextOM.Range);
    });

    it('should return a `Range` with a `startContainer` set to the first ' +
        'appended node', function () {
            var root = retext.parse('A document.'),
                range = root.appendContent(
                    '\n\nA first paragraph.\n\nA second paragraph.'
                );

            assert(range.startContainer instanceof TextOM.WhiteSpaceNode);
            assert(
                range.toString() ===
                '\n\nA first paragraph.\n\nA second paragraph.'
            );
        }
    );

    it('should return a `Range` with a `endContainer` set to the last ' +
        'appended node', function () {
            var root = retext.parse('A document.'),
                range = root.appendContent(
                    '\n\nA first paragraph.\n\nA second paragraph.'
                );

            assert(range.endContainer instanceof TextOM.ParagraphNode);
            assert(
                range.toString() ===
                '\n\nA first paragraph.\n\nA second paragraph.'
            );
        }
    );

    it('should append one or more `ParagraphNode`s when operating on ' +
        'a `RootNode`', function () {
            var root = retext.parse('A document including a paragraph.');
            root.appendContent(' Another paragraph.');

            assert(root.tail instanceof TextOM.ParagraphNode);
            assert(
                root.toString() ===
                'A document including a paragraph. Another paragraph.'
            );
        }
    );

    it('should append one or more `SentenceNode`s when operating on a ' +
        '`ParagraphNode`', function () {
            var paragraph = retext.parse(
                'A document including a paragraph.'
            ).head;

            paragraph.appendContent(' A second sentence. A third sentence.');

            assert(paragraph.tail instanceof TextOM.SentenceNode);
            assert(
                paragraph.toString() ===
                'A document including a paragraph. A second sentence. A ' +
                'third sentence.'
            );
        }
    );

    it('should append one or more of `WordNode`, `PunctuationNode`, and ' +
        '`WhiteSpaceNode`, when operating on a `SentenceNode`', function () {
            var sentence = retext.parse('A sentence').head.head;

            sentence.appendContent(
                ', some words, whitespace, and punctuation.'
            );

            assert(sentence.tail instanceof TextOM.PunctuationNode);
            assert(
                sentence.toString() ===
                'A sentence, some words, whitespace, and punctuation.'
            );
        }
    );

    it('should append one or more of `WhiteSpaceNode`s, when starting or ' +
        'ending the given value', function () {
            var root = retext.parse('A document including a paragraph.');
            root.appendContent('\n\nAnother paragraph.\n\n');

            assert(root.tail instanceof TextOM.WhiteSpaceNode);
            assert(root.tail.prev.prev instanceof TextOM.WhiteSpaceNode);
            assert(
                root.toString() ===
                'A document including a paragraph.\n\nAnother paragraph.\n\n'
            );
        }
    );
});

describe('Parent#replaceContent(value?)', function () {
    it('should be of type `function`', function () {
        assert(typeof TextOM.Parent.prototype.replaceContent === 'function');
    });

    it('should NOT throw, when given an empty value', function () {
        var root = retext.parse('A document.');
        assert.doesNotThrow(function () {
            root.replaceContent('');
        });
        assert.doesNotThrow(function () {
            root.replaceContent();
        });
    });

    it('should throw, when not opperating on a parent', function () {
        var root = retext.parse('A document.');

        assert.throws(function () {
            root.replaceContent.call();
        }, /Type Error/);

        assert.throws(function () {
            root.replaceContent.call(new TextOM.TextNode('test'));
        }, /Type Error/);
    });

    it('should throw, when opperating on an unknown node', function () {
        var node = retext.parse('document').head.head.head;

        node.type = 'SomeUnknownNode';

        assert.throws(function () {
            node.replaceContent();
        }, 'context object');
    });

    it('should return a newly initialized `Range` object', function () {
        var root = retext.parse('A document.');
        assert(root.replaceContent('A paragraph.') instanceof TextOM.Range);
    });

    it('should return a `Range` with a `startContainer` set to the first ' +
        'inserted node', function () {
            var root = retext.parse('A document.'),
                range = root.replaceContent(
                    'A first paragraph.\n\nA second paragraph.'
                );

            assert(range.startContainer instanceof TextOM.ParagraphNode);
            assert(
                range.toString() ===
                'A first paragraph.\n\nA second paragraph.'
            );
        }
    );

    it('should return a `Range` with a `endContainer` set to the last ' +
        'inserted node', function () {
            var root = retext.parse('A document.'),
                range = root.replaceContent(
                    'A first paragraph.\n\nA second paragraph.'
                );

            assert(range.endContainer instanceof TextOM.ParagraphNode);
            assert(
                range.toString() ===
                'A first paragraph.\n\nA second paragraph.'
            );
        }
    );

    it('should replace one or more `ParagraphNode`s when operating on ' +
        'a `RootNode`', function () {
            var root = retext.parse('A document including a paragraph.');
            root.replaceContent('Another paragraph.');
            assert(root.head instanceof TextOM.ParagraphNode);
            assert(root.toString() === 'Another paragraph.');
        }
    );

    it('should insert one or more `SentenceNode`s when operating on ' +
        'a `ParagraphNode`', function () {
            var paragraph = retext.parse(
                'A document including a paragraph.'
            ).head;

            paragraph.replaceContent(
                'A second sentence. A third sentence.'
            );

            assert(paragraph.head instanceof TextOM.SentenceNode);
            assert(paragraph.tail instanceof TextOM.SentenceNode);
            assert(
                paragraph.toString() ===
                'A second sentence. A third sentence.'
            );
        }
    );

    it('should insert one or more of `WordNode`, `PunctuationNode`, and ' +
        '`WhiteSpaceNode`, when operating on a `SentenceNode`', function () {
            var sentence = retext.parse('A sentence').head.head;
            sentence.replaceContent(
                'Some words, whitespace, and punctuation.'
            );
            assert(sentence.head instanceof TextOM.WordNode);
            assert(sentence.tail instanceof TextOM.PunctuationNode);
            assert(
                sentence.toString() ===
                'Some words, whitespace, and punctuation.'
            );
        }
    );

    it('should insert one or more of `WhiteSpaceNode`s, when starting or ' +
        'ending the given value', function () {
            var root = retext.parse('A document including a paragraph.');
            root.replaceContent('\n\nAnother paragraph.\n\n');
            assert(root.head instanceof TextOM.WhiteSpaceNode);
            assert(root.tail instanceof TextOM.WhiteSpaceNode);
            assert(root.toString() === '\n\nAnother paragraph.\n\n');
        }
    );
});

describe('Parent#removeContent()', function () {
    it('should be of type `function`', function () {
        assert(typeof TextOM.Parent.prototype.removeContent === 'function');
    });

    it('should throw, when not opperating on a parent', function () {
        var root = retext.parse('A document.');

        assert.throws(function () {
            root.removeContent.call();
        }, /Type Error/);

        assert.throws(function () {
            root.removeContent.call(new TextOM.TextNode('test'));
        }, /Type Error/);
    });

    it('should remove all `(Paragraph|WhiteSpace)Node`s when when ' +
        'operating on a `RootNode`', function () {
            var root = retext.parse(
                'A document.\n\nContaining two paragraphs.'
            );
            root.removeContent();
            assert(root.toString() === '');
            assert(root.length === 0);
        }
    );

    it('should remove all `(Sentence|WhiteSpace)Node`s when operating on ' +
        'a `ParagraphNode`', function () {
            var paragraph = retext.parse(
                'A document. Containing two paragraphs.\n\n' +
                'The first paragraph contains two sentences.'
            ).head;

            paragraph.removeContent();

            assert(paragraph.length === 0);
            assert(paragraph.toString() === '');
            assert(
                paragraph.parent.toString() ===
                '\n\nThe first paragraph contains two sentences.'
            );
        }
    );

    it('should remove one or more of `WordNode`, `PunctuationNode`, and ' +
        '`WhiteSpaceNode`, when operating on a `SentenceNode`', function () {
            var sentence = retext.parse(
                'A document. Containing two paragraphs.\n\n' +
                'The first paragraph contains two sentences.'
            ).head.head;

            sentence.removeContent();
            assert(sentence.length === 0);
            assert(sentence.toString() === '');
            assert(
                sentence.parent.parent.toString() ===
                ' Containing two paragraphs.\n\n' +
                'The first paragraph contains two sentences.'
            );
        }
    );
});

describe('Parent#removeOuterContent()', function () {
    it('should be of type `function`', function () {
        assert(
            typeof TextOM.Element.prototype.removeOuterContent === 'function'
        );
    });

    it('should throw, when not opperating on an element', function () {
        var root = retext.parse('A document.');

        assert.throws(function () {
            root.removeOuterContent.call();
        }, /Type Error/);

        assert.throws(function () {
            root.removeOuterContent();
        }, /Type Error/);

        assert.throws(function () {
            root.removeOuterContent.call(new TextOM.TextNode('test'));
        }, /Type Error/);
    });

    it('should remove the operated on node when operating on an element',
        function () {
            var root;

            root = retext.parse(
                'A document. Containing two paragraphs.\n\n' +
                'The first paragraph contains two sentences.'
            );

            root.head.removeOuterContent();

            assert(root.length === 2);
            assert(
                root.toString() ===
                '\n\nThe first paragraph contains two sentences.'
            );
        }
    );
});

describe('Parent#replaceOuterContent(value?)', function () {
    it('should be of type `function`', function () {
        assert(
            typeof TextOM.Parent.prototype.replaceOuterContent === 'function'
        );
    });

    it('should NOT throw, when given an empty value', function () {
        assert.doesNotThrow(function () {
            retext.parse('A document.').head.replaceOuterContent('');
        });

        assert.doesNotThrow(function () {
            retext.parse('A document.').head.replaceOuterContent();
        });
    });

    it('should throw, when not opperating on an element', function () {
        var root = retext.parse('A document.');

        assert.throws(function () {
            root.replaceOuterContent.call();
        }, /Type Error/);

        assert.throws(function () {
            root.replaceOuterContent();
        }, /Type Error/);

        assert.throws(function () {
            root.replaceOuterContent.call(new TextOM.TextNode('test'));
        }, /Type Error/);
    });

    it('should throw, when the operated on node has an unknown parent',
        function () {
            var node = retext.parse('document').head.head.head;

            node.parent.type = 'SomeUnknownNode';

            assert.throws(function () {
                node.replaceOuterContent();
            }, 'context object');
        }
    );

    it('should return a newly initialized `Range` object', function () {
        var paragraph = retext.parse('A document.').head;

        assert(
            paragraph.replaceOuterContent() instanceof TextOM.Range
        );
    });

    it('should replace the operated on node with new siblings', function () {
        var root, paragraph;

        root = retext.parse(
            'A first paragraph.\n' +
            '\n' +
            'A second paragraph.'
        );

        paragraph = root.tail;

        paragraph.replaceOuterContent(
            'A third paragraph.\n' +
            '\n' +
            'A fourth paragraph.'
        );

        assert(!paragraph.parent);

        assert(
            root.toString() ===
            'A first paragraph.\n' +
            '\n' +
            'A third paragraph.\n' +
            '\n' +
            'A fourth paragraph.'
        );
    });

    it('should replace return a range with its start- and set to the ' +
        'first and last inserted nodes', function () {
            var paragraph, range;

            paragraph = retext.parse(
                'A first paragraph.\n' +
                '\n' +
                'A second paragraph.'
            ).tail;

            range = paragraph.replaceOuterContent(
                'A third paragraph.\n' +
                '\n' +
                'A fourth paragraph.'
            );

            assert(range.startContainer instanceof TextOM.ParagraphNode);
            assert(range.endContainer instanceof TextOM.ParagraphNode);

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
        }
    );
});

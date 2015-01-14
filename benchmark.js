'use strict';

var Retext,
    retextContent;

/**
 * Dependencies.
 */

Retext = require('retext');
retextContent = require('./');

/**
 * Dependencies.
 */

var retext;

retext = new Retext().use(retextContent);

/**
 * Test data: A (big?) article (w/ 100 paragraphs, 500
 * sentences, 10,000 words);
 *
 * Source:
 *   http://www.gutenberg.org/files/10745/10745-h/10745-h.htm
 */

var sentence,
    paragraph,
    section,
    article,
    sectionNode,
    articleNode,
    enters;

sentence = 'Where she had stood was clear, and she was gone since Sir ' +
    'Kay does not choose to assume my quarrel.';

paragraph = 'Thou art a churlish knight to so affront a lady ' +
    'he could not sit upon his horse any longer. ' +
    'For methinks something hath befallen my lord and that he ' +
    'then, after a while, he cried out in great voice. ' +
    'For that light in the sky lieth in the south ' +
    'then Queen Helen fell down in a swoon, and lay. ' +
    'Touch me not, for I am not mortal, but Fay ' +
    'so the Lady of the Lake vanished away, everything behind. ' +
    sentence;

enters = '\n\n';

section = paragraph + Array(10).join(enters + paragraph);

article = section + Array(10).join(enters + section);

function createSection(done) {
    retext.parse(section, function (err, tree) {
        sectionNode = tree;

        done(err);
    });
}

function createArticle(done) {
    retext.parse(article, function (err, tree) {
        articleNode = tree;

        done(err);
    });
}

suite('TextOM.Parent#prependContent()', function () {
    before(createSection);
    before(createArticle);

    bench('Prepend a paragraph before an ever growing section', function () {
        sectionNode.head.prependContent(paragraph + enters);
    });

    bench('Prepend a paragraph before an ever growing article', function () {
        articleNode.head.prependContent(paragraph + enters);
    });
});

suite('TextOM.Parent#appendContent()', function () {
    before(createSection);
    before(createArticle);

    bench('Append a paragraph after an ever growing section', function () {
        sectionNode.tail.appendContent(enters + paragraph);
    });

    bench('Append a paragraph after an ever growing article', function () {
        articleNode.tail.appendContent(enters + paragraph);
    });
});

suite('TextOM.Parent#replaceContent()', function () {
    before(createSection);
    before(createArticle);

    bench('Replace a paragraph in a section', function () {
        sectionNode.head.replaceContent(paragraph);
    });

    bench('Replace a paragraph in an article', function () {
        articleNode.head.replaceContent(paragraph);
    });
});

suite('TextOM.Parent#replaceOuterContent()', function () {
    before(createSection);
    before(createArticle);

    bench('Replace a paragraph with another paragraph in a section',
        function () {
            sectionNode.head.replaceOuterContent(paragraph);
        }
    );

    bench('Replace a paragraph with another paragraph in an article',
        function () {
            articleNode.head.replaceOuterContent(paragraph);
        }
    );
});

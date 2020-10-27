import { Quad, NamedNode, BlankNode, Literal, Default, } from "./DataFactory.js";
const nnClosingTagError = () => new Error(`named node without closing angle bracket`);
const bnOpenTagError = () => new Error(`invalid blank node label`);
const unexpectedCharError = (identifier) => new Error(`Unexpected character '${identifier}'`);
const quadClosingPeriodError = (line) => new Error(`quad without closing period ${line}`);
const nnOpeningToken = "<";
const nnOpeningTokenOffset = nnOpeningToken.length;
const nnClosingToken = ">";
const nnClosingPostfix = "> ";
const nnClosingPostfixOffset = nnClosingPostfix.length;
const bnOpeningToken = "_";
const bnOpeningPrefix = "_:";
const bnOpeningPrefixOffset = bnOpeningPrefix.length;
const bnClosingToken = " ";
const bnClosingTokenOffset = bnClosingToken.length;
const ltOpeningToken = '"';
const ltOpeningTokenOffset = ltOpeningToken.length;
const quadClosingPostfix = ".";
const ltReservedReplace = /\\(.)/g;
const ltReservedReplaceFn = (match) => {
    switch (match) {
        case "\\n":
            return "\n";
        case "\\r":
            return "\r";
        case '\\"':
            return '"';
        case "\\\\":
            return "\\";
        default:
            throw new Error(`Unknown token ${match}`);
    }
};
// const lgOpeningToken: string = "@"
// const lgOpeningTokenOffset: number = lgOpeningToken.length
const lgOpeningPrefix = '"@';
const lgOpeningPrefixOffset = lgOpeningPrefix.length;
const lgClosingToken = " ";
const dtSplitPrefix = '"^^<';
const dtSplitPrefixOffset = dtSplitPrefix.length;
const xsdString = new NamedNode("http://www.w3.org/2001/XMLSchema#string");
const rdfLangString = new NamedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#langString");
export default function* Parse(input) {
    if (!input || input.length === 0) {
        return;
    }
    let rightBoundary, leftBoundary;
    let lang, datatype;
    let subject, predicate, object, graph;
    for (const line of input.split("\n")) {
        if (line === "") {
            continue;
        }
        rightBoundary = -1;
        leftBoundary = -1;
        /*
         * Parse the subject
         */
        switch (line.charAt(0)) {
            case nnOpeningToken:
                rightBoundary = line.indexOf(nnClosingPostfix);
                if (rightBoundary === -1) {
                    throw nnClosingTagError();
                }
                const namedNodeValue = line.substring(nnOpeningTokenOffset, rightBoundary);
                subject = new NamedNode(namedNodeValue);
                leftBoundary = rightBoundary + nnClosingPostfixOffset;
                break;
            case bnOpeningToken:
                rightBoundary = line.indexOf(bnClosingToken);
                const blankNodeValue = line.substring(bnOpeningPrefixOffset, rightBoundary);
                subject = new BlankNode(blankNodeValue);
                leftBoundary = rightBoundary + bnClosingTokenOffset;
                break;
            default:
                throw unexpectedCharError(line.charAt(0));
        }
        /*
         * Parse the predicate
         */
        // We currently assume blank nodes can't be predicates
        rightBoundary = line.indexOf(nnClosingPostfix, leftBoundary);
        if (rightBoundary === -1) {
            throw nnClosingTagError();
        }
        leftBoundary =
            line.indexOf(nnOpeningToken, leftBoundary) + nnOpeningTokenOffset;
        predicate = new NamedNode(line.substring(leftBoundary, rightBoundary));
        leftBoundary = rightBoundary + nnClosingPostfixOffset;
        /*
         * Parse the object
         */
        switch (line.charAt(leftBoundary)) {
            case nnOpeningToken:
                leftBoundary = leftBoundary + nnOpeningTokenOffset;
                // When parsing ntriples, the space of the nnClosingPostfix might not exist, so it can't be used
                rightBoundary = line.indexOf(nnClosingToken, leftBoundary);
                if (rightBoundary === -1) {
                    throw nnClosingTagError();
                }
                object = new NamedNode(line.substring(leftBoundary, rightBoundary));
                leftBoundary = rightBoundary + nnClosingPostfixOffset;
                break;
            case bnOpeningToken:
                leftBoundary =
                    line.indexOf(bnOpeningPrefix, leftBoundary) + bnOpeningPrefixOffset;
                rightBoundary = line.indexOf(bnClosingToken, leftBoundary);
                if (rightBoundary === -1) {
                    throw quadClosingPeriodError(line);
                }
                const value = line.substring(leftBoundary, rightBoundary);
                object = new BlankNode(value);
                leftBoundary = rightBoundary + bnClosingTokenOffset;
                break;
            case '"':
                leftBoundary = leftBoundary + ltOpeningTokenOffset;
                const objEndIndex = line.lastIndexOf(ltOpeningToken);
                const literalValue = line
                    .substring(leftBoundary, objEndIndex)
                    .replace(ltReservedReplace, ltReservedReplaceFn);
                leftBoundary = objEndIndex;
                // dtOrLgBoundary = line.indexOf(dtSplitPrefix, leftBoundary)
                if (line.substring(leftBoundary, leftBoundary + dtSplitPrefixOffset) ===
                    dtSplitPrefix) {
                    // Typed literal
                    rightBoundary = line.indexOf(nnClosingToken, leftBoundary + dtSplitPrefixOffset);
                    if (rightBoundary === -1) {
                        throw nnClosingTagError();
                    }
                    const value = line.substring(leftBoundary + dtSplitPrefixOffset, rightBoundary);
                    lang = null;
                    datatype = new NamedNode(value);
                    leftBoundary = rightBoundary + nnClosingPostfixOffset;
                }
                else if (line.substring(leftBoundary, leftBoundary + lgOpeningPrefixOffset) ===
                    lgOpeningPrefix) {
                    rightBoundary = line.indexOf(lgClosingToken, leftBoundary + lgOpeningPrefixOffset);
                    if (rightBoundary === -1) {
                        throw quadClosingPeriodError(line);
                    }
                    lang = line.substring(leftBoundary + lgOpeningPrefixOffset, rightBoundary);
                    datatype = rdfLangString;
                    leftBoundary = rightBoundary;
                }
                else {
                    // Implicit literals are strings
                    lang = null;
                    datatype = xsdString;
                    leftBoundary += ltOpeningTokenOffset + 1;
                }
                object =
                    lang === null
                        ? new Literal(literalValue, "", datatype)
                        : new Literal(literalValue, lang, rdfLangString);
                break;
            default:
                throw unexpectedCharError(line.charAt(leftBoundary));
        }
        /*
         * Parse the graph, if any
         */
        if (line[leftBoundary] === nnOpeningToken) {
            leftBoundary += nnOpeningTokenOffset;
            rightBoundary = line.indexOf(nnClosingPostfix, leftBoundary);
            if (rightBoundary === -1) {
                throw nnClosingTagError();
            }
            else if (line.substring(rightBoundary, rightBoundary + nnClosingPostfixOffset) !== nnClosingPostfix) {
                throw nnClosingTagError();
            }
            const value = line.substring(leftBoundary, rightBoundary);
            leftBoundary = rightBoundary + nnClosingPostfixOffset;
            graph = new NamedNode(value);
        }
        else if (line[leftBoundary] === bnOpeningToken) {
            if (line.substring(leftBoundary, leftBoundary + bnOpeningPrefixOffset) !==
                bnOpeningPrefix) {
                throw bnOpenTagError();
            }
            leftBoundary = leftBoundary + bnOpeningPrefixOffset;
            rightBoundary = line.indexOf(bnClosingToken, leftBoundary);
            if (rightBoundary === -1) {
                throw quadClosingPeriodError(line);
            }
            const value = line.substring(leftBoundary, rightBoundary);
            graph = new BlankNode(value);
            leftBoundary = rightBoundary + bnClosingTokenOffset;
        }
        else {
            graph = Default;
        }
        if (line.substring(leftBoundary) === quadClosingPostfix) {
            yield new Quad(subject, predicate, object, graph);
        }
        else {
            throw quadClosingPeriodError(line);
        }
    }
}

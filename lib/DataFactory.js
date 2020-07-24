import iris from "./IRIs.js";
const { rdf, xsd } = iris;
let _blankNodeCounter = 0;
class BaseTerm {
    constructor(id) {
        this.id = id;
    }
    equals(term) {
        if (term === undefined || term === null) {
            return false;
        }
        else if (term instanceof BaseTerm) {
            return this.id === term.id;
        }
        else {
            return this.termType === term.termType && this.value === term.value;
        }
    }
}
export class NamedNode extends BaseTerm {
    constructor(value) {
        super(`<${value}>`);
    }
    get termType() {
        return "NamedNode";
    }
    get value() {
        return this.id.slice(1, -1);
    }
    toJSON() {
        return {
            termType: this.termType,
            value: this.value,
        };
    }
}
const xsdString = new NamedNode(xsd.string);
const rdfLangString = new NamedNode(rdf.langString);
export class Literal extends BaseTerm {
    constructor(value, languageOrDataType) {
        if (typeof languageOrDataType === "string") {
            super(`"${value}"@${languageOrDataType.toLowerCase()}`);
        }
        else if (languageOrDataType === null ||
            languageOrDataType.value === xsd.string) {
            super(`"${value}"`);
        }
        else {
            super(`"${value}"^^<${languageOrDataType.value}>`);
        }
    }
    get termType() {
        return "Literal";
    }
    get value() {
        return this.id.substring(1, this.id.lastIndexOf('"'));
    }
    get term() {
        return `<${this.id}>`;
    }
    get language() {
        const i = this.id.lastIndexOf('"') + 1;
        return this.id[i] === "@" ? this.id.slice(i + 1) : "";
    }
    get datatype() {
        const i = this.id.lastIndexOf('"') + 1;
        if (this.id.length === i) {
            return xsdString;
        }
        else if (this.id[i] === "@") {
            return rdfLangString;
        }
        else if (this.id.slice(i, i + 3) === "^^<" &&
            this.id[this.id.length - 1] === ">") {
            return new NamedNode(this.id.slice(i + 3, -1));
        }
        else {
            throw new Error(`Invalid literal id ${this.id}`);
        }
    }
    get datatypeString() {
        const i = this.id.lastIndexOf('"') + 1;
        if (this.id.length === i) {
            return xsd.string;
        }
        else if (this.id[i] === "@") {
            return rdf.langString;
        }
        else if (this.id.slice(i, i + 3) === "^^<" &&
            this.id[this.id.length - 1] === ">") {
            return this.id.slice(i + 3, -1);
        }
        else {
            throw new Error(`Invalid literal id ${this.id}`);
        }
    }
    equals(term) {
        if (term === null || term === undefined) {
            return false;
        }
        else if (term instanceof Literal) {
            return this.id === term.id;
        }
        else {
            return (this.termType === term.termType &&
                this.value === term.value &&
                this.language === term.language &&
                this.datatypeString === term.datatype.value);
        }
    }
    toJSON() {
        return {
            termType: this.termType,
            value: this.value,
            language: this.language,
            datatype: { termType: "NamedNode", value: this.datatypeString },
        };
    }
}
export class BlankNode extends BaseTerm {
    constructor(name) {
        super("_:" + name);
    }
    get termType() {
        return "BlankNode";
    }
    get value() {
        return this.id.substr(2);
    }
    toJSON() {
        return {
            termType: this.termType,
            value: this.value,
        };
    }
}
export class Variable extends BaseTerm {
    constructor(name) {
        super("?" + name);
    }
    get termType() {
        return "Variable";
    }
    get value() {
        return this.id.slice(1);
    }
    toJSON() {
        return {
            termType: this.termType,
            value: this.value,
        };
    }
}
export class DefaultGraph extends BaseTerm {
    constructor() {
        super("");
    }
    get value() {
        return "";
    }
    get termType() {
        return "DefaultGraph";
    }
    toJSON() {
        return {
            termType: this.termType,
            value: "",
        };
    }
}
export const Default = new DefaultGraph();
export function fromId(id) {
    if (id === "") {
        return Default;
    }
    switch (id[0]) {
        case "_":
            return new BlankNode(id.slice(2));
        case "?":
            return new Variable(id.slice(1));
        case '"':
            const i = id.lastIndexOf('"');
            if (i === -1) {
                throw new Error(`Invalid literal id ${id}`);
            }
            const value = id.slice(1, i);
            if (id.length === i + 1) {
                return new Literal(value, null);
            }
            else if (id[i + 1] === "@") {
                return new Literal(value, id.slice(i + 2));
            }
            else if (id.slice(i, i + 4) === '"^^<' && id[id.length - 1] === ">") {
                const datatype = new NamedNode(id.slice(i + 4, -1));
                return new Literal(value, datatype);
            }
            else {
                throw new Error(`Invalid literal id ${id}`);
            }
        case "<":
            return new NamedNode(id.slice(1, -1));
        default:
            throw new Error(`Invalid term id ${id}`);
    }
}
export function toId(term) {
    if (typeof term === "string") {
        return term;
    }
    else if (term instanceof BaseTerm) {
        return term.id;
    }
    else if (!term) {
        return "";
    }
    // Term instantiated with another library
    switch (term.termType) {
        case "NamedNode":
            return `<${term.value}>`;
        case "BlankNode":
            return "_:" + term.value;
        case "Variable":
            return "?" + term.value;
        case "DefaultGraph":
            return "";
        case "Literal":
            return ('"' +
                term.value +
                '"' +
                (term.language
                    ? "@" + term.language
                    : term.datatype && term.datatype.value !== xsd.string
                        ? "^^<" + term.datatype.value + ">"
                        : ""));
        default:
            throw new Error("Invalid term: " + term);
    }
}
// ## Quad constructor
export class Quad {
    constructor(subject, predicate, object, graph) {
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
        this.graph = graph || Default;
        this[0] = this.subject;
        this[1] = this.predicate;
        this[2] = this.object;
        this[3] = this.graph;
    }
    toJSON() {
        return {
            subject: this.subject.toJSON(),
            predicate: this.predicate.toJSON(),
            object: this.object.toJSON(),
            graph: this.graph.toJSON(),
        };
    }
    equals(quad) {
        if (quad === undefined || quad === null) {
            return false;
        }
        else {
            return (this.subject.equals(quad.subject) &&
                this.predicate.equals(quad.predicate) &&
                this.object.equals(quad.object) &&
                this.graph.equals(quad.graph));
        }
    }
}
function namedNode(iri) {
    return new NamedNode(iri);
}
function blankNode(name) {
    return new BlankNode(name || `n4-${_blankNodeCounter++}`);
}
function literal(value, languageOrDataType) {
    return new Literal(value, languageOrDataType || null);
}
function variable(name) {
    return new Variable(name);
}
function defaultGraph() {
    return Default;
}
function quad(subject, predicate, object, graph) {
    return new Quad(subject, predicate, object, graph);
}
export function getTerm(term) {
    if (term === null) {
        return null;
    }
    else if (typeof term === "string") {
        return fromId(term);
    }
    else if (term instanceof BaseTerm) {
        return term;
    }
    else {
        switch (term.termType) {
            case "NamedNode":
                return new NamedNode(term.value);
            case "BlankNode":
                return new BlankNode(term.value);
            case "Literal":
                return new Literal(term.value, term.language || new NamedNode(term.datatype.value));
            case "DefaultGraph":
                return Default;
            case "Variable":
                return new Variable(term.value);
        }
    }
}
const DataFactory = {
    namedNode,
    blankNode,
    variable,
    literal,
    defaultGraph,
    quad,
};
export default DataFactory;

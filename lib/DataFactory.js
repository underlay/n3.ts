"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromId = fromId;
exports.toId = toId;
exports.default = exports.Quad = exports.Default = exports.DefaultGraph = exports.Variable = exports.BlankNode = exports.Literal = exports.NamedNode = void 0;

var _IRIs = require("./IRIs.js");

let _blankNodeCounter = 0;

class NamedNode {
  constructor(value) {
    this.value = value;
  }

  get termType() {
    return "NamedNode";
  }

  get id() {
    return `<${this.value}>`;
  }

  equals(other) {
    if (other === undefined || other === null) {
      return false;
    } else {
      return other.termType === "NamedNode" && other.value === this.value;
    }
  }

  toJSON() {
    return {
      termType: this.termType,
      value: this.value
    };
  }

}

exports.NamedNode = NamedNode;
const xsdString = new NamedNode(_IRIs.xsd.string);
const rdfLangString = new NamedNode(_IRIs.rdf.langString);

class Literal {
  constructor(value, language, datatype) {
    this.value = value;
    this.language = language;
    this.datatype = datatype;

    if (datatype.value === _IRIs.xsd.string) {
      this.id = `"${JSON.stringify(value)}"`;
    } else if (datatype.value === _IRIs.rdf.langString && language !== "") {
      this.id = `"${JSON.stringify(value)}"@${this.language}`;
    } else {
      this.id = `"${JSON.stringify(value)}"^^<${datatype.value}>`;
    }
  }

  get termType() {
    return "Literal";
  }

  get datatypeString() {
    return this.datatype.value;
  }

  equals(term) {
    if (term === null || term === undefined) {
      return false;
    } else {
      return this.termType === term.termType && this.value === term.value && this.language === term.language && this.datatype.equals(term.datatype);
    }
  }

  toJSON() {
    return {
      termType: this.termType,
      value: this.value,
      language: this.language,
      datatype: {
        termType: "NamedNode",
        value: this.datatype.value
      }
    };
  }

}

exports.Literal = Literal;

class BlankNode {
  constructor(value) {
    this.value = value;
  }

  get id() {
    return `_:${this.value}`;
  }

  get termType() {
    return "BlankNode";
  }

  equals(term) {
    if (term === null || term === undefined) {
      return false;
    } else {
      return this.termType === term.termType && term.value === this.value;
    }
  }

  toJSON() {
    return {
      termType: this.termType,
      value: this.value
    };
  }

}

exports.BlankNode = BlankNode;

class Variable {
  constructor(value) {
    this.value = value;
  }

  get id() {
    return `?${this.value}`;
  }

  get termType() {
    return "Variable";
  }

  equals(term) {
    if (term === null || term === undefined) {
      return false;
    } else {
      return this.termType === term.termType && term.value === this.value;
    }
  }

  toJSON() {
    return {
      termType: this.termType,
      value: this.value
    };
  }

}

exports.Variable = Variable;

class DefaultGraph {
  get termType() {
    return "DefaultGraph";
  }

  get id() {
    return "";
  }

  get value() {
    return "";
  }

  equals(term) {
    if (term === null || term === undefined) {
      return false;
    } else {
      return this.termType === term.termType;
    }
  }

  toJSON() {
    return {
      termType: this.termType,
      value: ""
    };
  }

}

exports.DefaultGraph = DefaultGraph;
const Default = new DefaultGraph();
exports.Default = Default;

function fromId(id) {
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
        return new Literal(value, "", xsdString);
      } else if (id[i + 1] === "@") {
        return new Literal(value, id.slice(i + 2), rdfLangString);
      } else if (id.slice(i, i + 4) === '"^^<' && id[id.length - 1] === ">") {
        const datatype = new NamedNode(id.slice(i + 4, -1));
        return new Literal(value, "", datatype);
      } else {
        throw new Error(`Invalid literal id ${id}`);
      }

    case "<":
      return new NamedNode(id.slice(1, -1));

    default:
      throw new Error(`Invalid term id ${id}`);
  }
}

function toId(term) {
  if (typeof term === "string") {
    return term;
  }

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
      return '"' + term.value + '"' + (term.language ? "@" + term.language : term.datatype && term.datatype.value !== _IRIs.xsd.string ? "^^<" + term.datatype.value + ">" : "");

    default:
      throw new Error("Invalid term: " + term);
  }
} // TODO: think about it


class Quad extends Array {
  constructor(subject, predicate, object, graph) {
    super(subject, predicate, object, graph || Default);
    this.subject = subject;
    this.predicate = predicate;
    this.object = object;
    this.graph = graph || Default;
  }

  get termType() {
    return "Quad";
  }

  get value() {
    return "";
  }

  get id() {
    if (this.graph.equals(Default)) {
      return `${this.subject.id} ${this.predicate.id} ${this.object.id} .`;
    } else {
      return `${this.subject.id} ${this.predicate.id} ${this.object.id} ${this.graph.id} .`;
    }
  }

  toJSON() {
    return {
      termType: "Quad",
      value: "",
      subject: this.subject.toJSON(),
      predicate: this.predicate.toJSON(),
      object: this.object.toJSON(),
      graph: this.graph.toJSON()
    };
  }

  equals(other) {
    if (other === undefined || other === null) {
      return false;
    } else {
      return other.termType === "Quad" && this.subject.equals(other.subject) && this.predicate.equals(other.predicate) && this.object.equals(other.object) && this.graph.equals(other.graph);
    }
  }

}

exports.Quad = Quad;

function namedNode(iri) {
  return new NamedNode(iri);
}

function blankNode(name) {
  return new BlankNode(name || `b${_blankNodeCounter++}`);
}

function literal(value, languageOrDataType) {
  if (languageOrDataType === undefined) {
    return new Literal(value, "", xsdString);
  } else if (typeof languageOrDataType === "string") {
    return new Literal(value, languageOrDataType, rdfLangString);
  } else {
    const datatype = new NamedNode(languageOrDataType.value);
    return new Literal(value, "", datatype);
  }
}

function variable(name) {
  return new Variable(name);
}

function defaultGraph() {
  return Default;
}

function quad(subject, predicate, object, graph) {
  return new Quad(subject, predicate, object, graph);
} // export function getTerm(
// 	term: null | string | Term
// ): null | NamedNode | BlankNode | Literal | Variable | DefaultGraph {
// 	if (term === null) {
// 		return null
// 	} else if (typeof term === "string") {
// 		return fromId(term)
// 	} else if (term instanceof BaseTerm) {
// 		return term
// 	} else {
// 		switch (term.termType) {
// 			case "NamedNode":
// 				return new NamedNode(term.value)
// 			case "BlankNode":
// 				return new BlankNode(term.value)
// 			case "Literal":
// 				return new Literal(
// 					term.value,
// 					term.language || new NamedNode(term.datatype.value)
// 				)
// 			case "DefaultGraph":
// 				return Default
// 			case "Variable":
// 				return new Variable(term.value)
// 		}
// 	}
// }


const DataFactory = {
  namedNode,
  blankNode,
  variable,
  literal,
  defaultGraph,
  quad
};
var _default = DataFactory;
exports.default = _default;
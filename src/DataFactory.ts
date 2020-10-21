import * as RDF from "rdf-js"
import * as DataModel from "./DataModel.js"

import { rdf, xsd } from "./IRIs.js"

let _blankNodeCounter = 0

export class NamedNode<T extends string = string>
	implements RDF.NamedNode, DataModel.NamedNode<T> {
	constructor(readonly value: T) {}

	get termType(): DataModel.NamedNodeT {
		return "NamedNode"
	}

	get id(): string {
		return `<${this.value}>`
	}

	equals(other?: null | RDF.Term) {
		if (other === undefined || other === null) {
			return false
		} else {
			return other.termType === "NamedNode" && other.value === this.value
		}
	}

	toJSON(): DataModel.NamedNode {
		return {
			termType: this.termType,
			value: this.value,
		}
	}
}

const xsdString = new NamedNode(xsd.string)
const rdfLangString = new NamedNode(rdf.langString)

export class Literal<T extends string = string>
	implements RDF.Literal, DataModel.Literal<T> {
	readonly id: string
	constructor(
		readonly value: string,
		readonly language: T extends typeof rdf.langString ? string : "",
		readonly datatype: NamedNode<T>
	) {
		if (datatype.value === xsd.string) {
			this.id = `"${JSON.stringify(value)}"`
		} else if (datatype.value === rdf.langString && language !== "") {
			this.id = `"${JSON.stringify(value)}"@${this.language}`
		} else {
			this.id = `"${JSON.stringify(value)}"^^<${datatype.value}>`
		}
	}

	get termType(): DataModel.LiteralT {
		return "Literal"
	}

	get datatypeString(): string {
		return this.datatype.value
	}

	equals(term?: null | RDF.Term): boolean {
		if (term === null || term === undefined) {
			return false
		} else {
			return (
				this.termType === term.termType &&
				this.value === term.value &&
				this.language === term.language &&
				this.datatype.equals(term.datatype)
			)
		}
	}

	toJSON(): DataModel.Literal {
		return {
			termType: this.termType,
			value: this.value,
			language: this.language,
			datatype: { termType: "NamedNode", value: this.datatype.value },
		}
	}
}

export class BlankNode implements RDF.BlankNode, DataModel.BlankNode {
	constructor(readonly value: string) {}

	get id(): string {
		return `_:${this.value}`
	}

	get termType(): DataModel.BlankNodeT {
		return "BlankNode"
	}

	equals(term?: null | RDF.Term): boolean {
		if (term === null || term === undefined) {
			return false
		} else {
			return this.termType === term.termType && term.value === this.value
		}
	}

	toJSON(): DataModel.BlankNode {
		return {
			termType: this.termType,
			value: this.value,
		}
	}
}

export class Variable implements RDF.Variable, DataModel.Variable {
	constructor(readonly value: string) {}
	get id() {
		return `?${this.value}`
	}

	get termType(): DataModel.VariableT {
		return "Variable"
	}

	equals(term?: null | RDF.Term): boolean {
		if (term === null || term === undefined) {
			return false
		} else {
			return this.termType === term.termType && term.value === this.value
		}
	}

	toJSON(): DataModel.Variable {
		return {
			termType: this.termType,
			value: this.value,
		}
	}
}

export class DefaultGraph implements RDF.DefaultGraph, DataModel.DefaultGraph {
	get termType(): DataModel.DefaultGraphT {
		return "DefaultGraph"
	}

	get id(): "" {
		return ""
	}

	get value(): "" {
		return ""
	}

	equals(term?: null | RDF.Term): boolean {
		if (term === null || term === undefined) {
			return false
		} else {
			return this.termType === term.termType
		}
	}

	toJSON(): DataModel.DefaultGraph {
		return {
			termType: this.termType,
			value: "",
		}
	}
}

export const Default = new DefaultGraph()

export function fromId(id: string) {
	if (id === "") {
		return Default
	}

	switch (id[0]) {
		case "_":
			return new BlankNode(id.slice(2))
		case "?":
			return new Variable(id.slice(1))
		case '"':
			const i = id.lastIndexOf('"')
			if (i === -1) {
				throw new Error(`Invalid literal id ${id}`)
			}

			const value = id.slice(1, i)
			if (id.length === i + 1) {
				return new Literal(value, "", xsdString)
			} else if (id[i + 1] === "@") {
				return new Literal(value, id.slice(i + 2), rdfLangString)
			} else if (id.slice(i, i + 4) === '"^^<' && id[id.length - 1] === ">") {
				const datatype = new NamedNode(id.slice(i + 4, -1))
				return new Literal(value, "", datatype)
			} else {
				throw new Error(`Invalid literal id ${id}`)
			}
		case "<":
			return new NamedNode(id.slice(1, -1))
		default:
			throw new Error(`Invalid term id ${id}`)
	}
}

export function toId(term: string | DataModel.Term): string {
	if (typeof term === "string") {
		return term
	}
	switch (term.termType) {
		case "NamedNode":
			return `<${term.value}>`
		case "BlankNode":
			return "_:" + term.value
		case "Variable":
			return "?" + term.value
		case "DefaultGraph":
			return ""
		case "Literal":
			return (
				'"' +
				term.value +
				'"' +
				(term.language
					? "@" + term.language
					: term.datatype && term.datatype.value !== xsd.string
					? "^^<" + term.datatype.value + ">"
					: "")
			)
		default:
			throw new Error("Invalid term: " + term)
	}
}

export interface D extends DataModel.DataModel {
	NamedNode: NamedNode
	BlankNode: BlankNode
	Literal: Literal
	DefaultGraph: DefaultGraph
	Variable: Variable
	Quad: Quad
}

// TODO: think about it
export class Quad
	extends Array<
		NamedNode | BlankNode | Literal | DefaultGraph | Variable | Quad
	>
	implements RDF.Quad, DataModel.Quad {
	readonly graph: NamedNode | BlankNode | DefaultGraph | Variable
	constructor(
		public readonly subject: NamedNode | BlankNode | Variable | Quad,
		public readonly predicate: NamedNode | Variable,
		public readonly object: NamedNode | BlankNode | Literal | Variable,
		graph?: NamedNode | BlankNode | DefaultGraph | Variable
	) {
		super(subject, predicate, object, graph || Default)
		this.graph = graph || Default
	}

	get termType(): DataModel.QuadT {
		return "Quad"
	}

	get value(): "" {
		return ""
	}

	get id(): string {
		if (this.graph.equals(Default)) {
			return `${this.subject.id} ${this.predicate.id} ${this.object.id} .`
		} else {
			return `${this.subject.id} ${this.predicate.id} ${this.object.id} ${this.graph.id} .`
		}
	}

	toJSON(): DataModel.Quad {
		return {
			termType: "Quad",
			value: "",
			subject: this.subject.toJSON(),
			predicate: this.predicate.toJSON(),
			object: this.object.toJSON(),
			graph: this.graph.toJSON(),
		}
	}

	equals(other?: null | RDF.Term): boolean {
		if (other === undefined || other === null) {
			return false
		} else {
			return (
				other.termType === "Quad" &&
				this.subject.equals(other.subject) &&
				this.predicate.equals(other.predicate) &&
				this.object.equals(other.object) &&
				this.graph.equals(other.graph)
			)
		}
	}
}

function namedNode<Iri extends string>(iri: Iri): RDF.NamedNode<Iri> {
	return new NamedNode(iri)
}

function blankNode(name: string): RDF.BlankNode {
	return new BlankNode(name || `b${_blankNodeCounter++}`)
}

function literal(
	value: string,
	languageOrDataType?: string | RDF.NamedNode
): RDF.Literal {
	if (languageOrDataType === undefined) {
		return new Literal(value, "", xsdString)
	} else if (typeof languageOrDataType === "string") {
		return new Literal(value, languageOrDataType, rdfLangString)
	} else {
		const datatype = new NamedNode(languageOrDataType.value)
		return new Literal(value, "", datatype)
	}
}

function variable(name: string): RDF.Variable {
	return new Variable(name)
}

function defaultGraph(): RDF.DefaultGraph {
	return Default
}

function quad(
	subject: NamedNode | BlankNode | Variable,
	predicate: NamedNode | Variable,
	object: NamedNode | BlankNode | Literal | Variable,
	graph?: NamedNode | BlankNode | DefaultGraph | Variable
): RDF.Quad {
	return new Quad(subject, predicate, object, graph)
}

// export function getTerm(
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

const DataFactory: RDF.DataFactory = {
	namedNode,
	blankNode,
	variable,
	literal,
	defaultGraph,
	quad,
}

export default DataFactory

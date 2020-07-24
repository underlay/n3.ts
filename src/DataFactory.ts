import * as RDF from "rdf-js"

import {
	Term,
	TermT,
	QuadT,
	NamedNodeT,
	BlankNodeT,
	LiteralT,
	DefaultGraphT,
	VariableT,
	DataModel,
	TermType,
	Subject,
	Predicate,
	Object,
	Graph,
	BaseQuad,
} from "./rdf.js"

import iris from "./IRIs.js"

const { rdf, xsd } = iris

let _blankNodeCounter = 0

abstract class BaseTerm<T extends TermType> {
	abstract get termType(): T
	abstract get value(): [T] extends [DefaultGraphT] ? "" : string
	constructor(readonly id: string) {}

	abstract toJSON(): TermT<T>

	equals(term?: null | Term): boolean {
		if (term === undefined || term === null) {
			return false
		} else if (term instanceof BaseTerm) {
			return this.id === term.id
		} else {
			return this.termType === term.termType && this.value === term.value
		}
	}
}

export class NamedNode extends BaseTerm<NamedNodeT>
	implements RDF.NamedNode, TermT<NamedNodeT> {
	constructor(value: string) {
		super(`<${value}>`)
	}

	get termType(): NamedNodeT {
		return "NamedNode"
	}

	get value(): string {
		return this.id.slice(1, -1)
	}

	toJSON(): TermT<NamedNodeT> {
		return {
			termType: this.termType,
			value: this.value,
		}
	}
}

const xsdString = new NamedNode(xsd.string)
const rdfLangString = new NamedNode(rdf.langString)

export class Literal extends BaseTerm<LiteralT>
	implements RDF.Literal, TermT<LiteralT> {
	constructor(
		value: string,
		languageOrDataType: RDF.NamedNode | string | null
	) {
		if (typeof languageOrDataType === "string") {
			super(`"${value}"@${languageOrDataType.toLowerCase()}`)
		} else if (
			languageOrDataType === null ||
			languageOrDataType.value === xsd.string
		) {
			super(`"${value}"`)
		} else {
			super(`"${value}"^^<${languageOrDataType.value}>`)
		}
	}

	get termType(): LiteralT {
		return "Literal"
	}

	get value(): string {
		return this.id.substring(1, this.id.lastIndexOf('"'))
	}

	get term(): string {
		return `<${this.id}>`
	}

	get language() {
		const i = this.id.lastIndexOf('"') + 1
		return this.id[i] === "@" ? this.id.slice(i + 1) : ""
	}

	get datatype(): NamedNode {
		const i = this.id.lastIndexOf('"') + 1
		if (this.id.length === i) {
			return xsdString
		} else if (this.id[i] === "@") {
			return rdfLangString
		} else if (
			this.id.slice(i, i + 3) === "^^<" &&
			this.id[this.id.length - 1] === ">"
		) {
			return new NamedNode(this.id.slice(i + 3, -1))
		} else {
			throw new Error(`Invalid literal id ${this.id}`)
		}
	}

	get datatypeString(): string {
		const i = this.id.lastIndexOf('"') + 1
		if (this.id.length === i) {
			return xsd.string
		} else if (this.id[i] === "@") {
			return rdf.langString
		} else if (
			this.id.slice(i, i + 3) === "^^<" &&
			this.id[this.id.length - 1] === ">"
		) {
			return this.id.slice(i + 3, -1)
		} else {
			throw new Error(`Invalid literal id ${this.id}`)
		}
	}

	equals(term?: null | Term): boolean {
		if (term === null || term === undefined) {
			return false
		} else if (term instanceof Literal) {
			return this.id === term.id
		} else {
			return (
				this.termType === term.termType &&
				this.value === term.value &&
				this.language === term.language &&
				this.datatypeString === term.datatype.value
			)
		}
	}

	toJSON(): TermT<LiteralT> {
		return {
			termType: this.termType,
			value: this.value,
			language: this.language,
			datatype: { termType: "NamedNode", value: this.datatypeString },
		}
	}
}

export class BlankNode extends BaseTerm<BlankNodeT>
	implements RDF.BlankNode, TermT<BlankNodeT> {
	constructor(name: string) {
		super("_:" + name)
	}

	get termType(): BlankNodeT {
		return "BlankNode"
	}

	get value() {
		return this.id.substr(2)
	}

	toJSON(): TermT<BlankNodeT> {
		return {
			termType: this.termType,
			value: this.value,
		}
	}
}

export class Variable extends BaseTerm<VariableT>
	implements RDF.Variable, TermT<VariableT> {
	constructor(name: string) {
		super("?" + name)
	}

	get termType(): VariableT {
		return "Variable"
	}

	get value() {
		return this.id.slice(1)
	}

	toJSON(): TermT<VariableT> {
		return {
			termType: this.termType,
			value: this.value,
		}
	}
}

export class DefaultGraph extends BaseTerm<DefaultGraphT>
	implements RDF.DefaultGraph, TermT<DefaultGraphT> {
	constructor() {
		super("")
	}

	get value(): "" {
		return ""
	}

	get termType(): DefaultGraphT {
		return "DefaultGraph"
	}

	toJSON(): TermT<DefaultGraphT> {
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
				return new Literal(value, null)
			} else if (id[i + 1] === "@") {
				return new Literal(value, id.slice(i + 2))
			} else if (id.slice(i, i + 4) === '"^^<' && id[id.length - 1] === ">") {
				const datatype = new NamedNode(id.slice(i + 4, -1))
				return new Literal(value, datatype)
			} else {
				throw new Error(`Invalid literal id ${id}`)
			}
		case "<":
			return new NamedNode(id.slice(1, -1))
		default:
			throw new Error(`Invalid term id ${id}`)
	}
}

export function toId(term: string | Term): string {
	if (typeof term === "string") {
		return term
	} else if (term instanceof BaseTerm) {
		return term.id
	} else if (!term) {
		return ""
	}

	// Term instantiated with another library
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

export interface D extends DataModel {
	NamedNode: NamedNode
	BlankNode: BlankNode
	Literal: Literal
	DefaultGraph: DefaultGraph
	Variable: Variable
	Quad: Quad
}

// ## Quad constructor
export class Quad implements RDF.Quad, QuadT<D> {
	public readonly [0]: Subject<D>
	public readonly [1]: Predicate<D>
	public readonly [2]: Object<D>
	public readonly [3]: Graph<D>
	public readonly graph: Graph<D>
	constructor(
		public readonly subject: Subject<D>,
		public readonly predicate: Predicate<D>,
		public readonly object: Object<D>,
		graph?: Graph<D>
	) {
		this.graph = graph || Default
		this[0] = this.subject
		this[1] = this.predicate
		this[2] = this.object
		this[3] = this.graph
	}

	public toJSON(): QuadT {
		return {
			subject: this.subject.toJSON(),
			predicate: this.predicate.toJSON(),
			object: this.object.toJSON(),
			graph: this.graph.toJSON(),
		}
	}

	public equals(quad?: null | BaseQuad): boolean {
		if (quad === undefined || quad === null) {
			return false
		} else {
			return (
				this.subject.equals(quad.subject) &&
				this.predicate.equals(quad.predicate) &&
				this.object.equals(quad.object) &&
				this.graph.equals(quad.graph)
			)
		}
	}
}

function namedNode(iri: string): NamedNode {
	return new NamedNode(iri)
}

function blankNode(name: string): BlankNode {
	return new BlankNode(name || `n4-${_blankNodeCounter++}`)
}

function literal(value: string, languageOrDataType?: string | NamedNode) {
	return new Literal(value, languageOrDataType || null)
}

function variable(name: string) {
	return new Variable(name)
}

function defaultGraph() {
	return Default
}

function quad(
	subject: NamedNode | BlankNode | Variable,
	predicate: NamedNode | Variable,
	object: NamedNode | BlankNode | Literal | Variable,
	graph?: NamedNode | BlankNode | DefaultGraph | Variable
) {
	return new Quad(subject, predicate, object, graph)
}

export function getTerm(
	term: null | string | Term
): null | NamedNode | BlankNode | Literal | Variable | DefaultGraph {
	if (term === null) {
		return null
	} else if (typeof term === "string") {
		return fromId(term)
	} else if (term instanceof BaseTerm) {
		return term
	} else {
		switch (term.termType) {
			case "NamedNode":
				return new NamedNode(term.value)
			case "BlankNode":
				return new BlankNode(term.value)
			case "Literal":
				return new Literal(
					term.value,
					term.language || new NamedNode(term.datatype.value)
				)
			case "DefaultGraph":
				return Default
			case "Variable":
				return new Variable(term.value)
		}
	}
}

const DataFactory: RDF.DataFactory = {
	namedNode,
	blankNode,
	variable,
	literal,
	defaultGraph,
	quad,
}

export default DataFactory

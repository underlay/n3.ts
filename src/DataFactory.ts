import iris from "./IRIs"
import * as RDF from "rdf-js"

const { rdf, xsd } = iris

let _blankNodeCounter = 0

interface Term<T extends string> {
	termType: T
	readonly id: string
	readonly value: string
}

export abstract class BaseTerm<T extends string> implements Term<T> {
	abstract get termType(): T
	abstract get value(): string
	constructor(readonly id: string) {}

	equals(term: RDF.Term): boolean {
		if (term === null || term === undefined) {
			return false
		} else if (term instanceof BaseTerm) {
			return this.id === term.id
		} else {
			return this.termType === term.termType && this.value === term.value
		}
	}

	toJSON() {
		return {
			termType: this.termType,
			value: this.value,
		}
	}
}

type NamedNodeT = "NamedNode"
type LiteralT = "Literal"
type BlankNodeT = "BlankNode"
type DefaultGraphT = "DefaultGraph"
type VariableT = "Variable"

export class NamedNode extends BaseTerm<NamedNodeT> implements RDF.NamedNode {
	get termType(): NamedNodeT {
		return "NamedNode"
	}

	get value(): string {
		return this.id
	}
}

// ## Literal constructor
export class Literal extends BaseTerm<LiteralT> implements RDF.Literal {
	get termType(): LiteralT {
		return "Literal"
	}

	get value(): string {
		return this.id.substring(1, this.id.lastIndexOf('"'))
	}

	// ### The language of this literal
	get language() {
		// Find the last quotation mark (e.g., '"abc"@en-us')
		const i = this.id.lastIndexOf('"') + 1
		// If "@" it follows, return the remaining substring; empty otherwise
		return i < this.id.length && this.id[i] === "@"
			? this.id.substr(i + 1).toLowerCase()
			: ""
	}

	// ### The datatype IRI of this literal
	get datatype(): NamedNode {
		return new NamedNode(this.datatypeString)
	}

	// ### The datatype string of this literal
	get datatypeString(): string {
		const i = this.id.lastIndexOf('"') + 1
		if (i < this.id.length) {
			if (this.id[i] === "@") {
				return rdf.langString
			} else if (this.id[i] === "^" && this.id[i + 1] === "^") {
				return this.id.slice(i + 2)
			}
		}
		return xsd.string
	}

	equals(term: RDF.Term): boolean {
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

	toJSON() {
		return {
			termType: this.termType,
			value: this.value,
			language: this.language,
			datatype: { termType: "NamedNode", value: this.datatypeString },
		}
	}
}

export class BlankNode extends BaseTerm<BlankNodeT> implements RDF.BlankNode {
	constructor(name: string) {
		super("_:" + name)
	}

	get termType(): BlankNodeT {
		return "BlankNode"
	}

	get value() {
		return this.id.substr(2)
	}
}

export class Variable extends BaseTerm<VariableT> implements RDF.Variable {
	constructor(name: string) {
		super("?" + name)
	}

	get termType(): VariableT {
		return "Variable"
	}

	get value() {
		return this.id.substr(1)
	}
}

export class DefaultGraph extends BaseTerm<DefaultGraphT>
	implements RDF.DefaultGraph {
	constructor() {
		super("")
	}

	get value(): "" {
		return ""
	}

	get termType(): DefaultGraphT {
		return "DefaultGraph"
	}
}

export const Default = new DefaultGraph()

export function fromId(id: string, factory?: RDF.DataFactory) {
	factory = factory || DataFactory

	if (id === "") {
		return factory.defaultGraph()
	}

	switch (id[0]) {
		case "_":
			return factory.blankNode(id.substr(2))
		case "?":
			return factory.variable!(id.slice(1))
		case '"':
			// Shortcut for internal literals
			if (factory === DataFactory) return new Literal(id)
			// Literal without datatype or language
			if (id[id.length - 1] === '"')
				return factory.literal(id.substr(1, id.length - 2))
			// Literal with datatype or language
			var endPos = id.lastIndexOf('"', id.length - 1)
			return factory.literal(
				id.substr(1, endPos - 1),
				id[endPos + 1] === "@"
					? id.substr(endPos + 2)
					: factory.namedNode(id.substr(endPos + 3))
			)
		default:
			return factory.namedNode(id)
	}
}

// type Term = NamedNode | BlankNode | Literal | DefaultGraph | Variable
// ### Constructs an internal string ID from the given term or ID string
export function toId(term: string | RDF.Term): string {
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
			return term.value
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
					? "^^" + term.datatype.value
					: "")
			)
		default:
			throw new Error("Invalid term: " + term)
	}
}

// ## Quad constructor
export class Quad {
	readonly graph: NamedNode | BlankNode | DefaultGraph | Variable
	constructor(
		readonly subject: NamedNode | BlankNode | Variable,
		readonly predicate: NamedNode | Variable,
		readonly object: NamedNode | BlankNode | Literal | Variable,
		graph?: NamedNode | BlankNode | DefaultGraph | Variable
	) {
		this.graph = graph || Default
	}

	// ### Returns a plain object representation of this quad
	toJSON() {
		return {
			subject: this.subject.toJSON(),
			predicate: this.predicate.toJSON(),
			object: this.object.toJSON(),
			graph: this.graph.toJSON(),
		}
	}

	// ### Returns whether this object represents the same quad as the other
	equals(quad?: RDF.Quad): boolean {
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

// ### Creates a literal
function literal(value: string, languageOrDataType?: string | NamedNode) {
	// Create a language-tagged string
	if (typeof languageOrDataType === "string") {
		return new Literal('"' + value + '"@' + languageOrDataType.toLowerCase())
	}

	// Automatically determine datatype for booleans and numbers
	let datatype = languageOrDataType ? languageOrDataType.value : ""
	if (datatype === "") {
		if (typeof value === "boolean") {
			// Convert a boolean
			datatype = xsd.boolean
		} else if (typeof value === "number") {
			// Convert an integer or double
			if (Number.isFinite(value)) {
				datatype = Number.isInteger(value) ? xsd.integer : xsd.double
			} else {
				datatype = xsd.double
				if (!Number.isNaN(value)) {
					value = value > 0 ? "INF" : "-INF"
				}
			}
		}
	}

	// Create a datatyped literal
	return datatype === "" || datatype === xsd.string
		? new Literal('"' + value + '"')
		: new Literal('"' + value + '"^^' + datatype)
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

const DataFactory: RDF.DataFactory = {
	namedNode,
	blankNode,
	variable,
	literal,
	defaultGraph,
	quad,
}

export default DataFactory

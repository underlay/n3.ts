export type NamedNodeT = "NamedNode"
export type LiteralT = "Literal"
export type BlankNodeT = "BlankNode"
export type DefaultGraphT = "DefaultGraph"
export type VariableT = "Variable"
export type QuadT = "Quad"

export type TermType =
	| NamedNodeT
	| LiteralT
	| BlankNodeT
	| DefaultGraphT
	| VariableT
	| QuadT

export type NamedNode<T extends string = string> = {
	termType: "NamedNode"
	value: T
}
export type BlankNode = { termType: "BlankNode"; value: string }
export type Literal<T extends string = string> = {
	termType: "Literal"
	value: string
	language: string
	datatype: NamedNode<T>
}
export type DefaultGraph = { termType: "DefaultGraph"; value: "" }
export type Variable = { termType: "Variable"; value: string }
export type Quad = {
	termType: "Quad"
	value: ""
	subject: term
	predicate: term
	object: term
	graph: term
}

type term = NamedNode | BlankNode | Literal | DefaultGraph | Variable | Quad

export interface DataModel<
	N extends NamedNode = NamedNode,
	B extends BlankNode = BlankNode,
	L extends Literal = Literal,
	D extends DefaultGraph = DefaultGraph,
	V extends Variable = Variable,
	Q extends Quad = Quad
> {
	NamedNode: N
	BlankNode: B
	Literal: L
	DefaultGraph: D
	Variable: V
	Quad: Q
}

export type Term<D extends DataModel = DataModel> =
	| D["NamedNode"]
	| D["BlankNode"]
	| D["Literal"]
	| D["DefaultGraph"]
	| D["Variable"]
	| D["Quad"]

export type Subject<D extends DataModel = DataModel> =
	| D["NamedNode"]
	| D["BlankNode"]
	| D["Variable"]
	| D["Quad"]

export type Predicate<D extends DataModel = DataModel> =
	| D["NamedNode"]
	| D["Variable"]

export type Object<D extends DataModel = DataModel> =
	| D["NamedNode"]
	| D["BlankNode"]
	| D["Literal"]
	| D["Variable"]

export type Graph<D extends DataModel = DataModel> =
	| D["NamedNode"]
	| D["BlankNode"]
	| D["DefaultGraph"]
	| D["Variable"]

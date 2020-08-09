export type NamedNodeT = "NamedNode"
export type LiteralT = "Literal"
export type BlankNodeT = "BlankNode"
export type DefaultGraphT = "DefaultGraph"
export type VariableT = "Variable"

export type TermType =
	| NamedNodeT
	| LiteralT
	| BlankNodeT
	| DefaultGraphT
	| VariableT

export type TermT<T extends TermType = TermType> = {
	termType: T
	value: [T] extends [DefaultGraphT] ? "" : string
} & ([T] extends [LiteralT]
	? { language: string; datatype: { termType: NamedNodeT; value: string } }
	: {})

export type Term =
	| TermT<NamedNodeT>
	| TermT<BlankNodeT>
	| TermT<LiteralT>
	| TermT<DefaultGraphT>
	| TermT<VariableT>

interface Terms<
	N extends TermT<NamedNodeT> = TermT<NamedNodeT>,
	B extends TermT<BlankNodeT> = TermT<BlankNodeT>,
	L extends TermT<LiteralT> = TermT<LiteralT>,
	D extends TermT<DefaultGraphT> = TermT<DefaultGraphT>,
	V extends TermT<VariableT> = TermT<VariableT>
> {
	NamedNode: N
	BlankNode: B
	Literal: L
	DefaultGraph: D
	Variable: V
}

export type Subject<T extends Terms = Terms> =
	| T["NamedNode"]
	| T["BlankNode"]
	| T["Variable"]
export type Predicate<T extends Terms = Terms> = T["NamedNode"] | T["Variable"]
export type Object<T extends Terms = Terms> =
	| T["NamedNode"]
	| T["BlankNode"]
	| T["Literal"]
	| T["Variable"]
export type Graph<T extends Terms = Terms> =
	| T["NamedNode"]
	| T["BlankNode"]
	| T["DefaultGraph"]
	| T["Variable"]

export type BaseQuad<T extends Terms = Terms> = {
	subject: T[TermType]
	predicate: T[TermType]
	object: T[TermType]
	graph: T[TermType]
}

export type QuadT<T extends Terms = Terms> = {
	subject: Subject<T>
	predicate: Predicate<T>
	object: Object<T>
	graph: Graph<T>
}

export interface DataModel<
	T extends Terms = Terms,
	Q extends QuadT<T> = QuadT<T>
>
	extends Terms<
		T["NamedNode"],
		T["BlankNode"],
		T["Literal"],
		T["DefaultGraph"],
		T["Variable"]
	> {
	Quad: Q
}

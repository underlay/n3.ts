// Type definitions for the RDFJS specification 3.0
// Project: https://github.com/rdfjs/representation-task-force
// Definitions by: Ruben Taelman <https://github.com/rubensworks>
//                 Laurens Rietveld <https://github.com/LaurensRietveld>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

/* Data Model Interfaces */
/* https://rdf.js.org/data-model-spec/ */

/**
 * Contains an Iri, RDF blank Node, RDF literal, variable name, or a default graph
 * @see NamedNode
 * @see BlankNode
 * @see Literal
 * @see Variable
 * @see DefaultGraph
 */
export type Term = NamedNode | BlankNode | Literal | Variable | DefaultGraph

/**
 * Contains an IRI.
 */
export interface NamedNode {
	/**
	 * Contains the constant "NamedNode".
	 */
	termType: "NamedNode"
	/**
	 * The IRI of the named node (example: `http://example.org/resource`)
	 */
	value: string

	/**
	 * @param other The term to compare with.
	 * @return True if and only if other has termType "NamedNode" and the same `value`.
	 */
	equals(other: Term | null | undefined): boolean
}

/**
 * Contains an RDF blank node.
 */
export interface BlankNode {
	/**
	 * Contains the constant "BlankNode".
	 */
	termType: "BlankNode"
	/**
	 * Blank node name as a string, without any serialization specific prefixes,
	 * e.g. when parsing,
	 * if the data was sourced from Turtle, remove _:,
	 * if it was sourced from RDF/XML, do not change the blank node name (example: blank3).
	 */
	value: string

	/**
	 * @param other The term to compare with.
	 * @return True if and only if other has termType "BlankNode" and the same `value`.
	 */
	equals(other: Term | null | undefined): boolean
}

/**
 * An RDF literal, containing a string with an optional language tag and/or datatype.
 */
export interface Literal {
	/**
	 * Contains the constant "Literal".
	 */
	termType: "Literal"
	/**
	 * The text value, unescaped, without language or type (example: Brad Pitt).
	 */
	value: string
	/**
	 * the language as lowercase BCP47 string (examples: en, en-gb)
	 * or an empty string if the literal has no language.
	 * @link http://tools.ietf.org/html/bcp47
	 */
	language: string
	/**
	 * A NamedNode whose IRI represents the datatype of the literal.
	 */
	datatype: NamedNode

	/**
	 * @param other The term to compare with.
	 * @return True if and only if other has termType "Literal"
	 *                   and the same `value`, `language`, and `datatype`.
	 */
	equals(other: Term | null | undefined): boolean
}

/**
 * A variable name.
 */
export interface Variable {
	/**
	 * Contains the constant "Variable".
	 */
	termType: "Variable"
	/**
	 * The name of the variable *without* leading ? (example: a).
	 */
	value: string

	/**
	 * @param other The term to compare with.
	 * @return True if and only if other has termType "Variable" and the same `value`.
	 */
	equals(other: Term | null | undefined): boolean
}

/**
 * An instance of DefaultGraph represents the default graph.
 * It's only allowed to assign a DefaultGraph to the .graph property of a Quad.
 */
export interface DefaultGraph {
	/**
	 * Contains the constant "DefaultGraph".
	 */
	termType: "DefaultGraph"
	/**
	 * Contains an empty string as constant value.
	 */
	value: ""

	/**
	 * @param other The term to compare with.
	 * @return True if and only if other has termType "DefaultGraph".
	 */
	equals(other: Term | null | undefined): boolean
}

/**
 * The subject, which is a NamedNode, BlankNode or Variable.
 * @see NamedNode
 * @see BlankNode
 * @see Variable
 */
export type Quad_Subject = NamedNode | BlankNode | Variable

/**
 * The predicate, which is a NamedNode or Variable.
 * @see NamedNode
 * @see Variable
 */
export type Quad_Predicate = NamedNode | Variable

/**
 * The object, which is a NamedNode, Literal, BlankNode or Variable.
 * @see NamedNode
 * @see Literal
 * @see BlankNode
 * @see Variable
 */
export type Quad_Object = NamedNode | Literal | BlankNode | Variable

/**
 * The named graph, which is a DefaultGraph, NamedNode, BlankNode or Variable.
 * @see DefaultGraph
 * @see NamedNode
 * @see BlankNode
 * @see Variable
 */
export type Quad_Graph = DefaultGraph | NamedNode | BlankNode | Variable

/**
 * An RDF quad, taking any Term in its positions, containing the subject, predicate, object and graph terms.
 */
export interface BaseQuad {
	/**
	 * The subject.
	 * @see Quad_Subject
	 */
	subject: Term
	/**
	 * The predicate.
	 * @see Quad_Predicate
	 */
	predicate: Term
	/**
	 * The object.
	 * @see Quad_Object
	 */
	object: Term
	/**
	 * The named graph.
	 * @see Quad_Graph
	 */
	graph: Term

	/**
	 * @param other The term to compare with.
	 * @return True if and only if the argument is a) of the same type b) has all components equal.
	 */
	equals(other: BaseQuad | null | undefined): boolean
}

/**
 * An RDF quad, containing the subject, predicate, object and graph terms.
 */
export interface Quad extends BaseQuad {
	/**
	 * The subject.
	 * @see Quad_Subject
	 */
	subject: Quad_Subject
	/**
	 * The predicate.
	 * @see Quad_Predicate
	 */
	predicate: Quad_Predicate
	/**
	 * The object.
	 * @see Quad_Object
	 */
	object: Quad_Object
	/**
	 * The named graph.
	 * @see Quad_Graph
	 */
	graph: Quad_Graph

	/**
	 * @param other The term to compare with.
	 * @return True if and only if the argument is a) of the same type b) has all components equal.
	 */
	equals(other: BaseQuad | null | undefined): boolean
}

/**
 * A factory for instantiating RDF terms and quads.
 */
export interface DataFactory<
	OutQuad extends BaseQuad = Quad,
	InQuad extends BaseQuad = OutQuad
> {
	/**
	 * @param value The IRI for the named node.
	 * @return A new instance of NamedNode.
	 * @see NamedNode
	 */
	namedNode(value: string): NamedNode

	/**
	 * @param value The optional blank node identifier.
	 * @return A new instance of BlankNode.
	 *                         If the `value` parameter is undefined a new identifier
	 *                         for the blank node is generated for each call.
	 * @see BlankNode
	 */
	blankNode(value?: string): BlankNode

	/**
	 * @param                 value              The literal value.
	 * @param languageOrDatatype The optional language or datatype.
	 *                                                    If `languageOrDatatype` is a NamedNode,
	 *                                                    then it is used for the value of `NamedNode.datatype`.
	 *                                                    Otherwise `languageOrDatatype` is used for the value
	 *                                                    of `NamedNode.language`.
	 * @return A new instance of Literal.
	 * @see Literal
	 */
	literal(value: string, languageOrDatatype?: string | NamedNode): Literal

	/**
	 * This method is optional.
	 * @param value The variable name
	 * @return A new instance of Variable.
	 * @see Variable
	 */
	variable(value: string): Variable

	/**
	 * @return An instance of DefaultGraph.
	 */
	defaultGraph(): DefaultGraph

	/**
	 * @param subject   The quad subject term.
	 * @param predicate The quad predicate term.
	 * @param object    The quad object term.
	 * @param graph     The quad graph term.
	 * @return A new instance of Quad.
	 * @see Quad
	 */
	quad(
		subject: InQuad["subject"],
		predicate: InQuad["predicate"],
		object: InQuad["object"],
		graph?: InQuad["graph"]
	): OutQuad
}

type Stream<Q extends BaseQuad = Quad> = AsyncIterableIterator<Q>

/**
 * A Source is an object that emits quads.
 *
 * It can contain quads but also generate them on the fly.
 *
 * For example, parsers and transformations which generate quads can implement the Source interface.
 */
export interface Source<Q extends BaseQuad = Quad> {
	/**
	 * Returns a stream that processes all quads matching the pattern.
	 *
	 * @param subject   The optional exact subject or subject regex to match.
	 * @param predicate The optional exact predicate or predicate regex to match.
	 * @param object    The optional exact object or object regex to match.
	 * @param graph     The optional exact graph or graph regex to match.
	 * @return The resulting quad stream.
	 */
	match(
		subject?: Term | RegExp,
		predicate?: Term | RegExp,
		object?: Term | RegExp,
		graph?: Term | RegExp
	): Stream<Q>
}

export interface Sink<Q extends BaseQuad = Quad> {
	import(stream: AsyncIterator<Q>): Promise<void>
}

export interface Store<Q extends BaseQuad = Quad>
	extends Stream<Q>,
		Source<Q>,
		Sink<Q> {
	remove(stream: Stream<Q>): Promise<void>
	removeMatches(
		subject?: Term | RegExp,
		predicate?: Term | RegExp,
		object?: Term | RegExp,
		graph?: Term | RegExp
	): Promise<void>
	deleteGraph(graph: Q["graph"] | string): Promise<void>
}

/* Dataset Interfaces */
/* https://rdf.js.org/dataset-spec/ */

export interface DatasetCore<
	OutQuad extends BaseQuad = Quad,
	InQuad extends BaseQuad = OutQuad
> {
	/**
	 * A non-negative integer that specifies the number of quads in the set.
	 */
	readonly size: number

	/**
	 * Adds the specified quad to the dataset.
	 *
	 * Existing quads, as defined in `Quad.equals`, will be ignored.
	 */
	add(quad: InQuad): this

	/**
	 * Removes the specified quad from the dataset.
	 */
	delete(quad: InQuad): this

	/**
	 * Determines whether a dataset includes a certain quad.
	 */
	has(quad: InQuad): boolean

	/**
	 * Returns a new dataset that is comprised of all quads in the current instance matching the given arguments.
	 *
	 * The logic described in {@link https://rdf.js.org/dataset-spec/#quad-matching|Quad Matching} is applied for each
	 * quad in this dataset to check if it should be included in the output dataset.
	 *
	 * This method always returns a new DatasetCore, even if that dataset contains no quads.
	 *
	 * Since a `DatasetCore` is an unordered set, the order of the quads within the returned sequence is arbitrary.
	 *
	 * @param subject   The optional exact subject to match.
	 * @param predicate The optional exact predicate to match.
	 * @param object    The optional exact object to match.
	 * @param graph     The optional exact graph to match.
	 */
	match(
		subject?: Term | null,
		predicate?: Term | null,
		object?: Term | null,
		graph?: Term | null
	): this

	[Symbol.iterator](): Iterator<OutQuad>
}

export interface DatasetCoreFactory<
	OutQuad extends BaseQuad = Quad,
	InQuad extends BaseQuad = OutQuad,
	D extends DatasetCore<OutQuad, InQuad> = DatasetCore<OutQuad, InQuad>
> {
	/**
	 * Returns a new dataset and imports all quads, if given.
	 */
	dataset(quads?: InQuad[]): D
}

export interface Dataset<
	OutQuad extends BaseQuad = Quad,
	InQuad extends BaseQuad = OutQuad
> extends DatasetCore<OutQuad, InQuad> {
	/**
	 * Imports the quads into this dataset.
	 *
	 * This method differs from `Dataset.union` in that it adds all `quads` to the current instance, rather than
	 * combining `quads` and the current instance to create a new instance.
	 */
	addAll(quads: Dataset<InQuad> | InQuad[]): this

	/**
	 * Returns `true` if the current instance is a superset of the given dataset; differently put: if the given dataset
	 * is a subset of, is contained in the current dataset.
	 *
	 * Blank Nodes will be normalized.
	 */
	contains(other: Dataset<InQuad>): boolean

	/**
	 * This method removes the quads in the current instance that match the given arguments.
	 *
	 * The logic described in {@link https://rdf.js.org/dataset-spec/#quad-matching|Quad Matching} is applied for each
	 * quad in this dataset to select the quads which will be deleted.
	 *
	 * @param subject   The optional exact subject to match.
	 * @param predicate The optional exact predicate to match.
	 * @param object    The optional exact object to match.
	 * @param graph     The optional exact graph to match.
	 */
	deleteMatches(
		subject?: Term,
		predicate?: Term,
		object?: Term,
		graph?: Term
	): this

	/**
	 * Returns a new dataset that contains all quads from the current dataset, not included in the given dataset.
	 */
	difference(other: Dataset<InQuad>): this

	/**
	 * Returns true if the current instance contains the same graph structure as the given dataset.
	 *
	 * Blank Nodes will be normalized.
	 */
	equals(other: Dataset<InQuad>): boolean

	/**
	 * Universal quantification method, tests whether every quad in the dataset passes the test implemented by the
	 * provided `iteratee`.
	 *
	 * This method immediately returns boolean `false` once a quad that does not pass the test is found.
	 *
	 * This method always returns boolean `true` on an empty dataset.
	 *
	 * This method is aligned with `Array.prototype.every()` in ECMAScript-262.
	 */
	every(iteratee: QuadFilterIteratee<OutQuad>["test"]): boolean

	/**
	 * Creates a new dataset with all the quads that pass the test implemented by the provided `iteratee`.
	 *
	 * This method is aligned with Array.prototype.filter() in ECMAScript-262.
	 */
	filter(iteratee: QuadFilterIteratee<OutQuad>["test"]): this

	/**
	 * Executes the provided `iteratee` once on each quad in the dataset.
	 *
	 * This method is aligned with `Array.prototype.forEach()` in ECMAScript-262.
	 */
	forEach(iteratee: QuadRunIteratee<OutQuad>["run"]): void

	/**
	 * Imports all quads from the given stream into the dataset.
	 *
	 * The stream events `end` and `error` are wrapped in a Promise.
	 */
	import(stream: Stream<InQuad>): Promise<this>

	/**
	 * Returns a new dataset containing alls quads from the current dataset that are also included in the given dataset.
	 */
	intersection(other: Dataset<InQuad>): this

	/**
	 * Returns a new dataset containing all quads returned by applying `iteratee` to each quad in the current dataset.
	 */
	map(iteratee: QuadMapIteratee<OutQuad>["map"]): this

	/**
	 * This method calls the `iteratee` on each `quad` of the `Dataset`. The first time the `iteratee` is called, the
	 * `accumulator` value is the `initialValue` or, if not given, equals to the first quad of the `Dataset`. The return
	 * value of the `iteratee` is used as `accumulator` value for the next calls.
	 *
	 * This method returns the return value of the last `iteratee` call.
	 *
	 * This method is aligned with `Array.prototype.reduce()` in ECMAScript-262.
	 */
	reduce<A = any>(
		iteratee: QuadReduceIteratee<A, OutQuad>["run"],
		initialValue?: A
	): A

	/**
	 * Existential quantification method, tests whether some quads in the dataset pass the test implemented by the
	 * provided `iteratee`.
	 *
	 * This method immediately returns boolean `true` once a quad that passes the test is found.
	 *
	 * This method is aligned with `Array.prototype.some()` in ECMAScript-262.
	 */
	some(iteratee: QuadFilterIteratee<OutQuad>["test"]): boolean

	/**
	 * Returns the set of quads within the dataset as a host language native sequence, for example an `Array` in
	 * ECMAScript-262.
	 *
	 * Since a `Dataset` is an unordered set, the order of the quads within the returned sequence is arbitrary.
	 */
	toArray(): OutQuad[]

	/**
	 * Returns an N-Quads string representation of the dataset, preprocessed with
	 * {@link https://json-ld.github.io/normalization/spec/|RDF Dataset Normalization} algorithm.
	 */
	toCanonical(): string

	/**
	 * Returns a stream that contains all quads of the dataset.
	 */
	toStream(): Stream<OutQuad>

	/**
	 * Returns an N-Quads string representation of the dataset.
	 *
	 * No prior normalization is required, therefore the results for the same quads may vary depending on the `Dataset`
	 * implementation.
	 */
	toString(): string

	/**
	 * Returns a new `Dataset` that is a concatenation of this dataset and the quads given as an argument.
	 */
	union(quads: Dataset<InQuad>): this
}

export interface DatasetFactory<
	OutQuad extends BaseQuad = Quad,
	InQuad extends BaseQuad = OutQuad,
	D extends Dataset<OutQuad, InQuad> = Dataset<OutQuad, InQuad>
> extends DatasetCoreFactory<OutQuad, InQuad, D> {
	/**
	 * Returns a new dataset and imports all quads, if given.
	 */
	dataset(quads?: Dataset<InQuad> | InQuad[]): D
}

export interface QuadFilterIteratee<Q extends BaseQuad = Quad> {
	/**
	 * A callable function that returns `true` if the input quad passes the test this function implements.
	 */
	test(quad: Q, dataset: Dataset<Q>): boolean
}

export interface QuadMapIteratee<Q extends BaseQuad = Quad> {
	/**
	 * A callable function that can be executed on a quad and returns a quad.
	 *
	 * The returned quad can be the given quad or a new one.
	 */
	map(quad: Q, dataset: Dataset<Q>): Q
}

export interface QuadReduceIteratee<A = any, Q extends BaseQuad = Quad> {
	/**
	 * A callable function that can be executed on an accumulator and quad and returns a new accumulator.
	 */
	run(accumulator: A, quad: Q, dataset: Dataset<Q>): A
}

export interface QuadRunIteratee<Q extends BaseQuad = Quad> {
	/**
	 * A callable function that can be executed on a quad.
	 */
	run(quad: Q, dataset: Dataset<Q>): void
}

import * as RDF from "rdf-js"

import DataFactory, { toId, fromId, Quad, D } from "./DataFactory.js"
import {
	Subject,
	Predicate,
	Object,
	Graph,
	TermType,
	Term,
	QuadT,
} from "./rdf.js"

type Rotation = SPO | POS | OSP
type SPO = ["subject", "predicate", "object"]
type POS = ["predicate", "object", "subject"]
type OSP = ["object", "subject", "predicate"]
const SPO: SPO = ["subject", "predicate", "object"]
const POS: POS = ["predicate", "object", "subject"]
const OSP: OSP = ["object", "subject", "predicate"]

type Index = Map<number, Map<number, Set<number>>>
type GraphIndex = Readonly<{
	subjects: Index
	predicates: Index
	objects: Index
}>

// ## Constructor
export default class Store {
	private id: number
	private ids: Map<string, number>
	private entities: Map<number, string>
	private sizeCache: number | null
	private graphMap: Map<string, GraphIndex>
	private blankNodeIndex: number
	constructor(quads?: Iterable<QuadT>) {
		// The number of quads is initially zero
		this.sizeCache = 0
		// `#graphs` contains subject, predicate, and object indexes per graph
		// this.#graphs = Object.create(null)
		this.graphMap = new Map()
		// `#ids` maps entities such as `http://xmlns.com/foaf/0.1/name` to numbers,
		// saving memory by using only numbers as keys in `#graphs`
		this.id = 0
		this.ids = new Map([["><", 0]]) // dummy entry, so the first actual key is non-zero
		this.entities = new Map() // inverse of `#ids`
		// `#blankNodeIndex` is the index of the last automatically named blank node
		this.blankNodeIndex = 0

		// Add quads if passed
		if (quads !== undefined) {
			this.addQuads(quads)
		}
	}

	[Symbol.iterator](): Iterator<Quad> {
		return this.quads(null, null, null, null)
	}

	// ### `size` returns the number of quads in the store
	get size() {
		// Return the quad count if if was cached
		if (this.sizeCache !== null) {
			return this.sizeCache
		}

		// Calculate the number of quads by counting to the deepest level
		let size = 0
		for (const { subjects } of this.graphMap.values()) {
			for (const predicates of subjects.values()) {
				for (const objects of predicates.values()) {
					size += objects.size
				}
			}
		}

		this.sizeCache = size
		return size
	}

	// ## Private methods

	// Returns if the index has changed, if the entry did not already exist.
	private addToIndex(
		index0: Index,
		key0: number,
		key1: number,
		key2: number
	): boolean {
		// Create layers as necessary
		let existed = false
		const index1 = index0.get(key0)
		if (index1 === undefined) {
			index0.set(key0, new Map([[key1, new Set([key2])]]))
		} else {
			const index2 = index1.get(key1)
			if (index2 === undefined) {
				index1.set(key1, new Set([key2]))
			} else {
				existed = index2.has(key2)
				index2.add(key2)
			}
		}
		return existed
	}

	// ### `_removeFromIndex` removes a quad from a three-layered index
	private removeFromIndex(
		index0: Index,
		key0: number,
		key1: number,
		key2: number
	) {
		// Remove the quad from the index
		const index1 = index0.get(key0)!
		const index2 = index1.get(key1)!
		index2.delete(key2)
		if (index2.size === 0) {
			index1.delete(key1)
			if (index1.size === 0) {
				index0.delete(key0)
			}
		}
	}

	*generateIndex(
		index0: Index,
		key0: number | null,
		key1: number | null,
		key2: number | null,
		rotation: Rotation,
		graph: string
	): Generator<Quad, void> {
		const entities: [string, string, string] = ["", "", ""]
		if (key0) {
			const index1 = index0.get(key0)
			if (index1 !== undefined) {
				entities[0] = this.entities.get(key0)!
				yield* this.generateIndex1(
					entities,
					index1,
					key1 || null,
					key2 || null,
					rotation,
					graph
				)
			}
		} else {
			for (const [value0, index1] of index0) {
				entities[0] = this.entities.get(value0)!
				yield* this.generateIndex1(
					entities,
					index1,
					key1 || null,
					key2 || null,
					rotation,
					graph
				)
			}
		}
	}

	*generateIndex1(
		e: [string, string, string],
		index1: Map<number, Set<number>>,
		key1: number | null,
		key2: number | null,
		r: Rotation,
		graph: string
	): Generator<Quad, void> {
		if (key1) {
			const index2 = index1.get(key1)
			if (index2 !== undefined) {
				e[1] = this.entities.get(key1)!
				yield* this.generateIndex2(e, key2, index2, r, graph)
			}
		} else {
			for (const [value1, index2] of index1) {
				e[1] = this.entities.get(value1)!
				yield* this.generateIndex2(e, key2, index2, r, graph)
			}
		}
	}

	*generateIndex2(
		e: [string, string, string],
		key2: number | null,
		index2: Set<number>,
		r: Rotation,
		graph: string
	): Generator<Quad, void> {
		if (key2) {
			if (index2.has(key2)) {
				e[2] = this.entities.get(key2)!
				yield this.makeQuad(e, r, graph)
			}
		} else {
			for (const value2 of index2) {
				e[2] = this.entities.get(value2)!
				yield this.makeQuad(e, r, graph)
			}
		}
	}

	private makeQuad(
		[entity0, entity1, entity2]: [string, string, string],
		[name0, name1, name2]: Rotation,
		graph: string
	): Quad {
		const parts: {
			subject: D[TermType] | null
			predicate: D[TermType] | null
			object: D[TermType] | null
		} = { subject: null, predicate: null, object: null }
		parts[name0] = fromId(entity0)
		parts[name1] = fromId(entity1)
		parts[name2] = fromId(entity2)
		return new Quad(
			parts.subject as Subject<D>,
			parts.predicate as Predicate<D>,
			parts.object as Object<D>,
			fromId(graph) as Graph<D>
		)
	}

	private *loopByKey0(
		index0: Index,
		key0: number
	): Generator<number, void, undefined> {
		const index1 = index0.get(key0)
		if (index1 !== undefined) {
			yield* index1.keys()
		}
	}

	private *loopByKey1(
		index0: Index,
		key1: number
	): Generator<number, void, undefined> {
		for (const [key0, index1] of index0) {
			if (index1.has(key1)) {
				yield key0
			}
		}
	}

	private *loopBy2Keys(
		index0: Index,
		key0: number,
		key1: number
	): Generator<number, void, undefined> {
		const index1 = index0.get(key0)
		if (index1 !== undefined) {
			const index2 = index1.get(key1)
			if (index2 !== undefined) {
				yield* index2.keys()
			}
		}
	}

	// ### `countInIndex` counts matching quads in a three-layered index.
	// The index base is `index0` and the keys at each level are `key0`, `key1`, and `key2`.
	// Any of these keys can be undefined, which is interpreted as a wildcard.
	private countInIndex(
		index0: Index,
		key0: number | null,
		key1: number | null,
		key2: number | null
	): number {
		let count = 0
		if (key0 === null) {
			for (const index1 of index0.values()) {
				count += this.countInIndex1(index1, key1, key2)
			}
		} else {
			const index1 = index0.get(key0)
			if (index1 !== undefined) {
				count = this.countInIndex1(index1, key1, key2)
			}
		}

		return count
	}

	private countInIndex1(
		index1: Map<number, Set<number>>,
		key1: number | null,
		key2: number | null
	): number {
		let count = 0
		if (key1 === null) {
			for (const index2 of index1.values()) {
				count += key2 === null ? index2.size : index2.has(key2) ? 1 : 0
			}
		} else {
			const index2 = index1.get(key1)
			if (index2 !== undefined) {
				count += key2 === null ? index2.size : index2.has(key2) ? 1 : 0
			}
		}
		return count
	}

	// ### `getGraphIndices` returns an array with the given graph,
	// or all graphs if the argument is null or undefined.
	private getGraphIndices(graph: string | null): Map<string, GraphIndex> {
		if (graph === undefined || graph === null) {
			return this.graphMap
		} else {
			const graphIndex = this.graphMap.get(graph)!
			return new Map([[graph, graphIndex]])
		}
	}

	private getGraphIndex(graph: string): GraphIndex {
		const graphIndex = this.graphMap.get(graph)
		if (graphIndex !== undefined) {
			return graphIndex
		}
		const newGraphIndex: GraphIndex = Object.freeze({
			subjects: new Map(),
			predicates: new Map(),
			objects: new Map(),
		})
		this.graphMap.set(graph, newGraphIndex)
		return newGraphIndex
	}

	// ## Public methods

	// ### `addQuad` adds a new quad to the store.
	// Returns if the quad index has changed, if the quad did not already exist.
	public addQuad(quad: QuadT): void
	public addQuad(
		subject: Term,
		predicate: Term,
		object: Term,
		graph?: Term
	): void
	public addQuad(...args: [QuadT] | [Term, Term, Term, Term?]) {
		let [subject, predicate, object, graph] = ["", "", "", ""]
		if (args.length === 1) {
			subject = toId(args[0].subject)
			predicate = toId(args[0].predicate)
			object = toId(args[0].object)
			graph = toId(args[0].graph)
		} else {
			subject = toId(args[0])
			predicate = toId(args[1])
			object = toId(args[2])
			if (args[3] === undefined) {
				graph = ""
			} else {
				graph = toId(args[3])
			}
		}

		const graphIndex = this.getGraphIndex(graph)

		// Since entities can often be long IRIs, we avoid storing them in every index.
		// Instead, we have a separate index that maps entities to numbers,
		// which are then used as keys in the other indexes.
		if (!this.ids.has(subject)) {
			const id = ++this.id
			this.entities.set(id, subject)
			this.ids.set(subject, id)
		}
		const s = this.ids.get(subject)!
		if (!this.ids.has(predicate)) {
			const id = ++this.id
			this.entities.set(id, predicate)
			this.ids.set(predicate, id)
		}
		const p = this.ids.get(predicate)!
		if (!this.ids.has(object)) {
			const id = ++this.id
			this.entities.set(id, object)
			this.ids.set(object, id)
		}
		const o = this.ids.get(object)!

		const changed = this.addToIndex(graphIndex.subjects, s, p, o)
		this.addToIndex(graphIndex.predicates, p, o, s)
		this.addToIndex(graphIndex.objects, o, s, p)

		// The cached quad count is now invalid
		this.sizeCache = null
		return changed
	}

	// ### `addQuads` adds multiple quads to the store
	public addQuads(quads: Iterable<QuadT>) {
		for (const quad of quads) {
			this.addQuad(quad)
		}
	}

	// ### `removeQuad` removes a quad from the store if it exists
	public removeQuad(quad: RDF.Quad): boolean
	public removeQuad(
		subject: RDF.Term,
		predicate: RDF.Term,
		object: RDF.Term,
		graph?: RDF.Term
	): boolean
	public removeQuad(...args: any[]): boolean {
		let [subject, predicate, object, graph] = ["", "", "", ""]
		if (args.length === 1) {
			subject = toId(args[0].subject)
			predicate = toId(args[0].predicate)
			object = toId(args[0].object)
			graph = toId(args[0].graph)
		} else if (args.length === 3) {
			subject = toId(args[0])
			predicate = toId(args[1])
			object = toId(args[2])
			graph = ""
		} else if (args.length === 4) {
			subject = toId(args[0])
			predicate = toId(args[1])
			object = toId(args[2])
			graph = toId(args[3])
		}

		// Find internal identifiers for all components
		// and verify the quad exists.
		const index = this.graphMap.get(graph)
		if (index === undefined) {
			return false
		}

		if (
			!this.ids.has(subject) ||
			!this.ids.has(predicate) ||
			!this.ids.has(object)
		) {
			return false
		}

		const [s, p, o] = [
			this.ids.get(subject)!,
			this.ids.get(predicate)!,
			this.ids.get(object)!,
		]

		const subjects = index.subjects.get(s)
		if (subjects === undefined) {
			return false
		}

		const predicates = subjects.get(p)
		if (predicates === undefined || !predicates.has(o)) {
			return false
		}

		// Remove it from all indexes
		this.removeFromIndex(index.subjects, s, p, o)
		this.removeFromIndex(index.predicates, p, o, s)
		this.removeFromIndex(index.objects, o, s, p)
		if (this.sizeCache !== null) {
			this.sizeCache--
		}

		if (index.subjects.size === 0) {
			this.graphMap.delete(graph)
		}

		return true
	}

	// ### `remove` removes a stream of quads from the store
	public remove(stream: IterableIterator<RDF.Quad>) {
		for (const quad of stream) {
			this.removeQuad(quad)
		}
	}

	// ### `removeMatches` removes all matching quads from the store
	// Setting any field to `undefined` or `null` indicates a wildcard.
	public removeMatches(
		subject: RDF.Term | null,
		predicate: RDF.Term | null,
		object: RDF.Term | null,
		graph: RDF.Term | null
	) {
		return this.remove(this.quads(subject, predicate, object, graph))
	}

	// ### `deleteGraph` removes all triples with the given graph from the store
	public deleteGraph(graph: RDF.Term) {
		return this.removeMatches(null, null, null, graph)
	}

	private getGraphId(graph: Term | string): string | undefined {
		const graphId = toId(graph)
		if (this.graphMap.has(graphId)) {
			return graphId
		} else {
			return undefined
		}
	}

	// TODO::::::
	private getIds(
		s: Term | string | null,
		p: Term | string | null,
		o: Term | string | null,
		graph: Term | string | null
	): [
		number | null | undefined,
		number | null | undefined,
		number | null | undefined,
		string | null | undefined
	] {
		return [
			s === null ? null : this.ids.get(toId(s)),
			p === null ? null : this.ids.get(toId(p)),
			o === null ? null : this.ids.get(toId(o)),
			graph === null ? null : this.getGraphId(graph),
		]
	}

	private *q(
		s: number | null,
		p: number | null,
		o: number | null,
		g: string | null
	): Generator<Quad, void> {
		const graphs = this.getGraphIndices(g)
		for (const [graphId, { subjects, predicates, objects }] of graphs) {
			// Choose the optimal index, based on what fields are present
			if (s) {
				if (o) {
					// If subject and object are given, the object index will be the fastest
					yield* this.generateIndex(objects, o, s, p, OSP, graphId)
				} else {
					// If only subject and possibly predicate are given, the subject index will be the fastest
					yield* this.generateIndex(subjects, s, p, null, SPO, graphId)
				}
			} else if (p) {
				// If only predicate and possibly object are given, the predicate index will be the fastest
				yield* this.generateIndex(predicates, p, o, null, POS, graphId)
			} else if (o) {
				// If only object is given, the object index will be the fastest
				yield* this.generateIndex(objects, o, null, null, OSP, graphId)
			} else {
				// If nothing is given, iterate subjects and predicates first
				yield* this.generateIndex(subjects, null, null, null, SPO, graphId)
			}
		}
	}

	// ### `match` returns a stream of quads matching a pattern.
	// Setting any field to `undefined` or `null` indicates a wildcard.
	public *quads(
		subject: Term | string | null,
		predicate: Term | string | null,
		object: Term | string | null,
		graph: Term | string | null
	): Generator<Quad, void> {
		const [s, p, o, g] = this.getIds(subject, predicate, object, graph)
		if (
			s === undefined ||
			p === undefined ||
			o === undefined ||
			g === undefined
		) {
			return
		}

		yield* this.q(s, p, o, g)
	}

	public getQuads(
		subject: Term | string | null,
		predicate: Term | string | null,
		object: Term | string | null,
		graph: Term | string | null
	): Quad[] {
		return Array.from(this.quads(subject, predicate, object, graph))
	}

	public countQuads(
		subject: Term | string | null,
		predicate: Term | string | null,
		object: Term | string | null,
		graph: Term | string | null
	): number {
		const [s, p, o, g] = this.getIds(subject, predicate, object, graph)
		if (
			s === undefined ||
			p === undefined ||
			o === undefined ||
			g === undefined
		) {
			return 0
		}

		const graphs = this.getGraphIndices(g)

		let count = 0

		for (const content of graphs.values()) {
			if (s) {
				if (o) {
					// If subject and object are given, the object index will be the fastest
					count += this.countInIndex(content.objects, o, s, p)
				} else {
					// If only subject and possibly predicate are given, the subject index will be the fastest
					count += this.countInIndex(content.subjects, s, p, o)
				}
			} else if (p) {
				// If only predicate and possibly object are given, the predicate index will be the fastest
				count += this.countInIndex(content.predicates, p, o, s)
			} else {
				// If only object is possibly given, the object index will be the fastest
				count += this.countInIndex(content.objects, o, s, p)
			}
		}

		return count
	}

	public getSubjects(
		predicate: Term | string | null,
		object: Term | string | null,
		graph: Term | string | null
	): Subject<D>[] {
		return Array.from(this.subjects(predicate, object, graph))
	}

	public *subjects(
		predicate: Term | string | null,
		object: Term | string | null,
		graph: Term | string | null
	): Generator<Subject<D>, void, undefined> {
		const [_, p, o, g] = this.getIds(null, predicate, object, graph)
		if (p === undefined || o === undefined || g === undefined) {
			return
		}

		const graphs = this.getGraphIndices(g)

		const ids: Set<number> = new Set()
		for (const { subjects, predicates, objects } of graphs.values()) {
			// Choose optimal index based on which fields are wildcards
			let iterator: IterableIterator<number>
			if (p) {
				if (o) {
					// If predicate and object are given, the POS index is best.
					iterator = this.loopBy2Keys(predicates, p, o)
				} else {
					// If only predicate is given, the SPO index is best.
					iterator = this.loopByKey1(subjects, p)
				}
			} else if (o) {
				// If only object is given, the OSP index is best.
				iterator = this.loopByKey0(objects, o)
			} else {
				// If no params given, iterate all the subjects
				iterator = subjects.keys()
			}

			for (const s of iterator) {
				yield* this.unique(s, ids) as Generator<Subject<D>>
			}
		}
	}

	public getPredicates(
		subject: Term | string | null,
		object: Term | string | null,
		graph: Term | string | null
	): Predicate<D>[] {
		return Array.from(this.predicates(subject, object, graph))
	}

	public *predicates(
		subject: Term | string | null,
		object: Term | string | null,
		graph: Term | string | null
	): Generator<Predicate<D>, void, undefined> {
		const [s, _, o, g] = this.getIds(subject, null, object, graph)
		if (s === undefined || o === undefined || g === undefined) {
			return
		}

		const graphs = this.getGraphIndices(g)

		const ids: Set<number> = new Set()

		for (const { subjects, predicates, objects } of graphs.values()) {
			// Choose optimal index based on which fields are wildcards
			let iterator: IterableIterator<number>
			if (s) {
				if (o) {
					// If subject and object are given, the OSP index is best.
					iterator = this.loopBy2Keys(objects, o, s)
				} else {
					// If only subject is given, the SPO index is best.
					iterator = this.loopByKey0(subjects, s)
				}
			} else if (o) {
				// If only object is given, the POS index is best.
				iterator = this.loopByKey1(predicates, o)
			} else {
				// If no params given, iterate all the predicates.
				iterator = predicates.keys()
			}
			for (const p of iterator) {
				yield* this.unique(p, ids) as Generator<Predicate<D>>
			}
		}
	}

	// ### `getObjects` returns all objects that match the pattern.
	// Setting any field to `undefined` or `null` indicates a wildcard.
	public getObjects(
		subject: Term | string | null,
		predicate: Term | string | null,
		graph: Term | string | null
	): Object<D>[] {
		return Array.from(this.objects(subject, predicate, graph))
	}

	public *objects(
		subject: Term | string | null,
		predicate: Term | string | null,
		graph: Term | string | null
	): Generator<Object<D>, void, undefined> {
		const [s, p, _, g] = this.getIds(subject, predicate, null, graph)
		if (s === undefined || p === undefined || g === undefined) {
			return
		}

		const graphs = this.getGraphIndices(g)

		const ids: Set<number> = new Set()
		for (const { subjects, predicates, objects } of graphs.values()) {
			// Choose optimal index based on which fields are wildcards
			if (s) {
				if (p) {
					// If subject and predicate are given, the SPO index is best.
					for (const o of this.loopBy2Keys(subjects, s, p)) {
						yield* this.unique(o, ids) as Generator<Object<D>>
					}
				} else {
					// If only subject is given, the OSP index is best.
					for (const o of this.loopByKey1(objects, s)) {
						yield* this.unique(o, ids) as Generator<Object<D>>
					}
				}
			} else if (p) {
				// If only predicate is given, the POS index is best.
				for (const o of this.loopByKey0(predicates, p)) {
					yield* this.unique(o, ids) as Generator<Object<D>>
				}
			} else {
				// If no params given, iterate all the objects.
				for (const o of objects.keys()) {
					yield* this.unique(o, ids) as Generator<Object<D>>
				}
			}
		}
	}

	public getGraphs(
		subject: Term | string | null,
		predicate: Term | string | null,
		object: Term | string | null
	): Graph<D>[] {
		return Array.from(this.graphs(subject, predicate, object))
	}

	public *graphs(
		subject: Term | string | null,
		predicate: Term | string | null,
		object: Term | string | null
	): Generator<Graph<D>> {
		const [s, p, o, _] = this.getIds(subject, predicate, object, null)
		if (s === undefined || p === undefined || o === undefined) {
			return
		}

		for (const g of this.graphMap.keys()) {
			const graph = fromId(g) as Graph<D>
			for (const _ of this.q(s, p, o, g)) {
				yield graph
				break
			}
		}
	}

	private *unique(
		id: number,
		ids: Set<number>
	): Generator<D[TermType], void, unknown> {
		if (!ids.has(id)) {
			ids.add(id)
			yield fromId(this.entities.get(id)!)
		}
	}

	createBlankNode(suggestedName: string) {
		let name = ""
		if (suggestedName) {
			// Generate a name based on the suggested name
			name = "_:" + suggestedName
			for (let index = 1; this.ids.has(name); index++) {
				name = "_:" + suggestedName + index
			}
		} else {
			// Generate a generic blank node name
			do {
				name = "_:b" + this.blankNodeIndex++
			} while (this.ids.has(name))
		}
		// Add the blank node to the entities, avoiding the generation of duplicates
		const id = ++this.id
		this.ids.set(name, id)
		this.entities.set(id, name)
		return DataFactory.blankNode(name.substr(2))
	}
}

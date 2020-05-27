import * as RDF from "rdf-js"

import DataFactory, { toId, fromId } from "./DataFactory.js"

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
	#id: number
	#ids: Map<string, number>
	#entities: Map<number, string>
	#size: number | null
	#graphs: Map<string, GraphIndex>
	#blankNodeIndex: number
	#factory: RDF.DataFactory
	constructor(quads?: RDF.Quad[], options?: { factory?: RDF.DataFactory }) {
		// The number of quads is initially zero
		this.#size = 0
		// `#graphs` contains subject, predicate, and object indexes per graph
		// this.#graphs = Object.create(null)
		this.#graphs = new Map()
		// `#ids` maps entities such as `http://xmlns.com/foaf/0.1/name` to numbers,
		// saving memory by using only numbers as keys in `#graphs`
		this.#id = 0
		this.#ids = new Map([["><", 0]]) // dummy entry, so the first actual key is non-zero
		this.#entities = new Map() // inverse of `#ids`
		// `#blankNodeIndex` is the index of the last automatically named blank node
		this.#blankNodeIndex = 0

		options = options || {}
		this.#factory = options.factory || DataFactory

		// Add quads if passed
		if (Array.isArray(quads) && quads.length > 0) {
			this.addQuads(quads)
		}
	}

	// ## Public properties

	// ### `size` returns the number of quads in the store
	get size() {
		// Return the quad count if if was cached
		if (this.#size !== null) {
			return this.#size
		}

		// Calculate the number of quads by counting to the deepest level
		let size = 0
		for (const { subjects } of this.#graphs.values()) {
			for (const predicates of subjects.values()) {
				for (const objects of predicates.values()) {
					size += objects.size
				}
			}
		}

		this.#size = size
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
	): Generator<RDF.Quad, void> {
		const entities: [string, string, string] = ["", "", ""]
		if (key0) {
			const index1 = index0.get(key0)
			if (index1 !== undefined) {
				entities[0] = this.#entities.get(key0)!
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
				entities[0] = this.#entities.get(value0)!
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
	): Generator<RDF.Quad, void> {
		if (key1) {
			const index2 = index1.get(key1)
			if (index2 !== undefined) {
				e[1] = this.#entities.get(key1)!
				yield* this.generateIndex2(e, key2, index2, r, graph)
			}
		} else {
			for (const [value1, index2] of index1) {
				e[1] = this.#entities.get(value1)!
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
	): Generator<RDF.Quad, void> {
		if (key2) {
			if (index2.has(key2)) {
				e[2] = this.#entities.get(key2)!
				yield this.makeQuad(e, r, graph)
			}
		} else {
			for (const value2 of index2) {
				e[2] = this.#entities.get(value2)!
				yield this.makeQuad(e, r, graph)
			}
		}
	}

	private makeQuad(
		[entity0, entity1, entity2]: [string, string, string],
		[name0, name1, name2]: Rotation,
		graph: string
	): RDF.Quad {
		const parts: {
			subject: RDF.Term | null
			predicate: RDF.Term | null
			object: RDF.Term | null
		} = { subject: null, predicate: null, object: null }
		parts[name0] = fromId(entity0, this.#factory)
		parts[name1] = fromId(entity1, this.#factory)
		parts[name2] = fromId(entity2, this.#factory)
		return this.#factory.quad(
			parts.subject as RDF.Quad_Subject,
			parts.predicate as RDF.Quad_Predicate,
			parts.object as RDF.Quad_Object,
			fromId(graph, this.#factory) as RDF.Quad_Graph
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

	// ### `_countInIndex` counts matching quads in a three-layered index.
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
			return this.#graphs
		} else {
			const graphIndex = this.#graphs.get(graph)!
			return new Map([[graph, graphIndex]])
		}
	}

	private getGraphIndex(graph: string): GraphIndex {
		const graphIndex = this.#graphs.get(graph)
		if (graphIndex !== undefined) {
			return graphIndex
		}
		const newGraphIndex: GraphIndex = Object.freeze({
			subjects: new Map(),
			predicates: new Map(),
			objects: new Map(),
		})
		this.#graphs.set(graph, newGraphIndex)
		return newGraphIndex
	}

	// ## Public methods

	// ### `addQuad` adds a new quad to the store.
	// Returns if the quad index has changed, if the quad did not already exist.
	public addQuad(quad: RDF.Quad): void
	public addQuad(
		subject: RDF.Term,
		predicate: RDF.Term,
		object: RDF.Term,
		graph?: RDF.Term
	): void
	public addQuad(...args: any[]) {
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

		const graphIndex = this.getGraphIndex(graph)

		// Since entities can often be long IRIs, we avoid storing them in every index.
		// Instead, we have a separate index that maps entities to numbers,
		// which are then used as keys in the other indexes.
		if (!this.#ids.has(subject)) {
			const id = ++this.#id
			this.#entities.set(id, subject)
			this.#ids.set(subject, id)
		}
		const s = this.#ids.get(subject)!
		if (!this.#ids.has(predicate)) {
			const id = ++this.#id
			this.#entities.set(id, predicate)
			this.#ids.set(predicate, id)
		}
		const p = this.#ids.get(predicate)!
		if (!this.#ids.has(object)) {
			const id = ++this.#id
			this.#entities.set(id, object)
			this.#ids.set(object, id)
		}
		const o = this.#ids.get(object)!

		const changed = this.addToIndex(graphIndex.subjects, s, p, o)
		this.addToIndex(graphIndex.predicates, p, o, s)
		this.addToIndex(graphIndex.objects, o, s, p)

		// The cached quad count is now invalid
		this.#size = null
		return changed
	}

	// ### `addQuads` adds multiple quads to the store
	public addQuads(quads: RDF.Quad[]) {
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
		const index = this.#graphs.get(graph)
		if (index === undefined) {
			return false
		}

		if (
			!this.#ids.has(subject) ||
			!this.#ids.has(predicate) ||
			!this.#ids.has(object)
		) {
			return false
		}

		const [s, p, o] = [
			this.#ids.get(subject)!,
			this.#ids.get(predicate)!,
			this.#ids.get(object)!,
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
		if (this.#size !== null) {
			this.#size--
		}

		if (index.subjects.size === 0) {
			this.#graphs.delete(graph)
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

	private getIds(
		s: RDF.Term | null,
		p: RDF.Term | null,
		o: RDF.Term | null,
		graph: RDF.Term | null
	): [number | null, number | null, number | null, string | null] {
		return [
			(s && this.#ids.get(toId(s))) || null,
			(p && this.#ids.get(toId(p))) || null,
			(o && this.#ids.get(toId(o))) || null,
			graph && toId(graph),
		]
	}

	// ### `match` returns a stream of quads matching a pattern.
	// Setting any field to `undefined` or `null` indicates a wildcard.
	public *quads(
		subject: RDF.Term | null,
		predicate: RDF.Term | null,
		object: RDF.Term | null,
		graph: RDF.Term | null
	): Generator<RDF.Quad, void> {
		const [s, p, o, g] = this.getIds(subject, predicate, object, graph)
		if (
			(subject !== null && s === null) ||
			(predicate !== null && p === null) ||
			(object !== null && o === null)
		) {
			return
		}

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

	public getQuads(
		subject: RDF.Term | string | null,
		predicate: RDF.Term | string | null,
		object: RDF.Term | string | null,
		graph: RDF.Term | string | null
	): RDF.Quad[] {
		const s = typeof subject === "string" ? fromId(subject) : subject
		const p = typeof predicate === "string" ? fromId(predicate) : predicate
		const o = typeof object === "string" ? fromId(object) : object
		const g = typeof graph === "string" ? fromId(graph) : graph
		const quads: RDF.Quad[] = []
		for (const quad of this.quads(s, p, o, g)) {
			quads.push(quad)
		}
		return quads
	}

	// ### `countQuads` returns the number of quads matching a pattern.
	// Setting any field to `undefined` or `null` indicates a wildcard.
	public countQuads(
		subject: RDF.Term | null,
		predicate: RDF.Term | null,
		object: RDF.Term | null,
		graph: RDF.Term | null
	): number {
		const [s, p, o, g] = this.getIds(subject, predicate, object, graph)
		if (
			(subject !== null && s === null) ||
			(predicate !== null && p === null) ||
			(object !== null && o === null)
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
		predicate: RDF.Term | string | null,
		object: RDF.Term | string | null,
		graph: RDF.Term | string | null
	): RDF.Quad_Subject[] {
		const p = typeof predicate === "string" ? fromId(predicate) : predicate
		const o = typeof object === "string" ? fromId(object) : object
		const g = typeof graph === "string" ? fromId(graph) : graph

		const results: RDF.Quad_Subject[] = []
		for (const subject of this.subjects(p, o, g)) {
			results.push(subject)
		}
		return results
	}

	public *subjects(
		predicate: RDF.Term | null,
		object: RDF.Term | null,
		graph: RDF.Term | null
	): Generator<RDF.Quad_Subject, void, undefined> {
		const [_, p, o, g] = this.getIds(null, predicate, object, graph)
		if ((predicate !== null && p === null) || (object !== null && o === null)) {
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
				yield* this.unique(s, ids)
			}
		}
	}

	public getPredicates(
		subject: RDF.Term | string | null,
		object: RDF.Term | string | null,
		graph: RDF.Term | string | null
	): RDF.Quad_Predicate[] {
		const s = typeof subject === "string" ? fromId(subject) : subject
		const o = typeof object === "string" ? fromId(object) : object
		const g = typeof graph === "string" ? fromId(graph) : graph

		const terms: RDF.Quad_Predicate[] = []
		for (const predicate of this.predicates(s, o, g)) {
			terms.push(predicate)
		}
		return terms
	}

	public *predicates(
		subject: RDF.Term | null,
		object: RDF.Term | null,
		graph: RDF.Term | null
	): Generator<RDF.Quad_Predicate, void, undefined> {
		const [s, _, o, g] = this.getIds(subject, null, object, graph)
		if ((subject !== null && s === null) || (object !== null && o === null)) {
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
				yield* this.unique(p, ids)
			}
		}
	}

	// ### `getObjects` returns all objects that match the pattern.
	// Setting any field to `undefined` or `null` indicates a wildcard.
	public getObjects(
		subject: RDF.Term | string | null,
		predicate: RDF.Term | string | null,
		graph: RDF.Term | string | null
	): RDF.Quad_Object[] {
		const s = typeof subject === "string" ? fromId(subject) : subject
		const p = typeof predicate === "string" ? fromId(predicate) : predicate
		const g = typeof graph === "string" ? fromId(graph) : graph

		const terms: RDF.Quad_Object[] = []
		for (const object of this.objects(s, p, g)) {
			terms.push(object)
		}
		return terms
	}

	private *unique<T extends RDF.Term>(
		id: number,
		ids: Set<number>
	): Generator<T, void, unknown> {
		if (!ids.has(id)) {
			ids.add(id)
			yield fromId(this.#entities.get(id)!, this.#factory) as T
		}
	}

	public *objects(
		subject: RDF.Term | null,
		predicate: RDF.Term | null,
		graph: RDF.Term | null
	): Generator<RDF.Quad_Object, void, undefined> {
		const [s, p, _, g] = this.getIds(subject, predicate, null, graph)
		if (
			(subject !== null && s === null) ||
			(predicate !== null && p === null)
		) {
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
						yield* this.unique(o, ids)
					}
				} else {
					// If only subject is given, the OSP index is best.
					for (const o of this.loopByKey1(objects, s)) {
						yield* this.unique(o, ids)
					}
				}
			} else if (p) {
				// If only predicate is given, the POS index is best.
				for (const o of this.loopByKey0(predicates, p)) {
					yield* this.unique(o, ids)
				}
			} else {
				// If no params given, iterate all the objects.
				for (const o of objects.keys()) {
					yield* this.unique(o, ids)
				}
			}
		}
	}

	public getGraphs(
		subject: RDF.Term | string | null,
		predicate: RDF.Term | string | null,
		object: RDF.Term | string | null
	): RDF.Quad_Graph[] {
		const s = typeof subject === "string" ? fromId(subject) : subject
		const p = typeof predicate === "string" ? fromId(predicate) : predicate
		const o = typeof object === "string" ? fromId(object) : object

		const results: RDF.Quad_Graph[] = []
		for (const graph of this.graphs(s, p, o)) {
			results.push(graph)
		}
		return results
	}

	public *graphs(
		subject: RDF.Term | string | null,
		predicate: RDF.Term | string | null,
		object: RDF.Term | string | null
	): Generator<RDF.Quad_Graph> {
		const s = typeof subject === "string" ? fromId(subject) : subject
		const p = typeof predicate === "string" ? fromId(predicate) : predicate
		const o = typeof object === "string" ? fromId(object) : object

		for (const graph of this.#graphs.keys()) {
			const g = fromId(graph, this.#factory)
			for (const _ of this.quads(s, p, o, g)) {
				yield g as RDF.Quad_Graph
				break
			}
		}
	}

	createBlankNode(suggestedName: string) {
		let name = ""
		if (suggestedName) {
			// Generate a name based on the suggested name
			name = "_:" + suggestedName
			for (let index = 1; this.#ids.has(name); index++) {
				name = "_:" + suggestedName + index
			}
		} else {
			// Generate a generic blank node name
			do {
				name = "_:b" + this.#blankNodeIndex++
			} while (this.#ids.has(name))
		}
		// Add the blank node to the entities, avoiding the generation of duplicates
		const id = ++this.#id
		this.#ids.set(name, id)
		this.#entities.set(id, name)
		return this.#factory.blankNode(name.substr(2))
	}
}
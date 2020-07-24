import * as RDF from "rdf-js";
import { Quad, D } from "./DataFactory.js";
import { Subject, Predicate, Object, Graph, Term, QuadT } from "./rdf.js";
declare type Rotation = SPO | POS | OSP;
declare type SPO = ["subject", "predicate", "object"];
declare type POS = ["predicate", "object", "subject"];
declare type OSP = ["object", "subject", "predicate"];
declare const SPO: SPO;
declare const POS: POS;
declare const OSP: OSP;
declare type Index = Map<number, Map<number, Set<number>>>;
export default class Store {
    #private;
    constructor(quads?: QuadT[]);
    [Symbol.iterator](): Iterator<Quad>;
    get size(): number;
    private addToIndex;
    private removeFromIndex;
    generateIndex(index0: Index, key0: number | null, key1: number | null, key2: number | null, rotation: Rotation, graph: string): Generator<Quad, void>;
    generateIndex1(e: [string, string, string], index1: Map<number, Set<number>>, key1: number | null, key2: number | null, r: Rotation, graph: string): Generator<Quad, void>;
    generateIndex2(e: [string, string, string], key2: number | null, index2: Set<number>, r: Rotation, graph: string): Generator<Quad, void>;
    private makeQuad;
    private loopByKey0;
    private loopByKey1;
    private loopBy2Keys;
    private countInIndex;
    private countInIndex1;
    private getGraphIndices;
    private getGraphIndex;
    addQuad(quad: QuadT): void;
    addQuad(subject: Term, predicate: Term, object: Term, graph?: Term): void;
    addQuads(quads: QuadT[]): void;
    removeQuad(quad: RDF.Quad): boolean;
    removeQuad(subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph?: RDF.Term): boolean;
    remove(stream: IterableIterator<RDF.Quad>): void;
    removeMatches(subject: RDF.Term | null, predicate: RDF.Term | null, object: RDF.Term | null, graph: RDF.Term | null): void;
    deleteGraph(graph: RDF.Term): void;
    private getGraphId;
    private getIds;
    private q;
    quads(subject: Term | string | null, predicate: Term | string | null, object: Term | string | null, graph: Term | string | null): Generator<Quad, void>;
    getQuads(subject: Term | string | null, predicate: Term | string | null, object: Term | string | null, graph: Term | string | null): Quad[];
    countQuads(subject: Term | string | null, predicate: Term | string | null, object: Term | string | null, graph: Term | string | null): number;
    getSubjects(predicate: Term | string | null, object: Term | string | null, graph: Term | string | null): Subject<D>[];
    subjects(predicate: Term | string | null, object: Term | string | null, graph: Term | string | null): Generator<Subject<D>, void, undefined>;
    getPredicates(subject: Term | string | null, object: Term | string | null, graph: Term | string | null): Predicate<D>[];
    predicates(subject: Term | string | null, object: Term | string | null, graph: Term | string | null): Generator<Predicate<D>, void, undefined>;
    getObjects(subject: Term | string | null, predicate: Term | string | null, graph: Term | string | null): Object<D>[];
    objects(subject: Term | string | null, predicate: Term | string | null, graph: Term | string | null): Generator<Object<D>, void, undefined>;
    getGraphs(subject: Term | string | null, predicate: Term | string | null, object: Term | string | null): Graph<D>[];
    graphs(subject: Term | string | null, predicate: Term | string | null, object: Term | string | null): Generator<Graph<D>>;
    private unique;
    createBlankNode(suggestedName: string): RDF.BlankNode;
}
export {};

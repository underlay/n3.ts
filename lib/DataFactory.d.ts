import * as RDF from "rdf-js";
import { Term, TermT, QuadT, NamedNodeT, BlankNodeT, LiteralT, DefaultGraphT, VariableT, DataModel, TermType, Subject, Predicate, Object, Graph, BaseQuad } from "./rdf.js";
declare abstract class BaseTerm<T extends TermType> {
    readonly id: string;
    abstract get termType(): T;
    abstract get value(): [T] extends [DefaultGraphT] ? "" : string;
    constructor(id: string);
    abstract toJSON(): TermT<T>;
    equals(term?: null | Term): boolean;
}
export declare class NamedNode extends BaseTerm<NamedNodeT> implements RDF.NamedNode, TermT<NamedNodeT> {
    constructor(value: string);
    get termType(): NamedNodeT;
    get value(): string;
    toJSON(): TermT<NamedNodeT>;
}
export declare class Literal extends BaseTerm<LiteralT> implements RDF.Literal, TermT<LiteralT> {
    constructor(value: string, languageOrDataType: RDF.NamedNode | string | null);
    get termType(): LiteralT;
    get value(): string;
    get term(): string;
    get language(): string;
    get datatype(): NamedNode;
    get datatypeString(): string;
    equals(term?: null | Term): boolean;
    toJSON(): TermT<LiteralT>;
}
export declare class BlankNode extends BaseTerm<BlankNodeT> implements RDF.BlankNode, TermT<BlankNodeT> {
    constructor(name: string);
    get termType(): BlankNodeT;
    get value(): string;
    toJSON(): TermT<BlankNodeT>;
}
export declare class Variable extends BaseTerm<VariableT> implements RDF.Variable, TermT<VariableT> {
    constructor(name: string);
    get termType(): VariableT;
    get value(): string;
    toJSON(): TermT<VariableT>;
}
export declare class DefaultGraph extends BaseTerm<DefaultGraphT> implements RDF.DefaultGraph, TermT<DefaultGraphT> {
    constructor();
    get value(): "";
    get termType(): DefaultGraphT;
    toJSON(): TermT<DefaultGraphT>;
}
export declare const Default: DefaultGraph;
export declare function fromId(id: string): NamedNode | Literal | BlankNode | Variable | DefaultGraph;
export declare function toId(term: string | Term): string;
export interface D extends DataModel {
    NamedNode: NamedNode;
    BlankNode: BlankNode;
    Literal: Literal;
    DefaultGraph: DefaultGraph;
    Variable: Variable;
    Quad: Quad;
}
export declare class Quad implements RDF.Quad, QuadT<D> {
    readonly subject: Subject<D>;
    readonly predicate: Predicate<D>;
    readonly object: Object<D>;
    readonly [0]: Subject<D>;
    readonly [1]: Predicate<D>;
    readonly [2]: Object<D>;
    readonly [3]: Graph<D>;
    readonly graph: Graph<D>;
    constructor(subject: Subject<D>, predicate: Predicate<D>, object: Object<D>, graph?: Graph<D>);
    toJSON(): QuadT;
    equals(quad?: null | BaseQuad): boolean;
}
export declare function getTerm(term: null | string | Term): null | NamedNode | BlankNode | Literal | Variable | DefaultGraph;
declare const DataFactory: RDF.DataFactory;
export default DataFactory;

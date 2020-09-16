import * as RDF from "rdf-js";
import * as DataModel from "./DataModel.js";
export declare class NamedNode<Iri extends string = string> implements RDF.NamedNode, DataModel.NamedNode {
    readonly value: Iri;
    constructor(value: Iri);
    get termType(): DataModel.NamedNodeT;
    get id(): string;
    equals(other?: null | RDF.Term): boolean;
    toJSON(): DataModel.NamedNode;
}
export declare class Literal implements RDF.Literal, DataModel.Literal {
    readonly value: string;
    readonly id: string;
    readonly language: string;
    readonly datatype: NamedNode;
    constructor(value: string, languageOrDataType?: null | string | DataModel.NamedNode);
    get termType(): DataModel.LiteralT;
    equals(term?: null | RDF.Term): boolean;
    toJSON(): DataModel.Literal;
}
export declare class BlankNode implements RDF.BlankNode, DataModel.BlankNode {
    readonly value: string;
    constructor(value: string);
    get id(): string;
    get termType(): DataModel.BlankNodeT;
    equals(term?: null | RDF.Term): boolean;
    toJSON(): DataModel.BlankNode;
}
export declare class Variable implements RDF.Variable, DataModel.Variable {
    readonly value: string;
    constructor(value: string);
    get id(): string;
    get termType(): DataModel.VariableT;
    equals(term?: null | RDF.Term): boolean;
    toJSON(): DataModel.Variable;
}
export declare class DefaultGraph implements RDF.DefaultGraph, DataModel.DefaultGraph {
    get termType(): DataModel.DefaultGraphT;
    get id(): "";
    get value(): "";
    equals(term?: null | RDF.Term): boolean;
    toJSON(): DataModel.DefaultGraph;
}
export declare const Default: DefaultGraph;
export declare function fromId(id: string): Literal | NamedNode<string> | BlankNode | Variable | DefaultGraph;
export declare function toId(term: string | DataModel.Term): string;
export interface D extends DataModel.DataModel {
    NamedNode: NamedNode;
    BlankNode: BlankNode;
    Literal: Literal;
    DefaultGraph: DefaultGraph;
    Variable: Variable;
    Quad: Quad;
}
export declare class Quad extends Array<NamedNode | BlankNode | Literal | DefaultGraph | Variable | Quad> implements RDF.Quad, DataModel.Quad {
    readonly subject: NamedNode | BlankNode | Variable | Quad;
    readonly predicate: NamedNode | Variable;
    readonly object: NamedNode | BlankNode | Literal | Variable;
    readonly graph: NamedNode | BlankNode | DefaultGraph | Variable;
    constructor(subject: NamedNode | BlankNode | Variable | Quad, predicate: NamedNode | Variable, object: NamedNode | BlankNode | Literal | Variable, graph?: NamedNode | BlankNode | DefaultGraph | Variable);
    get termType(): DataModel.QuadT;
    get value(): "";
    get id(): string;
    toJSON(): DataModel.Quad;
    equals(other?: null | RDF.Term): boolean;
}
declare const DataFactory: RDF.DataFactory;
export default DataFactory;

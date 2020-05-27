import * as RDF from "rdf-js";
interface Term<T extends string> {
    termType: T;
    readonly id: string;
    readonly value: string;
}
export declare abstract class BaseTerm<T extends string> implements Term<T> {
    readonly id: string;
    abstract get termType(): T;
    abstract get value(): string;
    constructor(id: string);
    equals(term: RDF.Term): boolean;
    toJSON(): {
        termType: T;
        value: string;
    };
}
declare type NamedNodeT = "NamedNode";
declare type LiteralT = "Literal";
declare type BlankNodeT = "BlankNode";
declare type DefaultGraphT = "DefaultGraph";
declare type VariableT = "Variable";
export declare class NamedNode extends BaseTerm<NamedNodeT> implements RDF.NamedNode {
    get termType(): NamedNodeT;
    get value(): string;
}
export declare class Literal extends BaseTerm<LiteralT> implements RDF.Literal {
    get termType(): LiteralT;
    get value(): string;
    get language(): string;
    get datatype(): NamedNode;
    get datatypeString(): string;
    equals(term: RDF.Term): boolean;
    toJSON(): {
        termType: "Literal";
        value: string;
        language: string;
        datatype: {
            termType: string;
            value: string;
        };
    };
}
export declare class BlankNode extends BaseTerm<BlankNodeT> implements RDF.BlankNode {
    constructor(name: string);
    get termType(): BlankNodeT;
    get value(): string;
}
export declare class Variable extends BaseTerm<VariableT> implements RDF.Variable {
    constructor(name: string);
    get termType(): VariableT;
    get value(): string;
}
export declare class DefaultGraph extends BaseTerm<DefaultGraphT> implements RDF.DefaultGraph {
    constructor();
    get value(): "";
    get termType(): DefaultGraphT;
}
export declare const Default: DefaultGraph;
export declare function fromId(id: string, factory?: RDF.DataFactory): RDF.Term;
export declare function toId(term: string | RDF.Term): string;
export declare class Quad {
    readonly subject: NamedNode | BlankNode | Variable;
    readonly predicate: NamedNode | Variable;
    readonly object: NamedNode | BlankNode | Literal | Variable;
    readonly graph: NamedNode | BlankNode | DefaultGraph | Variable;
    constructor(subject: NamedNode | BlankNode | Variable, predicate: NamedNode | Variable, object: NamedNode | BlankNode | Literal | Variable, graph?: NamedNode | BlankNode | DefaultGraph | Variable);
    toJSON(): {
        subject: {
            termType: "NamedNode";
            value: string;
        } | {
            termType: "BlankNode";
            value: string;
        } | {
            termType: "Variable";
            value: string;
        };
        predicate: {
            termType: "NamedNode";
            value: string;
        } | {
            termType: "Variable";
            value: string;
        };
        object: {
            termType: "NamedNode";
            value: string;
        } | {
            termType: "BlankNode";
            value: string;
        } | {
            termType: "Variable";
            value: string;
        } | {
            termType: "Literal";
            value: string;
            language: string;
            datatype: {
                termType: string;
                value: string;
            };
        };
        graph: {
            termType: "NamedNode";
            value: string;
        } | {
            termType: "BlankNode";
            value: string;
        } | {
            termType: "Variable";
            value: string;
        } | {
            termType: "DefaultGraph";
            value: string;
        };
    };
    equals(quad?: RDF.Quad): boolean;
}
declare const DataFactory: RDF.DataFactory;
export default DataFactory;

export declare type NamedNodeT = "NamedNode";
export declare type LiteralT = "Literal";
export declare type BlankNodeT = "BlankNode";
export declare type DefaultGraphT = "DefaultGraph";
export declare type VariableT = "Variable";
export declare type QuadT = "Quad";
export declare type TermType = NamedNodeT | LiteralT | BlankNodeT | DefaultGraphT | VariableT | QuadT;
export declare type NamedNode = {
    termType: "NamedNode";
    value: string;
};
export declare type BlankNode = {
    termType: "BlankNode";
    value: string;
};
export declare type Literal = {
    termType: "Literal";
    value: string;
    language: string;
    datatype: NamedNode;
};
export declare type DefaultGraph = {
    termType: "DefaultGraph";
    value: "";
};
export declare type Variable = {
    termType: "Variable";
    value: string;
};
export declare type Quad = {
    termType: "Quad";
    value: "";
    subject: term;
    predicate: term;
    object: term;
    graph: term;
};
declare type term = NamedNode | BlankNode | Literal | DefaultGraph | Variable | Quad;
export interface DataModel<N extends NamedNode = NamedNode, B extends BlankNode = BlankNode, L extends Literal = Literal, D extends DefaultGraph = DefaultGraph, V extends Variable = Variable, Q extends Quad = Quad> {
    NamedNode: N;
    BlankNode: B;
    Literal: L;
    DefaultGraph: D;
    Variable: V;
    Quad: Q;
}
export declare type Term<D extends DataModel = DataModel> = D["NamedNode"] | D["BlankNode"] | D["Literal"] | D["DefaultGraph"] | D["Variable"] | D["Quad"];
export declare type Subject<D extends DataModel = DataModel> = D["NamedNode"] | D["BlankNode"] | D["Variable"] | D["Quad"];
export declare type Predicate<D extends DataModel = DataModel> = D["NamedNode"] | D["Variable"];
export declare type Object<D extends DataModel = DataModel> = D["NamedNode"] | D["BlankNode"] | D["Literal"] | D["Variable"];
export declare type Graph<D extends DataModel = DataModel> = D["NamedNode"] | D["BlankNode"] | D["DefaultGraph"] | D["Variable"];
export {};

import { Quad, NamedNode, BlankNode } from "./DataFactory.js";
export declare function parseString(input: string, options?: {
    namedNodeMap?: Map<string, NamedNode>;
    blankNodeMap?: Map<string, BlankNode>;
}): Generator<Quad, void, undefined>;

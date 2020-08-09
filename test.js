// import Store from "./lib/Store.js"
// import DataFactory from "./lib/DataFactory.js"

// const s = new Store()

// s.addQuad(
// 	DataFactory.quad(
// 		DataFactory.blankNode("b6"),
// 		DataFactory.namedNode("http://schema.org/name"),
// 		DataFactory.literal("FFFFF")
// 	)
// )

// s.addQuad(
// 	DataFactory.quad(
// 		DataFactory.blankNode("b5"),
// 		DataFactory.namedNode("http://schema.org/name"),
// 		DataFactory.literal("JKFLJDKSLJ")
// 	)
// )

// console.log(s.getObjects(null, "<http://schema.org/name>", null))

import Parse from "./lib/Parse.js"

const input = `<http://example/s> <http://example/p> <http://example/o> <http://example/g> .
`

for (const quad of Parse(input)) {
	console.log(quad.toJSON())
}

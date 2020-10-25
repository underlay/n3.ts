const xsdDecimal = "http://www.w3.org/2001/XMLSchema#decimal"
const xsdBoolean = "http://www.w3.org/2001/XMLSchema#boolean"
const xsdDouble = "http://www.w3.org/2001/XMLSchema#double"
const xsdInteger = "http://www.w3.org/2001/XMLSchema#integer"
const xsdString = "http://www.w3.org/2001/XMLSchema#string"
const xsdDate = "http://www.w3.org/2001/XMLSchema#date"
const xsdDateTime = "http://www.w3.org/2001/XMLSchema#dateTime"
const xsdHexBinary = "http://www.w3.org/2001/XMLSchema#hexBinary"
const xsdBase64Binary = "http://www.w3.org/2001/XMLSchema#base64Binary"

const rdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
const rdfNil = "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"
const rdfFirst = "http://www.w3.org/1999/02/22-rdf-syntax-ns#first"
const rdfRest = "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest"
const rdfLangString = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
const rdfJSON = "http://www.w3.org/1999/02/22-rdf-syntax-ns#JSON"

export const xsd = {
	decimal: xsdDecimal as typeof xsdDecimal,
	boolean: xsdBoolean as typeof xsdBoolean,
	double: xsdDouble as typeof xsdDouble,
	integer: xsdInteger as typeof xsdInteger,
	string: xsdString as typeof xsdString,
	date: xsdDate as typeof xsdDate,
	dateTime: xsdDateTime as typeof xsdDateTime,
	hexBinary: xsdHexBinary as typeof xsdHexBinary,
	base64Binary: xsdBase64Binary as typeof xsdBase64Binary,
}

export const rdf = {
	type: rdfType as typeof rdfType,
	nil: rdfNil as typeof rdfNil,
	first: rdfFirst as typeof rdfFirst,
	rest: rdfRest as typeof rdfRest,
	langString: rdfLangString as typeof rdfLangString,
	JSON: rdfJSON as typeof rdfJSON,
}

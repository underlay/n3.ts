const xsdDecimal = "http://www.w3.org/2001/XMLSchema#decimal";
const xsdBoolean = "http://www.w3.org/2001/XMLSchema#boolean";
const xsdDouble = "http://www.w3.org/2001/XMLSchema#double";
const xsdInteger = "http://www.w3.org/2001/XMLSchema#integer";
const xsdString = "http://www.w3.org/2001/XMLSchema#string";
const xsdDate = "http://www.w3.org/2001/XMLSchema#date";
const xsdDateTime = "http://www.w3.org/2001/XMLSchema#dateTime";
const xsdHexBinary = "http://www.w3.org/2001/XMLSchema#hexBinary";
const xsdBase64Binary = "http://www.w3.org/2001/XMLSchema#base64Binary";
const rdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const rdfNil = "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil";
const rdfFirst = "http://www.w3.org/1999/02/22-rdf-syntax-ns#first";
const rdfRest = "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest";
const rdfLangString = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
const rdfJSON = "http://www.w3.org/1999/02/22-rdf-syntax-ns#JSON";
export const xsd = {
    decimal: xsdDecimal,
    boolean: xsdBoolean,
    double: xsdDouble,
    integer: xsdInteger,
    string: xsdString,
    date: xsdDate,
    dateTime: xsdDateTime,
    hexBinary: xsdHexBinary,
    base64Binary: xsdBase64Binary,
};
export const rdf = {
    type: rdfType,
    nil: rdfNil,
    first: rdfFirst,
    rest: rdfRest,
    langString: rdfLangString,
    JSON: rdfJSON,
};
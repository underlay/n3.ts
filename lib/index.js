"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  DataModel: true,
  Term: true,
  Subject: true,
  Predicate: true,
  Object: true,
  Graph: true,
  NamedNodeT: true,
  BlankNodeT: true,
  LiteralT: true,
  DefaultGraphT: true,
  VariableT: true,
  QuadT: true,
  DataFactory: true,
  toId: true,
  fromId: true,
  Default: true,
  NamedNode: true,
  BlankNode: true,
  Literal: true,
  DefaultGraph: true,
  Variable: true,
  Quad: true,
  D: true,
  Store: true,
  Parse: true
};
Object.defineProperty(exports, "DataModel", {
  enumerable: true,
  get: function () {
    return _DataModel.DataModel;
  }
});
Object.defineProperty(exports, "Term", {
  enumerable: true,
  get: function () {
    return _DataModel.Term;
  }
});
Object.defineProperty(exports, "Subject", {
  enumerable: true,
  get: function () {
    return _DataModel.Subject;
  }
});
Object.defineProperty(exports, "Predicate", {
  enumerable: true,
  get: function () {
    return _DataModel.Predicate;
  }
});
Object.defineProperty(exports, "Object", {
  enumerable: true,
  get: function () {
    return _DataModel.Object;
  }
});
Object.defineProperty(exports, "Graph", {
  enumerable: true,
  get: function () {
    return _DataModel.Graph;
  }
});
Object.defineProperty(exports, "NamedNodeT", {
  enumerable: true,
  get: function () {
    return _DataModel.NamedNodeT;
  }
});
Object.defineProperty(exports, "BlankNodeT", {
  enumerable: true,
  get: function () {
    return _DataModel.BlankNodeT;
  }
});
Object.defineProperty(exports, "LiteralT", {
  enumerable: true,
  get: function () {
    return _DataModel.LiteralT;
  }
});
Object.defineProperty(exports, "DefaultGraphT", {
  enumerable: true,
  get: function () {
    return _DataModel.DefaultGraphT;
  }
});
Object.defineProperty(exports, "VariableT", {
  enumerable: true,
  get: function () {
    return _DataModel.VariableT;
  }
});
Object.defineProperty(exports, "QuadT", {
  enumerable: true,
  get: function () {
    return _DataModel.QuadT;
  }
});
Object.defineProperty(exports, "DataFactory", {
  enumerable: true,
  get: function () {
    return _DataFactory.default;
  }
});
Object.defineProperty(exports, "toId", {
  enumerable: true,
  get: function () {
    return _DataFactory.toId;
  }
});
Object.defineProperty(exports, "fromId", {
  enumerable: true,
  get: function () {
    return _DataFactory.fromId;
  }
});
Object.defineProperty(exports, "Default", {
  enumerable: true,
  get: function () {
    return _DataFactory.Default;
  }
});
Object.defineProperty(exports, "NamedNode", {
  enumerable: true,
  get: function () {
    return _DataFactory.NamedNode;
  }
});
Object.defineProperty(exports, "BlankNode", {
  enumerable: true,
  get: function () {
    return _DataFactory.BlankNode;
  }
});
Object.defineProperty(exports, "Literal", {
  enumerable: true,
  get: function () {
    return _DataFactory.Literal;
  }
});
Object.defineProperty(exports, "DefaultGraph", {
  enumerable: true,
  get: function () {
    return _DataFactory.DefaultGraph;
  }
});
Object.defineProperty(exports, "Variable", {
  enumerable: true,
  get: function () {
    return _DataFactory.Variable;
  }
});
Object.defineProperty(exports, "Quad", {
  enumerable: true,
  get: function () {
    return _DataFactory.Quad;
  }
});
Object.defineProperty(exports, "D", {
  enumerable: true,
  get: function () {
    return _DataFactory.D;
  }
});
Object.defineProperty(exports, "Store", {
  enumerable: true,
  get: function () {
    return _Store.default;
  }
});
Object.defineProperty(exports, "Parse", {
  enumerable: true,
  get: function () {
    return _Parse.default;
  }
});

var _index = require("./namespaces/index.js");

Object.keys(_index).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _index[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index[key];
    }
  });
});

var _DataModel = require("./DataModel.js");

var _DataFactory = _interopRequireWildcard(require("./DataFactory.js"));

var _Store = _interopRequireDefault(require("./Store.js"));

var _Parse = _interopRequireDefault(require("./Parse.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
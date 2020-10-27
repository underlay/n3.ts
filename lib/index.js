"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
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
  Store: true,
  Parse: true
};
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

var _IRIs = require("./IRIs.js");

Object.keys(_IRIs).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _IRIs[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _IRIs[key];
    }
  });
});

var _DataFactory = _interopRequireWildcard(require("./DataFactory.js"));

var _Store = _interopRequireDefault(require("./Store.js"));

var _Parse = _interopRequireDefault(require("./Parse.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
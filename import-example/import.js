const { _callFunction, _checkType, _createFunction, log } = require("./runtime");
const valueImport = require("./somefile");
exports.valueImport = valueImport;
_callFunction(log, [
valueImport.someKey,
])
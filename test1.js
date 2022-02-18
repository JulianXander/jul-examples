const { _branch, _callFunction, _checkType, _createFunction, _checkDictionaryType, BuiltInTypeBase, Any, BooleanType, StringType, Float64, DictionaryLiteralType, TupleType, StreamType, FunctionType, ArgumentReference, TypeType, UnionType, TypeOfType, _any, _boolean, _float64, _string, _error, _type, subtract, sum, complete, subscribe, timer$, log, runJs } = require("./runtime");
let _var;
let var2;
{
const _temp = [
4,
5,
];
const _isArray = Array.isArray(_temp);
_var = _isArray ? _temp[0] : _temp._var;
var2 = _isArray ? _temp[1] : _temp.var2;
}
module.exports = _callFunction(log, [
_var,
var2,
])
const { _branch, _callFunction, _checkType, _createFunction, _checkDictionaryType, deepEquals, BuiltInTypeBase, AnyType, BooleanType, IntegerType, FloatType, StringType, DictionaryLiteralType, TupleType, StreamType, FunctionType, ParameterReference, TypeType, IntersectionType, UnionType, ComplementType, TypeOfType, Any, _Boolean, Float, Integer, NonZeroInteger, _String, _Error, Type, equal, modulo, subtract, subtractFloat, sum, sumFloat, complete, subscribe, httpTextRequest$, timer$, log, repeat, runJs } = require("./runtime");
module.exports = _callFunction(subscribe, [
_callFunction(httpTextRequest$, [
`https://api.ipify.org/?format=json`,
`get`,
]),
log,
])
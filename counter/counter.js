const { _branch, _callFunction, _checkType, _createFunction, _checkDictionaryType, deepEquals, BuiltInTypeBase, AnyType, BooleanType, IntegerType, FloatType, StringType, TupleType, DictionaryLiteralType, StreamType, FunctionType, ParameterReference, TypeType, IntersectionType, UnionType, ComplementType, TypeOfType, Any, _Boolean, Float, Integer, NonZeroInteger, _String, _Error, Type, equal, modulo, subtract, subtractFloat, sum, sumFloat, parseJson, forEach, complete, subscribe, httpTextRequest$, timer$, log, repeat, runJs } = require("./runtime");
const counter$ = _callFunction(timer$, [
1000,
]);
exports.counter$ = counter$;
_callFunction(subscribe, [
counter$,
_createFunction((x) => {_callFunction(log, [
x,
])
_callFunction(runJs, [
`document.body.innerText = ${x}`,
])
return _branch(
x,
_createFunction(() => {return _callFunction(complete, [
counter$,
])}, {type:10}),
_createFunction(() => {return null}, {
}),
)}, {
singleNames: [
{
name: "x"}
],
}),
])
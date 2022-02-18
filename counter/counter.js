const { _branch, _callFunction, _checkType, _createFunction, _checkDictionaryType, BuiltInTypeBase, Any, BooleanType, StringType, Float64, DictionaryLiteralType, TupleType, StreamType, FunctionType, ArgumentReference, TypeType, UnionType, TypeOfType, _any, _boolean, _float64, _string, _error, _type, subtract, sum, complete, subscribe, timer$, log, runJs } = require("./runtime");
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
])}, {type:(_x) => _x === 10}),
_createFunction(() => {return null}, {
}),
)}, {
singleNames: [
{
name: "x"}
],
}),
])
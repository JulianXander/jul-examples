const { _branch, _callFunction, _checkType, _createFunction, _checkDictionaryType, deepEquals, BuiltInTypeBase, AnyType, BooleanType, IntegerType, FloatType, StringType, DictionaryLiteralType, TupleType, StreamType, FunctionType, ParameterReference, TypeType, IntersectionType, UnionType, ComplementType, TypeOfType, Any, _Boolean, Float, Integer, NonZeroInteger, _String, _Error, Type, equal, modulo, subtract, subtractFloat, sum, sumFloat, complete, subscribe, httpTextRequest$, timer$, log, repeat, runJs } = require("./runtime");
const fibonacciHelper = _createFunction((countdown, current, previous) => {return _branch(
countdown,
_createFunction(() => {return previous}, {type:0n}),
_createFunction(() => {return _callFunction(fibonacciHelper, [
_callFunction(subtract, [
countdown,
1n,
]),
_callFunction(sum, [
current,
previous,
]),
current,
])}, {
}),
)}, {
singleNames: [
{
name: "countdown",
type: Integer},
{
name: "current",
type: Integer},
{
name: "previous",
type: Integer}
],
});
exports.fibonacciHelper = fibonacciHelper;
const fibonacci = _createFunction((x) => {return _callFunction(fibonacciHelper, [
x,
1n,
0n,
])}, {
singleNames: [
{
name: "x",
type: Integer}
],
});
exports.fibonacci = fibonacci;
const test = _callFunction(fibonacci, [
12n,
]);
exports.test = test;
_callFunction(log, [
test,
])
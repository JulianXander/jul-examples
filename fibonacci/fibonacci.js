const { _branch, _callFunction, _checkType, _createFunction, subtract, sum, complete, subscribe, timer$, log, runJs } = require("./runtime");
const fibonacciHelper = _createFunction((countdown, current, previous) => {return _branch(
countdown,
_createFunction((x) => {return previous}, {
singleNames: [
{
name: "x",
type: (_x) => _x === 0}
],
}),
_createFunction(() => {return _callFunction(fibonacciHelper, [
_callFunction(subtract, [
countdown,
1,
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
name: "countdown"},
{
name: "current"},
{
name: "previous"}
],
});
exports.fibonacciHelper = fibonacciHelper;
const fibonacci = _createFunction((x) => {return _callFunction(fibonacciHelper, [
x,
1,
0,
])}, {
singleNames: [
{
name: "x"}
],
});
exports.fibonacci = fibonacci;
const test = _callFunction(fibonacci, [
12,
]);
exports.test = test;
_callFunction(log, [
test,
])
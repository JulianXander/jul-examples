import { _branch, _callFunction, _checkType, _createFunction } from "./runtime"
const source$ = _callFunction(timer$, [
2000,
]);
_callFunction(source$.subscribe, [
_createFunction((x) => {_callFunction(console.log, [
'source$',
x,
])}, {x}),
])
const mapped1$ = _callFunction(map$, [
source$,
_createFunction((count) => {_callFunction(count.modulo, [
2,
])}, {count}),
]);
_callFunction(mapped1$.subscribe, [
_createFunction((x) => {_callFunction(console.log, [
'mapped1$',
x,
])}, {x}),
])
const mapped2$ = _callFunction(map$, [
source$,
_createFunction((count) => {_callFunction(count.modulo, [
5,
])}, {count}),
]);
_callFunction(mapped2$.subscribe, [
_createFunction((x) => {_callFunction(console.log, [
'mapped2$',
x,
])}, {x}),
])
const combined$ = _callFunction(combine$, [
source$,
mapped1$,
mapped2$,
]);
_callFunction(combined$.subscribe, [
_createFunction((x) => {_callFunction(console.log, [
'combined',
x,
])}, {x}),
])
_callFunction(combined$.onCompleted, [
_createFunction(() => {_callFunction(console.log, [
'combined complete',
])}, {}),
])
_callFunction(source$.complete, null)
_callFunction(mapped2$.complete, null)
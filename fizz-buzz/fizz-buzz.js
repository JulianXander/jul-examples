const { _branch, _callFunction, _checkType, _createFunction, _checkDictionaryType, deepEquals, BuiltInTypeBase, AnyType, BooleanType, IntegerType, FloatType, StringType, DictionaryLiteralType, TupleType, StreamType, FunctionType, ParameterReference, TypeType, IntersectionType, UnionType, ComplementType, TypeOfType, Any, _Boolean, Float, Integer, NonZeroInteger, _String, _Error, Type, equal, modulo, subtract, sum, complete, subscribe, timer$, log, repeat, runJs } = require("./runtime");
const divisibleBy = _createFunction((divisor) => {
	return _createFunction((dividend) => {
		return _callFunction(equal, [
			_callFunction(modulo, [
				dividend,
				divisor,
			]),
			0n,
		])
	}, {
		singleNames: [
			{
				name: "dividend",
				type: Integer
			}
		],
	})
}, {
	singleNames: [
		{
			name: "divisor",
			type: NonZeroInteger
		}
	],
});
exports.divisibleBy = divisibleBy;
_callFunction(repeat, [
	100n,
	_createFunction((index) => {
		const message = _branch(
			index,
			_createFunction(() => { return `FizzBuzz` }, {
				type: _callFunction(divisibleBy, [
					15n,
				])
			}),
			_createFunction(() => { return `Buzz` }, {
				type: _callFunction(divisibleBy, [
					5n,
				])
			}),
			_createFunction(() => { return `Fizz` }, {
				type: _callFunction(divisibleBy, [
					3n,
				])
			}),
			_createFunction(() => { return index }, {
			}),
		);
		return _callFunction(log, [
			message,
		])
	}, {
		singleNames: [
			{
				name: "index"
			}
		],
	}),
])
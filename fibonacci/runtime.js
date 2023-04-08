"use strict";
// Enthält Laufzeit helper sowie core-lib builtins
Object.defineProperty(exports, "__esModule", { value: true });
exports.runJs = exports.repeat = exports.log = exports.timer$ = exports.httpTextRequest$ = exports.subscribe = exports.complete = exports.forEach = exports.parseJson = exports.sumFloat = exports.sum = exports.subtractFloat = exports.subtract = exports.modulo = exports.equal = exports.Type = exports._Error = exports._String = exports.NonZeroInteger = exports.Integer = exports.Float = exports._Boolean = exports.Any = exports.TypeOfType = exports.ComplementType = exports.UnionType = exports.IntersectionType = exports.TypeType = exports.ParameterReference = exports.FunctionType = exports.StreamType = exports.DictionaryLiteralType = exports.TupleType = exports.StringType = exports.FloatType = exports.IntegerType = exports.BooleanType = exports.AnyType = exports.BuiltInTypeBase = exports.deepEquals = exports._checkDictionaryType = exports._createFunction = exports._checkType = exports._callFunction = exports._branch = void 0;
//#region helper
let processId = 1;
//#region internals
function _branch(value, ...branches) {
    // TODO collect inner Errors?
    for (const branch of branches) {
        const assignedParams = tryAssignParams(branch.params, value);
        if (!(assignedParams instanceof Error)) {
            return branch(assignedParams);
        }
    }
    return new Error(`${value} did not match any branch`);
}
exports._branch = _branch;
function _callFunction(fn, args) {
    if ('params' in fn) {
        // jul function
        const assignedParams = tryAssignParams(fn.params, args);
        if (assignedParams instanceof Error) {
            return assignedParams;
        }
        return fn(...assignedParams);
    }
    // js function
    return Array.isArray(args)
        ? fn(...args)
        : fn(args);
}
exports._callFunction = _callFunction;
function _checkType(type, value) {
    return isOfType(value, type)
        ? value
        : new Error(`${value} is not of type ${type}`);
}
exports._checkType = _checkType;
function _createFunction(fn, params) {
    const julFn = fn;
    julFn.params = params;
    return julFn;
}
exports._createFunction = _createFunction;
function _checkDictionaryType(dictionaryType, value) {
    const assignedParams = tryAssignParams(dictionaryType, value);
    return assignedParams instanceof Error;
}
exports._checkDictionaryType = _checkDictionaryType;
//#endregion internals
function isOfType(value, type) {
    switch (typeof type) {
        case 'bigint':
        case 'boolean':
        case 'number':
        case 'string':
            return value === type;
        case 'object': {
            if (type instanceof BuiltInTypeBase) {
                const builtInType = type;
                switch (builtInType.type) {
                    case 'any':
                        return true;
                    case 'boolean':
                        return typeof value === 'boolean';
                    case 'integer':
                        return typeof value === 'bigint';
                    case 'float':
                        return typeof value === 'number';
                    case 'string':
                        return typeof value === 'string';
                    case 'error':
                        return value instanceof Error;
                    case 'dictionary': {
                        if (!isDictionary(value)) {
                            return false;
                        }
                        const elementType = builtInType.elementType;
                        for (const key in value) {
                            const elementValue = value[key];
                            if (!isOfType(elementValue, elementType)) {
                                return false;
                            }
                        }
                        return true;
                    }
                    case 'dictionaryLiteral': {
                        if (!isDictionary(value)) {
                            return false;
                        }
                        const fieldTypes = builtInType.fields;
                        for (const key in fieldTypes) {
                            const elementValue = value[key];
                            const elementType = fieldTypes[key];
                            if (!isOfType(elementValue, elementType)) {
                                return false;
                            }
                        }
                        return true;
                    }
                    case 'list':
                        return Array.isArray(value)
                            && value.every(element => isOfType(element, builtInType.elementType));
                    case 'tuple':
                        return Array.isArray(value)
                            && value.length <= builtInType.elementTypes.length
                            && builtInType.elementTypes.every((elementType, index) => isOfType(value[index], elementType));
                    case 'stream':
                        // TODO check value type
                        return value instanceof Stream;
                    case 'function':
                        // TODO check returntype/paramstype
                        return typeof value === 'function';
                    case 'reference':
                        // TODO deref?
                        return true;
                    case 'type':
                        // TODO check primitive value (null/boolean/number/string)/builtintype/function
                        // return value === null
                        // || typeof value === 'boolean'
                        // || typeof value === 'number'
                        // || typeof value === 'string'
                        // || value instanceof BuiltInTypeBase
                        // || typeof value === ;
                        return true;
                    case 'and':
                        return builtInType.choiceTypes.every(coiceType => isOfType(value, coiceType));
                    case 'or':
                        return builtInType.choiceTypes.some(coiceType => isOfType(value, coiceType));
                    case 'not':
                        return !isOfType(value, builtInType.sourceType);
                    case 'typeOf':
                        return deepEquals(value, builtInType.value);
                    default: {
                        const assertNever = builtInType;
                        throw new Error(`Unexpected BuiltInType ${assertNever.type}`);
                    }
                }
            }
            // null/Dictionary/Array
            return deepEquals(value, type);
        }
        case 'function':
            return type(value);
        default: {
            const assertNever = type;
            throw new Error(`Unexpected type ${typeof assertNever}`);
        }
    }
}
// TODO check empty prototype?
function isDictionary(value) {
    return typeof value === 'object'
        && !(value instanceof BuiltInTypeBase)
        && !(value instanceof Error)
        && !Array.isArray(value);
}
function tryAssignParams(params, values) {
    const assigneds = [];
    const { type: outerType, singleNames, rest } = params;
    if (outerType !== undefined) {
        const isValid = isOfType(values, outerType);
        if (!isValid) {
            return new Error(`Can not assign the value ${values} to params because it is not of type ${outerType}`);
        }
        return assigneds;
    }
    // primitive value in Array wrappen
    const wrappedValue = typeof values === 'object'
        ? values
        : [values];
    const isArray = Array.isArray(wrappedValue);
    let index = 0;
    if (singleNames) {
        for (; index < singleNames.length; index++) {
            const param = singleNames[index];
            const { name, type } = param;
            const value = isArray
                ? wrappedValue[index]
                : wrappedValue[name];
            const isValid = type
                ? isOfType(value, type)
                : true;
            if (!isValid) {
                return new Error(`Can not assign the value ${value} to param ${name} because it is not of type ${type}`);
            }
            assigneds.push(value);
        }
    }
    if (rest) {
        const restType = rest.type;
        if (isArray) {
            for (; index < wrappedValue.length; index++) {
                const value = wrappedValue[index];
                const isValid = restType
                    ? isOfType(value, restType)
                    : true;
                if (!isValid) {
                    return new Error(`Can not assign the value ${value} to rest param because it is not of type ${rest}`);
                }
                assigneds.push(value);
            }
        }
        else {
            // TODO rest dictionary??
            throw new Error('tryAssignParams not implemented yet for rest dictionary');
        }
    }
    return assigneds;
}
// TODO toString
function deepEquals(value1, value2) {
    const type1 = typeof value1;
    if (type1 !== typeof value2) {
        return false;
    }
    switch (type1) {
        case 'bigint':
        case 'boolean':
        case 'function':
        case 'number':
        case 'string':
        case 'symbol':
        case 'undefined':
            return value1 === value2;
        case 'object':
            if (value1 === null || value2 === null) {
                return value1 === value2;
            }
            else if (value1 instanceof Stream || value2 instanceof Stream) {
                return value1 === value2;
            }
            else if (Array.isArray(value1) || Array.isArray(value2)) {
                if (!Array.isArray(value1)
                    || !Array.isArray(value2)
                    || value1.length !== value2.length) {
                    return false;
                }
                for (let index = 0; index < value1.length; index++) {
                    if (value1[index] !== value2[index]) {
                        return false;
                    }
                }
                return true;
            }
            else {
                // Dictionary/Function Object
                const typedValue1 = value1;
                for (const key in typedValue1) {
                    if (typedValue1[key] !== value2[key]) {
                        return false;
                    }
                }
                return true;
            }
        default: {
            const assertNever = type1;
            throw new Error('Unexpected type for deepEquals: ' + assertNever);
        }
    }
}
exports.deepEquals = deepEquals;
class BuiltInTypeBase {
}
exports.BuiltInTypeBase = BuiltInTypeBase;
class AnyType extends BuiltInTypeBase {
    type = 'any';
}
exports.AnyType = AnyType;
class BooleanType extends BuiltInTypeBase {
    type = 'boolean';
}
exports.BooleanType = BooleanType;
class IntegerType extends BuiltInTypeBase {
    type = 'integer';
}
exports.IntegerType = IntegerType;
class FloatType extends BuiltInTypeBase {
    type = 'float';
}
exports.FloatType = FloatType;
class StringType extends BuiltInTypeBase {
    type = 'string';
}
exports.StringType = StringType;
class ErrorType extends BuiltInTypeBase {
    type = 'error';
}
class ListType extends BuiltInTypeBase {
    elementType;
    constructor(elementType) {
        super();
        this.elementType = elementType;
    }
    type = 'list';
}
class TupleType extends BuiltInTypeBase {
    elementTypes;
    constructor(elementTypes) {
        super();
        this.elementTypes = elementTypes;
    }
    type = 'tuple';
}
exports.TupleType = TupleType;
class DictionaryType extends BuiltInTypeBase {
    elementType;
    constructor(elementType) {
        super();
        this.elementType = elementType;
    }
    type = 'dictionary';
}
class DictionaryLiteralType extends BuiltInTypeBase {
    fields;
    constructor(fields) {
        super();
        this.fields = fields;
    }
    type = 'dictionaryLiteral';
}
exports.DictionaryLiteralType = DictionaryLiteralType;
class StreamType extends BuiltInTypeBase {
    valueType;
    constructor(valueType) {
        super();
        this.valueType = valueType;
    }
    type = 'stream';
}
exports.StreamType = StreamType;
class FunctionType extends BuiltInTypeBase {
    paramsType;
    returnType;
    constructor(paramsType, returnType) {
        super();
        this.paramsType = paramsType;
        this.returnType = returnType;
        // TODO set functionRef bei params
        if (returnType instanceof ParameterReference) {
            returnType.functionRef = this;
        }
    }
    type = 'function';
}
exports.FunctionType = FunctionType;
// TODO Parameter Type ???
class ParameterReference extends BuiltInTypeBase {
    path;
    index;
    constructor(path, index) {
        super();
        this.path = path;
        this.index = index;
    }
    type = 'reference';
    /**
     * Wird im constructor von FunctionType gesetzt und sollte immer vorhanden sein.
     */
    functionRef;
}
exports.ParameterReference = ParameterReference;
class TypeType extends BuiltInTypeBase {
    type = 'type';
}
exports.TypeType = TypeType;
class IntersectionType extends BuiltInTypeBase {
    choiceTypes;
    constructor(choiceTypes) {
        super();
        this.choiceTypes = choiceTypes;
    }
    type = 'and';
}
exports.IntersectionType = IntersectionType;
class UnionType extends BuiltInTypeBase {
    choiceTypes;
    constructor(choiceTypes) {
        super();
        this.choiceTypes = choiceTypes;
    }
    type = 'or';
}
exports.UnionType = UnionType;
class ComplementType extends BuiltInTypeBase {
    sourceType;
    constructor(sourceType) {
        super();
        this.sourceType = sourceType;
    }
    type = 'not';
}
exports.ComplementType = ComplementType;
class TypeOfType extends BuiltInTypeBase {
    value;
    constructor(value) {
        super();
        this.value = value;
    }
    type = 'typeOf';
}
exports.TypeOfType = TypeOfType;
class Stream {
    constructor(getValue) {
        this.getValue = getValue;
    }
    lastValue;
    lastProcessId;
    completed = false;
    listeners = [];
    onCompletedListeners = [];
    push(value, processId) {
        if (processId === this.lastProcessId) {
            return;
        }
        if (deepEquals(value, this.lastValue)) {
            return;
        }
        if (this.completed) {
            throw new Error('Can not push to completed stream.');
        }
        this.lastValue = value;
        this.lastProcessId = processId;
        this.listeners.forEach(listener => listener(value));
    }
    /**
     * Aktualisiert diesen Stream und alle Dependencies und benachrichtigt Subscriber.
     */
    getValue;
    /**
     * Gibt einen unsubscribe callback zurück.
     * Wertet sofort den listener beim subscriben sofort aus, wenn evaluateOnSubscribe = true.
     */
    subscribe(listener, evaluateOnSubscribe = true) {
        if (evaluateOnSubscribe) {
            listener(this.getValue());
        }
        if (this.completed) {
            return () => { };
        }
        this.listeners.push(listener);
        return () => {
            if (this.completed) {
                return;
            }
            const index = this.listeners.indexOf(listener);
            if (index === -1) {
                throw new Error('Can not unsubscribe listener, because listener was not subscribed.');
            }
            this.listeners.splice(index, 1);
        };
    }
    complete() {
        if (this.completed) {
            return;
        }
        this.completed = true;
        // dispose listeners
        this.listeners = [];
        this.onCompletedListeners.forEach(onCompletedListener => {
            onCompletedListener();
        });
        this.onCompletedListeners = [];
    }
    /**
     * Wenn der Stream schon completed ist wird der callback sofort aufgerufen.
     */
    onCompleted(callback) {
        if (this.completed) {
            callback();
        }
        else {
            this.onCompletedListeners.push(callback);
        }
    }
}
//#region create
function createSource$(initialValue) {
    const stream$ = new Stream(() => stream$.lastValue);
    stream$.push(initialValue, processId);
    return stream$;
}
function of$(value) {
    const $ = createSource$(value);
    $.complete();
    return $;
}
//#endregion create
//#region transform
function createDerived$(getValue) {
    const derived$ = new Stream(() => {
        if (processId === derived$.lastProcessId
            || derived$.completed) {
            return derived$.lastValue;
        }
        return getValue();
    });
    return derived$;
}
function map$(source$, mapFunction) {
    let lastSourceValue;
    const mapped$ = createDerived$(() => {
        const currentSourceValue = source$.getValue();
        if (deepEquals(currentSourceValue, lastSourceValue)) {
            mapped$.lastProcessId = processId;
            return mapped$.lastValue;
        }
        const currentMappedValue = mapFunction(currentSourceValue);
        lastSourceValue = currentSourceValue;
        mapped$.push(currentMappedValue, processId);
        return currentMappedValue;
    });
    mapped$.onCompleted(() => {
        unsubscribe();
    });
    const unsubscribe = source$.subscribe(sourceValue => {
        mapped$.getValue();
    });
    source$.onCompleted(() => {
        mapped$.complete();
    });
    return mapped$;
}
function combine$(...source$s) {
    const combined$ = createDerived$(() => {
        const lastValues = combined$.lastValue;
        const currentValues = source$s.map(source$ => source$.getValue());
        if (deepEquals(currentValues, lastValues)) {
            combined$.lastProcessId = processId;
            return lastValues;
        }
        combined$.push(currentValues, processId);
        return currentValues;
    });
    combined$.onCompleted(() => {
        unsubscribes.forEach((unsubscribe, index) => {
            unsubscribe();
        });
    });
    const unsubscribes = source$s.map((source$, index) => {
        source$.onCompleted(() => {
            // combined ist complete, wenn alle Sources complete sind.
            if (!source$s.some(source$ => !source$.completed)) {
                combined$.complete();
            }
        });
        return source$.subscribe(value => {
            combined$.getValue();
        });
    });
    return combined$;
}
function takeUntil$(source$, completed$) {
    const mapped$ = map$(source$, x => x);
    const unsubscribeCompleted = completed$.subscribe(() => {
        mapped$.complete();
    }, false);
    completed$.onCompleted(() => {
        mapped$.complete();
    });
    mapped$.onCompleted(() => {
        unsubscribeCompleted();
    });
    return mapped$;
}
function flatMerge$(source$$) {
    const inner$s = [];
    const unsubscribeInners = [];
    const flat$ = createDerived$(() => {
        const lastValue = flat$.lastValue;
        const currentValue = source$$.getValue().getValue();
        if (deepEquals(currentValue, lastValue)) {
            flat$.lastProcessId = processId;
            return lastValue;
        }
        flat$.push(currentValue, processId);
        return currentValue;
    });
    const unsubscribeOuter = source$$.subscribe(source$ => {
        inner$s.push(source$);
        const unsubscribeInner = source$.subscribe(value => {
            flat$.getValue();
        });
        unsubscribeInners.push(unsubscribeInner);
    });
    flat$.onCompleted(() => {
        unsubscribeOuter();
        unsubscribeInners.forEach(unsubscribeInner => {
            unsubscribeInner();
        });
    });
    // flat ist complete, wenn outerSource und alle innerSources complete sind
    source$$.onCompleted(() => {
        inner$s.forEach(inner$ => {
            inner$.onCompleted(() => {
                if (!inner$s.some(source$ => !source$.completed)) {
                    flat$.complete();
                }
            });
        });
    });
    return flat$;
}
function flatSwitch$(source$$) {
    let unsubscribeInner;
    const flat$ = createDerived$(() => {
        const lastValue = flat$.lastValue;
        const currentValue = source$$.getValue().getValue();
        if (deepEquals(currentValue, lastValue)) {
            flat$.lastProcessId = processId;
            return lastValue;
        }
        flat$.push(currentValue, processId);
        return currentValue;
    });
    const unsubscribeOuter = source$$.subscribe(source$ => {
        unsubscribeInner = takeUntil$(source$, source$$).subscribe(value => {
            flat$.getValue();
        });
    });
    flat$.onCompleted(() => {
        unsubscribeOuter();
        unsubscribeInner?.();
    });
    // flat ist complete, wenn outerSource und die aktuelle innerSource complete sind
    source$$.onCompleted(() => {
        source$$.getValue().onCompleted(() => {
            flat$.complete();
        });
    });
    return flat$;
}
// TODO
// function flatMap
// TODO testen
function accumulate$(source$, initialAccumulator, accumulate) {
    const mapped$ = map$(source$, value => {
        const newAccumulator = accumulate(mapped$.lastValue === undefined
            ? initialAccumulator
            : mapped$.lastValue, value);
        return newAccumulator;
    });
    return mapped$;
}
function retry$(method$, maxAttepmts, currentAttempt = 1) {
    if (currentAttempt === maxAttepmts) {
        return method$();
    }
    const withRetry$$ = map$(method$(), result => {
        if (result instanceof Error) {
            console.log('Error! Retrying... Attempt:', currentAttempt, 'process:', processId);
            return retry$(method$, maxAttepmts, currentAttempt + 1);
        }
        return of$(result);
    });
    return flatSwitch$(withRetry$$);
}
;
function parseJsonValue(json, startIndex) {
    let index = parseJsonWhiteSpace(json, startIndex);
    const character = json[index];
    switch (character) {
        case 'n':
            return parseJsonToken(json, index, 'null', null);
        case 't':
            return parseJsonToken(json, index, 'true', true);
        case 'f':
            return parseJsonToken(json, index, 'false', false);
        case '-':
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9': {
            const isNegative = character === '-';
            const numberRegex = /(?<integer>0|[1-9][0-9]*)(\.(?<fraction>[0-9]+))?([eE](?<exponent>[-+]?[0-9]+))?/y;
            numberRegex.lastIndex = isNegative
                ? index + 1
                : index;
            const match = numberRegex.exec(json);
            if (!match) {
                return new Error(`Invalid JSON. Failed to parse number at position ${index}`);
            }
            const integerString = (isNegative ? '-' : '') + match.groups.integer;
            const fractionString = match.groups.fraction;
            const numerator = BigInt(integerString + (fractionString ?? ''));
            const exponentString = match.groups.exponent;
            const fractionExponent = fractionString
                ? BigInt('-' + fractionString.length)
                : 0n;
            const exponent = exponentString
                ? BigInt(exponentString)
                : 0n;
            const combinedExponent = fractionExponent + exponent;
            const numberValue = combinedExponent < 0
                // TODO kürzen?
                ? {
                    numerator: numerator,
                    denominator: 10n ** (-1n * combinedExponent),
                }
                : numerator * 10n ** combinedExponent;
            return {
                parsed: numberValue,
                endIndex: numberRegex.lastIndex,
            };
        }
        case '"':
            return parseJsonString(json, index + 1);
        case '[': {
            index++;
            const array = [];
            index = parseJsonWhiteSpace(json, index);
            if (json[index] === ']') {
                return {
                    parsed: array,
                    endIndex: index + 1,
                };
            }
            let isSeparator = false;
            while (index < json.length) {
                if (isSeparator) {
                    index = parseJsonWhiteSpace(json, index);
                    const arrayCharacter = json[index];
                    switch (arrayCharacter) {
                        case ',':
                            isSeparator = false;
                            index++;
                            break;
                        case ']':
                            return {
                                parsed: array,
                                endIndex: index + 1,
                            };
                        default:
                            return new Error(`Invalid JSON. Unexpected character ${arrayCharacter} at position ${index} while parsing array.`);
                    }
                }
                else {
                    const elementResult = parseJsonValue(json, index);
                    if (elementResult instanceof Error) {
                        return elementResult;
                    }
                    array.push(elementResult.parsed);
                    isSeparator = true;
                    index = elementResult.endIndex;
                }
            }
        }
        case '{': {
            index++;
            const object = {};
            index = parseJsonWhiteSpace(json, index);
            if (json[index] === '}') {
                return {
                    parsed: object,
                    endIndex: index + 1,
                };
            }
            let isSeparator = false;
            while (index < json.length) {
                index = parseJsonWhiteSpace(json, index);
                const objectCharacter = json[index];
                if (isSeparator) {
                    switch (objectCharacter) {
                        case ',':
                            isSeparator = false;
                            index++;
                            break;
                        case '}':
                            return {
                                parsed: object,
                                endIndex: index + 1,
                            };
                        default:
                            return new Error(`Invalid JSON. Unexpected character ${objectCharacter} at position ${index} while parsing object.`);
                    }
                }
                else {
                    if (objectCharacter !== '"') {
                        return new Error(`Invalid JSON. Unexpected character ${objectCharacter} at position ${index} while parsing object key.`);
                    }
                    const keyResult = parseJsonString(json, index);
                    if (keyResult instanceof Error) {
                        return keyResult;
                    }
                    const colonIndex = parseJsonWhiteSpace(json, keyResult.endIndex);
                    const colonCharacter = json[colonIndex];
                    if (colonCharacter !== ':') {
                        return new Error(`Invalid JSON. Unexpected character ${objectCharacter} at position ${index} while parsing colon.`);
                    }
                    const valueResult = parseJsonValue(json, colonIndex + 1);
                    if (valueResult instanceof Error) {
                        return valueResult;
                    }
                    object[keyResult.parsed] = valueResult.parsed;
                    isSeparator = true;
                    index = valueResult.endIndex;
                }
            }
        }
        default:
            return new Error(`Invalid JSON. Unexpected character ${character} at position ${index}`);
    }
}
function parseJsonWhiteSpace(json, startIndex) {
    const whiteSpaceRegex = /[ \n\r\t]*/y;
    whiteSpaceRegex.lastIndex = startIndex;
    whiteSpaceRegex.exec(json);
    return whiteSpaceRegex.lastIndex;
}
function parseJsonToken(json, startIndex, token, value) {
    const endIndex = startIndex + token.length;
    if (json.substring(startIndex, endIndex) !== token) {
        return new Error(`Inavlid JSON. Failed to parse value ${token} at position ${startIndex}`);
    }
    return {
        parsed: value,
        endIndex: endIndex,
    };
}
function parseJsonString(json, startIndex) {
    let stringValue = '';
    for (let index = startIndex; index < json.length; index++) {
        const stringCharacter = json[index];
        switch (stringCharacter) {
            case '"':
                return {
                    parsed: stringValue,
                    endIndex: index + 1,
                };
            case '\\':
                index++;
                if (index === json.length) {
                    return new Error('Invalid JSON. String not terminated.');
                }
                const escapedCharacter = json[index];
                switch (escapedCharacter) {
                    case '"':
                    case '\\':
                    case '/':
                    case 'b':
                    case 'f':
                    case 'n':
                    case 'r':
                    case 't':
                        stringValue += escapedCharacter;
                        break;
                    case 'u':
                        index++;
                        const hexEndIndex = index + 4;
                        if (hexEndIndex >= json.length) {
                            return new Error('Invalid JSON. String not terminated.');
                        }
                        const hexCharacters = json.substring(index, hexEndIndex);
                        if (!/[0-9a-fA-F]{4}/.test(hexCharacters)) {
                            return new Error(`Invalid JSON. Invalid hex code at position ${index}.`);
                        }
                        stringValue += String.fromCharCode(parseInt(hexCharacters, 16));
                        index = hexEndIndex - 1;
                        break;
                    default:
                        return new Error();
                }
                break;
            default:
                stringValue += stringCharacter;
                break;
        }
    }
    return new Error('Invalid JSON. String not terminated.');
}
//#endregion JSON
//#endregion helper
//#region builtins
//#region Types
exports.Any = new AnyType();
exports._Boolean = new BooleanType();
exports.Float = new FloatType();
exports.Integer = new IntegerType();
exports.NonZeroInteger = new UnionType([exports.Integer, new ComplementType(0)]);
exports._String = new StringType();
exports._Error = new ErrorType();
exports.Type = new TypeType();
//#endregion Types
//#region Functions
//#region Any
exports.equal = _createFunction((first, second) => first === second, {
    singleNames: [
        {
            name: 'first',
            // TODO
            // type: { type: 'reference', names: ['Any'] }
        },
        {
            name: 'second',
            // TODO
            // type: { type: 'reference', names: ['Any'] }
        }
    ]
});
//#endregion Any
//#region Number
// TODO moduloFloat
exports.modulo = _createFunction((dividend, divisor) => dividend % divisor, {
    singleNames: [
        {
            name: 'dividend',
            // TODO
            // type: { type: 'reference', names: ['Integer'] }
        },
        {
            name: 'divisor',
            // TODO
            // type: { type: 'reference', names: ['NonZeroInteger'] }
        }
    ]
});
exports.subtract = _createFunction((minuend, subtrahend) => {
    if (typeof minuend === 'bigint') {
        if (typeof subtrahend === 'bigint') {
            return minuend - subtrahend;
        }
        else {
            return {
                numerator: minuend * subtrahend.denominator - subtrahend.numerator,
                denominator: subtrahend.denominator,
            };
        }
    }
    else {
        if (typeof subtrahend === 'bigint') {
            return {
                numerator: minuend.numerator - subtrahend * minuend.denominator,
                denominator: minuend.denominator,
            };
        }
        else {
            // TODO kleinstes gemeinsames Vielfaches, kürzen
            return {
                numerator: minuend.numerator * subtrahend.denominator - subtrahend.numerator * minuend.denominator,
                denominator: minuend.denominator * subtrahend.denominator,
            };
        }
    }
}, {
    singleNames: [
        {
            name: 'minuend',
            // TODO
            // type: { type: 'reference', names: ['Rational'] }
        },
        {
            name: 'subtrahend',
            // TODO
            // type: { type: 'reference', names: ['Rational'] }
        }
    ]
});
exports.subtractFloat = _createFunction((minuend, subtrahend) => minuend - subtrahend, {
    singleNames: [
        {
            name: 'minuend',
            // TODO
            // type: { type: 'reference', names: ['Float'] }
        },
        {
            name: 'subtrahend',
            // TODO
            // type: { type: 'reference', names: ['Float'] }
        }
    ]
});
// TODO sum, sumFloat
exports.sum = _createFunction((...args) => args.reduce((accumulator, current) => {
    if (typeof accumulator === 'bigint') {
        if (typeof current === 'bigint') {
            return accumulator + current;
        }
        else {
            return {
                numerator: accumulator * current.denominator + current.numerator,
                denominator: current.denominator,
            };
        }
    }
    else {
        if (typeof current === 'bigint') {
            return {
                numerator: accumulator.numerator + current * accumulator.denominator,
                denominator: accumulator.denominator,
            };
        }
        else {
            // TODO kleinstes gemeinsames Vielfaches, kürzen
            return {
                numerator: accumulator.numerator * current.denominator + current.numerator * accumulator.denominator,
                denominator: accumulator.denominator * current.denominator,
            };
        }
    }
}, 0n),
    // TODO params type ...Rational[]
    {
        rest: {
            // name: 'args'
        }
    });
exports.sumFloat = _createFunction((...args) => args.reduce((accumulator, current) => accumulator + current, 0),
    // TODO params type ...Float[]
    {
        rest: {
            // name: 'args'
        }
    });
//#endregion Number
//#region String
exports.parseJson = _createFunction((json) => {
    const result = parseJsonValue(json, 0);
    if (result instanceof Error) {
        return result;
    }
    const endIndex = parseJsonWhiteSpace(json, result.endIndex);
    if (endIndex < json.length) {
        return new Error(`Invalid JSON. Unexpected extra charcter ${json[endIndex]} after parsed value at position ${endIndex}`);
    }
    return result.parsed;
}, {
    singleNames: [
        {
            name: 'json',
            // TODO
            // typeGuard: { type: 'reference', names: ['String'] }
        },
    ]
});
//#endregion String
//#region List
exports.forEach = _createFunction((values, callback) => {
    values.forEach(callback);
    return null;
}, {
    singleNames: [
        {
            name: 'values',
            // TODO
            // typeGuard: { type: 'reference', names: ['List'] }
        },
        {
            name: 'callback',
            // TODO
            // typeGuard: { type: 'reference', names: ['Function'] }
        },
    ]
});
//#endregion List
//#region Stream
//#region core
exports.complete = _createFunction((stream$) => {
    stream$.complete();
    return null;
}, {
    singleNames: [
        {
            name: 'stream$',
            // TODO
            // typeGuard: { type: 'reference', names: ['Stream'] }
        },
    ]
});
exports.subscribe = _createFunction((stream$, listener) => {
    const listenerFunction = (value) => {
        _callFunction(listener, [value]);
    };
    return stream$.subscribe(listenerFunction);
}, {
    singleNames: [
        {
            name: 'stream$',
            // TODO
            // typeGuard: { type: 'reference', names: ['Stream'] }
        },
        {
            name: 'listener',
            // TODO
            // typeGuard: { type: 'reference', names: ['Function'] }
        },
    ]
});
//#endregion core
//#region create
exports.httpTextRequest$ = _createFunction((url, method, headers, body) => {
    const abortController = new AbortController();
    const response$ = createSource$(null);
    response$.onCompleted(() => {
        abortController.abort();
    });
    fetch(url, {
        method: method,
        headers: headers,
        body: body,
        signal: abortController.signal,
    }).then(response => {
        if (response.ok) {
            return response.text();
        }
        else {
            throw new Error(response.statusText);
        }
    }).then(responseText => {
        processId++;
        response$.push(responseText, processId);
    }).catch(error => {
        processId++;
        response$.push(error, processId);
    }).finally(() => {
        response$.complete();
    });
    return response$;
}, {
    singleNames: [
        {
            name: 'url',
            // TODO
            // type: String
        },
        {
            name: 'method',
            // TODO
            // type: String
        },
        {
            name: 'body',
            // TODO
            // type: Any
        },
    ]
});
exports.timer$ = _createFunction((delayMs) => {
    const stream$ = createSource$(1);
    const cycle = () => {
        setTimeout(() => {
            if (stream$.completed) {
                return;
            }
            processId++;
            stream$.push(stream$.lastValue + 1, processId);
            cycle();
        }, delayMs);
    };
    cycle();
    return stream$;
}, {
    singleNames: [{
        name: 'delayMs',
        // TODO
        // type: Float
    }]
});
//#endregion create
//#endregion Stream
//#region Utility
exports.log = _createFunction(console.log, {
    rest: {}
});
exports.repeat = _createFunction((count, iteratee) => {
    for (let index = 1n; index <= count; index++) {
        iteratee(index);
    }
}, {
    singleNames: [
        {
            name: 'count',
            // TODO
            // type: Integer
        },
        {
            name: 'iteratee',
            // TODO
            // type: Function
        },
    ]
});
exports.runJs = _createFunction(eval, {
    singleNames: [{
        name: 'js',
        // TODO
        // type: String
    }]
});
// TODO dynamische imports erlauben??
// export const _import = _createFunction(require, {
// 	singleNames: [{
// 		name: 'path',
// 		type: (x) => typeof x === 'string'
// 	}]
// });
//#endregion Utility
//#endregion Functions
//#endregion builtins
//# sourceMappingURL=runtime.js.map
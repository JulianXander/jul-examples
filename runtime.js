"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runJs = exports.log = exports.timer$ = exports.subscribe = exports.complete = exports.sum = exports.subtract = exports._type = exports._error = exports._string = exports._float64 = exports._boolean = exports._any = exports.TypeOfType = exports.UnionType = exports.TypeType = exports.ArgumentReference = exports.FunctionType = exports.StreamType = exports.TupleType = exports.DictionaryLiteralType = exports.Float64 = exports.StringType = exports.BooleanType = exports.Any = exports.BuiltInTypeBase = exports._checkDictionaryType = exports._createFunction = exports._checkType = exports._callFunction = exports._branch = void 0;
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
    const assignedParams = tryAssignParams(fn.params, args);
    if (assignedParams instanceof Error) {
        return assignedParams;
    }
    return fn(...assignedParams);
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
                    case 'float64':
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
        default:
            throw new Error(`Unexpected type ${typeof type}`);
    }
}
// TOOD check empty prototype?
function isDictionary(value) {
    return typeof value === 'object'
        && !(value instanceof BuiltInTypeBase)
        && !(value instanceof Error)
        && !Array.isArray(value);
}
function tryAssignParams(params, values) {
    const assigneds = [];
    const { type: outerType, singleNames, rest } = params;
    if (outerType) {
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
class BuiltInTypeBase {
}
exports.BuiltInTypeBase = BuiltInTypeBase;
class Any extends BuiltInTypeBase {
    constructor() {
        super(...arguments);
        this.type = 'any';
    }
}
exports.Any = Any;
class BooleanType extends BuiltInTypeBase {
    constructor() {
        super(...arguments);
        this.type = 'boolean';
    }
}
exports.BooleanType = BooleanType;
class StringType extends BuiltInTypeBase {
    constructor() {
        super(...arguments);
        this.type = 'string';
    }
}
exports.StringType = StringType;
class Float64 extends BuiltInTypeBase {
    constructor() {
        super(...arguments);
        this.type = 'float64';
    }
}
exports.Float64 = Float64;
class ErrorType extends BuiltInTypeBase {
    constructor() {
        super(...arguments);
        this.type = 'error';
    }
}
class DictionaryType extends BuiltInTypeBase {
    constructor(elementType) {
        super();
        this.elementType = elementType;
        this.type = 'dictionary';
    }
}
class DictionaryLiteralType extends BuiltInTypeBase {
    constructor(fields) {
        super();
        this.fields = fields;
        this.type = 'dictionaryLiteral';
    }
}
exports.DictionaryLiteralType = DictionaryLiteralType;
class ListType extends BuiltInTypeBase {
    constructor(elementType) {
        super();
        this.elementType = elementType;
        this.type = 'list';
    }
}
class TupleType extends BuiltInTypeBase {
    constructor(elementTypes) {
        super();
        this.elementTypes = elementTypes;
        this.type = 'tuple';
    }
}
exports.TupleType = TupleType;
class StreamType extends BuiltInTypeBase {
    constructor(valueType) {
        super();
        this.valueType = valueType;
        this.type = 'stream';
    }
}
exports.StreamType = StreamType;
class FunctionType extends BuiltInTypeBase {
    constructor(paramsType, returnType) {
        super();
        this.paramsType = paramsType;
        this.returnType = returnType;
        this.type = 'function';
        // TODO set functionRef bei params
        if (returnType instanceof ArgumentReference) {
            returnType.functionRef = this;
        }
    }
}
exports.FunctionType = FunctionType;
// TODO Parameter Type ???
class ArgumentReference extends BuiltInTypeBase {
    constructor(path) {
        super();
        this.path = path;
        this.type = 'reference';
    }
}
exports.ArgumentReference = ArgumentReference;
class TypeType extends BuiltInTypeBase {
    constructor() {
        super(...arguments);
        this.type = 'type';
    }
}
exports.TypeType = TypeType;
class IntersectionType extends BuiltInTypeBase {
    constructor(choiceTypes) {
        super();
        this.choiceTypes = choiceTypes;
        this.type = 'and';
    }
}
class UnionType extends BuiltInTypeBase {
    constructor(choiceTypes) {
        super();
        this.choiceTypes = choiceTypes;
        this.type = 'or';
    }
}
exports.UnionType = UnionType;
class TypeOfType extends BuiltInTypeBase {
    constructor(value) {
        super();
        this.value = value;
        this.type = 'typeOf';
    }
}
exports.TypeOfType = TypeOfType;
class Stream {
    constructor(getValue) {
        this.completed = false;
        this.listeners = [];
        this.onCompletedListeners = [];
        this.getValue = getValue;
    }
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
function httpRequest$(url, method, body) {
    const abortController = new AbortController();
    const response$ = createSource$(null);
    response$.onCompleted(() => {
        abortController.abort();
    });
    fetch(url, {
        method: method,
        body: body,
        signal: abortController.signal,
    }).then(response => {
        processId++;
        response$.push(response, processId);
    }).catch(error => {
        processId++;
        response$.push(error, processId);
    }).finally(() => {
        response$.complete();
    });
    return response$;
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
        unsubscribeInner === null || unsubscribeInner === void 0 ? void 0 : unsubscribeInner();
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
//#endregion transform
//#endregion Stream
//#region builtins
//#region Types
exports._any = new Any();
exports._boolean = new BooleanType();
exports._float64 = new Float64();
exports._string = new StringType();
exports._error = new ErrorType();
exports._type = new TypeType();
//#endregion Types
// TODO remove
// TODO types, funktionen ergänzen
//#region Number
exports.subtract = _createFunction((minuend, subtrahend) => minuend - subtrahend, {
    singleNames: [
        {
            name: 'minuend',
            // TODO
            // type: { type: 'reference', names: ['Float64'] }
        },
        {
            name: 'subtrahend',
            // TODO
            // type: { type: 'reference', names: ['Float64'] }
        }
    ]
});
exports.sum = _createFunction((...args) => args.reduce((accumulator, current) => accumulator + current, 0), 
// TODO params type ...Float64[]
{
    rest: {
    // name: 'args'
    }
});
//#endregion Number
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
            // type: Float64
        }]
});
//#endregion create
//#endregion Stream
//#region Utility
exports.log = _createFunction(console.log, {
    rest: {}
});
exports.runJs = _createFunction(eval, {
    singleNames: [{
            name: 'js',
            // TODO
            // type: String
        }]
});
//#endregion Utility
// TODO dynamische imports erlauben??
// export const _import = _createFunction(require, {
// 	singleNames: [{
// 		name: 'path',
// 		type: (x) => typeof x === 'string'
// 	}]
// });
//#endregion builtins
//# sourceMappingURL=runtime.js.map
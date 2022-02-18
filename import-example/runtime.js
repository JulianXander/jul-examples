"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports._createFunction = exports._checkType = exports._callFunction = exports._branch = void 0;
//#region internals
function _branch(value, branches) {
    // TODO collect inner Errors?
    for (const branch of branches) {
        const assignedParams = tryAssignParams(value, branch.params);
        if (!(assignedParams instanceof Error)) {
            return branch(assignedParams);
        }
    }
    return new Error(`${value} did not match any branch`);
}
exports._branch = _branch;
function _callFunction(fn, args) {
    const assignedParams = tryAssignParams(args, fn.params);
    if (assignedParams instanceof Error) {
        return assignedParams;
    }
    return fn(...assignedParams);
}
exports._callFunction = _callFunction;
function _checkType(type, value) {
    return type(value)
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
//#endregion internals
function tryAssignParams(values, params) {
    const assigneds = [];
    const { singleNames, rest } = params;
    const isArray = Array.isArray(values);
    let index = 0;
    if (singleNames) {
        for (; index < singleNames.length; index++) {
            const param = singleNames[index];
            const { name, type } = param;
            const value = isArray
                ? values[index]
                : values[name];
            const isValid = type
                ? type(value)
                : true;
            if (!isValid) {
                return new Error(`Can not assigne the value ${value} to param ${name} because it is not of type ${type}`);
            }
            assigneds.push(value);
        }
    }
    if (rest) {
        const restType = rest.type;
        if (isArray) {
            for (; index < values.length; index++) {
                const value = values[index];
                const isValid = restType
                    ? restType(value)
                    : true;
                if (!isValid) {
                    return new Error(`Can not assigne the value ${value} to rest param because it is not of type ${rest}`);
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
//#region builtins
exports.log = _createFunction(console.log, { rest: {} });
// export const _import = _createFunction(require, {
// 	singleNames: [{
// 		name: 'path',
// 		type: (x) => typeof x === 'string'
// 	}]
// });
// TODO
//#endregion builtins
//# sourceMappingURL=runtime.js.map
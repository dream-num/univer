import { IKeyValue } from '@univerjs/core';

export function getObjType(obj: any) {
    let toString = Object.prototype.toString;

    let map: IKeyValue = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object',
    };

    return map[toString.call(obj)];
}

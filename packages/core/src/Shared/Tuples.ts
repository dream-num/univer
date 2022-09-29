import { Tools } from './Tools';

/**
 * Tool library for detecting data types
 */
export class Tuples {
    static STRING_TYPE = 1;

    static NUMBER_TYPE = 2;

    static BOOLEAN_TYPE = 3;

    static FUNCTION_TYPE = 4;

    static OBJECT_TYPE = 5;

    static checkup(target: IArguments | unknown[], ...types: any[]): boolean {
        if (target.length !== types.length) {
            return false;
        }
        const length = target.length;
        for (let i = 0; i < length; i++) {
            const element = target[i];
            const type = types[i];
            switch (type) {
                case Tuples.BOOLEAN_TYPE: {
                    if (!Tools.isBoolean(element)) {
                        return false;
                    }
                    break;
                }
                case Tuples.NUMBER_TYPE: {
                    if (!Tools.isNumber(element)) {
                        return false;
                    }
                    break;
                }
                case Tuples.STRING_TYPE: {
                    if (!Tools.isString(element)) {
                        return false;
                    }
                    break;
                }
                case Tuples.FUNCTION_TYPE: {
                    if (!Tools.isFunction(element)) {
                        return false;
                    }
                    break;
                }
                case Tuples.OBJECT_TYPE: {
                    if (!Tools.isPlainObject(element)) {
                        return false;
                    }
                    break;
                }
                default: {
                    if (!Tools.isAssignableFrom(element, type)) {
                        return false;
                    }
                    break;
                }
            }
        }
        return true;
    }
}

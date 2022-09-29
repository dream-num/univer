import { ErrorType } from '../Basics/ErrorType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { FunctionVariantType, NodeValueType } from '../Basics/Common';

export class BaseFunction {
    get name() {
        return '';
    }

    calculate(...arg: FunctionVariantType[]): NodeValueType {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    static functionMap: Map<string, BaseFunction> = new Map();

    static create(): BaseFunction {
        if (this.functionMap.has(this.name)) {
            return this.functionMap.get(this.name)!;
        }

        return new this();
    }
}

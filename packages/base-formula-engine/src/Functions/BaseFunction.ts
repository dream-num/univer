import { ErrorType } from '../Basics/ErrorType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { FunctionVariantType, NodeValueType } from '../Basics/Common';
import { BaseValueObject } from '../ValueObject/BaseValueObject';

export class BaseFunction {
    static functionMap: Map<string, BaseFunction> = new Map();

    get name() {
        return '';
    }

    static create(): BaseFunction {
        if (this.functionMap.has(this.name)) {
            return this.functionMap.get(this.name)!;
        }

        return new this();
    }

    isAsync() {
        return false;
    }

    isAddress() {
        return false;
    }

    calculate(...arg: FunctionVariantType[]): NodeValueType {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    checkArrayType(variant: FunctionVariantType) {
        return variant.isReferenceObject() || (variant.isValueObject() && (variant as BaseValueObject).isArray());
    }
}

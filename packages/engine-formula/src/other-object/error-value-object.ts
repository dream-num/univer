import type { ErrorType } from '../basics/error-type';
import { ObjectClassType } from '../basics/object-class-type';

export class ErrorValueObject extends ObjectClassType {
    static errorMap: Map<ErrorType, ErrorValueObject> = new Map();

    constructor(private _errorType: ErrorType) {
        super();
    }

    static create(errorType: ErrorType) {
        if (this.errorMap.has(errorType)) {
            return this.errorMap.get(errorType)!;
        }
        const errorValueObject = new ErrorValueObject(errorType);
        this.errorMap.set(errorType, errorValueObject);
        return errorValueObject;
    }

    getErrorType() {
        return this._errorType;
    }

    override isEqual(object: ObjectClassType) {
        if ((object as ErrorValueObject).getErrorType() === this.getErrorType()) {
            return true;
        }
        return false;
    }

    override isErrorObject() {
        return true;
    }
}

import { ErrorType } from '../Basics/ErrorType';
import { ObjectClassType } from '../Basics/ObjectClassType';

export class ErrorValueObject extends ObjectClassType {
    getErrorType() {
        return this._errorType;
    }

    isErrorObject() {
        return true;
    }

    constructor(private _errorType: ErrorType) {
        super();
    }

    static errorMap: Map<ErrorType, ErrorValueObject> = new Map();

    static create(errorType: ErrorType) {
        if (this.errorMap.has(errorType)) {
            return this.errorMap.get(errorType)!;
        }
        const errorValueObject = new ErrorValueObject(errorType);
        this.errorMap.set(errorType, errorValueObject);
        return errorValueObject;
    }
}

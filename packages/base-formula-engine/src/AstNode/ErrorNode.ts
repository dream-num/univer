import { ErrorType } from '../Basics/ErrorType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseAstNode } from './BaseAstNode';
import { NodeType } from './NodeType';

export class ErrorNode extends BaseAstNode {
    constructor(errorType: ErrorType) {
        super(errorType);
        this._errorValueObject = ErrorValueObject.create(errorType);
    }

    get nodeType() {
        return NodeType.ERROR;
    }

    static create(errorType: ErrorType) {
        return new ErrorNode(errorType);
    }

    getValue() {
        return this._errorValueObject;
    }

    private _errorValueObject: ErrorValueObject;
}

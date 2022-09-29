import { ErrorType } from '../Basics/ErrorType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseAstNode } from './BaseAstNode';
import { NodeType } from './NodeType';

export class ErrorNode extends BaseAstNode {
    get nodeType() {
        return NodeType.ERROR;
    }

    private _errorValueObject: ErrorValueObject;

    constructor(errorType: ErrorType) {
        super();
        this._errorValueObject = ErrorValueObject.create(errorType);
    }

    getValue() {
        return this._errorValueObject;
    }

    static create(errorType: ErrorType) {
        return new ErrorNode(errorType);
    }
}

import { FunctionVariantType } from '../Basics/Common';
import { ObjectClassType } from '../Basics/ObjectClassType';

export class AsyncObject extends ObjectClassType {
    constructor(private _promise: Promise<FunctionVariantType>) {
        super();
    }

    isAsyncObject() {
        return true;
    }

    getValue() {
        return this._promise;
    }
}

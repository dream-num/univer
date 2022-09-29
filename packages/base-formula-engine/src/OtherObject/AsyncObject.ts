import { FunctionVariantType } from '../Basics/Common';
import { ObjectClassType } from '../Basics/ObjectClassType';

export class AsyncObject extends ObjectClassType {
    isAsyncObject() {
        return true;
    }

    constructor(private _promise: Promise<FunctionVariantType>) {
        super();
    }

    getValue() {
        return this._promise;
    }
}

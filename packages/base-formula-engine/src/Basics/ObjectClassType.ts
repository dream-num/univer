import { Disposable } from '@univerjs/core';

export class ObjectClassType extends Disposable {
    isErrorObject() {
        return false;
    }

    isAsyncObject() {
        return false;
    }

    isReferenceObject() {
        return false;
    }

    isValueObject() {
        return false;
    }
}

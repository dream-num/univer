/**
 * Copyright 2023 DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ErrorType } from '../../basics/error-type';
import { ObjectClassType } from '../../basics/object-class-type';

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

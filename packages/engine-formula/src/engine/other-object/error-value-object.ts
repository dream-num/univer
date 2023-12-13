/**
 * Copyright 2023-present DreamNum Inc.
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
    constructor(
        private _errorType: ErrorType,
        private _errorContent: string = ''
    ) {
        super();
    }

    static create(errorType: ErrorType, errorContent?: string) {
        const errorValueObject = new ErrorValueObject(errorType, errorContent);
        return errorValueObject;
    }

    getErrorType() {
        return this._errorType;
    }

    getErrorContent() {
        return this._errorContent;
    }

    override isEqualType(object: ObjectClassType) {
        if ((object as ErrorValueObject).getErrorType() === this.getErrorType()) {
            return true;
        }
        return false;
    }

    override isErrorObject() {
        return true;
    }
}

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

import { FUniver } from '@univerjs/core';
import { FDataValidationBuilder } from './f-data-validation-builder';

export class FUnvierDataValidationMixin {
    /**
     * @deparecated use `univerAPI.newDataValidation()` as instead.
     */
    static newDataValidation(): FDataValidationBuilder {
        return new FDataValidationBuilder();
    }

    newDataValidation(): FDataValidationBuilder {
        return new FDataValidationBuilder();
    }
}

FUniver.extend(FUnvierDataValidationMixin);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/no-namespace
    namespace FUniver {
        function newDataValidation(): FDataValidationBuilder;
    }
}

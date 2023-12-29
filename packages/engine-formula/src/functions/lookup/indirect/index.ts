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

import { ErrorType } from '../../..';
import { CellReferenceObject } from '../../../engine/reference-object/cell-reference-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Indirect extends BaseFunction {
    override calculate(refText: BaseValueObject, a1?: BaseValueObject) {
        const cell = new CellReferenceObject('A7');
        if (this.unitId == null || this.subUnitId == null) {
            return new ErrorValueObject(ErrorType.REF);
        }
        cell.setDefaultUnitId(this.unitId);
        cell.setDefaultSheetId(this.subUnitId);

        return cell;
    }
}

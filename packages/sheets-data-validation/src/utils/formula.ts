/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { DataValidationType, ICellData, Nullable } from '@univerjs/core';
import type { DataValidatorRegistryService } from '@univerjs/data-validation';
import { ERROR_TYPE_SET } from '@univerjs/engine-formula';

export function getFormulaResult(result: Nullable<Nullable<ICellData>[][]>) {
    return result?.[0]?.[0]?.v;
}

export function getFormulaCellData(result: Nullable<Nullable<ICellData>[][]>) {
    return result?.[0]?.[0];
}

export function isLegalFormulaResult(res: string) {
    return !(ERROR_TYPE_SET as Set<string>).has(res);
}

/**
 * Judge if the data-validation's formula need to be offseted by ranges
 */
export function shouldOffsetFormulaByRange(type: DataValidationType | string, validatorRegistryService: DataValidatorRegistryService) {
    const validator = validatorRegistryService.getValidatorItem(type);
    return validator?.offsetFormulaByRange ?? false;
}

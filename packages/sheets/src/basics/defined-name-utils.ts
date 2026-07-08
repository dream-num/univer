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

import type { IUniverInstanceService, Workbook } from '@univerjs/core';
import type { IDefinedNamesService, IFunctionService, ISuperTableService } from '@univerjs/engine-formula';
import { Tools, UniverInstanceType } from '@univerjs/core';
import { isReferenceStringWithEffectiveColumn } from '@univerjs/engine-formula';
import { cjk } from '@univerjs/engine-render';

interface IValidateDefinedNameOptions {
    unitId: string;
    formulaOrRefString: string;
    univerInstanceService: IUniverInstanceService;
    definedNamesService: IDefinedNamesService;
    superTableService: ISuperTableService;
    functionService: IFunctionService;
    id?: string;
}

export function validateDefinedName(name: string, options: IValidateDefinedNameOptions): true | string {
    if (name.length === 0) {
        return 'sheets.definedName.nameEmpty';
    }

    const { unitId, formulaOrRefString, univerInstanceService, definedNamesService, superTableService, functionService, id } = options;

    /**
     * The defined name can't be duplicate with existing defined names.
     * If id is provided, it means we are updating an existing defined name. We should allow the name to be the same as itself.
     */
    const existingDefinedName = definedNamesService.getValueByName(unitId, name);
    if (
        existingDefinedName &&
        (id === null || id === undefined || id.length === 0 || existingDefinedName.id !== id)
    ) {
        return 'sheets.definedName.nameDuplicate';
    }

    // The defined name can't be duplicate with existing table names.
    if (superTableService.hasTable(unitId, name)) {
        return 'sheets.definedName.nameDuplicate';
    }

    // The defined name can't be a reference string with effective column, which will cause confusion.
    if (
        !Tools.isValidParameter(name) ||
        isReferenceStringWithEffectiveColumn(name) ||
        (!Tools.isStartValidPosition(name) && !cjk.hasCJKText(name.substring(0, 1)))
    ) {
        return 'sheets.definedName.nameInvalid';
    }

    const workbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
    if (!workbook) {
        throw new Error(`Workbook not found for unitId: ${unitId}`);
    }

    const worksheets = workbook.getSheets();

    // The defined name can't be duplicate with existing sheet names.
    if (worksheets.some((sheet) => sheet.getName() === name)) {
        return 'sheets.definedName.nameSheetConflict';
    }

    if (formulaOrRefString.length === 0) {
        return 'sheets.definedName.formulaOrRefStringEmpty';
    }

    // The defined name can't be duplicate with existing function names.
    if (functionService.hasExecutor(name.toUpperCase())) {
        return 'sheets.definedName.nameConflict';
    }

    return true;
}

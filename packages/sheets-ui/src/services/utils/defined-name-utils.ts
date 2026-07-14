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
import type {
    IDefinedNamesService,
    IDefinedNamesServiceParam,
    IFunctionService,
    ISuperTableService,
    LexerTreeBuilder,
} from '@univerjs/engine-formula';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { AbsoluteRefType } from '@univerjs/core';
import { isReferenceStringWithEffectiveColumn, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { validateDefinedName } from '@univerjs/sheets';

export enum DefinedNameBoxActionType {
    Noop = 'noop',
    FocusDefinedName = 'focusDefinedName',
    FocusSelection = 'focusSelection',
    CreateDefinedName = 'createDefinedName',
    Reset = 'reset',
}

interface IResolveDefinedNameBoxActionParams {
    inputValue: string;
    rangeString: string;
    unitId: string;
    formulaOrRefString: string;
    univerInstanceService: IUniverInstanceService;
    definedNamesService: IDefinedNamesService;
    superTableService: ISuperTableService;
    functionService: IFunctionService;
}

type DefinedNameBoxAction =
    | { type: DefinedNameBoxActionType.Noop }
    | { type: DefinedNameBoxActionType.FocusDefinedName; definedName: IDefinedNamesServiceParam }
    | { type: DefinedNameBoxActionType.FocusSelection; refString: string }
    | { type: DefinedNameBoxActionType.CreateDefinedName; name: string }
    | { type: DefinedNameBoxActionType.Reset };

export function resolveDefinedNameBoxAction(params: IResolveDefinedNameBoxActionParams): DefinedNameBoxAction {
    const { inputValue, rangeString, unitId, formulaOrRefString, univerInstanceService, definedNamesService, superTableService, functionService } = params;

    if (inputValue === rangeString) {
        return { type: DefinedNameBoxActionType.Noop };
    }

    const definedName = definedNamesService.getValueByName(unitId, inputValue);
    if (definedName) {
        return {
            type: DefinedNameBoxActionType.FocusDefinedName,
            definedName,
        };
    }

    if (isReferenceStringWithEffectiveColumn(inputValue)) {
        return {
            type: DefinedNameBoxActionType.FocusSelection,
            refString: inputValue,
        };
    }

    const validateResult = validateDefinedName(inputValue, {
        unitId,
        formulaOrRefString,
        univerInstanceService,
        definedNamesService,
        superTableService,
        functionService,
    });

    if (validateResult === true) {
        return {
            type: DefinedNameBoxActionType.CreateDefinedName,
            name: inputValue,
        };
    }

    return { type: DefinedNameBoxActionType.Reset };
}

export function getAbsoluteRefStringFromSelection(
    workbook: Workbook,
    selections: readonly ISelectionWithStyle[] | undefined,
    lexerTreeBuilder: LexerTreeBuilder
) {
    const sheetName = workbook.getActiveSheet()?.getName();
    if (!sheetName || selections == null || selections.length === 0) {
        return '';
    }

    const formulaOrRefs = selections.map((selection) => serializeRangeWithSheet(sheetName, selection.range)).join(',');

    return lexerTreeBuilder.convertRefersToAbsolute(formulaOrRefs, AbsoluteRefType.ALL, AbsoluteRefType.ALL, sheetName);
}

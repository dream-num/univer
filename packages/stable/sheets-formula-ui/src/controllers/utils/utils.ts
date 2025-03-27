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

import type { ICellData, IContextService, Nullable } from '@univerjs/core';
import type { ErrorType } from '@univerjs/engine-formula';
import { CellValueType, FOCUSING_DOC, FOCUSING_UNIVER_EDITOR, isFormulaId, isFormulaString } from '@univerjs/core';
import { ERROR_TYPE_SET, stripErrorMargin } from '@univerjs/engine-formula';

export function whenEditorStandalone(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_DOC) &&
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR)
        // &&
        // contextService.getContextValue(FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE)
    );
}

/**
 * Extract the formula error from the cell
 * @param cell
 * @returns
 */
export function extractFormulaError(cell: Nullable<ICellData>, isArrayFormulaCell: boolean = false) {
    // Must contain a formula
    if (!isArrayFormulaCell && !(isFormulaString(cell?.f) || isFormulaId(cell?.si))) {
        return null;
    }

    if (typeof cell?.v === 'string' && ERROR_TYPE_SET.has(cell.v as ErrorType)) {
        return cell.v as ErrorType;
    }

    return null;
}

/**
 * Extract the formula number from the cell, handle the precision issue
 * @param cell
 * @returns
 */
export function extractFormulaNumber(cell: Nullable<ICellData>) {
    if ((isFormulaString(cell?.f) || isFormulaId(cell?.si)) && cell?.t === CellValueType.NUMBER && typeof cell?.v === 'number') {
        return stripErrorMargin(cell.v);
    }
    return null;
}

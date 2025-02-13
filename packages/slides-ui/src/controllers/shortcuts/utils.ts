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

import type { IContextService } from '@univerjs/core';
import {
    EDITOR_ACTIVATED,
    FOCUSING_COMMON_DRAWINGS,
    FOCUSING_EDITOR_INPUT_FORMULA,
    FOCUSING_EDITOR_STANDALONE,
    FOCUSING_SLIDE,
    FOCUSING_UNIVER_EDITOR,
    FORMULA_EDITOR_ACTIVATED,
} from '@univerjs/core';

export function whenSheetFocused(contextService: IContextService) {
    return contextService.getContextValue(FOCUSING_SLIDE);
}

// FIXME: why coupled with sheet editors?

/**
 * Requires the currently focused unit to be Workbook and the sheet editor is focused but not activated.
 * @param contextService
 * @returns If the sheet editor is focused but not activated.
 */
export function whenSheetEditorFocused(contextService: IContextService): boolean {
    return (
        contextService.getContextValue(FOCUSING_SLIDE) &&
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR) &&
        !contextService.getContextValue(EDITOR_ACTIVATED) &&
        !contextService.getContextValue(FOCUSING_COMMON_DRAWINGS)
    );
}

export function whenSheetEditorFocusedAndFxNotFocused(contextService: IContextService): boolean {
    return (
        contextService.getContextValue(FOCUSING_SLIDE) &&
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR) &&
        !contextService.getContextValue(EDITOR_ACTIVATED) &&
        !contextService.getContextValue(FORMULA_EDITOR_ACTIVATED) &&
        !contextService.getContextValue(FOCUSING_COMMON_DRAWINGS)
    );
}

/**
 * Requires the currently focused unit to be Workbook and the sheet editor is activated.
 * @param contextService
 * @returns If the sheet editor is activated.
 */
export function whenSheetEditorActivated(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_SLIDE) &&
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR) &&
        contextService.getContextValue(EDITOR_ACTIVATED)
    );
}

export function whenEditorActivated(contextService: IContextService) {
    return contextService.getContextValue(FOCUSING_UNIVER_EDITOR) && contextService.getContextValue(EDITOR_ACTIVATED);
}

/**
 * Requires the currently focused editor is a formula editor.
 * @param contextService
 * @returns If the formula editor is focused.
 */
export function whenFormulaEditorFocused(contextService: IContextService) {
    return (
        contextService.getContextValue(FORMULA_EDITOR_ACTIVATED) &&
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR)
    );
}

/**
 * Requires the currently focused editor is a formula editor, and it is activated.
 * @param contextService
 * @returns If the formula editor is activated.
 */
export function whenFormulaEditorActivated(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_SLIDE) &&
        contextService.getContextValue(EDITOR_ACTIVATED) &&
        contextService.getContextValue(FOCUSING_EDITOR_INPUT_FORMULA) &&
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR)
    );
}

/**
 * Requires the currently focused editor is not a formula editor, and it is activated.
 * @param contextService
 * @returns If the editor is activated and the editor is not the formula editor.
 */
export function whenEditorDidNotInputFormulaActivated(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_SLIDE) &&
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR) &&
        contextService.getContextValue(EDITOR_ACTIVATED) &&
        !contextService.getContextValue(FOCUSING_EDITOR_INPUT_FORMULA) &&
        !contextService.getContextValue(FOCUSING_EDITOR_STANDALONE)
    );
}

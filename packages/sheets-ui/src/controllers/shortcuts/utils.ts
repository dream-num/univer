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

import type { IContextService } from '@univerjs/core';
import {
    FOCUSING_EDITOR,
    FOCUSING_EDITOR_BUT_HIDDEN,
    FOCUSING_EDITOR_INPUT_FORMULA,
    FOCUSING_FORMULA_EDITOR,
    FOCUSING_SHEET,
} from '@univerjs/core';

export function whenEditorNotActivated(contextService: IContextService) {
    return contextService.getContextValue(FOCUSING_SHEET) && !contextService.getContextValue(FOCUSING_EDITOR);
}

export function whenEditorFocusIsHidden(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_EDITOR_BUT_HIDDEN) && !contextService.getContextValue(FOCUSING_EDITOR)
    );
}

export function whenEditorActivatedIsVisible(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_EDITOR) && contextService.getContextValue(FOCUSING_EDITOR_BUT_HIDDEN)
    );
}

export function whenFormulaEditorFocused(contextService: IContextService) {
    return contextService.getContextValue(FOCUSING_FORMULA_EDITOR);
}

export function whenEditorInputFormulaActivated(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_EDITOR) && contextService.getContextValue(FOCUSING_EDITOR_INPUT_FORMULA)
    );
}

export function whenEditorDidNotInputFormulaActivated(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_EDITOR) &&
        !contextService.getContextValue(FOCUSING_EDITOR_INPUT_FORMULA)
    );
}

export function whenEditorNotActivatedOrFormulaActivated(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_SHEET) &&
        (!contextService.getContextValue(FOCUSING_EDITOR) ||
            contextService.getContextValue(FOCUSING_EDITOR_INPUT_FORMULA))
    );
}

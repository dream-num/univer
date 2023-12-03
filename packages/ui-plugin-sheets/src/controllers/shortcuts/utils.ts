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

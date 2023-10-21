import { FOCUSING_SHEET, IContextService } from '@univerjs/core';
import { FOCUSING_EDITOR } from '@univerjs/core/services/context/context.js';

export function whenEditorNotActivated(contextService: IContextService) {
    return contextService.getContextValue(FOCUSING_SHEET) && !contextService.getContextValue(FOCUSING_EDITOR);
}

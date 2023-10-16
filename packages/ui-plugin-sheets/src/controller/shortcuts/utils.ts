import { FOCUSING_SHEET, IContextService } from '@univerjs/core';

import { SHEET_EDITOR_ACTIVATED } from '../../services/context/context';

export function whenEditorNotActivated(contextService: IContextService) {
    return contextService.getContextValue(FOCUSING_SHEET) && !contextService.getContextValue(SHEET_EDITOR_ACTIVATED);
}

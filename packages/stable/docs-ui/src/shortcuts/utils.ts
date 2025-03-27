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
import { FOCUSING_COMMON_DRAWINGS, FOCUSING_DOC, FOCUSING_UNIVER_EDITOR } from '@univerjs/core';

export function whenDocAndEditorFocused(contextService: IContextService): boolean {
    return contextService.getContextValue(FOCUSING_DOC)
        && contextService.getContextValue(FOCUSING_UNIVER_EDITOR)
        && !contextService.getContextValue(FOCUSING_COMMON_DRAWINGS);
}

export function whenDocAndEditorFocusedWithBreakLine(contextService: IContextService): boolean {
    return contextService.getContextValue(FOCUSING_DOC)
        && contextService.getContextValue(FOCUSING_UNIVER_EDITOR)
        // && !contextService.getContextValue(FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE)
        && !contextService.getContextValue(FOCUSING_COMMON_DRAWINGS);
}

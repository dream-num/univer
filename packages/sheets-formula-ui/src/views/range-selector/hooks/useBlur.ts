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

import { useDependency } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { useEffect } from 'react';

export const useBlur = (editorId: string, isFocusSet: (v: boolean) => void) => {
    const editorService = useDependency(IEditorService);
    useEffect(() => {
        const handleBlur = (_focusEditorId?: string) => {
            const focusEditorId = _focusEditorId || editorService.getFocusEditor()?.getEditorId();
            if (focusEditorId && editorId !== focusEditorId) {
                isFocusSet(false);
            }
        };
        const d = editorService.focus$.subscribe(() => handleBlur());
        const d2 = editorService.focusStyle$.subscribe((e) => handleBlur(e!));
        return () => {
            d.unsubscribe();
            d2.unsubscribe();
        };
    }, [editorService, editorId]);
};

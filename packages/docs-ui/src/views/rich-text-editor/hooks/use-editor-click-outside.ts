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

import { useDependency } from '@univerjs/ui';
import { useEffect } from 'react';
import { IEditorService } from '../../../services/editor/editor-manager.service';

export const useEditorClickOutside = (
    editorId: string,
    containerRef: React.RefObject<HTMLElement | null>,
    onClickOutside?: () => void
) => {
    const editorService = useDependency(IEditorService);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (editorService.getFocusId() !== editorId) return;

            const id = (event.target as HTMLDivElement)?.dataset?.editorid;
            if (id === editorId) return;

            // Check if click is inside the editor container
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onClickOutside?.();
            }
        };

        const timer = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            clearTimeout(timer);
        };
    }, [editorId, editorService, onClickOutside, containerRef]);
};

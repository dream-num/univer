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

import type { Editor } from '@univerjs/docs-ui';
import { useDependency } from '@univerjs/core';
import { matchToken } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useEffect } from 'react';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';

/**
 * add selections by inputting a `,`.
 * @param {string} unitId
 * @param {string} rangeString
 * @param {Editor} [editor]
 */
export const useEditorInput = (unitId: string, rangeString: string, editor?: Editor) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const render = renderManagerService.getRenderById(unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);

    useEffect(() => {
        if (editor && refSelectionsRenderService) {
            const d = editor.input$.subscribe((e) => {
                const content = e.content;
                if (content === matchToken.COMMA) {
                    refSelectionsRenderService.setSkipLastEnabled(true);
                } else {
                    refSelectionsRenderService.setSkipLastEnabled(false);
                }
            });
            return () => {
                d.unsubscribe();
            };
        }
    }, [editor, refSelectionsRenderService]);

    useEffect(() => {
        if (!refSelectionsRenderService) {
            return;
        }
        if (!rangeString.endsWith(matchToken.COMMA)) {
            refSelectionsRenderService.setSkipLastEnabled(false);
        }
    }, [rangeString, refSelectionsRenderService]);
};

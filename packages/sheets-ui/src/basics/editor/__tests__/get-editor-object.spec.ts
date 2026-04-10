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

import type { IRenderManagerService } from '@univerjs/engine-render';
import { DOCS_VIEW_KEY } from '@univerjs/docs-ui';
import { describe, expect, it } from 'vitest';
import { getEditorObject } from '../get-editor-object';

describe('getEditorObject', () => {
    it('returns undefined when unitId is null or render is missing', () => {
        const renderManagerService = {
            getRenderById: () => null,
        } as unknown as IRenderManagerService;

        expect(getEditorObject(null, renderManagerService)).toBeUndefined();
        expect(getEditorObject('u-1', renderManagerService)).toBeUndefined();
    });

    it('returns editor render parts from render manager', () => {
        const document = { id: 'doc' };
        const docBackground = { id: 'bg' };
        const scene = { id: 'scene' };
        const engine = { id: 'engine' };

        const renderManagerService = {
            getRenderById: () => ({
                mainComponent: document,
                scene,
                engine,
                components: new Map([[DOCS_VIEW_KEY.BACKGROUND, docBackground]]),
            }),
        } as unknown as IRenderManagerService;

        const res = getEditorObject('u-1', renderManagerService);
        expect(res).toEqual({
            document,
            docBackground,
            scene,
            engine,
        });
    });
});

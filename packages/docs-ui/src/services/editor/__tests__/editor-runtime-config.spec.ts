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

import type { IEditorRuntimeConfig } from '../editor-runtime-config';
import { DocumentDataModel } from '@univerjs/core';
import { getDocumentLayoutPresentation } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { getEditorRuntimeConfig, registerEditorRuntimeConfig } from '../editor-runtime-config';

describe('editor runtime configuration', () => {
    it('isolates instances and protects a replacement registration even when its config is reused', () => {
        const first = new DocumentDataModel({ id: 'runtime-first' });
        const second = new DocumentDataModel({ id: 'runtime-second' });
        const config: IEditorRuntimeConfig = {
            disableSelectionAutoScroll: true,
            layout: {
                getSnapshot: (snapshot) => snapshot,
                captureState: () => undefined,
                applyActions: () => {},
                restoreState: () => {},
            },
        };
        const initial = registerEditorRuntimeConfig(first, config);
        const replacement = registerEditorRuntimeConfig(first, config);
        initial.dispose();
        expect(getEditorRuntimeConfig(first)).toBe(config);
        expect(getDocumentLayoutPresentation(first)).toBe(config.layout);
        expect(getEditorRuntimeConfig(second)).toBeUndefined();
        expect(first.getSnapshot()).not.toHaveProperty('renderConfig');
        replacement.dispose();
        replacement.dispose();
        expect(getEditorRuntimeConfig(first)).toBeUndefined();
        expect(getDocumentLayoutPresentation(first)).toBeUndefined();
        first.dispose();
        second.dispose();
    });
});

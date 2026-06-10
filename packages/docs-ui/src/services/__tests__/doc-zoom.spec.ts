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

import { DocumentFlavor } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DEFAULT_MODERN_DOC_ZOOM_RATIO, getDocEffectiveZoomRatio } from '../doc-zoom';

describe('doc zoom helpers', () => {
    it('defaults modern docs to 120 percent when no explicit zoom is stored', () => {
        const documentModel = {
            getSettings: () => undefined,
            getSnapshot: () => ({
                documentStyle: {
                    documentFlavor: DocumentFlavor.MODERN,
                },
            }),
        };

        expect(getDocEffectiveZoomRatio(documentModel as never)).toBe(DEFAULT_MODERN_DOC_ZOOM_RATIO);
    });

    it('keeps explicit zoom ratios and classic defaults unchanged', () => {
        expect(getDocEffectiveZoomRatio({
            getSettings: () => ({ zoomRatio: 1.35 }),
            getSnapshot: () => ({
                documentStyle: {
                    documentFlavor: DocumentFlavor.MODERN,
                },
            }),
        } as never)).toBe(1.35);

        expect(getDocEffectiveZoomRatio({
            getSettings: () => undefined,
            getSnapshot: () => ({
                documentStyle: {
                    documentFlavor: DocumentFlavor.TRADITIONAL,
                },
            }),
        } as never)).toBe(1);
    });
});

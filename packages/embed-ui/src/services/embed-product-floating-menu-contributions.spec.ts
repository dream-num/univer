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

import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { createEmbedProductFloatingMenuContributions } from './embed-product-floating-menu-contributions';

describe('createEmbedProductFloatingMenuContributions', () => {
    it('creates the standard product floating menu matrix for Docs, Sheets, and Slides hosts', () => {
        const mount = vi.fn();

        expect(createEmbedProductFloatingMenuContributions({
            childType: UniverInstanceType.UNIVER_BASE,
            mount,
        })).toEqual([
            {
                hostType: UniverInstanceType.UNIVER_DOC,
                entry: 'docs-custom-block',
                childType: UniverInstanceType.UNIVER_BASE,
                mount,
            },
            {
                hostType: UniverInstanceType.UNIVER_SHEET,
                entry: 'sheets-floating-object',
                childType: UniverInstanceType.UNIVER_BASE,
                mount,
            },
            {
                hostType: UniverInstanceType.UNIVER_SLIDE,
                entry: 'slides-floating-object',
                childType: UniverInstanceType.UNIVER_BASE,
                mount,
            },
        ]);
    });
});

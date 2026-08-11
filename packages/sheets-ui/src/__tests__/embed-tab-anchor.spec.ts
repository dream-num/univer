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
import { describe, expect, it } from 'vitest';

import { getEmbedSheetsTabCustomData } from '../embed-tab-anchor';

describe('getEmbedSheetsTabCustomData', () => {
    it('reads the embedded product type used by the Sheet tab marker', () => {
        expect(getEmbedSheetsTabCustomData({
            custom: {
                UNIVER_EMBED_SHEETS_TAB: {
                    version: 1,
                    embedId: 'embed-1',
                    hostAnchorId: 'sheet-1',
                    childType: UniverInstanceType.UNIVER_BOARD,
                },
            },
        })).toEqual({
            version: 1,
            embedId: 'embed-1',
            hostAnchorId: 'sheet-1',
            childType: UniverInstanceType.UNIVER_BOARD,
        });
    });
});

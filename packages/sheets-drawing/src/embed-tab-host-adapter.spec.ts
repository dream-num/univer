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
import { createSheetsSheetTabHostAdapterContribution, registerSheetsSheetTabEmbedHostAdapters } from './embed-tab-host-adapter';

describe('sheets sheet-tab embed host adapter compatibility', () => {
    it('keeps old registration API as a no-op', () => {
        expect(() => registerSheetsSheetTabEmbedHostAdapters()).not.toThrow();
    });

    it('keeps the old factory export while moving the implementation to pro embed', () => {
        const adapter = createSheetsSheetTabHostAdapterContribution();

        expect(adapter).toMatchObject({
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-sheet-tab',
        });
        expect(() => adapter.createAnchorPlan()).toThrow('EMBED_SHEETS_TAB_ANCHOR_MOVED_TO_PRO_EMBED');
    });
});

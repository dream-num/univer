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
import { collectDocsTableLikeEmbedChildUnitIds, shouldRefreshDocsCustomBlockSizeForCommand } from './embed-docs-custom-block-refresh';

describe('docs custom block refresh helpers', () => {
    it('collects only sheet-like custom block child unit ids', () => {
        expect([...collectDocsTableLikeEmbedChildUnitIds({
            base: { data: { childType: UniverInstanceType.UNIVER_BASE, childUnitId: 'base-1' } },
            doc: { data: { childType: UniverInstanceType.UNIVER_DOC, childUnitId: 'doc-1' } },
            sheet: { data: { childType: UniverInstanceType.UNIVER_SHEET, childUnitId: 'sheet-1' } },
            missing: { data: { childType: UniverInstanceType.UNIVER_SHEET } },
        })].sort()).toEqual(['base-1', 'sheet-1']);
    });

    it('refreshes only when a command targets an embedded child unit', () => {
        const childUnitIds = new Set(['sheet-1']);

        expect(shouldRefreshDocsCustomBlockSizeForCommand({
            childUnitIds,
            commandParams: { unitId: 'sheet-1' },
            hostUnitId: 'doc-host',
        })).toBe(true);
        expect(shouldRefreshDocsCustomBlockSizeForCommand({
            childUnitIds,
            commandParams: { unitId: 'doc-host' },
            hostUnitId: 'doc-host',
        })).toBe(false);
        expect(shouldRefreshDocsCustomBlockSizeForCommand({
            childUnitIds,
            commandParams: { unitId: 'other' },
            hostUnitId: 'doc-host',
        })).toBe(false);
    });
});

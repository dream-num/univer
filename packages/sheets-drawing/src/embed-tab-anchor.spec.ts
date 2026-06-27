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

import { BooleanNumber } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import {
    createEmbedSheetsTabCustomData,
    createEmbedSheetsTabSnapshot,
    createEmbedSheetsTabSnapshotFromDescriptor,
    EMBED_SHEETS_TAB_CUSTOM_KEY,
    getEmbedSheetsTabCustomData,
    isEmbedSheetsTabSnapshot,
} from './embed-tab-anchor';

describe('embed sheet tab anchor', () => {
    it('creates worksheet-like snapshots with embed custom metadata', () => {
        const snapshot = createEmbedSheetsTabSnapshot({
            embedId: 'embed-1',
            hostAnchorId: 'tab-1',
            name: 'Embedded Doc',
        });

        expect(snapshot).toMatchObject({
            cellData: {},
            columnCount: 1,
            columnHeader: { hidden: BooleanNumber.TRUE },
            custom: {
                [EMBED_SHEETS_TAB_CUSTOM_KEY]: {
                    embedId: 'embed-1',
                    hostAnchorId: 'tab-1',
                    version: 1,
                },
            },
            id: 'tab-1',
            name: 'Embedded Doc',
            rowCount: 1,
            rowHeader: { hidden: BooleanNumber.TRUE },
            showGridlines: BooleanNumber.FALSE,
        });
    });

    it('creates tab snapshots from descriptors and falls back to embed id as name', () => {
        expect(createEmbedSheetsTabSnapshotFromDescriptor({
            embedId: 'embed-1',
            hostAnchorId: 'tab-1',
        } as never).name).toBe('embed-1');
        expect(createEmbedSheetsTabSnapshotFromDescriptor({
            embedId: 'embed-1',
            hostAnchorId: 'tab-1',
        } as never, 'Custom Name').name).toBe('Custom Name');
    });

    it('guards custom tab data', () => {
        const customData = createEmbedSheetsTabCustomData({
            embedId: 'embed-1',
            hostAnchorId: 'tab-1',
        });

        expect(getEmbedSheetsTabCustomData({ custom: { [EMBED_SHEETS_TAB_CUSTOM_KEY]: customData } })).toEqual(customData);
        expect(isEmbedSheetsTabSnapshot({ custom: { [EMBED_SHEETS_TAB_CUSTOM_KEY]: customData } })).toBe(true);
        expect(getEmbedSheetsTabCustomData({ custom: { [EMBED_SHEETS_TAB_CUSTOM_KEY]: { version: 2 } } })).toBeUndefined();
        expect(getEmbedSheetsTabCustomData({ custom: undefined })).toBeUndefined();
        expect(isEmbedSheetsTabSnapshot({ custom: {} })).toBe(false);
    });
});

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

import { describe, expect, it } from 'vitest';
import type { ISnapshot } from '@univerjs/protocol';
import { getSheetBlocksFromSnapshot, transformSnapshotToWorkbookData, transformWorkbookDataToSnapshot } from '../snapshot-transform';

import type { ILogContext } from '../../log/context';
import type { ISnapshotServerService } from '../snapshot-server.service';
import { textDecoder } from '../snapshot-utils';
import { MockSnapshotServerService, testSheetBlocks, testSnapshot, testWorkbookData } from './snapshot-mock';

/**
 * The Uint8Array converted from the encoded string, and the encoded string converted back is different from the original one, so objects can only be used for comparison.
 * @param snapshot
 * @returns
 */
function transformSnapshotMetaToObject(snapshot: ISnapshot) {
    const workbook = snapshot.workbook;
    if (!workbook) return snapshot;

    // Loop through sheets and convert originalMeta
    Object.keys(workbook.sheets).forEach((sheetKey) => {
        const sheet = workbook.sheets[sheetKey];
        sheet.originalMeta = JSON.parse(textDecoder.decode(sheet.originalMeta)); // Reassign the converted object to originalMeta
    });

    workbook.originalMeta = JSON.parse(textDecoder.decode(workbook.originalMeta)); // Reassign the converted object to originalMeta

    return snapshot;
}

describe('Test snapshot transform', () => {
    it('Function transformWorkbookDataToSnapshot', async () => {
        const context: ILogContext = {
            metadata: undefined,
        };
        const workbookData = testWorkbookData();
        const unitID = workbookData.id;
        const rev = workbookData.rev ?? 0;

        const snapshotService: ISnapshotServerService = new MockSnapshotServerService();

        const { snapshot } = await transformWorkbookDataToSnapshot(context, workbookData, unitID, rev, snapshotService);

        const snapshotData = transformSnapshotMetaToObject(snapshot);

        expect(snapshotData).toStrictEqual(transformSnapshotMetaToObject(testSnapshot()));

        const blocks = await getSheetBlocksFromSnapshot(snapshot, snapshotService);

        expect(blocks).toStrictEqual(testSheetBlocks());
    });
    it('Function transformSnapshotToWorkbookData', () => {
        expect(transformSnapshotToWorkbookData(testSnapshot(), testSheetBlocks())).toStrictEqual(testWorkbookData());
    });
});

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

import type { IFetchMissingChangesetsRequest, IFetchMissingChangesetsResponse, IGetResourcesRequest, IGetResourcesResponse, IGetSheetBlockRequest, IGetSheetBlockResponse, IGetUnitOnRevRequest, IGetUnitOnRevResponse, ISaveChangesetRequest, ISaveChangesetResponse, ISaveSheetBlockRequest, ISaveSheetBlockResponse, ISaveSnapshotRequest, ISaveSnapshotResponse, ISheetBlock, ISnapshot } from '@univerjs/protocol';
import { ErrorCode } from '@univerjs/protocol';

import { textEncoder } from '../snapshot-utils';
import type { IWorkbookData } from '../../../types/interfaces/i-workbook-data';
import { LocaleType } from '../../../types/enum/locale-type';
import type { ILogContext } from '../../log/context';
import type { ISnapshotServerService } from '../snapshot-server.service';
import { b64DecodeUnicode } from '../../../shared/coder';

export const testSnapshot = (): ISnapshot => ({
    unitID: '100',
    type: 2,
    rev: 3,
    workbook: {
        unitID: '100',
        rev: 3,
        creator: '',
        name: 'New Sheet By Univer',
        sheetOrder: [
            'sheet-1',
        ],
        sheets: {
            'sheet-1': {
                type: 0,
                id: 'sheet-1',
                name: 'Sheet 1',
                rowCount: 1000,
                columnCount: 20,
                originalMeta: textEncoder.encode(b64DecodeUnicode('eyJmcmVlemUiOiB7InhTcGxpdCI6IDAsICJ5U3BsaXQiOiAwLCAic3RhcnRSb3ciOiAtMSwgInN0YXJ0Q29sdW1uIjogLTF9LCAiaGlkZGVuIjogMCwgInJvd0RhdGEiOiB7IjAiOiB7ImgiOiAyNywgImFoIjogMjcsICJoZCI6IDB9fSwgInRhYkNvbG9yIjogInJlZCIsICJtZXJnZURhdGEiOiBbXSwgInJvd0hlYWRlciI6IHsid2lkdGgiOiA0NiwgImhpZGRlbiI6IDB9LCAic2Nyb2xsVG9wIjogMjAwLCAiem9vbVJhdGlvIjogMSwgImNvbHVtbkRhdGEiOiB7fSwgInNjcm9sbExlZnQiOiAxMDAsICJzZWxlY3Rpb25zIjogWyJBMSJdLCAicmlnaHRUb0xlZnQiOiAwLCAiY29sdW1uSGVhZGVyIjogeyJoZWlnaHQiOiAyMCwgImhpZGRlbiI6IDB9LCAic2hvd0dyaWRsaW5lcyI6IDEsICJkZWZhdWx0Um93SGVpZ2h0IjogMjcsICJkZWZhdWx0Q29sdW1uV2lkdGgiOiA5M30=')),
            },
        },
        resources: [],
        blockMeta: {
            'sheet-1': {
                sheetID: 'sheet-1',
                blocks: [
                    '100100',
                ],
            },
        },
        originalMeta: textEncoder.encode(b64DecodeUnicode('eyJsb2NhbGUiOiAiZW5VUyIsICJzdHlsZXMiOiB7fSwgInJlc291cmNlcyI6IFtdLCAiYXBwVmVyc2lvbiI6ICIzLjAuMC1hbHBoYSJ9')),
    },
    doc: undefined,
});

export const testSheetBlocks = (): ISheetBlock[] => [
    {
        id: '100100',
        startRow: 0,
        endRow: 0,
        data: textEncoder.encode(b64DecodeUnicode('eyIwIjogeyIwIjogeyJ0IjogMiwgInYiOiAxfSwgIjEiOiB7InQiOiAyLCAidiI6IDJ9fX0=')),
    },
];

export const testWorkbookData = (): IWorkbookData => ({
    id: '100',
    sheetOrder: [
        'sheet-1',
    ],
    name: 'New Sheet By Univer',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    styles: {},
    sheets: {
        'sheet-1': {
            id: 'sheet-1',
            name: 'Sheet 1',
            rowCount: 1000,
            columnCount: 20,
            freeze: {
                xSplit: 0,
                ySplit: 0,
                startRow: -1,
                startColumn: -1,
            },
            hidden: 0,
            rowData: {
                0: {
                    h: 27,
                    ah: 27,
                    hd: 0,
                },
            },
            tabColor: 'red',
            mergeData: [],
            rowHeader: {
                width: 46,
                hidden: 0,
            },
            scrollTop: 200,
            zoomRatio: 1,
            columnData: {},
            scrollLeft: 100,
            selections: [
                'A1',
            ],
            rightToLeft: 0,
            columnHeader: {
                height: 20,
                hidden: 0,
            },
            showGridlines: 1,
            defaultRowHeight: 27,
            defaultColumnWidth: 93,
            cellData: {
                0: {
                    0: {
                        t: 2,
                        v: 1,
                    },
                    1: {
                        t: 2,
                        v: 2,
                    },
                },
            },
        },
    },
    resources: [],
    rev: 3,
});

export class MockSnapshotServerService implements ISnapshotServerService {
    /** Load snapshot from a database. */
    getUnitOnRev(context: ILogContext, params: IGetUnitOnRevRequest): Promise<IGetUnitOnRevResponse> {
        return Promise.resolve({
            snapshot: testSnapshot(),
            changesets: [],
            error: {
                code: ErrorCode.OK,
                message: '',
            },
        });
    }

    /** Load sheet block from a database.  */
    getSheetBlock(context: ILogContext, params: IGetSheetBlockRequest): Promise<IGetSheetBlockResponse> {
        return Promise.resolve({
            block: testSheetBlocks()[0],
            error: {
                code: ErrorCode.OK,
                message: '',
            },
        });
    }

    /** Fetch missing changeset */
    fetchMissingChangesets(
        context: ILogContext,
        params: IFetchMissingChangesetsRequest
    ): Promise<IFetchMissingChangesetsResponse> {
        return Promise.resolve({
            changesets: [],
            error: {
                code: ErrorCode.OK,
                message: '',
            },
        });
    }

    getResourcesRequest(context: ILogContext, params: IGetResourcesRequest): Promise<IGetResourcesResponse> {
        return Promise.resolve({
            resources: {},
            error: {
                code: ErrorCode.OK,
                message: '',
            },
        });
    }

    /** Save snapshot to a database. */
    saveSnapshot(context: ILogContext, params: ISaveSnapshotRequest): Promise<ISaveSnapshotResponse> {
        return Promise.resolve({
            error: {
                code: ErrorCode.OK,
                message: '',
            },
        });
    };

    /** Save sheet block to a database. */
    saveSheetBlock(context: ILogContext, params: ISaveSheetBlockRequest): Promise<ISaveSheetBlockResponse> {
        return Promise.resolve({
            error: {
                code: ErrorCode.OK,
                message: '',
            },
            blockID: '100100', // mock block id
        });
    };

    /** Save changeset to a database. */
    saveChangeset(context: ILogContext, params: ISaveChangesetRequest): Promise<ISaveChangesetResponse> {
        return Promise.resolve({
            error: {
                code: ErrorCode.OK,
                message: '',
            },
            concurrent: [],
        });
    };
}

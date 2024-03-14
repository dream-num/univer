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
import type { ISnapshotSheetBlockObject } from '../../../types/interfaces/snapshot';

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
        originalMeta: textEncoder.encode(b64DecodeUnicode('eyJsb2NhbGUiOiJlblVTIiwic3R5bGVzIjp7fSwiYXBwVmVyc2lvbiI6IjMuMC4wLWFscGhhIn0=')),
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

export const testSnapshotSheetBlocksString = (): ISnapshotSheetBlockObject => ({
    snapshot: {
        type: 2,
        rev: 1,
        workbook: {
            unitID: 'Os2zYdqR5V-_L9h-VXI',
            creator: 'user',
            sheetOrder: [
                'uni6',
            ],
            sheets: {
                uni6: {
                    id: 'uni6',
                    name: 'Sheet1',
                    rowCount: 9,
                    columnCount: 5,
                    originalMeta: 'eyJjb2x1bW5EYXRhIjp7fSwiZGVmYXVsdENvbHVtbldpZHRoIjo3NSwiZGVmYXVsdFJvd0hlaWdodCI6MTksImZyZWV6ZSI6eyJ4U3BsaXQiOjAsInlTcGxpdCI6MCwic3RhcnRSb3ciOi0xLCJzdGFydENvbHVtbiI6LTF9LCJoaWRkZW4iOjAsInJvd0RhdGEiOnsiMiI6eyJoIjozMX0sIjMiOnsiaCI6MzF9fSwic2VsZWN0aW9ucyI6W3sic3RhcnRSb3ciOjQsInN0YXJ0Q29sdW1uIjo0LCJlbmRSb3ciOjQsImVuZENvbHVtbiI6NCwic3RhcnRBYnNvbHV0ZVJlZlR5cGUiOjAsImVuZEFic29sdXRlUmVmVHlwZSI6MCwicmFuZ2VUeXBlIjowfV0sInNob3dHcmlkbGluZXMiOjEsInN0YXR1cyI6MSwiem9vbVJhdGlvIjoxfQ==',
                },
            },
            resources: [
                {
                    name: 'SHEET_NUMFMT_PLUGIN',
                    data: '{}',
                },
            ],
            blockMeta: {
                uni6: {
                    sheetID: 'uni6',
                    blocks: [
                        '1710313165121361009',
                    ],
                },
            },
            originalMeta: 'eyJhcHBWZXJzaW9uIjoiMTYuMDMwMCIsImNvbXBhbnkiOiIiLCJjcmVhdGVkVGltZSI6IjIwMTUtMDYtMDVUMTg6MTk6MzRaIiwibGFzdE1vZGlmaWVkQnkiOiLmtqbms70g5YiYIiwibW9kaWZpZWRUaW1lIjoiMjAyNC0wMy0wNVQxMjoxNDo1MFoiLCJzdHlsZXMiOnsiRWlVaXZyIjp7ImZmIjoi562J57q/IiwiZnMiOjE4LCJibCI6MSwiY2wiOnsicmdiIjoiIzAwMDAwMCIsInRoIjowfSwiYmciOnsicmdiIjoiI0ZGQzAwMCIsInRoIjowfX0sIklpZF8yNSI6eyJmZiI6Iuetiee6vyIsImZzIjoxMSwiY2wiOnsicmdiIjoiI0ZGMDAwMCIsInRoIjowfX0sIkpLMVJEUSI6eyJmZiI6Iuetiee6vyIsImZzIjoxMSwiY2wiOnsicmdiIjoiI0ZGMDAwMCIsInRoIjowfSwiYmciOnsicmdiIjoiI0ZGRkYwMCIsInRoIjowfX0sIlhhQVBBTyI6eyJmZiI6Iuetiee6vyIsImZzIjoxMSwiY2wiOnsicmdiIjoiI0ZGMDAwMCIsInRoIjowfSwiYmciOnsicmdiIjoiI0ZGQzAwMCIsInRoIjowfX0sIlhidVA5TSI6eyJmZiI6Iuetiee6vyIsImZzIjoxOCwiYmwiOjEsImNsIjp7InJnYiI6IiMwMDAwMDAiLCJ0aCI6MH19LCJfcnNVd2MiOnsiZmYiOiLnrYnnur8iLCJmcyI6MTEsImNsIjp7InJnYiI6IiMwMDAwMDAiLCJ0aCI6MH19LCJ1eE1KUVYiOnsiZmYiOiLnrYnnur8iLCJmcyI6MTgsImJsIjoxLCJjbCI6eyJyZ2IiOiIjMDAwMDAwIiwidGgiOjB9LCJiZyI6eyJyZ2IiOiIjRkZGRjAwIiwidGgiOjB9fSwidmVfVzRmIjp7ImZmIjoi562J57q/IiwiZnMiOjExLCJjbCI6eyJyZ2IiOiIjMDAwMDAwIiwidGgiOjB9LCJiZyI6eyJyZ2IiOiIjMDBCMDUwIiwidGgiOjB9fX19',
        },
    },
    sheetBlocks: {
        '1710313165121361009': {
            id: '1710313165121361009',
            endRow: 7,
            data: 'eyIwIjp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiSWlkXzI1In0sIjEiOnsidiI6IjEiLCJ0IjoyLCJzIjoiSWlkXzI1In0sIjIiOnsidiI6IjEiLCJ0IjoyLCJzIjoiSWlkXzI1In0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiSWlkXzI1In19LCIxIjp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiSWlkXzI1In0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoiSksxUkRRIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoiWGFBUEFPIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiSWlkXzI1In19LCIyIjp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiWGJ1UDlNIn0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoidXhNSlFWIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoiRWlVaXZyIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiWGJ1UDlNIn19LCIzIjp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiWGJ1UDlNIn0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoidXhNSlFWIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoiRWlVaXZyIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiWGJ1UDlNIn19LCI0Ijp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn19LCI1Ijp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn19LCI2Ijp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn19LCI3Ijp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn19fQ==',
        },
    },
});

export const testSnapshotSheetBlocksBuffer = (): ISnapshotSheetBlockObject => ({
    snapshot: {
        type: 2,
        rev: 1,
        workbook: {
            unitID: 'Os2zYdqR5V-_L9h-VXI',
            creator: 'user',
            sheetOrder: [
                'uni6',
            ],
            sheets: {
                uni6: {
                    id: 'uni6',
                    name: 'Sheet1',
                    rowCount: 9,
                    columnCount: 5,
                    originalMeta: textEncoder.encode(b64DecodeUnicode('eyJjb2x1bW5EYXRhIjp7fSwiZGVmYXVsdENvbHVtbldpZHRoIjo3NSwiZGVmYXVsdFJvd0hlaWdodCI6MTksImZyZWV6ZSI6eyJ4U3BsaXQiOjAsInlTcGxpdCI6MCwic3RhcnRSb3ciOi0xLCJzdGFydENvbHVtbiI6LTF9LCJoaWRkZW4iOjAsInJvd0RhdGEiOnsiMiI6eyJoIjozMX0sIjMiOnsiaCI6MzF9fSwic2VsZWN0aW9ucyI6W3sic3RhcnRSb3ciOjQsInN0YXJ0Q29sdW1uIjo0LCJlbmRSb3ciOjQsImVuZENvbHVtbiI6NCwic3RhcnRBYnNvbHV0ZVJlZlR5cGUiOjAsImVuZEFic29sdXRlUmVmVHlwZSI6MCwicmFuZ2VUeXBlIjowfV0sInNob3dHcmlkbGluZXMiOjEsInN0YXR1cyI6MSwiem9vbVJhdGlvIjoxfQ==')),
                },
            },
            resources: [
                {
                    name: 'SHEET_NUMFMT_PLUGIN',
                    data: '{}',
                },
            ],
            blockMeta: {
                uni6: {
                    sheetID: 'uni6',
                    blocks: [
                        '1710313165121361009',
                    ],
                },
            },
            originalMeta: textEncoder.encode(b64DecodeUnicode('eyJhcHBWZXJzaW9uIjoiMTYuMDMwMCIsImNvbXBhbnkiOiIiLCJjcmVhdGVkVGltZSI6IjIwMTUtMDYtMDVUMTg6MTk6MzRaIiwibGFzdE1vZGlmaWVkQnkiOiLmtqbms70g5YiYIiwibW9kaWZpZWRUaW1lIjoiMjAyNC0wMy0wNVQxMjoxNDo1MFoiLCJzdHlsZXMiOnsiRWlVaXZyIjp7ImZmIjoi562J57q/IiwiZnMiOjE4LCJibCI6MSwiY2wiOnsicmdiIjoiIzAwMDAwMCIsInRoIjowfSwiYmciOnsicmdiIjoiI0ZGQzAwMCIsInRoIjowfX0sIklpZF8yNSI6eyJmZiI6Iuetiee6vyIsImZzIjoxMSwiY2wiOnsicmdiIjoiI0ZGMDAwMCIsInRoIjowfX0sIkpLMVJEUSI6eyJmZiI6Iuetiee6vyIsImZzIjoxMSwiY2wiOnsicmdiIjoiI0ZGMDAwMCIsInRoIjowfSwiYmciOnsicmdiIjoiI0ZGRkYwMCIsInRoIjowfX0sIlhhQVBBTyI6eyJmZiI6Iuetiee6vyIsImZzIjoxMSwiY2wiOnsicmdiIjoiI0ZGMDAwMCIsInRoIjowfSwiYmciOnsicmdiIjoiI0ZGQzAwMCIsInRoIjowfX0sIlhidVA5TSI6eyJmZiI6Iuetiee6vyIsImZzIjoxOCwiYmwiOjEsImNsIjp7InJnYiI6IiMwMDAwMDAiLCJ0aCI6MH19LCJfcnNVd2MiOnsiZmYiOiLnrYnnur8iLCJmcyI6MTEsImNsIjp7InJnYiI6IiMwMDAwMDAiLCJ0aCI6MH19LCJ1eE1KUVYiOnsiZmYiOiLnrYnnur8iLCJmcyI6MTgsImJsIjoxLCJjbCI6eyJyZ2IiOiIjMDAwMDAwIiwidGgiOjB9LCJiZyI6eyJyZ2IiOiIjRkZGRjAwIiwidGgiOjB9fSwidmVfVzRmIjp7ImZmIjoi562J57q/IiwiZnMiOjExLCJjbCI6eyJyZ2IiOiIjMDAwMDAwIiwidGgiOjB9LCJiZyI6eyJyZ2IiOiIjMDBCMDUwIiwidGgiOjB9fX19')),
        },
    },
    sheetBlocks: {
        '1710313165121361009': {
            id: '1710313165121361009',
            endRow: 7,
            data: textEncoder.encode(b64DecodeUnicode('eyIwIjp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiSWlkXzI1In0sIjEiOnsidiI6IjEiLCJ0IjoyLCJzIjoiSWlkXzI1In0sIjIiOnsidiI6IjEiLCJ0IjoyLCJzIjoiSWlkXzI1In0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiSWlkXzI1In19LCIxIjp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiSWlkXzI1In0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoiSksxUkRRIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoiWGFBUEFPIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiSWlkXzI1In19LCIyIjp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiWGJ1UDlNIn0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoidXhNSlFWIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoiRWlVaXZyIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiWGJ1UDlNIn19LCIzIjp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiWGJ1UDlNIn0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoidXhNSlFWIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoiRWlVaXZyIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiWGJ1UDlNIn19LCI0Ijp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn19LCI1Ijp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn19LCI2Ijp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn19LCI3Ijp7IjAiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn0sIjEiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjIiOnsidiI6IjIiLCJ0IjoyLCJzIjoidmVfVzRmIn0sIjMiOnsidiI6IjEiLCJ0IjoyLCJzIjoiX3JzVXdjIn19fQ==')),
        },
    },
});

export const testSnapshotSheetBlocksObject = (): ISnapshotSheetBlockObject => ({
    snapshot: {
        type: 2,
        rev: 1,
        workbook: {
            unitID: 'Os2zYdqR5V-_L9h-VXI',
            creator: 'user',
            sheetOrder: [
                'uni6',
            ],
            sheets: {
                uni6: {
                    id: 'uni6',
                    name: 'Sheet1',
                    rowCount: 9,
                    columnCount: 5,
                    originalMeta: {
                        columnData: {},
                        defaultColumnWidth: 75,
                        defaultRowHeight: 19,
                        freeze: {
                            xSplit: 0,
                            ySplit: 0,
                            startRow: -1,
                            startColumn: -1,
                        },
                        hidden: 0,
                        rowData: {
                            2: {
                                h: 31,
                            },
                            3: {
                                h: 31,
                            },
                        },
                        selections: [
                            {
                                startRow: 4,
                                startColumn: 4,
                                endRow: 4,
                                endColumn: 4,
                                startAbsoluteRefType: 0,
                                endAbsoluteRefType: 0,
                                rangeType: 0,
                            },
                        ],
                        showGridlines: 1,
                        status: 1,
                        zoomRatio: 1,
                    },
                    type: 0,
                },
            },
            resources: [
                {
                    name: 'SHEET_NUMFMT_PLUGIN',
                    data: '{}',
                },
            ],
            blockMeta: {
                uni6: {
                    sheetID: 'uni6',
                    blocks: [
                        '1710313165121361009',
                    ],
                },
            },
            originalMeta: {
                appVersion: '16.0300',
                company: '',
                createdTime: '2015-06-05T18:19:34Z',
                lastModifiedBy: '润泽 刘',
                modifiedTime: '2024-03-05T12:14:50Z',
                styles: {
                    EiUivr: {
                        ff: '等线',
                        fs: 18,
                        bl: 1,
                        cl: {
                            rgb: '#000000',
                            th: 0,
                        },
                        bg: {
                            rgb: '#FFC000',
                            th: 0,
                        },
                    },
                    Iid_25: {
                        ff: '等线',
                        fs: 11,
                        cl: {
                            rgb: '#FF0000',
                            th: 0,
                        },
                    },
                    JK1RDQ: {
                        ff: '等线',
                        fs: 11,
                        cl: {
                            rgb: '#FF0000',
                            th: 0,
                        },
                        bg: {
                            rgb: '#FFFF00',
                            th: 0,
                        },
                    },
                    XaAPAO: {
                        ff: '等线',
                        fs: 11,
                        cl: {
                            rgb: '#FF0000',
                            th: 0,
                        },
                        bg: {
                            rgb: '#FFC000',
                            th: 0,
                        },
                    },
                    XbuP9M: {
                        ff: '等线',
                        fs: 18,
                        bl: 1,
                        cl: {
                            rgb: '#000000',
                            th: 0,
                        },
                    },
                    _rsUwc: {
                        ff: '等线',
                        fs: 11,
                        cl: {
                            rgb: '#000000',
                            th: 0,
                        },
                    },
                    uxMJQV: {
                        ff: '等线',
                        fs: 18,
                        bl: 1,
                        cl: {
                            rgb: '#000000',
                            th: 0,
                        },
                        bg: {
                            rgb: '#FFFF00',
                            th: 0,
                        },
                    },
                    ve_W4f: {
                        ff: '等线',
                        fs: 11,
                        cl: {
                            rgb: '#000000',
                            th: 0,
                        },
                        bg: {
                            rgb: '#00B050',
                            th: 0,
                        },
                    },
                },
            },
        },
    },
    sheetBlocks: {
        '1710313165121361009': {
            id: '1710313165121361009',
            endRow: 7,
            data: {
                0: {
                    0: {
                        v: '1',
                        t: 2,
                        s: 'Iid_25',
                    },
                    1: {
                        v: '1',
                        t: 2,
                        s: 'Iid_25',
                    },
                    2: {
                        v: '1',
                        t: 2,
                        s: 'Iid_25',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: 'Iid_25',
                    },
                },
                1: {
                    0: {
                        v: '1',
                        t: 2,
                        s: 'Iid_25',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 'JK1RDQ',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 'XaAPAO',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: 'Iid_25',
                    },
                },
                2: {
                    0: {
                        v: '1',
                        t: 2,
                        s: 'XbuP9M',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 'uxMJQV',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 'EiUivr',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: 'XbuP9M',
                    },
                },
                3: {
                    0: {
                        v: '1',
                        t: 2,
                        s: 'XbuP9M',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 'uxMJQV',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 'EiUivr',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: 'XbuP9M',
                    },
                },
                4: {
                    0: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                },
                5: {
                    0: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                },
                6: {
                    0: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                },
                7: {
                    0: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                },
            },
        },
    },
} as ISnapshotSheetBlockObject);

export const testConvertedWorkbookData = (): IWorkbookData => ({
    id: 'Os2zYdqR5V-_L9h-VXI',
    rev: 1,
    name: '',
    locale: LocaleType.EN_US,
    sheetOrder: [
        'uni6',
    ],
    appVersion: '16.0300',
    sheets: {
        uni6: {
            id: 'uni6',
            name: 'Sheet1',
            rowCount: 9,
            columnCount: 5,
            columnData: {},
            defaultColumnWidth: 75,
            defaultRowHeight: 19,
            freeze: {
                xSplit: 0,
                ySplit: 0,
                startRow: -1,
                startColumn: -1,
            },
            hidden: 0,
            rowData: {
                2: {
                    h: 31,
                },
                3: {
                    h: 31,
                },
            },
            selections: [
                {
                    startRow: 4,
                    startColumn: 4,
                    endRow: 4,
                    endColumn: 4,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
            ],
            showGridlines: 1,
            status: 1,
            zoomRatio: 1,
            cellData: {
                0: {
                    0: {
                        v: '1',
                        t: 2,
                        s: 'Iid_25',
                    },
                    1: {
                        v: '1',
                        t: 2,
                        s: 'Iid_25',
                    },
                    2: {
                        v: '1',
                        t: 2,
                        s: 'Iid_25',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: 'Iid_25',
                    },
                },
                1: {
                    0: {
                        v: '1',
                        t: 2,
                        s: 'Iid_25',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 'JK1RDQ',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 'XaAPAO',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: 'Iid_25',
                    },
                },
                2: {
                    0: {
                        v: '1',
                        t: 2,
                        s: 'XbuP9M',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 'uxMJQV',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 'EiUivr',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: 'XbuP9M',
                    },
                },
                3: {
                    0: {
                        v: '1',
                        t: 2,
                        s: 'XbuP9M',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 'uxMJQV',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 'EiUivr',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: 'XbuP9M',
                    },
                },
                4: {
                    0: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                },
                5: {
                    0: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                },
                6: {
                    0: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                },
                7: {
                    0: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                    1: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    2: {
                        v: '2',
                        t: 2,
                        s: 've_W4f',
                    },
                    3: {
                        v: '1',
                        t: 2,
                        s: '_rsUwc',
                    },
                },
            },
        },
    },
    styles: {
        EiUivr: {
            ff: '等线',
            fs: 18,
            bl: 1,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#FFC000',
                th: 0,
            },
        },
        Iid_25: {
            ff: '等线',
            fs: 11,
            cl: {
                rgb: '#FF0000',
                th: 0,
            },
        },
        JK1RDQ: {
            ff: '等线',
            fs: 11,
            cl: {
                rgb: '#FF0000',
                th: 0,
            },
            bg: {
                rgb: '#FFFF00',
                th: 0,
            },
        },
        XaAPAO: {
            ff: '等线',
            fs: 11,
            cl: {
                rgb: '#FF0000',
                th: 0,
            },
            bg: {
                rgb: '#FFC000',
                th: 0,
            },
        },
        XbuP9M: {
            ff: '等线',
            fs: 18,
            bl: 1,
            cl: {
                rgb: '#000000',
                th: 0,
            },
        },
        _rsUwc: {
            ff: '等线',
            fs: 11,
            cl: {
                rgb: '#000000',
                th: 0,
            },
        },
        uxMJQV: {
            ff: '等线',
            fs: 18,
            bl: 1,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#FFFF00',
                th: 0,
            },
        },
        ve_W4f: {
            ff: '等线',
            fs: 11,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#00B050',
                th: 0,
            },
        },
    },
    resources: [
        {
            name: 'SHEET_NUMFMT_PLUGIN',
            data: '{}',
        },
    ],
    company: '',
    createdTime: '2015-06-05T18:19:34Z',
    lastModifiedBy: '润泽 刘',
    modifiedTime: '2024-03-05T12:14:50Z',
} as IWorkbookData);
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

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

import { describe, expect, it } from 'vitest';
import { isCellV, isICellData, isNullCell } from '../typedef';

const DOCUMENT_DATA = {
    id: 'd',
    body: {
        dataStream: 'No.2824163\r\n',
        textRuns: [
            {
                st: 0,
                ed: 2,
                ts: {
                    cl: {
                        rgb: '#000',
                    },
                    fs: 20,
                },
            },
            {
                st: 3,
                ed: 10,
                ts: {
                    cl: {
                        rgb: 'rgb(255, 0, 0)',
                    },
                    fs: 20,
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 10,
            },
        ],
    },
    documentStyle: {
        pageSize: {
            width: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
        },
        marginTop: 0,
        marginBottom: 0,
        marginRight: 2,
        marginLeft: 2,
    },
};

describe('Test cell data', () => {
    it('Function isICellData', () => {
        expect(isICellData({ s: '1' })).toBeTruthy();
        expect(isICellData({ p: { id: '1' } })).toBeTruthy();
        expect(isICellData({ v: '1' })).toBeTruthy();
        expect(isICellData({ f: '=SUM(1)' })).toBeTruthy();
        expect(isICellData({ si: '1' })).toBeTruthy();
        expect(isICellData({ t: 1 })).toBeTruthy();
        expect(isICellData({ custom: {} })).toBeTruthy();

        expect(isICellData({ a: '1' })).toBeFalsy();
        expect(isICellData(null)).toBeFalsy();
        expect(isICellData(undefined)).toBeFalsy();
        expect(isICellData({})).toBeFalsy();
    });

    it('Function isCellV', () => {
        expect(isCellV('1')).toBeTruthy();
        expect(isCellV(1)).toBeTruthy();
        expect(isCellV(true)).toBeTruthy();

        expect(isCellV({ v: '1' })).toBeFalsy();
        expect(isCellV(null)).toBeFalsy();
        expect(isCellV(undefined)).toBeFalsy();
        expect(isCellV({})).toBeFalsy();
    });

    it('Function isNullCell', () => {
        expect(isNullCell(null)).toBeTruthy();
        expect(isNullCell(undefined)).toBeTruthy();
        expect(isNullCell({ v: null })).toBeTruthy();
        expect(isNullCell({ v: undefined })).toBeTruthy();
        expect(isNullCell({ v: '' })).toBeTruthy();
        expect(isNullCell({ p: null })).toBeTruthy();
        expect(isNullCell({ p: undefined })).toBeTruthy();
        expect(isNullCell({ f: null })).toBeTruthy();
        expect(isNullCell({ f: undefined })).toBeTruthy();
        expect(isNullCell({ f: '' })).toBeTruthy();
        expect(isNullCell({ si: null })).toBeTruthy();
        expect(isNullCell({ si: undefined })).toBeTruthy();
        expect(isNullCell({ si: '' })).toBeTruthy();

        expect(isNullCell({ v: 1 })).toBeFalsy();
        expect(isNullCell({ p: DOCUMENT_DATA })).toBeFalsy();
        expect(isNullCell({ f: '=SUM(A1)' })).toBeFalsy();
        expect(isNullCell({ si: 'id1' })).toBeFalsy();
    });
});

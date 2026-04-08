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
import { BaselineOffset, BooleanNumber, HorizontalAlign, VerticalAlign, WrapStrategy } from '../../types/enum';
import { CustomRangeType } from '../../types/interfaces';
import {
    addLinkToDocumentModel,
    createDocumentModelWithStyle,
    extractOtherStyle,
    getEmptyCell,
    getFontFormat,
    isNotNullOrUndefined,
    isRangesEqual,
    isUnitRangesEqual,
} from '../util';

describe('sheet util helpers', () => {
    it('should create document models with cell styles and render config', () => {
        const documentModel = createDocumentModelWithStyle('Cell', { ff: 'Inter', fs: 12, va: BaselineOffset.SUPERSCRIPT }, {
            textRotation: { a: 35 },
            horizontalAlign: HorizontalAlign.CENTER,
            verticalAlign: VerticalAlign.MIDDLE,
            wrapStrategy: WrapStrategy.WRAP,
            paddingData: { t: 1, r: 4, b: 3, l: 2 },
        });

        expect(documentModel.getBody()).toMatchObject({
            dataStream: 'Cell\r\n',
            textRuns: [{ st: 0, ed: 4, ts: { ff: 'Inter', fs: 12, va: BaselineOffset.SUPERSCRIPT } }],
            paragraphs: [{ startIndex: 4, paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER } }],
        });
        expect(documentModel.getSnapshot().documentStyle).toMatchObject({
            marginTop: 1,
            marginRight: 4,
            marginBottom: 3,
            marginLeft: 2,
            renderConfig: {
                horizontalAlign: HorizontalAlign.CENTER,
                verticalAlign: VerticalAlign.MIDDLE,
                centerAngle: 0,
                vertexAngle: 35,
                wrapStrategy: WrapStrategy.WRAP,
            },
        });
        expect(documentModel.getDrawingsOrder()).toEqual([]);
    });

    it('should extract cell style fragments and enrich document links once', () => {
        const style = {
            ff: 'Inter',
            fs: 14,
            it: BooleanNumber.TRUE,
            bl: BooleanNumber.TRUE,
            ul: { s: BooleanNumber.TRUE },
            st: { s: BooleanNumber.TRUE },
            ol: { s: BooleanNumber.TRUE },
            cl: { rgb: '#123456' },
            tr: { a: 45 },
            td: 1,
            ht: HorizontalAlign.RIGHT,
            vt: VerticalAlign.BOTTOM,
            tb: WrapStrategy.WRAP,
            pd: { t: 1, r: 2, b: 3, l: 4 },
        } as const;
        const documentModel = createDocumentModelWithStyle('Link', { ff: 'Inter' }, {});

        expect(extractOtherStyle(style)).toEqual({
            textRotation: { a: 45 },
            textDirection: 1,
            horizontalAlign: HorizontalAlign.RIGHT,
            verticalAlign: VerticalAlign.BOTTOM,
            wrapStrategy: WrapStrategy.WRAP,
            paddingData: { t: 1, r: 2, b: 3, l: 4 },
        });
        expect(getFontFormat(style)).toEqual({
            ff: 'Inter',
            fs: 14,
            it: BooleanNumber.TRUE,
            bl: BooleanNumber.TRUE,
            ul: { s: BooleanNumber.TRUE },
            st: { s: BooleanNumber.TRUE },
            ol: { s: BooleanNumber.TRUE },
            cl: { rgb: '#123456' },
        });

        addLinkToDocumentModel(documentModel, 'https://univer.ai', 'link-1');
        addLinkToDocumentModel(documentModel, 'https://univer.ai/ignored', 'link-2');

        expect(documentModel.getBody()?.customRanges).toHaveLength(1);
        expect(documentModel.getBody()?.customRanges?.[0]).toMatchObject({
            rangeType: CustomRangeType.HYPERLINK,
            properties: { url: 'https://univer.ai', refId: 'link-1' },
        });
    });

    it('should compare ranges and expose empty-cell helpers', () => {
        expect(isRangesEqual(
            [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
            [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }]
        )).toBe(true);
        expect(isRangesEqual(
            [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
            [{ startRow: 1, endRow: 1, startColumn: 0, endColumn: 1 }]
        )).toBe(false);
        expect(isUnitRangesEqual(
            [{ unitId: 'u1', sheetId: 's1', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } }],
            [{ unitId: 'u1', sheetId: 's1', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } }]
        )).toBe(true);
        expect(isUnitRangesEqual(
            [{ unitId: 'u1', sheetId: 's1', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } }],
            [{ unitId: 'u2', sheetId: 's1', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } }]
        )).toBe(false);
        expect(isNotNullOrUndefined(0)).toBe(true);
        expect(isNotNullOrUndefined(undefined)).toBe(false);
        expect(getEmptyCell()).toEqual({
            p: null,
            s: null,
            v: null,
            t: null,
            f: null,
            si: null,
            ref: null,
            xf: null,
        });
    });
});

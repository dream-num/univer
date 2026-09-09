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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import { DocumentFlavor, LocaleType, Tools, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setupRenderTestEnv } from '../../../__tests__/render-test-utils';
import { FontCache } from '../../docs/layout/shaping-engine/font-cache';
import { getGeneralNumberDisplayText, SpreadsheetSkeleton } from '../sheet.render-skeleton';

describe('Rich-text render snapshot isolation', () => {
    it.each(['font cache', 'row height', 'column width'])(
        'does not rewrite persisted rich text while calculating %s',
        (path) => {
            const environment = setupRenderTestEnv();
            const univer = new Univer({ locale: LocaleType.EN_US });
            const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: 'rich-render-isolation',
                sheetOrder: ['sheet'],
                sheets: {
                    sheet: {
                        id: 'sheet',
                        name: 'Sheet',
                        rowCount: 10,
                        columnCount: 10,
                        cellData: {
                            0: {
                                0: {
                                    v: '中文😀',
                                    p: {
                                        id: 'rich-cell',
                                        documentStyle: {
                                            documentFlavor: DocumentFlavor.TRADITIONAL,
                                            pageSize: { width: 37, height: 80 },
                                            marginTop: 7,
                                        },
                                        body: {
                                            dataStream: '中文😀\r\n',
                                            paragraphs: [{ startIndex: 4, paragraphId: 'paragraph' }],
                                            sectionBreaks: [{ startIndex: 5, sectionId: 'section' }],
                                            textRuns: [{ st: 0, ed: 2, ts: { bl: 1 } }],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            const worksheet = workbook.getActiveSheet()!;
            const skeleton = univer.__getInjector().createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles());
            try {
                skeleton.calculate();
                const before = Tools.deepClone(workbook.getSnapshot());
                const cell = worksheet.getCellRaw(0, 0)!;
                if (path === 'font cache') {
                    skeleton._setFontStylesCache(0, 0, cell, {}, false);
                    expect(skeleton.stylesCache.fontMatrix.getValue(0, 0)?.documentSkeleton).toBeDefined();
                } else if (path === 'row height') {
                    expect(skeleton.calculateAutoHeightForCell(0, 0)).toBeGreaterThan(0);
                } else {
                    expect(skeleton._getMeasuredWidthByCell(cell, 0, 0, 0)).toBeGreaterThan(0);
                }
                expect(workbook.getSnapshot()).toEqual(before);
            } finally {
                skeleton.dispose();
                univer.dispose();
                environment.restore();
            }
        }
    );
});

describe('General number display', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('uses the most precise scientific notation that fits a narrow column', () => {
        vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text) => ({
            fontBoundingBoxAscent: 0,
            fontBoundingBoxDescent: 0,
            actualBoundingBoxAscent: 0,
            actualBoundingBoxDescent: 0,
            width: text.length * 7,
        }));

        expect(getGeneralNumberDisplayText(148706409, '148706409', '13.33px SimSun', 66)).toBe('1.49E+08');
        expect(getGeneralNumberDisplayText(209501025, '209501025', '13.33px SimSun', 66)).toBe('2.1E+08');
        expect(getGeneralNumberDisplayText(800510403, '800510403', '13.33px SimSun', 66)).toBe('8.01E+08');
        expect(getGeneralNumberDisplayText(148706409, '148706409', '13.33px SimSun', 70)).toBe('148706409');
    });
});

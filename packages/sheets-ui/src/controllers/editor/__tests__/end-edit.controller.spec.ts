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

import type { IDocumentData, Univer, Workbook } from '@univerjs/core';
import { IContextService, LocaleService } from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getCellDataByInput } from '../end-edit.controller';
import { createTestBed } from './create-test-bed';

const richTextDemo: IDocumentData = {
    id: 'd',
    body: {
        dataStream: 'Instructions: ①Project division - Fill in the specific division of labor after the project is disassembled: ②Responsible Person - Enter the responsible person\'s name here: ③Date-The specific execution time of the project (detailed to the date of a certain month), and the gray color block marks the planned real-time time of the division of labor of the project (for example, the specific execution time of [regional scene model arrangement and construction] is the 2 days marked in gray. \r\n',
        textRuns: [
            {
                st: 0,
                ed: 488,
                ts: {
                    cl: {
                        rgb: 'rgb(92,92,92)',
                    },
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 489,
                paragraphStyle: {
                    horizontalAlign: 0,
                    spaceAbove: 10,
                    lineSpacing: 1.2,
                },
            },
        ],
    },
    documentStyle: {
        pageSize: {
            width: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
        },
        renderConfig: {
            centerAngle: 0,
            horizontalAlign: 0,
            vertexAngle: 0,
            verticalAlign: 0,
            wrapStrategy: 0,
        },
        marginTop: 0,
        marginBottom: 0,
        marginRight: 2,
        marginLeft: 2,
    },
};

describe('Test EndEditController', () => {
    let univer: Univer;
    let workbook: Workbook;
    let get: Injector['get'];
    let localeService: LocaleService;
    let contextService: IContextService;
    let lexerTreeBuilder: LexerTreeBuilder;
    let spreadsheetSkeleton: SpreadsheetSkeleton;

    beforeEach(() => {
        const testBed = createTestBed();

        univer = testBed.univer;
        workbook = testBed.sheet;
        get = testBed.get;

        localeService = get(LocaleService);
        contextService = get(IContextService);
        lexerTreeBuilder = new LexerTreeBuilder();

        const worksheet = workbook.getActiveSheet();
        const config = worksheet.getConfig();
        spreadsheetSkeleton = new SpreadsheetSkeleton(
            worksheet,
            config,
            worksheet.getCellMatrix(),
            workbook.getStyles(),
            localeService,
            contextService
        );
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('getCellDataByInput', () => {
        it('normal cell', () => {
            const cell = {
                v: 1,
            };

            const inputCell = {
                v: 2,
            };

            const documentLayoutObject = spreadsheetSkeleton.getCellDocumentModelWithFormula(inputCell);
            if (!documentLayoutObject) {
                expect(documentLayoutObject).not.toBeUndefined();
                return;
            }

            const cellData = getCellDataByInput(cell, documentLayoutObject, lexerTreeBuilder);
            expect(cellData).toEqual({ v: '2', f: null, si: null, p: null });
        });
        it('rich text cell', () => {
            const cell = {
                v: 1,
            };
            const inputCell = {
                p: richTextDemo,
            };

            const documentLayoutObject = spreadsheetSkeleton.getCellDocumentModelWithFormula(inputCell);
            if (!documentLayoutObject) {
                expect(documentLayoutObject).not.toBeUndefined();
                return;
            }

            const cellData = getCellDataByInput(cell, documentLayoutObject, lexerTreeBuilder);
            expect(cellData).toEqual({ v: null, f: null, si: null, p: richTextDemo });
        });
        it('formula cell', () => {
            const cell = {
                v: 1,
            };
            const inputCell = {
                f: '=SUM(1)',
            };

            const documentLayoutObject = spreadsheetSkeleton.getCellDocumentModelWithFormula(inputCell);
            if (!documentLayoutObject) {
                expect(documentLayoutObject).not.toBeUndefined();
                return;
            }

            const cellData = getCellDataByInput(cell, documentLayoutObject, lexerTreeBuilder);
            expect(cellData).toEqual({ v: null, f: '=SUM(1)', p: null });
        });
        it('clear formula cell', () => {
            const cell = {
                f: '=H18:H25',
                v: 0,
                t: 2,
            };
            const inputCell = {
                v: '',
            };

            const documentLayoutObject = spreadsheetSkeleton.getCellDocumentModelWithFormula(inputCell);
            if (!documentLayoutObject) {
                expect(documentLayoutObject).not.toBeUndefined();
                return;
            }

            const cellData = getCellDataByInput(cell, documentLayoutObject, lexerTreeBuilder);
            expect(cellData).toEqual({ v: '', f: null, si: null, p: null, t: 2 });
        });
    });
});

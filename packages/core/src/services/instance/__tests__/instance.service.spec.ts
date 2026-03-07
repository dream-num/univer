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

import type { IWorkbookData } from '../../../sheets/typedef';
import type { Workbook } from '../../../sheets/workbook';
import type { IDocumentData } from '../../../types/interfaces/i-document-data';
import type { ISlideData } from '../../../types/interfaces/i-slide-data';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Injector } from '../../../common/di';
import { UniverInstanceType } from '../../../common/unit';
import { DocumentDataModel } from '../../../docs/data-model/document-data-model';
import { Workbook as WorkbookModel } from '../../../sheets/workbook';
import { SlideDataModel } from '../../../slides/slide-model';
import { FOCUSING_DOC, FOCUSING_SHEET, FOCUSING_SLIDE, FOCUSING_UNIT } from '../../context/context';
import { ContextService } from '../../context/context.service';
import { DesktopLogService, LogLevel } from '../../log/log.service';
import { UniverInstanceService } from '../instance.service';

function createWorkbookData(id = 'sheet-unit'): Partial<IWorkbookData> {
    return {
        id,
        name: 'Workbook',
        styles: {},
        sheetOrder: ['sheet-1'],
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                name: 'Sheet1',
                cellData: {},
                rowCount: 5,
                columnCount: 5,
            },
        },
    };
}

function createDocData(id = 'doc-unit'): Partial<IDocumentData> {
    return {
        id,
        body: { dataStream: 'Hello\r\n' },
        documentStyle: {
            pageSize: { width: 100, height: 100 },
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
        },
    };
}

function createSlideData(id = 'slide-unit'): Partial<ISlideData> {
    return {
        id,
        title: 'Slide',
        body: { pages: {}, pageOrder: [] },
    };
}

describe('UniverInstanceService', () => {
    let service: UniverInstanceService;
    let contextService: ContextService;
    let logService: DesktopLogService;

    beforeEach(() => {
        contextService = new ContextService();
        logService = new DesktopLogService();
        logService.setLogLevel(LogLevel.SILENT);
        service = new UniverInstanceService(new Injector(), contextService, logService);

        service.registerCtorForType(UniverInstanceType.UNIVER_SHEET, WorkbookModel as never);
        service.registerCtorForType(UniverInstanceType.UNIVER_DOC, DocumentDataModel as never);
        service.registerCtorForType(UniverInstanceType.UNIVER_SLIDE, SlideDataModel as never);
        service.__setCreateHandler((type, data, _ctor, options) => {
            let unit;
            if (type === UniverInstanceType.UNIVER_SHEET) {
                unit = new WorkbookModel(data as Partial<IWorkbookData>, logService);
            } else if (type === UniverInstanceType.UNIVER_DOC) {
                unit = new DocumentDataModel(data as Partial<IDocumentData>);
            } else {
                unit = new SlideDataModel(data as Partial<ISlideData>);
            }

            service.__addUnit(unit, options);
            return unit;
        });
    });

    afterEach(() => {
        service.dispose();
        contextService.dispose();
        logService.dispose();
    });

    it('should create units, set current unit and expose lookup APIs', () => {
        const added: string[] = [];
        service.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((unit) => {
            added.push(unit.getUnitId());
        });

        const workbook = service.createUnit<Partial<IWorkbookData>, WorkbookModel>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
        const doc = service.createUnit<Partial<IDocumentData>, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createDocData(), { makeCurrent: false });

        expect(added).toEqual(['sheet-unit']);
        expect(workbook.getUnitId()).toBe('sheet-unit');
        expect(service.getCurrentUnitOfType<WorkbookModel>(UniverInstanceType.UNIVER_SHEET)?.getUnitId()).toBe('sheet-unit');
        expect(service.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)).toBeUndefined();
        expect(service.getUnit<WorkbookModel>('sheet-unit', UniverInstanceType.UNIVER_SHEET)?.getUnitId()).toBe('sheet-unit');
        expect(service.getUnit('sheet-unit', UniverInstanceType.UNIVER_DOC)).toBeNull();
        expect(service.getAllUnitsForType<WorkbookModel>(UniverInstanceType.UNIVER_SHEET)).toHaveLength(1);
        expect(service.getUnitType(doc.getUnitId())).toBe(UniverInstanceType.UNIVER_DOC);
        expect(service.getUnitType('missing')).toBe(UniverInstanceType.UNRECOGNIZED);
    });

    it('should focus sheet, doc, slide and reset contexts on null focus', () => {
        const workbook = service.createUnit<Partial<IWorkbookData>, WorkbookModel>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
        const doc = service.createUnit<Partial<IDocumentData>, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createDocData());
        const slide = service.createUnit<Partial<ISlideData>, SlideDataModel>(UniverInstanceType.UNIVER_SLIDE, createSlideData());

        service.focusUnit(workbook.getUnitId());
        expect(contextService.getContextValue(FOCUSING_UNIT)).toBe(true);
        expect(contextService.getContextValue(FOCUSING_SHEET)).toBe(true);
        expect(contextService.getContextValue(FOCUSING_DOC)).toBe(false);

        service.focusUnit(doc.getUnitId());
        expect(service.getFocusedUnit()?.getUnitId()).toBe(doc.getUnitId());
        expect(contextService.getContextValue(FOCUSING_DOC)).toBe(true);
        expect(contextService.getContextValue(FOCUSING_SHEET)).toBe(false);

        service.focusUnit(slide.getUnitId());
        expect(contextService.getContextValue(FOCUSING_SLIDE)).toBe(true);
        expect(contextService.getContextValue(FOCUSING_DOC)).toBe(false);

        service.focusUnit(null);
        expect(service.getFocusedUnit()).toBeNull();
        expect(contextService.getContextValue(FOCUSING_UNIT)).toBe(false);
        expect(contextService.getContextValue(FOCUSING_DOC)).toBe(false);
        expect(contextService.getContextValue(FOCUSING_SHEET)).toBe(false);
        expect(contextService.getContextValue(FOCUSING_SLIDE)).toBe(false);
    });

    it('should replace docs and dispose units while resetting focus and current', () => {
        const disposed: string[] = [];
        service.getTypeOfUnitDisposed$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).subscribe((unit) => {
            disposed.push(unit.getUnitId());
        });

        const doc = service.createUnit<Partial<IDocumentData>, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createDocData());
        service.focusUnit(doc.getUnitId());

        const replacement = new DocumentDataModel(createDocData('doc-unit'));
        service.changeDoc(doc.getUnitId(), replacement);
        expect(service.getUniverDocInstance('doc-unit')).toBe(replacement);

        expect(service.disposeUnit('doc-unit')).toBe(true);
        expect(disposed).toEqual(['doc-unit']);
        expect(service.getCurrentUniverDocInstance()).toBeNull();
        expect(service.getFocusedUnit()).toBeUndefined();
        expect(service.disposeUnit('missing')).toBe(false);
    });

    it('should throw on duplicate unit id and support current type stream', () => {
        const currentIds: Array<string | null> = [];
        service.getCurrentTypeOfUnit$<WorkbookModel>(UniverInstanceType.UNIVER_SHEET).subscribe((unit) => {
            currentIds.push(unit?.getUnitId() ?? null);
        });

        service.createUnit<Partial<IWorkbookData>, WorkbookModel>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
        service.createUnit<Partial<IWorkbookData>, WorkbookModel>(UniverInstanceType.UNIVER_SHEET, createWorkbookData('sheet-unit-2'));
        service.setCurrentUnitForType('sheet-unit-2');

        expect(() => service.__addUnit(new WorkbookModel(createWorkbookData('sheet-unit-2'), logService))).toThrowError(/same unit id/);
        expect(() => service.setCurrentUnitForType('missing')).toThrowError(/no document with unitId missing/);
        expect(currentIds).toContain('sheet-unit');
        expect(currentIds).toContain('sheet-unit-2');
    });
});

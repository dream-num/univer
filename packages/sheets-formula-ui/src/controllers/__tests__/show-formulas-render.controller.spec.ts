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

import type { ICellData, IUniverInstanceService, Nullable } from '@univerjs/core';
import { CellValueType, InterceptorEffectEnum } from '@univerjs/core';
import { INTERCEPTOR_POINT } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetsShowFormulasService } from '../../services/show-formulas.service';
import { ShowFormulasRenderController } from '../show-formulas-render.controller';

interface ICellInterceptor {
    priority: number;
    effect: InterceptorEffectEnum;
    handler: (
        cell: Nullable<ICellData>,
        pos: { unitId: string; subUnitId: string; row: number; col: number; rawData: Nullable<ICellData> },
        next: (cell: Nullable<ICellData>) => Nullable<ICellData>
    ) => Nullable<ICellData>;
}

function createTestBed(options: { currentSheetId?: string } = {}) {
    const service = new SheetsShowFormulasService({
        getTypeOfUnitDisposed$: () => new Subject().asObservable(),
    } as unknown as IUniverInstanceService);

    let interceptor: ICellInterceptor | undefined;
    const sheetInterceptorService = {
        intercept: vi.fn((_point, config: ICellInterceptor) => {
            interceptor = config;
            return { dispose: vi.fn() };
        }),
    };

    const formulaDataModel = {
        getFormulaStringByCell: vi.fn((row: number, col: number) => (row === 0 && col === 0 ? '=SUM(A2:A3)' : null)),
    };

    const skeletonManagerService = {
        getCurrentParam: vi.fn(() => (options.currentSheetId ? { sheetId: options.currentSheetId } : null)),
        reCalculate: vi.fn(),
    };
    const mainComponent = { makeForceDirty: vi.fn() };
    const render = {
        with: vi.fn(() => skeletonManagerService),
        mainComponent,
    };
    const renderManagerService = {
        getRenderUnitById: vi.fn((unitId: string) => (unitId === 'unit' ? render : null)),
    };

    const controller = new ShowFormulasRenderController(
        service,
        formulaDataModel as never,
        sheetInterceptorService as never,
        renderManagerService as never
    );

    const intercept = (cell: Nullable<ICellData>, rawData: Nullable<ICellData>, row = 0, col = 0, subUnitId = 'sheet') =>
        interceptor!.handler(cell, { unitId: 'unit', subUnitId, row, col, rawData }, (value) => value);

    return { service, controller, interceptor: interceptor!, intercept, sheetInterceptorService, formulaDataModel, skeletonManagerService, mainComponent, renderManagerService };
}

describe('ShowFormulasRenderController', () => {
    it('registers a low priority value interceptor', () => {
        const { controller, sheetInterceptorService } = createTestBed();

        expect(sheetInterceptorService.intercept).toHaveBeenCalledWith(
            INTERCEPTOR_POINT.CELL_CONTENT,
            expect.objectContaining({ priority: -1, effect: InterceptorEffectEnum.Value })
        );

        controller.dispose();
    });

    it('passes cells through while show formulas is disabled', () => {
        const { controller, intercept, formulaDataModel } = createTestBed();
        const rawCell: ICellData = { f: '=SUM(A2:A3)', v: 3, t: CellValueType.NUMBER };

        expect(intercept(rawCell, rawCell)).toBe(rawCell);
        expect(formulaDataModel.getFormulaStringByCell).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('renders the formula text as a string for formula cells of enabled worksheets only', () => {
        const { service, controller, intercept, formulaDataModel } = createTestBed();
        service.setEnabled('unit', 'sheet', true);

        const rawCell: ICellData = { f: '=SUM(A2:A3)', v: 3, t: CellValueType.NUMBER, s: 'style-id' };
        const composed: ICellData = { ...rawCell, v: '3.00', p: { id: 'rich' } as never };

        expect(intercept(composed, rawCell)).toEqual({ f: '=SUM(A2:A3)', v: '=SUM(A2:A3)', t: CellValueType.STRING, s: 'style-id' });
        expect(formulaDataModel.getFormulaStringByCell).toHaveBeenCalledWith(0, 0, 'sheet', 'unit');
        expect(rawCell).toEqual({ f: '=SUM(A2:A3)', v: 3, t: CellValueType.NUMBER, s: 'style-id' });

        const plainCell: ICellData = { v: 'text' };
        expect(intercept(plainCell, plainCell)).toBe(plainCell);
        expect(intercept(null, null)).toBeNull();

        const otherSheetCell: ICellData = { f: '=A1', v: 1 };
        expect(intercept(otherSheetCell, otherSheetCell, 0, 0, 'other-sheet')).toBe(otherSheetCell);

        controller.dispose();
    });

    it('resolves shared formulas through the formula data model', () => {
        const { service, controller, intercept, formulaDataModel } = createTestBed();
        service.setEnabled('unit', 'sheet', true);

        const sharedCell: ICellData = { si: 'shared-id', v: 5 };
        expect(intercept(sharedCell, sharedCell)).toEqual({ si: 'shared-id', v: '=SUM(A2:A3)', t: CellValueType.STRING });

        const unresolvedCell: ICellData = { si: 'shared-id', v: 5 };
        expect(intercept(unresolvedCell, unresolvedCell, 1, 1)).toBe(unresolvedCell);
        expect(formulaDataModel.getFormulaStringByCell).toHaveBeenCalledWith(1, 1, 'sheet', 'unit');

        controller.dispose();
    });

    it('refreshes the render unit only for the active worksheet', () => {
        const { service, controller, skeletonManagerService, mainComponent, renderManagerService } = createTestBed({ currentSheetId: 'sheet' });

        service.setEnabled('unit', 'other-sheet', true);
        expect(skeletonManagerService.reCalculate).not.toHaveBeenCalled();
        expect(mainComponent.makeForceDirty).not.toHaveBeenCalled();

        service.setEnabled('unit', 'sheet', true);
        expect(skeletonManagerService.reCalculate).toHaveBeenCalledTimes(1);
        expect(mainComponent.makeForceDirty).toHaveBeenCalledWith(true);

        service.setEnabled('missing-unit', 'sheet', true);
        expect(renderManagerService.getRenderUnitById).toHaveBeenCalledWith('missing-unit');
        expect(skeletonManagerService.reCalculate).toHaveBeenCalledTimes(1);

        controller.dispose();
    });
});

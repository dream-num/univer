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

import type { Injector, IRange, Univer, Workbook } from '@univerjs/core';
import type { IRangeProtectionRule } from '../../../../model/range-protection-rule.model';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RemoveSheetCommand } from '../../../../commands/commands/remove-sheet.command';
import { AddRangeProtectionMutation } from '../../../../commands/mutations/add-range-protection.mutation';
import { DeleteRangeProtectionMutation } from '../../../../commands/mutations/delete-range-protection.mutation';
import { InsertColMutation, InsertRowMutation } from '../../../../commands/mutations/insert-row-col.mutation';
import { MoveColsMutation, MoveRowsMutation } from '../../../../commands/mutations/move-rows-cols.mutation';
import { SetRangeProtectionMutation } from '../../../../commands/mutations/set-range-protection.mutation';
import { RangeProtectionRenderModel } from '../../../../model/range-protection-render.model';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '../../../../model/range-protection-rule.model';
import { RangeProtectionCache } from '../../../../model/range-protection.cache';
import { createTestBase, TEST_WORKBOOK_DATA_DEMO } from '../../../__tests__/util';
import { RefRangeService } from '../../../ref-range/ref-range.service';
import { SheetsSelectionsService } from '../../../selections/selection.service';
import { SheetInterceptorService } from '../../../sheet-interceptor/sheet-interceptor.service';
import { RangeProtectionRefRangeService } from '../range-protection.ref-range';

describe('RangeProtectionRefRangeService', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let service: RangeProtectionRefRangeService;
    let ruleModel: RangeProtectionRuleModel;
    let rangeProtectionCache: RangeProtectionCache;
    let refRangeService: RefRangeService;
    let sheetInterceptorService: SheetInterceptorService;
    let unitId: string;
    let subUnitId: string;
    let seed = 0;

    const createRule = (overrides?: Partial<IRangeProtectionRule>): IRangeProtectionRule => {
        seed += 1;
        return {
            id: `rule-${seed}`,
            permissionId: `permission-${seed}`,
            unitId,
            subUnitId,
            unitType: UnitObject.SelectRange,
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.DesignedUserCanEdit,
            ranges: [{ startRow: 0, endRow: 0, startColumn: 1, endColumn: 3 }],
            ...overrides,
        };
    };

    beforeEach(() => {
        const testBed = createTestBase(TEST_WORKBOOK_DATA_DEMO, [
            [SheetsSelectionsService],
            [RefRangeService],
            [SheetInterceptorService],
            [RangeProtectionRuleModel],
            [RangeProtectionRenderModel],
            [RangeProtectionCache],
            [RangeProtectionRefRangeService],
        ]);

        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        refRangeService = get(RefRangeService);
        rangeProtectionCache = get(RangeProtectionCache);
        ruleModel = get(RangeProtectionRuleModel);
        sheetInterceptorService = get(SheetInterceptorService);

        const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        unitId = workbook.getUnitId();
        subUnitId = workbook.getActiveSheet()!.getSheetId();

        [
            AddRangeProtectionMutation,
            SetRangeProtectionMutation,
            InsertColMutation,
            InsertRowMutation,
            MoveRowsMutation,
            MoveColsMutation,
        ].forEach((command) => commandService.registerCommand(command));

        service = get(RangeProtectionRefRangeService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should route handler by command id and fallback to empty mutations', () => {
        const spyMoveRows = vi.spyOn(service as any, '_getRefRangeMutationsByMoveRows').mockReturnValue({ redos: ['moveRows'], undos: [] });
        const spyMoveCols = vi.spyOn(service as any, '_getRefRangeMutationsByMoveCols').mockReturnValue({ redos: ['moveCols'], undos: [] });
        const spyInsertRows = vi.spyOn(service as any, '_getRefRangeMutationsByInsertRows').mockReturnValue({ redos: ['insertRows'], undos: [] });
        const spyInsertCols = vi.spyOn(service as any, '_getRefRangeMutationsByInsertCols').mockReturnValue({ redos: ['insertCols'], undos: [] });
        const spyDeleteCols = vi.spyOn(service as any, '_getRefRangeMutationsByDeleteCols').mockReturnValue({ redos: ['deleteCols'], undos: [] });
        const spyDeleteRows = vi.spyOn(service as any, '_getRefRangeMutationsByDeleteRows').mockReturnValue({ redos: ['deleteRows'], undos: [] });

        expect(service.refRangeHandle({ id: 'sheet.command.move-rows', params: {} } as any, unitId, subUnitId)).toEqual({ redos: ['moveRows'], undos: [] });
        expect(service.refRangeHandle({ id: 'sheet.command.move-cols', params: {} } as any, unitId, subUnitId)).toEqual({ redos: ['moveCols'], undos: [] });
        expect(service.refRangeHandle({ id: 'sheet.command.insert-row', params: {} } as any, unitId, subUnitId)).toEqual({ redos: ['insertRows'], undos: [] });
        expect(service.refRangeHandle({ id: 'sheet.command.insert-col', params: {} } as any, unitId, subUnitId)).toEqual({ redos: ['insertCols'], undos: [] });
        expect(service.refRangeHandle({ id: 'sheet.command.remove-col', params: {} } as any, unitId, subUnitId)).toEqual({ redos: ['deleteCols'], undos: [] });
        expect(service.refRangeHandle({ id: 'sheet.command.remove-row', params: {} } as any, unitId, subUnitId)).toEqual({ redos: ['deleteRows'], undos: [] });
        expect(service.refRangeHandle({ id: 'unknown', params: {} } as any, unitId, subUnitId)).toEqual({ redos: [], undos: [] });

        expect(spyMoveRows).toHaveBeenCalled();
        expect(spyMoveCols).toHaveBeenCalled();
        expect(spyInsertRows).toHaveBeenCalled();
        expect(spyInsertCols).toHaveBeenCalled();
        expect(spyDeleteCols).toHaveBeenCalled();
        expect(spyDeleteRows).toHaveBeenCalled();
    });

    it('should generate set and delete mutations for delete-cols', () => {
        const partialRule = createRule({
            ranges: [{ startRow: 0, endRow: 0, startColumn: 1, endColumn: 3 }],
        });
        ruleModel.addRule(unitId, subUnitId, partialRule);

        const partialResult = (service as any)._getRefRangeMutationsByDeleteCols(
            { range: { startRow: 0, endRow: 0, startColumn: 2, endColumn: 2 } },
            unitId,
            subUnitId
        );
        expect(partialResult.redos[0].id).toBe(SetRangeProtectionMutation.id);
        expect(partialResult.redos[0].params.rule.ranges[0]).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 1,
            endColumn: 2,
        });

        const fullRule = createRule({
            ranges: [{ startRow: 1, endRow: 1, startColumn: 4, endColumn: 5 }],
        });
        ruleModel.addRule(unitId, subUnitId, fullRule);

        const fullResult = (service as any)._getRefRangeMutationsByDeleteCols(
            { range: { startRow: 1, endRow: 1, startColumn: 4, endColumn: 5 } },
            unitId,
            subUnitId
        );
        expect(fullResult.redos.some((redo: any) => redo.id === DeleteRangeProtectionMutation.id)).toBe(true);
    });

    it('should generate insert and move mutations for overlap rules', () => {
        const rule = createRule({
            ranges: [{ startRow: 5, endRow: 8, startColumn: 5, endColumn: 8 }],
        });
        ruleModel.addRule(unitId, subUnitId, rule);

        const insertRows = (service as any)._getRefRangeMutationsByInsertRows(
            { range: { startRow: 6, endRow: 7, startColumn: 0, endColumn: 0 } },
            unitId,
            subUnitId
        );
        expect(insertRows.redos[0].params.rule.ranges[0]).toMatchObject({ startRow: 5, endRow: 10 });

        const insertCols = (service as any)._getRefRangeMutationsByInsertCols(
            { range: { startRow: 0, endRow: 0, startColumn: 6, endColumn: 7 } },
            unitId,
            subUnitId
        );
        expect(insertCols.redos[0].params.rule.ranges[0]).toMatchObject({ startColumn: 5, endColumn: 10 });

        const moveRows = (service as any)._getRefRangeMutationsByMoveRows(
            {
                fromRange: { startRow: 2, endRow: 3, startColumn: 0, endColumn: 0 },
                toRange: { startRow: 6, endRow: 7, startColumn: 0, endColumn: 0 },
            },
            unitId,
            subUnitId
        );
        expect(moveRows.redos[0].params.rule.ranges[0]).toMatchObject({ startRow: 3, endRow: 8 });

        const moveCols = (service as any)._getRefRangeMutationsByMoveCols(
            {
                fromRange: { startRow: 0, endRow: 0, startColumn: 2, endColumn: 3 },
                toRange: { startRow: 0, endRow: 0, startColumn: 6, endColumn: 7 },
            },
            unitId,
            subUnitId
        );
        expect(moveCols.redos[0].params.rule.ranges[0]).toMatchObject({ startColumn: 3, endColumn: 8 });
        expect((service as any)._checkIsRightRange({ startRow: 1, endRow: 0, startColumn: 0, endColumn: 0 })).toBe(false);
    });

    it('should rebuild cache when move mutation executes', async () => {
        const rebuildSpy = vi.spyOn(rangeProtectionCache, 'reBuildCache');

        await commandService.executeCommand(MoveRowsMutation.id, {
            unitId,
            subUnitId,
            sourceRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 },
            targetRange: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 1 },
        });

        expect(rebuildSpy).toHaveBeenCalledWith(unitId, subUnitId);
    });

    it('should register ref ranges after range protection mutation', async () => {
        const registerSpy = vi.spyOn(refRangeService, 'registerRefRange');
        const rule = createRule({
            ranges: [{ startRow: 3, endRow: 4, startColumn: 3, endColumn: 4 } as IRange],
        });

        await commandService.executeCommand(AddRangeProtectionMutation.id, {
            unitId,
            subUnitId,
            rules: [rule],
        });

        expect(registerSpy).toHaveBeenCalled();
    });

    it('should inject pre-redo and undo mutations when removing sheet', () => {
        const ruleA = createRule({ id: 'rule-a', permissionId: 'permission-a' });
        const ruleB = createRule({ id: 'rule-b', permissionId: 'permission-b' });
        ruleModel.addRule(unitId, subUnitId, ruleA);
        ruleModel.addRule(unitId, subUnitId, ruleB);

        const interceptorResult = sheetInterceptorService.onCommandExecute({
            id: RemoveSheetCommand.id,
            params: {
                unitId,
                subUnitId,
            },
        });

        expect(interceptorResult.preRedos).toEqual([
            {
                id: DeleteRangeProtectionMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ruleIds: ['rule-a', 'rule-b'],
                },
            },
        ]);
        expect(interceptorResult.undos).toEqual([
            {
                id: AddRangeProtectionMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    name: '',
                    rules: [ruleA, ruleB],
                },
            },
        ]);
    });
});

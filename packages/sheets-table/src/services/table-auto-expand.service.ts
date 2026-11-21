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

import type { ICellData, IDisposable, IRange, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { ISheetValueChangeContext } from '@univerjs/sheets';
import {
    Disposable,
    generateRandomId,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    ObjectMatrix,
    Rectangle,
    toDisposable,
    Tools,
} from '@univerjs/core';
import { FormulaDataModel, LexerTreeBuilder } from '@univerjs/engine-formula';
import { AddWorksheetMergeMutation, checkRangesEditablePermission, IExclusiveRangeService } from '@univerjs/sheets';
import type {
    ITableAutoExpandCandidate,
    ITableAutoExpandContribution,
    ITableAutoExpandPatch,
} from '../types/auto-expand';
import { getTableAutoExpandFormulaEffects } from '../commands/utils/auto-expand-effects';
import { TableColumn } from '../models/table-column';
import { TableManager } from '../models/table-manager';
import { convertCellDataToString, getColumnName } from '../util';
import { getTableAutoExpandCandidates, resolveTableAutoExpandCandidates } from '../util/auto-expand';

export class SheetTableAutoExpandService extends Disposable {
    private readonly _contributions = new Map<string, ITableAutoExpandContribution>();

    constructor(
        @Inject(TableManager) private readonly _tableManager: TableManager,
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @IExclusiveRangeService private readonly _exclusiveRanges: IExclusiveRangeService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) private readonly _injector: Injector,
        @ILogService private readonly _logService: ILogService
    ) {
        super();
    }

    registerContribution(contribution: ITableAutoExpandContribution): IDisposable {
        if (this._contributions.has(contribution.id)) {
            throw new Error(`Duplicate Table auto expansion contribution: ${contribution.id}`);
        }
        this._contributions.set(contribution.id, contribution);
        return this.disposeWithMe(toDisposable(() => this._contributions.delete(contribution.id)));
    }

    prepare(context: ISheetValueChangeContext): ITableAutoExpandPatch[] {
        const { unitId, subUnitId } = context;
        const worksheet = this._instanceService.getUnit<Workbook>(unitId)?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return [];
        }
        const tables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
        const arrayRanges = this._injector.has(FormulaDataModel)
            ? this._injector.get(FormulaDataModel).getArrayFormulaRange()[unitId]?.[subUnitId]
            : undefined;
        const spillRanges: IRange[] = [];
        new ObjectMatrix<IRange>(arrayRanges).forValue((_row, _column, range) => {
            if (range) {
                spillRanges.push(range);
            }
        });
        const plannedMerges = (context.mutations ?? []).flatMap((mutation) => {
            const params = mutation.params as { unitId?: string; subUnitId?: string; ranges?: IRange[] };
            return mutation.id === AddWorksheetMergeMutation.id && params?.unitId === unitId && params.subUnitId === subUnitId
                ? params.ranges ?? []
                : [];
        });
        const candidates = getTableAutoExpandCandidates(tables.map((table) => ({
            tableId: table.getId(),
            range: table.getRange(),
            showFooter: table.isShowFooter(),
        })), context.ranges);
        const patches = new Map<string, ITableAutoExpandPatch>();
        const operationId = generateRandomId();
        const valid = resolveTableAutoExpandCandidates(candidates, (candidate) => {
            if (candidate.newRange.endRow >= worksheet.getRowCount() || candidate.newRange.endColumn >= worksheet.getColumnCount()) {
                return false;
            }
            if (!this._injector.invoke((accessor) => checkRangesEditablePermission(accessor, unitId, subUnitId, candidate.addedRanges))) {
                return false;
            }
            const allowed = candidate.addedRanges.every((added) => {
                if ([...worksheet.getMergeData(), ...plannedMerges].some((merge) => Rectangle.intersects(added, merge))
                    || spillRanges.some((range) => Rectangle.intersects(added, range))
                    || tables.some((table) => table.getId() !== candidate.tableId && Rectangle.intersects(added, table.getRange()))) {
                    return false;
                }
                if (this._exclusiveRanges.getInterestGroupId([{ range: { ...added, unitId, sheetId: subUnitId }, primary: null }]).length) {
                    return false;
                }
                return !hasExistingContent(worksheet, context, added);
            });
            if (!allowed) return false;
            try {
                patches.set(candidate.tableId, this._preparePatch(context, candidate, worksheet, operationId));
                return true;
            } catch (error) {
                this._logService.warn('[TableAutoExpand] Optional expansion could not be prepared', error);
                return false;
            }
        });
        return valid.map((candidate) => patches.get(candidate.tableId)!);
    }

    private _preparePatch(context: ISheetValueChangeContext, candidate: ITableAutoExpandCandidate, worksheet: Worksheet, operationId: string): ITableAutoExpandPatch {
        const { unitId, subUnitId } = context;
        const table = this._tableManager.getTable(unitId, candidate.tableId)!;
        const columns = Tools.deepClone(table.getTableInfo().columns);
        const before = { range: { ...candidate.oldRange }, columns: Tools.deepClone(columns) };
        const prefix = this._localeService.t('sheets-table.columnPrefix');
        for (let col = candidate.oldRange.endColumn + 1; col <= candidate.newRange.endColumn; col++) {
            const cell = table.isShowHeader() ? context.contentWrites[candidate.oldRange.startRow]?.[col] : undefined;
            const name = convertCellDataToString(cell) || getColumnName(columns.length + 1, prefix);
            columns.push(new TableColumn(generateRandomId(), name).toJSON());
        }
        const patch: ITableAutoExpandPatch = {
            operationId,
            showHeader: table.isShowHeader(),
            unitId,
            subUnitId,
            tableId: candidate.tableId,
            before,
            claimedRanges: Tools.deepClone(candidate.addedRanges),
            after: { range: { ...candidate.newRange }, columns },
            redoEffects: [],
            undoEffects: [],
            effectGroups: [],
        };
        const formulas = getTableAutoExpandFormulaEffects(context, candidate, table, worksheet, () => this._injector.get(LexerTreeBuilder), Object.fromEntries(this._instanceService.getUnit<Workbook>(unitId)!.getSheets().map((sheet) => [sheet.getSheetId(), sheet.getName()])));
        patch.redoEffects.push(...formulas.redos);
        patch.undoEffects.unshift(...formulas.undos);
        patch.effectGroups!.push({ redoCount: formulas.redos.length, undoCount: formulas.undos.length });
        for (const contribution of this._contributions.values()) {
            const effects = contribution.getMutations(context, candidate);
            patch.redoEffects.push(...effects.redos);
            patch.undoEffects.unshift(...effects.undos);
            patch.effectGroups!.push({ redoCount: effects.redos.length, undoCount: effects.undos.length });
        }
        return patch;
    }

    override dispose(): void {
        this._contributions.clear();
        super.dispose();
    }
}

function hasExistingContent(worksheet: Worksheet, context: ISheetValueChangeContext, range: IRange): boolean {
    const matrix = worksheet.getCellMatrix().getMatrix();
    for (const source of [matrix, context.beforeCells]) {
        for (const rowKey of Object.keys(source)) {
            const row = Number(rowKey);
            if (row < range.startRow || row > range.endRow) {
                continue;
            }
            for (const colKey of Object.keys(source[row] ?? {})) {
                const col = Number(colKey);
                if (col < range.startColumn || col > range.endColumn) {
                    continue;
                }
                const before = context.beforeCells[row];
                const cell = before && Object.prototype.hasOwnProperty.call(before, col) ? before[col] : source[row][col];
                if (hasContent(cell)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function hasContent(cell: Nullable<ICellData>): boolean {
    return !!cell && ((cell.v !== undefined && cell.v !== null && cell.v !== '') || !!cell.f || !!cell.si
        || !!cell.p?.body?.dataStream.replace(/\r\n$/, ''));
}

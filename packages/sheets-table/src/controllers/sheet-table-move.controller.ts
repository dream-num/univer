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

import type { IMutationInfo, Worksheet } from '@univerjs/core';
import type { IMoveRangeCommandParams } from '@univerjs/sheets';
import type { LocaleKey } from '../locale/types';
import {
    Disposable,
    ErrorService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    Rectangle,
} from '@univerjs/core';
import {
    checkRangesEditablePermission,
    getSheetCommandTarget,
    MoveRangeCommand,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { MoveSheetTableMutation } from '../commands/mutations/move-sheet-table.mutation';
import { TableManager } from '../models/table-manager';

export class SheetTableMoveController extends Disposable {
    constructor(
        @Inject(TableManager) private readonly _tableManager: TableManager,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(ErrorService) private readonly _errorService: ErrorService
    ) {
        super();

        this.disposeWithMe(
            this._sheetInterceptorService.interceptBeforeCommand({
                performCheck: async (command) => command.id !== MoveRangeCommand.id || this._checkMove(command.params as IMoveRangeCommandParams),
            })
        );
        this.disposeWithMe(
            this._sheetInterceptorService.interceptAfterCommand({
                getMutations: (command) => command.id === MoveRangeCommand.id
                    ? this._getMoveMutations(command.params as IMoveRangeCommandParams)
                    : { redos: [], undos: [] },
            })
        );
    }

    private _getTargets(params: IMoveRangeCommandParams) {
        const source = getSheetCommandTarget(this._univerInstanceService, {
            unitId: params.fromUnitId ?? params.toUnitId,
            subUnitId: params.fromSubUnitId,
        });
        const target = getSheetCommandTarget(this._univerInstanceService, {
            unitId: params.toUnitId ?? source?.unitId,
            subUnitId: params.toSubUnitId ?? source?.subUnitId,
        });
        return { source, target };
    }

    private _checkMove(params: IMoveRangeCommandParams): boolean {
        const { source, target } = this._getTargets(params);
        if (!source || !target || source.unitId !== target.unitId) {
            return false;
        }

        const sourceTables = this._tableManager.getTablesBySubunitId(source.unitId, source.subUnitId);
        const movingTables = sourceTables.filter((table) => Rectangle.contains(params.fromRange, table.getRange()));

        if (!movingTables.length) {
            return true;
        }

        const targetTables = this._tableManager.getTablesBySubunitId(target.unitId, target.subUnitId);

        for (const table of targetTables) {
            if (movingTables.includes(table) || !Rectangle.intersects(params.toRange, table.getRange())) {
                continue;
            }
            this._errorService.emit(this._localeService.t<LocaleKey>('sheets-table.moveTableOverlapError'));
            return false;
        }

        const { fromRange, toRange } = params;
        if (!this._isValidMoveRange(params, target.worksheet)) {
            return false;
        }

        return checkRangesEditablePermission(this._injector, source.unitId, source.subUnitId, [fromRange])
            && checkRangesEditablePermission(this._injector, target.unitId, target.subUnitId, [toRange]);
    }

    private _isValidMoveRange(params: IMoveRangeCommandParams, worksheet: Worksheet): boolean {
        const { fromRange, toRange } = params;
        if (fromRange.endRow - fromRange.startRow !== toRange.endRow - toRange.startRow
            || fromRange.endColumn - fromRange.startColumn !== toRange.endColumn - toRange.startColumn
            || toRange.startRow < 0 || toRange.startColumn < 0
            || toRange.endRow >= worksheet.getRowCount()
            || toRange.endColumn >= worksheet.getColumnCount()) {
            return false;
        }
        return true;
    }

    private _getMoveMutations(params: IMoveRangeCommandParams) {
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const { source, target } = this._getTargets(params);
        if (!source || !target || source.unitId !== target.unitId) {
            return { redos, undos };
        }

        const rowOffset = params.toRange.startRow - params.fromRange.startRow;
        const columnOffset = params.toRange.startColumn - params.fromRange.startColumn;
        const tables = this._tableManager.getTablesBySubunitId(source.unitId, source.subUnitId);

        for (const table of tables) {
            const range = table.getRange();
            if (!Rectangle.contains(params.fromRange, range)) {
                continue;
            }
            redos.push({
                id: MoveSheetTableMutation.id,
                params: {
                    unitId: source.unitId,
                    tableId: table.getId(),
                    subUnitId: target.subUnitId,
                    range: {
                        startRow: range.startRow + rowOffset,
                        endRow: range.endRow + rowOffset,
                        startColumn: range.startColumn + columnOffset,
                        endColumn: range.endColumn + columnOffset,
                    },
                },
            });
            undos.push({
                id: MoveSheetTableMutation.id,
                params: {
                    unitId: source.unitId,
                    tableId: table.getId(),
                    subUnitId: source.subUnitId,
                    range,
                    calculatedColumns: table.getTableInfo().columns.filter((column) => column.formula).map((column) => ({
                        columnId: column.id,
                        formula: column.formula,
                        formulaIsArray: column.formulaIsArray,
                    })),
                },
            });
        }

        return { redos, undos };
    }
}

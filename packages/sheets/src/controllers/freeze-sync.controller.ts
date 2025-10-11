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

import type { IExecutionOptions, IFreeze, Workbook } from '@univerjs/core';
import type { IInsertColMutationParams, IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowsMutationParams } from '../basics';
import type { IMoveColumnsMutationParams, IMoveRowsMutationParams } from '../commands/mutations/move-rows-cols.mutation';
import type { IUniverSheetsConfig } from './config.schema';
import { Disposable, DisposableCollection, ICommandService, IConfigService, Inject, IUniverInstanceService, sequenceExecute, UniverInstanceType } from '@univerjs/core';
import { InsertColMutation, InsertRowMutation } from '../commands/mutations/insert-row-col.mutation';
import { MoveColsMutation, MoveRowsMutation } from '../commands/mutations/move-rows-cols.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../commands/mutations/remove-row-col.mutation';
import { SetFrozenMutation } from '../commands/mutations/set-frozen.mutation';
import { SHEETS_PLUGIN_CONFIG_KEY } from './config.schema';

const sheetsFreezeOnlyLocalMutationIds = [
    SetFrozenMutation.id,
];

const effectedByOnlyLocalMutationIds = [
    InsertRowMutation.id,
    InsertColMutation.id,
    RemoveRowMutation.id,
    RemoveColMutation.id,
    MoveRowsMutation.id,
    MoveColsMutation.id,
];

export class SheetsFreezeSyncController extends Disposable {
    private _d: DisposableCollection = new DisposableCollection();
    private _enabled: boolean = true;

    constructor(
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        const freezeSync = this._configService.getConfig<IUniverSheetsConfig>(SHEETS_PLUGIN_CONFIG_KEY)?.freezeSync ?? true;
        this.setEnabled(freezeSync);
    }

    getEnabled() {
        return this._enabled;
    }

    setEnabled(enabled: boolean) {
        if (enabled) {
            this._d.dispose();
        } else {
            this._initOnlyLocalListener();
        }
        this._enabled = enabled;
    }

    private _initOnlyLocalListener() {
        this._d.add(
            this._commandService.beforeCommandExecuted((commandInfo, options) => {
                if (sheetsFreezeOnlyLocalMutationIds.includes(commandInfo.id)) {
                    if (!options) options = {};
                    options.onlyLocal = true;
                }
            })
        );

        this._d.add(
            this._commandService.onCommandExecuted((commandInfo, options) => {
                if (effectedByOnlyLocalMutationIds.includes(commandInfo.id) && options?.fromCollab) {
                    const { id, params } = commandInfo;

                    if (id === InsertRowMutation.id) {
                        this._handleInsertRowMutation(params as IInsertRowMutationParams, options);
                    } else if (id === InsertColMutation.id) {
                        this._handleInsertColMutation(params as IInsertColMutationParams, options);
                    } else if (id === RemoveRowMutation.id) {
                        this._handleRemoveRowMutation(params as IRemoveRowsMutationParams, options);
                    } else if (id === RemoveColMutation.id) {
                        this._handleRemoveColMutation(params as IRemoveColMutationParams, options);
                    } else if (id === MoveRowsMutation.id) {
                        this._handleMoveRowsMutation(params as IMoveRowsMutationParams, options);
                    } else if (id === MoveColsMutation.id) {
                        this._handleMoveColsMutation(params as IMoveColumnsMutationParams, options);
                    }
                }
            })
        );
    }

    private _handleInsertRowMutation(params: IInsertRowMutationParams, options?: IExecutionOptions) {
        const { range, unitId, subUnitId } = params;
        const freeze = this._getFreeze(unitId, subUnitId);
        if (!freeze) return;

        if (range.startRow < freeze.startRow) {
            const insertCount = range.endRow - range.startRow + 1;
            const newFreeze = {
                ...freeze,
                startRow: Math.max(1, freeze.startRow + insertCount),
                ySplit: Math.max(1, freeze.ySplit + insertCount),
            };
            this._sequenceExecute(unitId, subUnitId, newFreeze, options);
        }
    }

    private _handleInsertColMutation(params: IInsertColMutationParams, options?: IExecutionOptions) {
        const { range, unitId, subUnitId } = params as IInsertColMutationParams;
        const freeze = this._getFreeze(unitId, subUnitId);
        if (!freeze) return;

        if (range.startColumn < freeze.startColumn) {
            const insertCount = range.endColumn - range.startColumn + 1;
            const newFreeze = {
                ...freeze,
                startColumn: Math.max(1, freeze.startColumn + insertCount),
                xSplit: Math.max(1, freeze.xSplit + insertCount),
            };
            this._sequenceExecute(unitId, subUnitId, newFreeze, options);
        }
    }

    private _handleRemoveRowMutation(params: IRemoveRowsMutationParams, options?: IExecutionOptions) {
        const { range, unitId, subUnitId } = params as IRemoveRowsMutationParams;
        const freeze = this._getFreeze(unitId, subUnitId);
        if (!freeze) return;

        if (range.startRow < freeze.startRow) {
            const removeCount = Math.min(freeze.startRow, range.endRow + 1) - range.startRow;
            const newFreeze = {
                ...freeze,
                startRow: Math.max(1, freeze.startRow - removeCount),
                ySplit: Math.max(1, freeze.ySplit - removeCount),
            };
            this._sequenceExecute(unitId, subUnitId, newFreeze, options);
        }
    }

    private _handleRemoveColMutation(params: IRemoveColMutationParams, options?: IExecutionOptions) {
        const { range, unitId, subUnitId } = params as IRemoveColMutationParams;
        const freeze = this._getFreeze(unitId, subUnitId);
        if (!freeze) return;

        if (range.startColumn < freeze.startColumn) {
            const removeCount = Math.min(freeze.startColumn, range.endColumn + 1) - range.startColumn;
            const newFreeze = {
                ...freeze,
                startColumn: Math.max(1, freeze.startColumn - removeCount),
                xSplit: Math.max(1, freeze.xSplit - removeCount),
            };
            this._sequenceExecute(unitId, subUnitId, newFreeze, options);
        }
    }

    private _handleMoveRowsMutation(params: IMoveRowsMutationParams, options?: IExecutionOptions) {
        const { sourceRange, targetRange, unitId, subUnitId } = params as IMoveRowsMutationParams;
        const freeze = this._getFreeze(unitId, subUnitId);

        if (
            !freeze ||
            freeze.startRow <= 0 ||
            (sourceRange.startRow >= freeze.startRow && targetRange.startRow >= freeze.startRow) ||
            (sourceRange.endRow < freeze.startRow && targetRange.endRow < freeze.startRow)
        ) {
            return;
        }

        const moveCount = sourceRange.endRow - sourceRange.startRow + 1;
        const moveFreezeCount = Math.max(
            Math.min(freeze.startRow, sourceRange.endRow + 1) - sourceRange.startRow,
            0
        );
        const newFreeze: IFreeze = { ...freeze };

        if (targetRange.startRow >= freeze.startRow) {
            // Move down
            newFreeze.startRow = Math.max(1, freeze.startRow - moveFreezeCount);
            newFreeze.ySplit = Math.max(1, freeze.ySplit - moveFreezeCount);
        } else {
            // Move up
            newFreeze.startRow = freeze.startRow + moveCount - moveFreezeCount;
            newFreeze.ySplit = freeze.ySplit + moveCount - moveFreezeCount;
        }

        this._sequenceExecute(unitId, subUnitId, newFreeze, options);
    }

    private _handleMoveColsMutation(params: IMoveColumnsMutationParams, options?: IExecutionOptions) {
        const { sourceRange, targetRange, unitId, subUnitId } = params as IMoveColumnsMutationParams;
        const freeze = this._getFreeze(unitId, subUnitId);

        if (
            !freeze ||
            freeze.startColumn <= 0 ||
            (sourceRange.startColumn >= freeze.startColumn && targetRange.startColumn >= freeze.startColumn) ||
            (sourceRange.endColumn < freeze.startColumn && targetRange.endColumn < freeze.startColumn)
        ) {
            return;
        }

        const moveCount = sourceRange.endColumn - sourceRange.startColumn + 1;
        const moveFreezeCount = Math.max(
            Math.min(freeze.startColumn, sourceRange.endColumn + 1) - sourceRange.startColumn,
            0
        );
        const newFreeze: IFreeze = { ...freeze };

        if (targetRange.startColumn >= freeze.startColumn) {
            // Move right
            newFreeze.startColumn = Math.max(1, freeze.startColumn - moveFreezeCount);
            newFreeze.xSplit = Math.max(1, freeze.xSplit - moveFreezeCount);
        } else {
            // Move left
            newFreeze.startColumn = freeze.startColumn + moveCount - moveFreezeCount;
            newFreeze.xSplit = freeze.xSplit + moveCount - moveFreezeCount;
        }

        this._sequenceExecute(unitId, subUnitId, newFreeze, options);
    }

    private _getFreeze(unitId: string, subUnitId: string) {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return null;
        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) return null;
        return worksheet.getFreeze();
    }

    private _sequenceExecute(unitId: string, subUnitId: string, newFreeze: IFreeze, options?: IExecutionOptions) {
        sequenceExecute([
            {
                id: SetFrozenMutation.id,
                params: {
                    ...newFreeze,
                    unitId,
                    subUnitId,
                    resetScroll: false,
                },
            },
        ], this._commandService, options);
    }
}

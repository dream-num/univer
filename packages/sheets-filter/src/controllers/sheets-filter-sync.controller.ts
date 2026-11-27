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

import type { IMutationInfo } from '@univerjs/core';
import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IMoveColumnsMutationParams,
    IMoveRowsMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '@univerjs/sheets';
import {
    Disposable,
    DisposableCollection,
    ICommandService,
    IConfigService,
    Inject,
    IPermissionService,
    IUniverInstanceService,
    sequenceExecute,
} from '@univerjs/core';
import {
    getSheetCommandTarget,
    InsertColMutation,
    InsertRowMutation,
    MoveColsMutation,
    MoveRowsMutation,
    RemoveColMutation,
    RemoveRowMutation,
    WorkbookEditablePermission,
} from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import type { IUniverSheetsFilterConfig } from '../config/config';
import {
    ReCalcSheetsFilterMutation,
    RemoveSheetsFilterMutation,
    SetSheetsFilterCriteriaMutation,
} from '../commands/mutations/sheets-filter.mutation';
import { SHEETS_FILTER_PLUGIN_CONFIG_KEY } from '../config/config';
import { SheetsFilterService } from '../services/sheet-filter.service';
import { SheetsFilterController } from './sheets-filter.controller';

const sheetsFilterOnlyLocalMutationIds = [
    SetSheetsFilterCriteriaMutation.id,
    ReCalcSheetsFilterMutation.id,
];

const effectedByOnlyLocalMutationIds = [
    InsertColMutation.id,
    RemoveColMutation.id,
    MoveColsMutation.id,
];

const structuralMutationIds = [
    InsertColMutation.id,
    InsertRowMutation.id,
    RemoveColMutation.id,
    RemoveRowMutation.id,
    MoveColsMutation.id,
    MoveRowsMutation.id,
];

export class SheetsFilterSyncController extends Disposable {
    private _d: DisposableCollection = new DisposableCollection();

    private readonly _visible$ = new BehaviorSubject<boolean>(false);
    readonly visible$ = this._visible$.asObservable();
    get visible(): boolean { return this._visible$.getValue(); }

    private readonly _enabled$ = new BehaviorSubject<boolean>(true);
    readonly enabled$ = this._enabled$.asObservable();
    get enabled(): boolean { return this._enabled$.getValue(); }

    constructor(
        @Inject(SheetsFilterController) private readonly _sheetsFilterController: SheetsFilterController,
        @Inject(SheetsFilterService) private readonly _sheetsFilterService: SheetsFilterService,
        @ICommandService protected readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService
    ) {
        super();

        this._initRemoteStructuralListener();

        const config = this._configService.getConfig<IUniverSheetsFilterConfig>(SHEETS_FILTER_PLUGIN_CONFIG_KEY);
        if (config?.enableSyncSwitch) {
            this._visible$.next(true);

            if (typeof config.enableSyncSwitch === 'object') {
                this.setEnabled(config.enableSyncSwitch.defaultValue ?? true);
            }
        }
    }

    setEnabled(enabled: boolean) {
        this._enabled$.next(enabled);
        if (enabled) {
            this._d.dispose();
        } else {
            this._initOnlyLocalListener();
        }
    }

    private _initOnlyLocalListener() {
        this._d.add(
            this._commandService.beforeCommandExecuted((commandInfo, options) => {
                if (!sheetsFilterOnlyLocalMutationIds.includes(commandInfo.id)) {
                    return;
                }
                const target = getSheetCommandTarget(this._univerInstanceService, commandInfo.params as {
                    unitId?: string;
                    subUnitId?: string;
                });
                if (!target || !this._isWorkbookEditable(target.unitId)) {
                    return;
                }
                if (!options) {
                    options = {};
                }
                options.onlyLocal = true;
            })
        );

        this._d.add(
            this._commandService.onCommandExecuted((commandInfo, options) => {
                if (effectedByOnlyLocalMutationIds.includes(commandInfo.id) && options?.fromCollab) {
                    const { unitId: targetUnitId, subUnitId: targetSubUnitId } = commandInfo.params as {
                        unitId?: string;
                        subUnitId?: string;
                    };
                    if (!targetUnitId || !targetSubUnitId || !this._isWorkbookEditable(targetUnitId)) {
                        return;
                    }
                    if (this._sheetsFilterService.isRemoteFilterMutationsSuppressed(targetUnitId, targetSubUnitId)) {
                        return;
                    }
                    if (commandInfo.id === InsertColMutation.id) {
                        const { range, unitId, subUnitId } = commandInfo.params as IInsertColMutationParams;
                        const { redos } = this._sheetsFilterController.handleInsertColCommand(range, unitId, subUnitId);
                        sequenceExecute(redos, this._commandService, options);
                    } else if (commandInfo.id === RemoveColMutation.id) {
                        const { range, unitId, subUnitId } = commandInfo.params as IRemoveColMutationParams;
                        const { redos } = this._sheetsFilterController.handleRemoveColCommand(range, unitId, subUnitId);
                        sequenceExecute(redos, this._commandService, options);
                    } else if (commandInfo.id === MoveColsMutation.id) {
                        const { sourceRange: fromRange, targetRange: toRange, unitId, subUnitId } = commandInfo.params as IMoveColumnsMutationParams;
                        const { redos } = this._sheetsFilterController.handleMoveColsCommand({ fromRange, toRange }, unitId, subUnitId);
                        sequenceExecute(redos, this._commandService, options);
                    }
                }
            })
        );
    }

    private _isWorkbookEditable(unitId?: string): boolean {
        if (!unitId) {
            return true;
        }
        const permission = this._permissionService.getPermissionPoint(new WorkbookEditablePermission(unitId).id);
        return permission?.value !== false;
    }

    private _initRemoteStructuralListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo, options) => {
                if (!options?.fromCollab || !structuralMutationIds.includes(commandInfo.id)) {
                    return;
                }
                const { unitId, subUnitId } = commandInfo.params as { unitId?: string; subUnitId?: string };
                if (!unitId || !subUnitId || !this._sheetsFilterService.isRemoteFilterMutationsSuppressed(unitId, subUnitId)) {
                    return;
                }

                let redos: IMutationInfo[] = [];
                switch (commandInfo.id) {
                    case InsertColMutation.id: {
                        const params = commandInfo.params as IInsertColMutationParams;
                        redos = this._sheetsFilterController.handleRemoteInsertCol(params.range, unitId, params.subUnitId);
                        break;
                    }
                    case InsertRowMutation.id: {
                        const params = commandInfo.params as IInsertRowMutationParams;
                        redos = this._sheetsFilterController.handleRemoteInsertRow(params.range, unitId, params.subUnitId);
                        break;
                    }
                    case RemoveColMutation.id: {
                        const params = commandInfo.params as IRemoveColMutationParams;
                        redos = this._sheetsFilterController.handleRemoteRemoveCol(params.range, unitId, params.subUnitId);
                        break;
                    }
                    case RemoveRowMutation.id: {
                        const params = commandInfo.params as IRemoveRowsMutationParams;
                        redos = this._sheetsFilterController.handleRemoteRemoveRow(params.range, unitId, params.subUnitId);
                        break;
                    }
                    case MoveColsMutation.id: {
                        const params = commandInfo.params as IMoveColumnsMutationParams;
                        redos = this._sheetsFilterController.handleRemoteMoveCols(params.sourceRange, params.targetRange, unitId, params.subUnitId);
                        break;
                    }
                    case MoveRowsMutation.id: {
                        const params = commandInfo.params as IMoveRowsMutationParams;
                        redos = this._sheetsFilterController.handleRemoteMoveRows(params.sourceRange, params.targetRange, unitId, params.subUnitId);
                        break;
                    }
                }

                if (subUnitId) {
                    this._sheetsFilterService.markRemoteFilterRecalc(unitId, subUnitId);
                }
                const removesFilter = redos.some((mutation) => mutation.id === RemoveSheetsFilterMutation.id);
                sequenceExecute(redos, this._commandService, { ...options, onlyLocal: true });
                if (removesFilter && subUnitId) {
                    // The local filter model is gone; undo entries that still target it would
                    // fail and block later history entries.
                    this._sheetsFilterService.invalidateFilterHistory(unitId, subUnitId);
                }
            })
        );
    }
}

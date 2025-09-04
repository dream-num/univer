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

import type { IInsertColMutationParams, IMoveColumnsMutationParams, IRemoveColMutationParams } from '@univerjs/sheets';
import type { IUniverSheetsFilterConfig } from './config.schema';
import { Disposable, DisposableCollection, ICommandService, IConfigService, Inject, sequenceExecute } from '@univerjs/core';
import { InsertColMutation, MoveColsMutation, RemoveColMutation } from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { ReCalcSheetsFilterMutation, SetSheetsFilterCriteriaMutation } from '../commands/mutations/sheets-filter.mutation';
import { SHEETS_FILTER_PLUGIN_CONFIG_KEY } from './config.schema';
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
        @ICommandService protected readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        const config = this._configService.getConfig<IUniverSheetsFilterConfig>(SHEETS_FILTER_PLUGIN_CONFIG_KEY);
        if (config?.enableSyncSwitch) {
            this._visible$.next(true);
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
                if (sheetsFilterOnlyLocalMutationIds.includes(commandInfo.id)) {
                    if (!options) options = {};
                    options.onlyLocal = true;
                }
            })
        );

        this._d.add(
            this._commandService.onCommandExecuted((commandInfo, options) => {
                if (effectedByOnlyLocalMutationIds.includes(commandInfo.id) && options?.fromCollab) {
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
}

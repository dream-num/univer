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

import { Disposable, DisposableCollection, ICommandService, Inject, sequenceExecute } from "@univerjs/core";
import { BehaviorSubject } from "rxjs";
import { SheetsFilterController } from "./sheets-filter.controller";
import { SetSheetsFilterCriteriaMutation, ReCalcSheetsFilterMutation } from "../commands/mutations/sheets-filter.mutation";
import { IInsertColMutationParams, IMoveColumnsMutationParams, InsertColMutation, IRemoveColMutationParams, MoveColsMutation, RemoveColMutation } from "@univerjs/sheets";
import { SheetsFilterService } from "../services/sheet-filter.service";

const sheetsFilterOnlyLocalMutationIds = [
    SetSheetsFilterCriteriaMutation.id,
    ReCalcSheetsFilterMutation.id
]

const effectedByOnlyLocalMutationIds = [
    InsertColMutation.id,
    RemoveColMutation.id,
    MoveColsMutation.id
]

export class SheetsFilterSyncController extends Disposable {
    private _d: DisposableCollection = new DisposableCollection();

    private readonly _visible$ = new BehaviorSubject<boolean>(true);
    readonly visible$ = this._visible$.asObservable();
    get visible(): boolean { return this._visible$.getValue(); }

    private readonly _enabled$ = new BehaviorSubject<boolean>(true);
    readonly enabled$ = this._enabled$.asObservable();
    get enabled(): boolean { return this._enabled$.getValue(); }

    constructor(
        @Inject(SheetsFilterService) private readonly _sheetsFilterService: SheetsFilterService,
        @Inject(SheetsFilterController) private readonly _sheetsFilterController: SheetsFilterController,
        @ICommandService protected readonly _commandService: ICommandService,
    ) {
        super();
    }

    setVisible(visible: boolean) {
        this._visible$.next(visible);
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
        )
    }
}

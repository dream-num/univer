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

import type { IRange } from '@univerjs/core';
import {
    Disposable,
    DisposableCollection,
    ICommandService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import type { IMoveRangeCommandParams } from '@univerjs/sheets';
import { MoveRangeCommand, NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import { ISelectionRenderService } from '../services/selection/selection-render.service';

@OnLifecycle(LifecycleStages.Steady, MoveRangeController)
export class MoveRangeController extends Disposable {
    constructor(
        @Inject(ISelectionRenderService) private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ICommandService) private readonly _commandService: ICommandService
    ) {
        super();
        this._initialize();
    }

    private _initialize = () => {
        const disposableCollection = new DisposableCollection();

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoveEnd$.subscribe(() => {
                    // Each range change requires re-listening
                    disposableCollection.dispose();

                    const current = this._selectionManagerService.getCurrent();

                    /**
                     * Moving the selection only responds to regular selections;
                     * it does not apply to selections for features like formulas or charts.
                     */
                    if (current?.pluginName !== NORMAL_SELECTION_PLUGIN_NAME) {
                        return;
                    }

                    const selectionControls = this._selectionRenderService.getCurrentControls();
                    selectionControls.forEach((controlSelection) => {
                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionMoved$.subscribe((_toRange) => {
                                    if (!_toRange) {
                                        return;
                                    }
                                    const _fromRange = controlSelection.model.getRange();
                                    const fromRange: IRange = {
                                        startRow: _fromRange.startRow,
                                        startColumn: _fromRange.startColumn,
                                        endRow: _fromRange.endRow,
                                        endColumn: _fromRange.endColumn,
                                        rangeType: _fromRange.rangeType,
                                    };
                                    const toRange: IRange = {
                                        startRow: _toRange.startRow,
                                        startColumn: _toRange.startColumn,
                                        endRow: _toRange.endRow,
                                        endColumn: _toRange.endColumn,
                                        // rangeType must equal to fromRange
                                        rangeType: _fromRange.rangeType,
                                    };

                                    if (
                                        fromRange.startRow === toRange.startRow &&
                                        fromRange.startColumn === toRange.startColumn
                                    ) {
                                        return;
                                    }

                                    if (toRange.startRow < 0 || toRange.startColumn < 0) {
                                        return;
                                    }

                                    const params: IMoveRangeCommandParams = {
                                        fromRange,
                                        toRange,
                                    };
                                    this._commandService.executeCommand(MoveRangeCommand.id, params);
                                })
                            )
                        );
                    });
                })
            )
        );
    };
}

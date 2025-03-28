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

import type { IRange, Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { IMoveRangeCommandParams } from '@univerjs/sheets';
import {
    Disposable,
    DisposableCollection,
    ICommandService,
    Inject,
    toDisposable,
} from '@univerjs/core';

import { MoveRangeCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { ISheetSelectionRenderService } from '../services/selection/base-selection-render.service';

export class MoveRangeRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(ISheetSelectionRenderService) private readonly _selectionRenderService: ISheetSelectionRenderService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(ICommandService) private readonly _commandService: ICommandService
    ) {
        super();
        this._initialize();
    }

    private _initialize = () => {
        const disposableCollection = new DisposableCollection();

        this.disposeWithMe(
            this._selectionManagerService.selectionMoveEnd$.subscribe(() => {
                // Each range change requires re-listening
                disposableCollection.dispose();

                const selectionControls = this._selectionRenderService.getSelectionControls();
                selectionControls.forEach((controlSelection) => {
                    disposableCollection.add(
                        toDisposable(
                            controlSelection.selectionMoveEnd$.subscribe((_toRange) => {
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
        );
    };
}

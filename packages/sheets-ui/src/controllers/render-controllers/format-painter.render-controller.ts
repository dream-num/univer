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

import type { Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import {
    Disposable,
    ICommandService,
    toDisposable,
} from '@univerjs/core';
import { CURSOR_TYPE } from '@univerjs/engine-render';

import { ApplyFormatPainterCommand, SetOnceFormatPainterCommand } from '../../commands/commands/set-format-painter.command';
import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';
import { ISheetSelectionRenderService } from '../../services/selection/base-selection-render.service';

export class FormatPainterRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IFormatPainterService private readonly _formatPainterService: IFormatPainterService,
        @ISheetSelectionRenderService private readonly _selectionRenderService: ISheetSelectionRenderService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._initialize();
    }

    private _initialize() {
        this._bindFormatPainterStatus();
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(this._selectionRenderService.selectionMoveEnd$.subscribe((selections) => {
            if (this._formatPainterService.getStatus() !== FormatPainterStatus.OFF) {
                const { rangeWithCoord } = selections[selections.length - 1];
                this._commandService.executeCommand(ApplyFormatPainterCommand.id, {
                    unitId: this._context.unitId,
                    subUnitId: this._context.unit.getActiveSheet()?.getSheetId() || '',
                    range: {
                        startRow: rangeWithCoord.startRow,
                        startColumn: rangeWithCoord.startColumn,
                        endRow: rangeWithCoord.endRow,
                        endColumn: rangeWithCoord.endColumn,
                    },
                });

                    // if once, turn off the format painter
                if (this._formatPainterService.getStatus() === FormatPainterStatus.ONCE) {
                    this._commandService.executeCommand(SetOnceFormatPainterCommand.id);
                }
            }
        })

        );
    }

    private _bindFormatPainterStatus() {
        this.disposeWithMe(
            toDisposable(this._formatPainterService.status$.subscribe((status) => {
                const scene = this._context.scene;
                if (!scene) return;
                if (status !== FormatPainterStatus.OFF) {
                    scene.setDefaultCursor(CURSOR_TYPE.CELL);
                } else {
                    scene.setDefaultCursor(CURSOR_TYPE.DEFAULT);
                }
            }))
        );
    }
}

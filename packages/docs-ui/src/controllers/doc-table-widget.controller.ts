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

import type { DocumentDataModel, IDisposable, Nullable } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, DisposableCollection, ILogService, Inject } from '@univerjs/core';
import { CURSOR_TYPE, Rect } from '@univerjs/engine-render';
import { DocEventManagerService } from '../services/event/doc-event-manager.service';
import { DocSelectionRenderController } from './render-controllers/doc-selection-render.controller';

const RECT_SIZE = 1;
const MIN_COL_WIDTH = 20;
const MIN_ROW_HEIGHT = 50;

export class DocTableWidgetController extends Disposable implements IRenderModule {
    private _rowRect: Nullable<Rect> = null;
    private _columnRect: Nullable<Rect> = null;
    private _hoverDisposable: Nullable<IDisposable> = null;

    private _onPointerDown = false;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocEventManagerService) private readonly _docEventManagerService: DocEventManagerService,
        @Inject(ILogService) private readonly _logService: ILogService,
        @Inject(DocSelectionRenderController) private readonly _docSelectionRenderController: DocSelectionRenderController
    ) {
        super();

        this._initTableEvent();
    }

    private _removeColumnRect() {
        if (this._columnRect) {
            this._context.scene.removeObject(this._columnRect);
            this._columnRect = null;
        }
    }

    private _handleMissTableGrid() {
        if (this._onPointerDown) return;
        this._context.scene.resetCursor();
        this._hoverDisposable?.dispose();
        this._docSelectionRenderController.disableSelection(false);
    }

    private _initTableEvent() {
        this.disposeWithMe(
            this._docEventManagerService.hoverTableColumnGrid$.subscribe((grid) => {
                if (!grid || grid.columnIndex === 0) {
                    this._handleMissTableGrid();
                    return;
                }
                const tableGrids = this._docEventManagerService.getTableBounds();
                const active = tableGrids.find((g) => g.id === grid.tableId);
                if (!active) {
                    this._handleMissTableGrid();
                    return;
                }
                if (this._onPointerDown) return;
                this._context.scene.setCursor(CURSOR_TYPE.COLUMN_RESIZE);
                const disposable = new DisposableCollection();
                this._docSelectionRenderController.disableSelection(true);
                const MIN_X = active.left + (grid.columnIndex === 1 ? 0 : active.colAccumulateWidth[grid.columnIndex - 2]) + MIN_COL_WIDTH;
                const MAX_X = active.left + (grid.columnIndex === active.colAccumulateWidth.length ? Infinity : active.colAccumulateWidth[grid.columnIndex]) - MIN_COL_WIDTH;
                disposable.add(this._context.mainComponent!.onPointerDown$.subscribeEvent((evt) => {
                    this._onPointerDown = true;
                    const { offsetX } = evt;
                    this._columnRect = new Rect(
                        'table-column-resize',
                        {
                            left: offsetX,
                            top: active.top,
                            width: RECT_SIZE,
                            height: active.height,
                            fill: 'blue',
                        }
                    );
                    this._context.scene.addObject(this._columnRect, 100);
                }));

                disposable.add(this._context.scene!.onPointerUp$.subscribeEvent(() => {
                    this._onPointerDown = false;
                    this._context.scene.removeObject(this._columnRect!);
                    this._columnRect = null;
                    disposable.dispose();
                    this._docSelectionRenderController.disableSelection(false);
                }));

                disposable.add(this._context.scene.onPointerMove$.subscribeEvent((evt) => {
                    if (!this._onPointerDown) {
                        return;
                    }
                    const { offsetX } = evt;
                    this._columnRect?.transformByState({ left: Math.min(Math.max(MIN_X, offsetX), MAX_X) });
                    this._columnRect?.makeDirty();
                    this._context.scene.makeDirty();
                }));
                this._hoverDisposable = disposable;
            })
        );

        this.disposeWithMe(
            this._docEventManagerService.hoverTableRowGrid$.subscribe((grid) => {
                this._logService.log('===hoverTableRowGrid', grid);
            })
        );
    }
}

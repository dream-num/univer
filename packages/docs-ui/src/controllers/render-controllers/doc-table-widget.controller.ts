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

import type { DocumentDataModel, IDisposable, INumberUnit, Nullable } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { IDocTableResizeColumnCommandParams, IDocTableResizeRowCommandParams } from '../../commands/commands/table/doc-table-resize.command';
import { Disposable, DisposableCollection, ICommandService, ILogService, Inject } from '@univerjs/core';
import { CURSOR_TYPE, Rect } from '@univerjs/engine-render';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { DocTableResizeColumnCommand, DocTableResizeRowCommand } from '../../commands/commands/table/doc-table-resize.command';
import { DocEventManagerService } from '../../services/event/doc-event-manager.service';
import { DocSelectionRenderController } from './doc-selection-render.controller';

const RECT_SIZE = 1;
const MIN_COL_WIDTH = 20;
const MIN_ROW_HEIGHT = 20;
const WIDGET_Z_INDEX = 100;

export class DocTableWidgetController extends Disposable implements IRenderModule {
    private _rowRect: Nullable<Rect> = null;
    private _columnRect: Nullable<Rect> = null;
    private _hoverDisposable: Nullable<IDisposable> = null;

    private _onPointerDown = false;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocEventManagerService) private readonly _docEventManagerService: DocEventManagerService,
        @Inject(ILogService) private readonly _logService: ILogService,
        @Inject(DocSelectionRenderController) private readonly _docSelectionRenderController: DocSelectionRenderController,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initTableColumnEvent();
        this._initTableRowEvent();
    }

    private _handleMissTableGrid() {
        if (this._onPointerDown) return;
        this._context.scene.resetCursor();
        this._hoverDisposable?.dispose();
        this._docSelectionRenderController.disableSelection(false);
    }

    private _initTableColumnEvent() {
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
                const MIN_X = grid.columnIndex === 0 ? active.minX : (active.left + (grid.columnIndex === 1 ? 0 : active.colAccumulateWidth[grid.columnIndex - 2]) + MIN_COL_WIDTH);
                const MAX_X = grid.columnIndex === 0 ? active.left : (active.left + (grid.columnIndex === active.colAccumulateWidth.length ? active.maxX - active.left : active.colAccumulateWidth[grid.columnIndex]) - MIN_COL_WIDTH);
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
                    this._context.scene.addObject(this._columnRect, WIDGET_Z_INDEX);
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

                disposable.add(this._context.scene!.onPointerUp$.subscribeEvent(() => {
                    this._onPointerDown = false;
                    const targetX = this._columnRect!.left;
                    const originX = active.left + (active.colAccumulateWidth[grid.columnIndex - 1] ?? 0);
                    const movedX = Math.floor(targetX - originX);
                    if (movedX !== 0) {
                        if (grid.columnIndex === 0) {
                            // const newLeft = active.left + movedX - active.minX;
                            // const
                        } else {
                            const resizeInfo: { columnIndex: number; width: INumberUnit }[] = [];
                            const tableId = grid.tableId.split('#')[0];
                            const getColumnWidth = (index: number) => active.colAccumulateWidth[index] - (active.colAccumulateWidth[index - 1] ?? 0);
                            resizeInfo.push({ columnIndex: grid.columnIndex - 1, width: { v: getColumnWidth(grid.columnIndex - 1) + movedX } });
                            if (grid.columnIndex !== active.colAccumulateWidth.length) {
                                resizeInfo.push({ columnIndex: grid.columnIndex, width: { v: getColumnWidth(grid.columnIndex) - movedX } });
                            }
                            const params: IDocTableResizeColumnCommandParams = {
                                tableId,
                                resizeInfo,
                            };
                            this._commandService.syncExecuteCommand(DocTableResizeColumnCommand.id, params);
                        }
                    }

                    this._context.scene.removeObject(this._columnRect!);
                    this._columnRect = null;
                    disposable.dispose();
                    this._docSelectionRenderController.disableSelection(false);
                }));

                this._hoverDisposable = disposable;
            })
        );
    }

    private _initTableRowEvent() {
        this.disposeWithMe(
            this._docEventManagerService.hoverTableRowGrid$.subscribe((grid) => {
                if (!grid || grid.rowIndex === 0) {
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
                this._context.scene.setCursor(CURSOR_TYPE.ROW_RESIZE);
                const disposable = new DisposableCollection();
                this._docSelectionRenderController.disableSelection(true);
                const minY = active.top + (active.rowAccumulateHeight[grid.rowIndex - 2] ?? 0) + MIN_ROW_HEIGHT;
                disposable.add(this._context.mainComponent!.onPointerDown$.subscribeEvent((evt) => {
                    this._onPointerDown = true;
                    const { offsetY } = evt;
                    const scrollY = this._context.scene.getViewportScrollXY(this._context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)!);

                    this._rowRect = new Rect(
                        'table-row-resize',
                        {
                            left: active.left,
                            top: offsetY + scrollY.y,
                            width: active.width,
                            height: RECT_SIZE,
                            fill: 'blue',
                        }
                    );
                    this._context.scene.addObject(this._rowRect, WIDGET_Z_INDEX);
                }));

                disposable.add(this._context.scene.onPointerMove$.subscribeEvent((evt) => {
                    if (!this._onPointerDown) {
                        return;
                    }
                    const { offsetY } = evt;
                    const scrollY = this._context.scene.getViewportScrollXY(this._context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)!);
                    this._rowRect?.transformByState({ top: Math.max(minY, offsetY + scrollY.y) });
                    this._rowRect?.makeDirty();
                    this._context.scene.makeDirty();
                }));

                disposable.add(this._context.scene.onPointerUp$.subscribeEvent(() => {
                    this._onPointerDown = false;
                    const targetY = this._rowRect!.top;
                    const originY = active.top + (active.rowAccumulateHeight[grid.rowIndex - 1] ?? 0);
                    const movedY = Math.floor(targetY - originY);
                    if (movedY !== 0) {
                        const resizeInfo: { rowIndex: number; height: INumberUnit }[] = [];
                        const tableId = grid.tableId.split('#')[0];
                        const getRowHeight = (index: number) => active.rowAccumulateHeight[index] - (active.rowAccumulateHeight[index - 1] ?? 0);
                        resizeInfo.push({ rowIndex: grid.rowIndex - 1, height: { v: getRowHeight(grid.rowIndex - 1) + movedY } });

                        const params: IDocTableResizeRowCommandParams = {
                            tableId,
                            resizeInfo,
                        };
                        this._commandService.syncExecuteCommand(DocTableResizeRowCommand.id, params);
                    }

                    this._context.scene.removeObject(this._rowRect!);
                    this._rowRect = null;
                    disposable.dispose();
                    this._docSelectionRenderController.disableSelection(false);
                }));

                this._hoverDisposable = disposable;
            })
        );
    }
}

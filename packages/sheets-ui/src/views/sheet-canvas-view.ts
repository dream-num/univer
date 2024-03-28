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

import type { Workbook, Worksheet } from '@univerjs/core';
import { ICommandService, RxDisposable, toDisposable } from '@univerjs/core';
import type { IRenderContext, IRenderController, IWheelEvent } from '@univerjs/engine-render';
import {
    IRenderManagerService,
    Layer,
    PointerInput,
    Rect,
    RENDER_CLASS_TYPE,
    ScrollBar,
    Spreadsheet,
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
    Viewport,
} from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

import { SetScrollRelativeCommand } from '../commands/commands/set-scroll.command';
import {
    SHEET_COMPONENT_HEADER_LAYER_INDEX,
    SHEET_COMPONENT_MAIN_LAYER_INDEX,
    SHEET_VIEW_KEY,
    VIEWPORT_KEY,
} from '../common/keys';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

export class SheetCanvasView extends RxDisposable implements IRenderController {
    private readonly _fps$ = new BehaviorSubject<string>('');
    readonly fps$ = this._fps$.asObservable();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();

        this._addNewRender(this._context.unit);
    }

    override dispose(): void {
        this._fps$.complete();
    }

    private _addNewRender(workbook: Workbook) {
        const { scene, engine } = this._context;

        scene.openTransformer();
        scene.addLayer(new Layer(scene, [], 0), new Layer(scene, [], 2));

        this._addComponent(workbook);

        const should = workbook.getShouldRenderLoopImmediately();
        if (should) {
            engine.runRenderLoop(() => {
                scene.render();
                this._fps$.next(Math.round(engine.getFps()).toString());
            });
        }
    }

    private _addComponent(workbook: Workbook) {
        const { scene, components } = this._context;

        const worksheet = workbook.getActiveSheet();

        const unitId = workbook.getUnitId();

        const sheetId = worksheet.getSheetId();

        this._addViewport(worksheet);

        const spreadsheet = new Spreadsheet(SHEET_VIEW_KEY.MAIN);
        const spreadsheetRowHeader = new SpreadsheetRowHeader(SHEET_VIEW_KEY.ROW);
        const spreadsheetColumnHeader = new SpreadsheetColumnHeader(SHEET_VIEW_KEY.COLUMN);
        const SpreadsheetLeftTopPlaceholder = new Rect(SHEET_VIEW_KEY.LEFT_TOP, {
            zIndex: 2,
            left: -1,
            top: -1,
            fill: 'rgb(248, 249, 250)',
            stroke: 'rgb(217, 217, 217)',
            strokeWidth: 1,
        });

        this._context.mainComponent = spreadsheet;
        components.set(SHEET_VIEW_KEY.MAIN, spreadsheet);
        components.set(SHEET_VIEW_KEY.ROW, spreadsheetRowHeader);
        components.set(SHEET_VIEW_KEY.COLUMN, spreadsheetColumnHeader);
        components.set(SHEET_VIEW_KEY.LEFT_TOP, SpreadsheetLeftTopPlaceholder);

        scene.addObjects([spreadsheet], SHEET_COMPONENT_MAIN_LAYER_INDEX);
        scene.addObjects(
            [spreadsheetRowHeader, spreadsheetColumnHeader, SpreadsheetLeftTopPlaceholder],
            SHEET_COMPONENT_HEADER_LAYER_INDEX
        );

        scene.enableLayerCache(SHEET_COMPONENT_MAIN_LAYER_INDEX, SHEET_COMPONENT_HEADER_LAYER_INDEX);
    }

    /**
     * +-----------------+--------------------+-------------------+
     * |  VIEW_LEFT_TOP  |  VIEW_COLUMN_LEFT  | VIEW_COLUMN_RIGHT |
     * +-----------------+--------------------+-------------------+
     * |  VIEW_ROW_TOP   | VIEW_MAIN_LEFT_TOP |   VIEW_MAIN_TOP   |
     * +-----------------+--------------------+-------------------+
     * | VIEW_ROW_BOTTOM |   VIEW_MAIN_LEFT   |     VIEW_MAIN     |
     * +-----------------+--------------------+-------------------+
     */
    private _addViewport(worksheet: Worksheet) {
        const scene = this._context.scene;

        const { rowHeader, columnHeader } = worksheet.getConfig();

        const viewMain = new Viewport(VIEWPORT_KEY.VIEW_MAIN, scene, {
            left: rowHeader.width,
            top: columnHeader.height,
            bottom: 0,
            right: 0,
            isWheelPreventDefaultX: true,
            isRelativeX: true,
            isRelativeY: true,
        });

        new Viewport(VIEWPORT_KEY.VIEW_ROW_TOP, scene, {
            active: false,
            isWheelPreventDefaultX: true,
            isRelativeX: false,
            isRelativeY: false,
        });

        new Viewport(VIEWPORT_KEY.VIEW_ROW_BOTTOM, scene, {
            left: 0,
            top: columnHeader.height,
            bottom: 0,
            width: rowHeader.width,
            isWheelPreventDefaultX: true,
            isRelativeX: false,
            isRelativeY: true,
        });

        new Viewport(VIEWPORT_KEY.VIEW_COLUMN_LEFT, scene, {
            active: false,
            isWheelPreventDefaultX: true,
            isRelativeX: false,
            isRelativeY: false,
        });

        new Viewport(VIEWPORT_KEY.VIEW_COLUMN_RIGHT, scene, {
            left: rowHeader.width,
            top: 0,
            height: columnHeader.height,
            right: 0,
            isWheelPreventDefaultX: true,
            isRelativeX: true,
            isRelativeY: false,
        });

        new Viewport(VIEWPORT_KEY.VIEW_LEFT_TOP, scene, {
            left: 0,
            top: 0,
            width: rowHeader.width,
            height: columnHeader.height,
            isWheelPreventDefaultX: true,
            isRelativeX: false,
            isRelativeY: false,
        });

        new Viewport(VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP, scene, {
            isWheelPreventDefaultX: true,
            active: false,
            isRelativeX: false,
            isRelativeY: false,
        });

        new Viewport(VIEWPORT_KEY.VIEW_MAIN_LEFT, scene, {
            isWheelPreventDefaultX: true,
            active: false,
            isRelativeX: false,
            isRelativeY: true,
        });

        new Viewport(VIEWPORT_KEY.VIEW_MAIN_TOP, scene, {
            isWheelPreventDefaultX: true,
            active: false,
            isRelativeX: true,
            isRelativeY: false,
        });

        // mouse scroll
        this.disposeWithMe(
            toDisposable(
                scene.onMouseWheelObserver.add((evt: IWheelEvent, state) => {
                    if (evt.ctrlKey) {
                        return;
                    }

                    let offsetX = 0;
                    let offsetY = 0;

                    const isLimitedStore = viewMain.limitedScroll();
                    if (evt.inputIndex === PointerInput.MouseWheelX) {
                        const deltaFactor = Math.abs(evt.deltaX);
                        // let magicNumber = deltaFactor < 40 ? 2 : deltaFactor < 80 ? 3 : 4;
                        const scrollNum = deltaFactor;

                        if (evt.deltaX > 0) {
                            offsetX = scrollNum;
                        } else {
                            offsetX = -scrollNum;
                        }
                        this._commandService.executeCommand(SetScrollRelativeCommand.id, { offsetX });

                        // 临界点时执行浏览器行为
                        if (scene.getParent().classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                            if (!isLimitedStore?.isLimitedX) {
                                state.stopPropagation();
                            }
                        } else if (viewMain.isWheelPreventDefaultX) {
                            evt.preventDefault();
                        } else if (!isLimitedStore?.isLimitedX) {
                            evt.preventDefault();
                        }
                    }
                    if (evt.inputIndex === PointerInput.MouseWheelY) {
                        const deltaFactor = Math.abs(evt.deltaY);
                        // let magicNumber = deltaFactor < 40 ? 2 : deltaFactor < 80 ? 3 : 4;
                        let scrollNum = deltaFactor;
                        if (evt.shiftKey) {
                            scrollNum *= 3;
                            if (evt.deltaY > 0) {
                                offsetX = scrollNum;
                            } else {
                                offsetX = -scrollNum;
                            }
                            this._commandService.executeCommand(SetScrollRelativeCommand.id, { offsetX });

                            // 临界点时执行浏览器行为
                            if (scene.getParent().classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                                if (!isLimitedStore?.isLimitedX) {
                                    state.stopPropagation();
                                }
                            } else if (viewMain.isWheelPreventDefaultX) {
                                evt.preventDefault();
                            } else if (!isLimitedStore?.isLimitedX) {
                                evt.preventDefault();
                            }
                        } else {
                            if (evt.deltaY > 0) {
                                offsetY = scrollNum;
                            } else {
                                offsetY = -scrollNum;
                            }
                            this._commandService.executeCommand(SetScrollRelativeCommand.id, { offsetY });

                            // 临界点时执行浏览器行为
                            if (scene.getParent().classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                                if (!isLimitedStore?.isLimitedY) {
                                    state.stopPropagation();
                                }
                            } else if (viewMain.isWheelPreventDefaultY) {
                                evt.preventDefault();
                            } else if (!isLimitedStore?.isLimitedY) {
                                evt.preventDefault();
                            }
                        }
                    }

                    this._context.scene.makeDirty(true);
                })
            )
        );

        // create a scroll bar
        new ScrollBar(viewMain);

        scene.attachControl();

        return viewMain;
    }
}

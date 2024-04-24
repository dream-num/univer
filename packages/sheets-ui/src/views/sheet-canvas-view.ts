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

import type { Nullable, Workbook, Worksheet } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable, toDisposable, UniverInstanceType } from '@univerjs/core';
import type { IRender, IWheelEvent, Scene } from '@univerjs/engine-render';
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
import { BehaviorSubject, takeUntil } from 'rxjs';

import { SetScrollRelativeCommand } from '../commands/commands/set-scroll.command';
import {
    SHEET_COMPONENT_HEADER_LAYER_INDEX,
    SHEET_COMPONENT_MAIN_LAYER_INDEX,
    SHEET_VIEW_KEY,
    VIEWPORT_KEY,
} from '../common/keys';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

/**
 * @todo RenderUnit
 */
@OnLifecycle(LifecycleStages.Ready, SheetCanvasView)
export class SheetCanvasView extends RxDisposable {
    private _scene!: Scene;

    private readonly _fps$ = new BehaviorSubject<string>('');

    readonly fps$ = this._fps$.asObservable();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();
        this._initialize();
    }

    private _initialize() {
        this._init();
    }

    override dispose(): void {
        this._fps$.complete();
    }

    private _init() {
        this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => this._create(workbook));
        this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => this._dispose(workbook));
        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.SHEET).forEach((workbook) => this._create(workbook));
    }

    private _dispose(workbook: Workbook) {
        const unitId = workbook.getUnitId();
        this._renderManagerService.removeRender(unitId);
    }

    private _create(workbook: Nullable<Workbook>) {
        if (!workbook) {
            return;
        }

        const unitId = workbook.getUnitId();
        if (!this._renderManagerService.has(unitId)) {
            this._addNewRender(workbook);
        }
    }

    private _addNewRender(workbook: Workbook) {
        const unitId = workbook.getUnitId();
        const container = workbook.getContainer();

        const parentRenderUnitId = workbook.getParentRenderUnitId();

        if (container != null && parentRenderUnitId != null) {
            throw new Error('container or parentRenderUnitId can only exist one');
        }

        const isAddedToExistedScene = container == null && parentRenderUnitId != null;
        if (isAddedToExistedScene) {
            this._renderManagerService.createRenderWithParent(unitId, parentRenderUnitId);
        } else {
            this._renderManagerService.createRender(unitId);
        }

        const currentRender = this._renderManagerService.getRenderById(unitId);

        if (currentRender == null) {
            return;
        }

        const { scene, engine } = currentRender;

        scene.openTransformer();

        this._scene = scene;

        scene.addLayer(new Layer(scene, [], 0), new Layer(scene, [], 2));

        if (currentRender != null) {
            this._addComponent(currentRender, workbook);
        }

        const should = workbook.getShouldRenderLoopImmediately();

        if (should && !isAddedToExistedScene) {
            engine.runRenderLoop(() => {
                scene.render();
                this._fps$.next(Math.round(engine.getFps()).toString());
            });
        }

        this._renderManagerService.setCurrent(unitId);
    }

    private _addComponent(renderUnit: IRender, workbook: Workbook) {
        const scene = this._scene;

        const worksheet = workbook.getActiveSheet();

        const unitId = workbook.getUnitId();

        const sheetId = worksheet.getSheetId();

        const _viewMain = this._addViewport(worksheet);

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

        renderUnit.mainComponent = spreadsheet;
        renderUnit.components.set(SHEET_VIEW_KEY.MAIN, spreadsheet);
        renderUnit.components.set(SHEET_VIEW_KEY.ROW, spreadsheetRowHeader);
        renderUnit.components.set(SHEET_VIEW_KEY.COLUMN, spreadsheetColumnHeader);
        renderUnit.components.set(SHEET_VIEW_KEY.LEFT_TOP, SpreadsheetLeftTopPlaceholder);

        scene.addObjects([spreadsheet], SHEET_COMPONENT_MAIN_LAYER_INDEX);
        scene.addObjects(
            [spreadsheetRowHeader, spreadsheetColumnHeader, SpreadsheetLeftTopPlaceholder],
            SHEET_COMPONENT_HEADER_LAYER_INDEX
        );

        scene.enableLayerCache(SHEET_COMPONENT_MAIN_LAYER_INDEX, SHEET_COMPONENT_HEADER_LAYER_INDEX);

        this._sheetSkeletonManagerService.setCurrent({ sheetId, unitId });

        // viewMain?.onScrollStopObserver.add(() => {
        //     spreadsheet.makeForceDirty();
        // });
    }

    private _addViewport(worksheet: Worksheet) {
        const scene = this._scene;
        if (scene == null) {
            return;
        }

        const { rowHeader, columnHeader } = worksheet.getConfig();

        const viewMain = new Viewport(VIEWPORT_KEY.VIEW_MAIN, scene, {
            left: rowHeader.width,
            top: columnHeader.height,
            bottom: 0,
            right: 0,
            isWheelPreventDefaultX: true,
        });

        new Viewport(VIEWPORT_KEY.VIEW_ROW_TOP, scene, {
            active: false,
            isWheelPreventDefaultX: true,
        });

        new Viewport(VIEWPORT_KEY.VIEW_ROW_BOTTOM, scene, {
            left: 0,
            top: columnHeader.height,
            bottom: 0,
            width: rowHeader.width,
            isWheelPreventDefaultX: true,
        });

        new Viewport(VIEWPORT_KEY.VIEW_COLUMN_LEFT, scene, {
            active: false,
            isWheelPreventDefaultX: true,
        });

        new Viewport(VIEWPORT_KEY.VIEW_COLUMN_RIGHT, scene, {
            left: rowHeader.width,
            top: 0,
            height: columnHeader.height,
            right: 0,
            isWheelPreventDefaultX: true,
        });

        new Viewport(VIEWPORT_KEY.VIEW_LEFT_TOP, scene, {
            left: 0,
            top: 0,
            width: rowHeader.width,
            height: columnHeader.height,
            isWheelPreventDefaultX: true,
        });

        new Viewport(VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP, scene, {
            isWheelPreventDefaultX: true,
            active: false,
        });

        new Viewport(VIEWPORT_KEY.VIEW_MAIN_LEFT, scene, {
            isWheelPreventDefaultX: true,
            active: false,
        });

        new Viewport(VIEWPORT_KEY.VIEW_MAIN_TOP, scene, {
            isWheelPreventDefaultX: true,
            active: false,
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
                    if (evt.inputIndex === PointerInput.MouseWheelZ) {
                        // TODO
                        // ...
                    }

                    this._scene.makeDirty(true);
                })
            )
        );

        // create a scroll bar
        new ScrollBar(viewMain);

        scene.attachControl();

        return viewMain;
    }
}

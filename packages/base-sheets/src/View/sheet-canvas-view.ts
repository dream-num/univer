import {
    IRender,
    IRenderManagerService,
    ISelectionTransformerShapeManager,
    IWheelEvent,
    Layer,
    PointerInput,
    Rect,
    RENDER_CLASS_TYPE,
    Scene,
    ScrollBar,
    Spreadsheet,
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
    Viewport,
} from '@univerjs/base-render';
import {
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import {
    SHEET_COMPONENT_HEADER_LAYER_INDEX,
    SHEET_COMPONENT_MAIN_LAYER_INDEX,
    SHEET_VIEW_KEY,
    VIEWPORT_KEY,
} from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { SetScrollRelativeCommand } from '../commands/commands/set-scroll.command';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Ready, SheetCanvasView)
export class SheetCanvasView {
    private _scene!: Scene;

    private _currentWorkbook!: Workbook;

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionTransformerShapeManager
        private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        this._currentUniverService.currentSheet$.subscribe((workbook) => {
            if (workbook == null) {
                return;
                // throw new Error('workbook is null');
            }
            this._currentWorkbook = workbook;
            this._addNewRender();
        });
    }

    private _addNewRender() {
        const workbook = this._currentWorkbook;

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
        this._renderManagerService.setCurrent(unitId);

        const currentRender = this._renderManagerService.getRenderById(unitId);

        if (currentRender == null) {
            return;
        }

        const { scene, engine } = currentRender;

        scene.openTransformer();

        this._scene = scene;

        scene.addLayer(Layer.create(scene, [], 0), Layer.create(scene, [], 2));

        if (currentRender != null) {
            this._addComponent(currentRender);
        }

        const should = workbook.getShouldRenderLoopImmediately();

        if (should && !isAddedToExistedScene) {
            engine.runRenderLoop(() => {
                // document.getElementById('app')!.innerHTML = engine.getFps().toString();
                scene.render();
            });
        }
    }

    private _addComponent(currentRender: IRender) {
        const scene = this._scene;

        const workbook = this._currentWorkbook;

        const worksheet = workbook.getActiveSheet();

        const unitId = workbook.getUnitId();

        const sheetId = worksheet.getSheetId();

        this._addViewport(worksheet);

        // const { rowTotalHeight, columnTotalWidth, rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;
        // const rowHeaderWidth = rowHeader.hidden !== true ? rowHeader.width : 0;
        // const columnHeaderHeight = columnHeader.hidden !== true ? columnHeader.height : 0;
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

        currentRender.mainComponent = spreadsheet;
        currentRender.components.set(SHEET_VIEW_KEY.MAIN, spreadsheet);
        currentRender.components.set(SHEET_VIEW_KEY.ROW, spreadsheetRowHeader);
        currentRender.components.set(SHEET_VIEW_KEY.COLUMN, spreadsheetColumnHeader);
        currentRender.components.set(SHEET_VIEW_KEY.LEFT_TOP, SpreadsheetLeftTopPlaceholder);

        scene.addObjects([spreadsheet], SHEET_COMPONENT_MAIN_LAYER_INDEX);
        scene.addObjects(
            [spreadsheetRowHeader, spreadsheetColumnHeader, SpreadsheetLeftTopPlaceholder],
            SHEET_COMPONENT_HEADER_LAYER_INDEX
        );

        this._sheetSkeletonManagerService.setCurrent({ sheetId, unitId });
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
        const viewRowTop = new Viewport(VIEWPORT_KEY.VIEW_ROW_TOP, scene, {
            active: false,
            isWheelPreventDefaultX: true,
        });

        const viewRowBottom = new Viewport(VIEWPORT_KEY.VIEW_ROW_BOTTOM, scene, {
            left: 0,
            top: columnHeader.height,
            bottom: 0,
            width: rowHeader.width,
            isWheelPreventDefaultX: true,
        });

        const viewColumnLeft = new Viewport(VIEWPORT_KEY.VIEW_COLUMN_LEFT, scene, {
            active: false,
            isWheelPreventDefaultX: true,
        });

        const viewColumnRight = new Viewport(VIEWPORT_KEY.VIEW_COLUMN_RIGHT, scene, {
            left: rowHeader.width,
            top: 0,
            height: columnHeader.height,
            right: 0,
            isWheelPreventDefaultX: true,
        });

        const viewLeftTop = new Viewport(VIEWPORT_KEY.VIEW_LEFT_TOP, scene, {
            left: 0,
            top: 0,
            width: rowHeader.width,
            height: columnHeader.height,
            isWheelPreventDefaultX: true,
        });

        const viewMainLeftTop = new Viewport(VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP, scene, {
            isWheelPreventDefaultX: true,
            active: false,
        });

        const viewMainLeft = new Viewport(VIEWPORT_KEY.VIEW_MAIN_LEFT, scene, {
            isWheelPreventDefaultX: true,
            active: false,
        });

        const viewMainTop = new Viewport(VIEWPORT_KEY.VIEW_MAIN_TOP, scene, {
            isWheelPreventDefaultX: true,
            active: false,
        });

        // mouse scroll
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
        });

        // create a scroll bar
        new ScrollBar(viewMain);

        scene
            .addViewport(
                viewMain,
                viewColumnLeft,
                viewColumnRight,
                viewRowTop,
                viewRowBottom,
                viewLeftTop,
                viewMainLeftTop,
                viewMainLeft,
                viewMainTop
            )
            .attachControl();
    }
}

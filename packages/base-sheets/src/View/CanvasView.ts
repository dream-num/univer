import {
    EVENT_TYPE,
    IRender,
    IRenderManagerService,
    IScrollObserverParam,
    ISelectionTransformerShapeManager,
    IWheelEvent,
    Layer,
    Rect,
    Scene,
    ScrollBar,
    Spreadsheet,
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
    Viewport,
} from '@univerjs/base-render';
import {
    EventState,
    ICurrentUniverService,
    LifecycleStages,
    Nullable,
    ObserverManager,
    OnLifecycle,
    Worksheet,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { CANVAS_VIEW_KEY, SHEET_VIEW_KEY } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Ready, CanvasView)
export class CanvasView {
    // TODO: rename to SheetCanvasView
    private _scene: Nullable<Scene>;

    constructor(
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionTransformerShapeManager
        private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        this._initialize();
    }

    private _initialize() {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();

        const unitId = workbook.getUnitId();

        const renderManager = this._renderManagerService.createRenderWithDefaultEngine(unitId);

        renderManager.setCurrent(unitId);

        const currentRender = renderManager.getCurrent();

        if (currentRender == null) {
            return;
        }

        const { scene, engine } = currentRender;

        scene.openTransformer();

        this._scene = scene;

        // sheet zoom [0 ~ 1]
        this._observerManager.requiredObserver<{ zoomRatio: number }>('onZoomRatioSheetObservable').add((value) => {
            this._scene?.scale(value.zoomRatio, value.zoomRatio);
        });

        scene.addLayer(Layer.create(scene, [], 0), Layer.create(scene, [], 2));

        if (currentRender != null) {
            this._initialComponent(currentRender);
        }

        engine.runRenderLoop(() => {
            // document.getElementById('app')!.innerHTML = engine.getFps().toString();
            scene.render();
        });
    }

    private _initialComponent(currentRender: IRender) {
        const scene = this._scene;
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const worksheet = workbook.getActiveSheet();

        const unitId = workbook.getUnitId();

        const sheetId = worksheet.getSheetId();

        this._updateViewport(worksheet);

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

        scene?.addObjects([spreadsheet], 0);
        scene?.addObjects([spreadsheetRowHeader, spreadsheetColumnHeader, SpreadsheetLeftTopPlaceholder], 2);

        this._sheetSkeletonManagerService.setCurrent({ sheetId, unitId });

        // if (spreadsheetSkeleton == null) {
        //     return;
        // }

        // this._selectionTransformerShapeManager.changeRuntime(spreadsheetSkeleton, currentRender.scene);

        // scene?.transformByState({
        //     width: columnWidthByHeader(worksheet) + columnTotalWidth,
        //     height: rowHeightByHeader(worksheet) + rowTotalHeight,
        //     // width: this._columnWidthByTitle(worksheet) + columnTotalWidth + 100,
        //     // height: this._rowHeightByTitle(worksheet) + rowTotalHeight + 200,
        // });
    }

    private _updateViewport(worksheet: Worksheet) {
        const scene = this._scene;
        if (scene == null) {
            return;
        }

        // const { rowTotalHeight, columnTotalWidth, rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;

        // const rowHeaderWidthScale = rowHeaderWidth * scene.scaleX;
        // const columnHeaderHeightScale = columnHeaderHeight * scene.scaleY;

        const { rowHeader, columnHeader } = worksheet.getConfig();

        const viewMain = new Viewport(CANVAS_VIEW_KEY.VIEW_MAIN, scene, {
            left: rowHeader.width,
            top: columnHeader.height,
            bottom: 0,
            right: 0,
            isWheelPreventDefaultX: true,
        });
        const viewTop = new Viewport(CANVAS_VIEW_KEY.VIEW_TOP, scene, {
            left: rowHeader.width,
            top: 0,
            height: columnHeader.height,
            right: 0,
            isWheelPreventDefaultX: true,
        });
        const viewLeft = new Viewport(CANVAS_VIEW_KEY.VIEW_LEFT, scene, {
            left: 0,
            top: columnHeader.height,
            bottom: 0,
            width: rowHeader.width,
            isWheelPreventDefaultX: true,
        });
        const viewLeftTop = new Viewport(CANVAS_VIEW_KEY.VIEW_LEFT_TOP, scene, {
            left: 0,
            top: 0,
            width: rowHeader.width,
            height: columnHeader.height,
            isWheelPreventDefaultX: true,
        });
        // viewMain.linkToViewport(viewLeft, LINK_VIEW_PORT_TYPE.Y);
        // viewMain.linkToViewport(viewTop, LINK_VIEW_PORT_TYPE.X);
        // syncing scroll on the main area to headerbars
        viewMain.onScrollAfterObserver.add((param: IScrollObserverParam) => {
            const { scrollX, scrollY, actualScrollX, actualScrollY } = param;

            viewTop
                .updateScroll({
                    scrollX,
                    actualScrollX,
                })
                .makeDirty(true);

            viewLeft
                .updateScroll({
                    scrollY,
                    actualScrollY,
                })
                .makeDirty(true);
        });

        // 鼠标滚轮缩放
        scene.on(EVENT_TYPE.wheel, (evt: unknown, state: EventState) => {
            const e = evt as IWheelEvent;
            if (e.ctrlKey) {
                const deltaFactor = Math.abs(e.deltaX);
                let ratioDelta = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
                ratioDelta *= e.deltaY > 0 ? -1 : 1;
                if (scene.scaleX < 1) {
                    ratioDelta /= 2;
                }

                const sheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                const currentRatio = sheet.getZoomRatio();
                let nextRatio = +parseFloat(`${currentRatio + ratioDelta}`).toFixed(1);
                nextRatio = nextRatio >= 4 ? 4 : nextRatio <= 0.1 ? 0.1 : nextRatio;

                // sheet.setZoomRatio(nextRatio);

                e.preventDefault();
            } else {
                viewMain.onMouseWheel(e, state);
            }
        });

        const scrollbar = new ScrollBar(viewMain);

        scene.addViewport(viewMain, viewLeft, viewTop, viewLeftTop).attachControl();
    }
}

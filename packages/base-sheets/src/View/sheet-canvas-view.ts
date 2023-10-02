import {
    IRender,
    IRenderManagerService,
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
    ICurrentUniverService,
    LifecycleStages,
    Nullable,
    ObserverManager,
    OnLifecycle,
    Worksheet,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import {
    SHEET_COMPONENT_HEADER_LAYER_INDEX,
    SHEET_COMPONENT_MAIN_LAYER_INDEX,
    SHEET_VIEW_KEY,
    VIEWPORT_KEY,
} from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Ready, SheetCanvasView)
export class SheetCanvasView {
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
        // this._observerManager.requiredObserver<{ zoomRatio: number }>('onZoomRatioSheetObservable').add((value) => {
        //     this._scene?.scale(value.zoomRatio, value.zoomRatio);
        // });

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

        scene?.addObjects([spreadsheet], SHEET_COMPONENT_MAIN_LAYER_INDEX);
        scene?.addObjects(
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
        scene.onMouseWheelObserver.add((e: IWheelEvent, state) => {
            if (e.ctrlKey) {
                return;
            }

            viewMain.onMouseWheel(e, state);
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

import {
    convertSelectionDataToRange,
    IMouseEvent,
    IPointerEvent,
    IRenderManagerService,
    ISelectionTransformerShapeManager,
} from '@univerjs/base-render';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    RANGE_TYPE,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getSheetObject, ISheetObjectParam } from '../Basics/component-tools';
import { VIEWPORT_KEY } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { SetSelectionsOperation } from '../commands/operations/selection.operation';
import { ISetZoomRatioOperationParams, SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../services/selection-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Rendered, SelectionController)
export class SelectionController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionTransformerShapeManager
        private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();

        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { spreadsheetLeftTopPlaceholder } = sheetObject;

        this._onChangeListener();

        this._initialMain(sheetObject);

        this._initialRowHeader(sheetObject);

        this._initialColumnHeader(sheetObject);

        this._skeletonListener();

        this._commandExecutedListener();

        spreadsheetLeftTopPlaceholder?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {});

        this._userActionSyncListener();

        const unitId = workbook.getUnitId();

        const sheetId = worksheet.getSheetId();

        this._selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId,
            sheetId,
        });
    }

    private _initialMain(sheetObject: ISheetObjectParam) {
        const { spreadsheet, scene } = sheetObject;
        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        spreadsheet?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            this._selectionTransformerShapeManager.enableDetectMergedCell();
            this._selectionTransformerShapeManager.eventTrigger(
                evt,
                spreadsheet.zIndex + 1,
                RANGE_TYPE.NORMAL,
                viewportMain
            );
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        });
    }

    private _initialRowHeader(sheetObject: ISheetObjectParam) {
        const { spreadsheetRowHeader, spreadsheet, scene } = sheetObject;
        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        spreadsheetRowHeader?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            this._selectionTransformerShapeManager.disableDetectMergedCell();
            this._selectionTransformerShapeManager.eventTrigger(
                evt,
                (spreadsheet?.zIndex || 1) + 1,
                RANGE_TYPE.ROW,
                viewportMain
            );
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        });

        spreadsheetRowHeader?.onPointerMoveObserver.add((evt: IPointerEvent | IMouseEvent, state) => {});
    }

    private _initialColumnHeader(sheetObject: ISheetObjectParam) {
        const { spreadsheetColumnHeader, spreadsheet, scene } = sheetObject;
        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        spreadsheetColumnHeader?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            this._selectionTransformerShapeManager.disableDetectMergedCell();
            this._selectionTransformerShapeManager.eventTrigger(
                evt,
                (spreadsheet?.zIndex || 1) + 1,
                RANGE_TYPE.COLUMN,
                viewportMain
            );
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        });
    }

    private _onChangeListener() {
        this._selectionManagerService.selectionInfo$.subscribe((param) => {
            this._selectionTransformerShapeManager.reset();
            if (param == null) {
                return;
            }

            for (const selectionWithStyle of param) {
                const selectionData =
                    this._selectionTransformerShapeManager.convertSelectionRangeToData(selectionWithStyle);
                this._selectionTransformerShapeManager.addControlToCurrentByRangeData(selectionData);
            }
        });
    }

    private _userActionSyncListener() {
        this._selectionTransformerShapeManager.selectionRangeWithStyle$.subscribe((selectionDataWithStyleList) => {
            const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
            const unitId = workbook.getUnitId();
            const sheetId = workbook.getActiveSheet().getSheetId();

            this._commandService.executeCommand(SetSelectionsOperation.id, {
                unitId,
                sheetId,
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                selections: selectionDataWithStyleList.map((selectionDataWithStyle) =>
                    convertSelectionDataToRange(selectionDataWithStyle)
                ),
            });
        });
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }

    private _commandExecutedListener() {
        const updateCommandList = [SetZoomRatioOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
                    const worksheet = workbook.getActiveSheet();

                    const params = command.params as ISetZoomRatioOperationParams;
                    const { workbookId, worksheetId } = params;
                    if (!(workbookId === workbook.getUnitId() && worksheetId === worksheet.getSheetId())) {
                        return;
                    }

                    this._selectionManagerService.refreshSelection();
                }
            })
        );
    }

    private _skeletonListener() {
        this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                return;
            }
            const { unitId, sheetId, skeleton } = param;

            const currentRender = this._renderManagerService.getRenderById(unitId);

            if (currentRender == null) {
                return;
            }

            const { scene } = currentRender;

            const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

            this._selectionTransformerShapeManager.changeRuntime(skeleton, scene, viewportMain);

            this._selectionManagerService.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId,
                sheetId,
            });
        });
    }
}

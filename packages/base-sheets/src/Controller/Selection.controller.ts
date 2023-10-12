import {
    convertSelectionDataToRange,
    IMouseEvent,
    IPointerEvent,
    IRenderManagerService,
    ISelectionTransformerShapeManager,
    ISelectionWithStyle,
} from '@univerjs/base-render';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    ICurrentUniverService,
    LifecycleStages,
    OnLifecycle,
    RANGE_TYPE,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getSheetObject, ISheetObjectParam } from '../Basics/component-tools';
import { VIEWPORT_KEY } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { ScrollCommand } from '../commands/commands/set-scroll.command';
import { SetSelectionsOperation } from '../commands/operations/selection.operation';
import { ISetZoomRatioOperationParams, SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../services/selection-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Rendered, SelectionController)
export class SelectionController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
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
            param.length && this._scrollToSelection(param[param.length - 1]);
        });
    }

    private _scrollToSelection(selection: ISelectionWithStyle) {
        let startSheetViewRow;
        let startSheetViewColumn;
        const {
            startRow: selectionStartRow,
            startColumn: selectionStartColumn,
            endRow: selectionEndRow,
            endColumn: selectionEndColumn,
        } = selection.range;
        const { rowHeightAccumulation, columnWidthAccumulation } =
            this._sheetSkeletonManagerService.getCurrent()?.skeleton ?? {};
        if (rowHeightAccumulation == null || columnWidthAccumulation == null) {
            return;
        }
        const scene = this._getSheetObject()?.scene;
        if (scene == null) {
            return;
        }
        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (viewport == null) {
            return;
        }
        const bounds = viewport.getBounding();
        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (skeleton == null) {
            return;
        }
        const {
            startRow: viewportStartRow,
            startColumn: viewportStartColumn,
            endRow: viewportEndRow,
            endColumn: viewportEndColumn,
        } = skeleton.getRowColumnSegment(bounds);
        let isOverflow = false;
        // top overflow
        if (selectionStartRow <= viewportStartRow) {
            isOverflow = true;
            startSheetViewRow = selectionStartRow;
        }
        // left overflow
        if (selectionStartColumn <= viewportStartColumn) {
            isOverflow = true;
            startSheetViewColumn = selectionStartColumn;
        }
        // bottom overflow
        if (selectionEndRow >= viewportEndRow) {
            isOverflow = true;
            const minRowAccumulation = rowHeightAccumulation[selectionEndRow] - viewport.height!;
            for (let r = viewportStartRow; r <= selectionEndRow; r++) {
                if (rowHeightAccumulation[r] >= minRowAccumulation) {
                    startSheetViewRow = r + 1;
                    break;
                }
            }
        }
        // right overflow
        if (selectionEndColumn >= viewportEndColumn) {
            isOverflow = true;
            const minColumnAccumulation = columnWidthAccumulation[selectionEndColumn] - viewport.width!;
            for (let c = viewportStartColumn; c <= selectionEndColumn; c++) {
                if (columnWidthAccumulation[c] >= minColumnAccumulation) {
                    startSheetViewColumn = c + 1;
                    break;
                }
            }
        }
        if (!isOverflow) {
            return;
        }
        // sheetViewStartRow and sheetViewStartColumn maybe undefined
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        this._commandService.executeCommand(ScrollCommand.id, {
            unitId: workbook.getUnitId(),
            sheetId: workbook.getActiveSheet().getSheetId(),
            sheetViewStartRow: startSheetViewRow,
            sheetViewStartColumn: startSheetViewColumn,
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

            this._selectionTransformerShapeManager.changeRuntime(skeleton, scene);

            this._selectionManagerService.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId,
                sheetId,
            });
        });
    }
}

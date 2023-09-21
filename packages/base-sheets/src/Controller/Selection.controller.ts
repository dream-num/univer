import {
    convertSelectionDataToRange,
    IMouseEvent,
    IPointerEvent,
    IRenderManagerService,
    ISelectionTransformerShapeManager,
} from '@univerjs/base-render';
import {
    Disposable,
    ICommandService,
    ICurrentUniverService,
    ISelection,
    ObserverManager,
    SELECTION_TYPE,
    Worksheet,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SHEET_VIEW_KEY } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { SetSelectionsOperation } from '../Commands/Operations/selection.operation';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../Services/selection-manager.service';
import { SheetSkeletonManagerService } from '../Services/sheetSkeleton-manager.service';

export class SelectionController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionTransformerShapeManager
        private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager,

        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const worksheet = workbook.getActiveSheet();

        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { spreadsheet, spreadsheetLeftTopPlaceholder } = sheetObject;

        if (spreadsheet == null) {
            return;
        }

        this._onChangeListener();

        this._initialMain();

        this._initialRowHeader();

        this._initialColumnHeader();

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

    private _initialMain() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }
        const { spreadsheet } = sheetObject;
        spreadsheet?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            if (!this._selectionManagerService.isSelectionEnabled) {
                return;
            }
            let selectionType = this._selectionManagerService.selectionType;
            if (selectionType === SELECTION_TYPE.AUTO) {
                selectionType = SELECTION_TYPE.NORMAL;
            }
            this._selectionTransformerShapeManager.eventTrigger(
                evt,
                this._selectionManagerService.currentStyle,
                spreadsheet.zIndex + 1,
                selectionType,
                SELECTION_TYPE.NORMAL,
                this._selectionManagerService.isDetectMergedCell
            );
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        });
    }

    private _initialRowHeader() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }
        const { spreadsheetRowHeader, spreadsheet } = sheetObject;

        spreadsheetRowHeader?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            if (!this._selectionManagerService.isSelectionEnabled) {
                return;
            }
            let selectionType = this._selectionManagerService.selectionType;
            if (selectionType === SELECTION_TYPE.AUTO) {
                selectionType = SELECTION_TYPE.ROW;
            }
            this._selectionTransformerShapeManager.eventTrigger(
                evt,
                this._selectionManagerService.currentStyle,
                (spreadsheet?.zIndex || 1) + 1,
                selectionType,
                SELECTION_TYPE.ROW,
                this._selectionManagerService.isDetectMergedCell
            );
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        });

        spreadsheetRowHeader?.onPointerMoveObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            console.log('titleMove');
        });
    }

    private _initialColumnHeader() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }
        const { spreadsheetColumnHeader, spreadsheet } = sheetObject;
        spreadsheetColumnHeader?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            if (!this._selectionManagerService.isSelectionEnabled) {
                return;
            }
            let selectionType = this._selectionManagerService.selectionType;
            if (selectionType === SELECTION_TYPE.AUTO) {
                selectionType = SELECTION_TYPE.COLUMN;
            }
            this._selectionTransformerShapeManager.eventTrigger(
                evt,
                this._selectionManagerService.currentStyle,
                (spreadsheet?.zIndex || 1) + 1,
                selectionType,
                SELECTION_TYPE.COLUMN,
                this._selectionManagerService.isDetectMergedCell
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

            for (const selectionRange of param) {
                const selectionData =
                    this._selectionTransformerShapeManager.convertSelectionRangeToData(selectionRange);
                this._selectionTransformerShapeManager.addControlToCurrentByRangeData(selectionData);
            }
        });
    }

    private _userActionSyncListener() {
        this._selectionTransformerShapeManager.selectionRangeWithStyle$.subscribe((selectionDataWithStyleList) => {
            const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
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

            const current = selectionDataWithStyleList[selectionDataWithStyleList.length - 1];
            if (current == null) {
                return;
            }
            const selectionRange = convertSelectionDataToRange(current);
            this._observerManager.getObserver<ISelection>('onChangeSelectionObserver')?.notifyObservers({
                rangeData: selectionRange.rangeData,
                cellRange: selectionRange.cellRange,
                selectionType: selectionRange.selectionType,
            });
        });
    }

    private _update(worksheet: Worksheet) {
        const spreadsheetSkeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;

        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }
        const { scene } = sheetObject;

        if (spreadsheetSkeleton == null) {
            return;
        }

        if (scene) {
            this._selectionTransformerShapeManager.changeRuntime(spreadsheetSkeleton, scene);
        }

        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();

        const unitId = workbook.getUnitId();

        const sheetId = worksheet.getSheetId();

        this._selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId,
            sheetId,
        });
    }

    private _getSheetObject() {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();

        const unitId = workbook.getUnitId();

        const currentRender = this._renderManagerService.getRenderById(unitId);

        if (currentRender == null) {
            return;
        }

        const { components, mainComponent, scene, engine } = currentRender;

        const spreadsheet = mainComponent;
        const spreadsheetRowHeader = components.get(SHEET_VIEW_KEY.ROW);
        const spreadsheetColumnHeader = components.get(SHEET_VIEW_KEY.COLUMN);
        const spreadsheetLeftTopPlaceholder = components.get(SHEET_VIEW_KEY.LEFT_TOP);

        return {
            spreadsheet,
            spreadsheetRowHeader,
            spreadsheetColumnHeader,
            spreadsheetLeftTopPlaceholder,
            scene,
            engine,
        };
    }
}

import {
    convertSelectionDataToRange,
    IMouseEvent,
    IPointerEvent,
    ISelectionTransformerShapeManager,
    Rect,
    Scene,
    Spreadsheet,
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
} from '@univerjs/base-render';
import {
    ICommandService,
    ICurrentUniverService,
    ISelection,
    LocaleService,
    ObserverManager,
    SELECTION_TYPE,
    Worksheet,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { SetSelectionsOperation } from '../../commands/operations/selection.operation';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../services/selection-manager.service';
import { BaseView, CANVAS_VIEW_KEY, CanvasViewRegistry, SHEET_VIEW_KEY } from '../BaseView';

export class SelectionView extends BaseView {
    override viewKey = CANVAS_VIEW_KEY.SELECTION_VIEW;

    constructor(
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ISelectionTransformerShapeManager
        private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
    }

    override onSheetChange(worksheet: Worksheet) {
        this._update(worksheet);
    }

    protected override _initialize() {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        let worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            worksheet = workbook.getSheets()[0];
        }

        const { spreadsheet, spreadsheetLeftTopPlaceholder, spreadsheetSkeleton } = this._getSheetObject();

        if (spreadsheet == null) {
            return;
        }

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

        this._initialRowHeader();

        this._initialColumnHeader();

        spreadsheetLeftTopPlaceholder?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {});

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

        this._update(worksheet);
    }

    private _initialRowHeader() {
        const { spreadsheetRowHeader, spreadsheet, spreadsheetSkeleton } = this._getSheetObject();
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
                spreadsheet.zIndex + 1,
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
        const { spreadsheetColumnHeader, spreadsheet, spreadsheetSkeleton } = this._getSheetObject();
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
                spreadsheet.zIndex + 1,
                selectionType,
                SELECTION_TYPE.COLUMN,
                this._selectionManagerService.isDetectMergedCell
            );
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        });
    }

    private _update(worksheet: Worksheet) {
        const { spreadsheetSkeleton } = this._getSheetObject();
        if (spreadsheetSkeleton == null) {
            return;
        }
        const scene = this.getScene();
        this._selectionTransformerShapeManager.changeRuntime(spreadsheetSkeleton, scene);

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
        const scene = this.getScene();
        const spreadsheet = scene.getObject(SHEET_VIEW_KEY.MAIN) as Spreadsheet;
        const spreadsheetRowHeader = scene.getObject(SHEET_VIEW_KEY.ROW) as SpreadsheetRowHeader;
        const spreadsheetColumnHeader = scene.getObject(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        const spreadsheetLeftTopPlaceholder = scene.getObject(SHEET_VIEW_KEY.LEFT_TOP) as Rect;

        return {
            spreadsheet,
            spreadsheetRowHeader,
            spreadsheetColumnHeader,
            spreadsheetLeftTopPlaceholder,
            spreadsheetSkeleton: spreadsheet.getSkeleton(),
        };
    }
}

export class SelectionViewFactory {
    zIndex = 1;

    /**
     * Generate SheetView Instance
     * @param scene
     * @param injector
     * @returns
     */
    create(scene: Scene, injector: Injector): SelectionView {
        const selectionView = injector.createInstance(SelectionView);
        selectionView.initialize(scene);
        return selectionView;
    }
}

CanvasViewRegistry.add(new SelectionViewFactory());

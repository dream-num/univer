import {
    convertSelectionDataToRange,
    IMouseEvent,
    IPointerEvent,
    ISelectionTransformerShapeManager,
    Rect,
    Scene,
    Spreadsheet,
    SpreadsheetColumnTitle,
    SpreadsheetRowTitle,
} from '@univerjs/base-render';
import { ICurrentUniverService, LocaleService, Worksheet } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../Services/selection-manager.service';
import { BaseView, CANVAS_VIEW_KEY, CanvasViewRegistry, SHEET_VIEW_KEY } from '../BaseView';

export class SelectionView extends BaseView {
    override viewKey = CANVAS_VIEW_KEY.SELECTION_VIEW;

    constructor(
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ISelectionTransformerShapeManager private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
    }

    override updateToSheet(worksheet: Worksheet) {
        const { spreadsheet, spreadsheetRowTitle, spreadsheetColumnTitle, spreadsheetLeftTopPlaceholder, spreadsheetSkeleton } = this._getSheetObject();
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

    protected override _initialize() {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        let worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            worksheet = workbook.getSheets()[0];
        }

        const { spreadsheet, spreadsheetRowTitle, spreadsheetColumnTitle, spreadsheetLeftTopPlaceholder, spreadsheetSkeleton } = this._getSheetObject();

        if (spreadsheet == null) {
            return;
        }

        this._selectionManagerService.selectionInfo$.subscribe((param) => {
            this._selectionTransformerShapeManager.reset();
            if (param == null) {
                return;
            }

            for (const selectionRange of param) {
                const selectionData = this._selectionTransformerShapeManager.convertSelectionRangeToData(selectionRange);
                this._selectionTransformerShapeManager.addControlToCurrentByRangeData(selectionData);
            }
        });

        spreadsheet?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            this._selectionTransformerShapeManager.eventTrigger(evt, spreadsheet.zIndex + 1);

            state.stopPropagation();
        });

        spreadsheetRowTitle?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {});

        spreadsheetColumnTitle?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {});

        spreadsheetLeftTopPlaceholder?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {});

        this._selectionTransformerShapeManager.selectionRangeWithStyle$.subscribe((selectionDataWithStyleList) => {
            this._selectionManagerService.replaceWithNoRefresh(selectionDataWithStyleList.map((selectionDataWithStyle) => convertSelectionDataToRange(selectionDataWithStyle)));
        });

        this.updateToSheet(worksheet);
    }

    private _getSheetObject() {
        const scene = this.getScene();
        const spreadsheet = scene.getObject(SHEET_VIEW_KEY.MAIN) as Spreadsheet;
        const spreadsheetRowTitle = scene.getObject(SHEET_VIEW_KEY.ROW) as SpreadsheetRowTitle;
        const spreadsheetColumnTitle = scene.getObject(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnTitle;
        const spreadsheetLeftTopPlaceholder = scene.getObject(SHEET_VIEW_KEY.LEFT_TOP) as Rect;

        return {
            spreadsheet,
            spreadsheetRowTitle,
            spreadsheetColumnTitle,
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

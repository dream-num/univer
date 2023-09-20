import {
    Rect,
    Scene,
    Spreadsheet,
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
    SpreadsheetSkeleton,
} from '@univerjs/base-render';
import { ICurrentUniverService, LocaleService, Nullable, Worksheet } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { BaseView, CANVAS_VIEW_KEY, CanvasViewRegistry, SHEET_VIEW_KEY } from '../BaseView';

export class SheetView extends BaseView {
    override viewKey = CANVAS_VIEW_KEY.SHEET_VIEW;

    private _spreadsheetSkeleton: Nullable<SpreadsheetSkeleton>;

    private _spreadsheet: Nullable<Spreadsheet>;

    private _spreadsheetRowHeader: Nullable<SpreadsheetRowHeader>;

    private _spreadsheetColumnHeader: Nullable<SpreadsheetColumnHeader>;

    private _spreadsheetLeftTopPlaceholder: Nullable<Rect>;

    constructor(
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
    }

    getSpreadsheetSkeleton() {
        return this._spreadsheetSkeleton;
    }

    getSpreadsheet() {
        return this._spreadsheet;
    }

    getSpreadsheetRowHeader() {
        return this._spreadsheetRowHeader;
    }

    getSpreadsheetColumnHeader() {
        return this._spreadsheetColumnHeader;
    }

    getSpreadsheetLeftTopPlaceholder() {
        return this._spreadsheetLeftTopPlaceholder;
    }

    override onSheetChange(worksheet: Worksheet) {
        const scene = this.getScene();
        const spreadsheetSkeleton = this._buildSkeleton(worksheet);
        const { rowTotalHeight, columnTotalWidth, rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;

        this._spreadsheetSkeleton = spreadsheetSkeleton;
        this._spreadsheet?.updateSkeleton(spreadsheetSkeleton);
        this._spreadsheetRowHeader?.updateSkeleton(spreadsheetSkeleton);
        this._spreadsheetColumnHeader?.updateSkeleton(spreadsheetSkeleton);
        this._spreadsheetLeftTopPlaceholder?.transformByState({
            width: rowHeaderWidth,
            height: columnHeaderHeight,
        });

        scene.transformByState({
            width: this._columnWidthByTitle(worksheet) + columnTotalWidth,
            height: this._rowHeightByTitle(worksheet) + rowTotalHeight,
            // width: this._columnWidthByTitle(worksheet) + columnTotalWidth + 100,
            // height: this._rowHeightByTitle(worksheet) + rowTotalHeight + 200,
        });
        this._updateViewport(rowHeaderWidth, columnHeaderHeight);
    }

    protected override _initialize() {
        const scene = this.getScene();
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        let worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            worksheet = workbook.getSheets()[0];
        }
        const spreadsheetSkeleton = this._buildSkeleton(worksheet);

        const { rowTotalHeight, columnTotalWidth, rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;
        // const rowHeaderWidth = rowHeader.hidden !== true ? rowHeader.width : 0;
        // const columnHeaderHeight = columnHeader.hidden !== true ? columnHeader.height : 0;
        const spreadsheet = new Spreadsheet(SHEET_VIEW_KEY.MAIN, spreadsheetSkeleton);
        const spreadsheetRowHeader = new SpreadsheetRowHeader(SHEET_VIEW_KEY.ROW, spreadsheetSkeleton);
        const spreadsheetColumnHeader = new SpreadsheetColumnHeader(SHEET_VIEW_KEY.COLUMN, spreadsheetSkeleton);
        const SpreadsheetLeftTopPlaceholder = new Rect(SHEET_VIEW_KEY.LEFT_TOP, {
            zIndex: 2,
            left: -1,
            top: -1,
            width: rowHeaderWidth,
            height: columnHeaderHeight,
            fill: 'rgb(248, 249, 250)',
            stroke: 'rgb(217, 217, 217)',
            strokeWidth: 1,
        });

        this._spreadsheetSkeleton = spreadsheetSkeleton;
        this._spreadsheet = spreadsheet;
        this._spreadsheetRowHeader = spreadsheetRowHeader;
        this._spreadsheetColumnHeader = spreadsheetColumnHeader;
        this._spreadsheetLeftTopPlaceholder = SpreadsheetLeftTopPlaceholder;

        scene.addObjects([spreadsheet], 0);
        scene.addObjects([spreadsheetRowHeader, spreadsheetColumnHeader, SpreadsheetLeftTopPlaceholder], 2);
        scene.transformByState({
            width: this._columnWidthByTitle(worksheet) + columnTotalWidth,
            height: this._rowHeightByTitle(worksheet) + rowTotalHeight,
            // width: this._columnWidthByTitle(worksheet) + columnTotalWidth + 100,
            // height: this._rowHeightByTitle(worksheet) + rowTotalHeight + 200,
        });

        this._updateViewport(rowHeaderWidth, columnHeaderHeight);
    }

    private _updateViewport(rowHeaderWidth: number, columnHeaderHeight: number) {
        const scene = this.getScene();
        const rowHeaderWidthScale = rowHeaderWidth * scene.scaleX;
        const columnHeaderHeightScale = columnHeaderHeight * scene.scaleY;

        const viewMain = scene.getViewport(CANVAS_VIEW_KEY.VIEW_MAIN);
        const viewTop = scene.getViewport(CANVAS_VIEW_KEY.VIEW_TOP);
        const viewLeft = scene.getViewport(CANVAS_VIEW_KEY.VIEW_LEFT);
        const viewLeftTop = scene.getViewport(CANVAS_VIEW_KEY.VIEW_LEFT_TOP);

        viewMain?.resize({
            left: rowHeaderWidthScale,
            top: columnHeaderHeightScale,
        });

        viewTop?.resize({
            left: rowHeaderWidthScale,
            height: columnHeaderHeightScale,
        });

        viewLeft?.resize({
            top: columnHeaderHeightScale,
            width: rowHeaderWidthScale,
        });

        viewLeftTop?.resize({
            width: rowHeaderWidthScale,
            height: columnHeaderHeightScale,
        });
    }

    private _buildSkeleton(worksheet: Worksheet) {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const config = worksheet.getConfig();
        const spreadsheetSkeleton = SpreadsheetSkeleton.create(
            config,
            worksheet.getCellMatrix(),
            workbook.getStyles(),
            this._localeService
        );
        return spreadsheetSkeleton;
    }

    private _rowHeightByTitle(worksheet: Worksheet) {
        const config = worksheet?.getConfig();
        const columnHeader = config?.columnHeader.height || 0;
        return columnHeader;
    }

    private _columnWidthByTitle(worksheet: Worksheet) {
        const config = worksheet?.getConfig();
        const rowHeader = config?.rowHeader.width || 0;
        return rowHeader;
    }
}

export class SheetViewFactory {
    zIndex = 0;

    /**
     * Generate SheetView Instance
     * @param scene
     * @param injector
     * @returns
     */
    create(scene: Scene, injector: Injector): SheetView {
        const sheetView = injector.createInstance(SheetView);
        sheetView.initialize(scene);
        return sheetView;
    }
}

CanvasViewRegistry.add(new SheetViewFactory());

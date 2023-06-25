import { IRangeData, PLUGIN_NAMES, Workbook } from '@univerjs/core';
import { Rect, Scene } from '@univerjs/base-render';
import { SheetPlugin, SheetView } from '@univerjs/base-sheets';

import { FormulaPlugin } from '../FormulaPlugin';

enum ARRAY_FORMULA_LINE_MANAGER_KEY {
    top = '__ArrayFormulaLineTopControl__',
    bottom = '__ArrayFormulaLineBottomControl__',
    left = '__ArrayFormulaLineLeftControl__',
    right = '__ArrayFormulaLineRightControl__',
    line = '__ArrayFormulaLineControl__',
}

const LINE_COLOR = '#3969b9';
/**
 * Ant Line Controller
 */
export class ArrayFormulaLineControl {
    private _sheetPlugin: SheetPlugin;

    private _leftControl: Rect;

    private _rightControl: Rect;

    private _topControl: Rect;

    private _bottomControl: Rect;

    private _arrayFormulaLine: Rect;

    /**
     * Create ArrayFormLineController
     * @param plugin
     */
    constructor(private _plugin: FormulaPlugin, private _sheetId: string, private _range: IRangeData) {
        this._sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this._initialize();
    }

    /**
     * Return SheetView
     * @returns
     */
    getSheetView(): SheetView {
        return this._sheetPlugin.getCanvasView().getSheetView();
    }

    /**
     * Return WorkBook
     * @returns Workbook
     */
    getWorkBook(): Workbook {
        return this._sheetPlugin.getWorkbook();
    }

    /**
     * Return SheetView Scene
     * @returns
     */
    getSheetViewScene(): Scene {
        return this._sheetPlugin.getCanvasView().getSheetView().getScene();
    }

    dispose() {
        this._leftControl?.dispose();
        this._rightControl?.dispose();
        this._topControl?.dispose();
        this._bottomControl?.dispose();
        this._arrayFormulaLine?.dispose();
    }

    private _initialize() {
        const { startRow, startColumn, endRow, endColumn } = this._range;
        const sheetId = this._sheetId;

        let workbook = this.getWorkBook();
        let worksheet = workbook.getSheetBySheetId(sheetId);

        if (worksheet == null) {
            throw new Error(`not found sheet from id: ${sheetId}`);
        }

        let rowTitleWidth = worksheet.getConfig().rowTitle.width;
        let columnTitleHeight = worksheet.getConfig().columnTitle.height;

        let rowManager = worksheet.getRowManager();
        let columnManager = worksheet.getColumnManager();

        let totalHeight = 0;
        let totalWidth = 0;
        for (let i = startRow; i < endRow; i++) {
            totalHeight += rowManager.getRowHeight(i);
        }
        for (let i = startColumn; i < endColumn; i++) {
            totalWidth += columnManager.getColumnWidth(i);
        }

        let offsetLeft = 0;
        let offsetTop = 0;
        for (let i = 0; i <= startRow - 1; i++) {
            offsetTop += rowManager.getRowHeight(i);
        }
        for (let i = 0; i <= startColumn - 1; i++) {
            offsetLeft += columnManager.getColumnWidth(i);
        }

        this._arrayFormulaLine = new Rect(ARRAY_FORMULA_LINE_MANAGER_KEY.line, {
            stroke: LINE_COLOR,
            strokeWidth: 1,
            left: offsetLeft + rowTitleWidth,
            top: offsetTop + columnTitleHeight,
            height: totalHeight,
            width: totalWidth,
            evented: false,
        });

        this.getSheetViewScene().addObject(this._arrayFormulaLine);
        // this._arrayFormulaLine.makeDirty(true);
    }
}

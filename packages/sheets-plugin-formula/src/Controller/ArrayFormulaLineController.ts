import { IRenderManagerService, Rect } from '@univerjs/base-render';
import { ICurrentUniverService, ISelectionRange, Workbook } from '@univerjs/core';

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
    private _leftControl: Rect;

    private _rightControl: Rect;

    private _topControl: Rect;

    private _bottomControl: Rect;

    private _arrayFormulaLine: Rect;

    /**
     * Create ArrayFormLineController
     * @param plugin
     */
    constructor(
        private _sheetId: string,
        private _range: ISelectionRange,
        @ICurrentUniverService private readonly _currentUniverSheet: ICurrentUniverService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        this._initialize();
    }

    /**
     * Return WorkBook
     * @returns Workbook
     */
    getWorkBook(): Workbook {
        return this._currentUniverSheet.getCurrentUniverSheetInstance().getWorkBook();
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

        const workbook = this.getWorkBook();
        const worksheet = workbook.getSheetBySheetId(sheetId);

        if (worksheet == null) {
            throw new Error(`not found sheet from id: ${sheetId}`);
        }

        const rowHeaderWidth = worksheet.getConfig().rowHeader.width;
        const columnHeaderHeight = worksheet.getConfig().columnHeader.height;

        const rowManager = worksheet.getRowManager();
        const columnManager = worksheet.getColumnManager();

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
            left: offsetLeft + rowHeaderWidth,
            top: offsetTop + columnHeaderHeight,
            height: totalHeight,
            width: totalWidth,
            evented: false,
        });

        const scene = this._renderManagerService.getCurrent()?.scene;
        scene?.addObject(this._arrayFormulaLine);

        // this._arrayFormulaLine.makeDirty(true);
    }
}

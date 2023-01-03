import { PLUGIN_NAMES, Workbook } from '@univer/core';
import { Rect, Scene } from '@univer/base-render';
import { SheetPlugin, SheetView } from '@univer/base-sheets';
import { ArrayFormulaDataType } from '@univer/base-formula-engine';
import { ArrayFormLine, ArrayFormLineModel, IArrayFormLineRange } from '../Model/ArrayFormLineModel';
import { FormulaPlugin } from '../FormulaPlugin';

enum ARRAY_FORM_LINE_MANAGER_KEY {
    top = '__ArrayFormLineTopControl__',
    bottom = '__ArrayFormLineBottomControl__',
    left = '__ArrayFormLineLeftControl__',
    right = '__ArrayFormLineRightControl__',
}

const LINE_COLOR = '#3969b9';
/**
 * Ant Line Controller
 */
export class ArrayFormLineControl {
    private _arrayFormLineModelList: ArrayFormLineModel[];

    private _sheetPlugin: SheetPlugin;

    private _activeSheetId: string;

    /**
     * Remove ArrayFormLineModel By SheetId
     * @param sheetId
     */
    private _removeArrayFormLineModelBySheetId(sheetId: string): void {
        const index = this._arrayFormLineModelList.findIndex((model) => model.getSheetId() !== sheetId);
        if (index > -1) {
            this._arrayFormLineModelList.splice(index, 1);
        }
    }

    /**
     * Find ArrayFormLineModel By SheetId
     * @param sheetId
     * @returns
     */
    private _findArrayFormLineModelBySheetId(sheetId: string, defaultValue: ArrayFormLineModel): ArrayFormLineModel {
        return this._arrayFormLineModelList.find((model) => model.getSheetId() === sheetId) ?? defaultValue;
    }

    /**
     * Save Or Update ArrayFormLineModel By SheetId
     * @param model
     * @returns
     */
    private _saveOrUpdateArrayFormLineModel(model: ArrayFormLineModel): void {
        for (let i = 0; i < this._arrayFormLineModelList.length; i++) {
            const itemModel = this._arrayFormLineModelList[i];
            if (itemModel.getSheetId() === model.getSheetId()) {
                this._arrayFormLineModelList[i] = model;
                return;
            }
        }
        this._arrayFormLineModelList.push(model);
    }

    /**
     * Create A Sheet ArrayFormLine Rect
     * @param sheetId
     * @param range
     */
    private _createArrayFormLinePathBySheetIdAndRange(sheetId: string, range: IArrayFormLineRange): Rect[] {
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
        for (let i = range.startRow; i < range.endRow; i++) {
            totalHeight += rowManager.getRowHeight(i);
        }
        for (let i = range.startColumn; i < range.endColumn; i++) {
            totalWidth += columnManager.getColumnWidth(i);
        }

        let offsetLeft = 0;
        let offsetTop = 0;
        for (let i = 0; i <= range.startRow - 1; i++) {
            offsetTop += rowManager.getRowHeight(i);
        }
        for (let i = 0; i <= range.startColumn - 1; i++) {
            offsetLeft += columnManager.getColumnWidth(i);
        }

        // TODO: Gradient shadows
        // dark gray #ebebeb
        // light gray #fefefe
        return [
            new Rect(ARRAY_FORM_LINE_MANAGER_KEY.left, {
                stroke: LINE_COLOR,
                strokeWidth: 1,
                left: offsetLeft + rowTitleWidth,
                top: offsetTop + columnTitleHeight,
                height: totalHeight,
                width: 0.1,
                shadowOffsetX: 10,
                shadowOffsetY: 10,
                shadowColor: 'LightSkyBlue',
                shadowBlur: 5,
            }),
            new Rect(ARRAY_FORM_LINE_MANAGER_KEY.top, {
                stroke: LINE_COLOR,
                strokeWidth: 1,
                left: offsetLeft + rowTitleWidth,
                top: offsetTop + columnTitleHeight,
                height: 0.1,
                width: totalWidth,
                shadowOffsetX: 10,
                shadowOffsetY: 10,
                shadowColor: 'LightSkyBlue',
                shadowBlur: 5,
            }),
            new Rect(ARRAY_FORM_LINE_MANAGER_KEY.right, {
                stroke: LINE_COLOR,
                strokeWidth: 1,
                left: offsetLeft + rowTitleWidth + totalWidth,
                top: offsetTop + columnTitleHeight,
                height: totalHeight,
                width: 0.1,
                shadowOffsetX: 10,
                shadowOffsetY: 10,
                shadowColor: 'LightSkyBlue',
                shadowBlur: 5,
            }),
            new Rect(ARRAY_FORM_LINE_MANAGER_KEY.bottom, {
                stroke: LINE_COLOR,
                strokeWidth: 1,
                left: offsetLeft + rowTitleWidth,
                top: offsetTop + columnTitleHeight + totalHeight,
                height: 0.1,
                width: totalWidth,
                shadowOffsetX: 10,
                shadowOffsetY: 10,
                shadowColor: 'LightSkyBlue',
                shadowBlur: 5,
            }),
        ];
    }

    /**
     * Delete ArrayFormLine Canvas UI
     */
    private _deleteSceneAllArrayFormLinePath(): void {
        for (let i = 0; i < this._arrayFormLineModelList.length; i++) {
            let arrayFormLineModel = this._arrayFormLineModelList[i];
            let arrayFormLineList = arrayFormLineModel.getArrayFormLineList();
            for (let j = 0; j < arrayFormLineList.length; j++) {
                let arrayFormLine = arrayFormLineList[j];
                let antPath = arrayFormLine.getPath();
                if (antPath) {
                    this.getSheetViewScene().removeObjects(antPath);
                }
            }
        }
    }

    /**
     * Make Update ArrayFormLine Canvas UI
     */
    private _makeUpdateSceneArrayFormLinePath(): void {
        this._deleteSceneAllArrayFormLinePath();
        for (let i = 0; i < this._arrayFormLineModelList.length; i++) {
            let arrayFormLineModel = this._arrayFormLineModelList[i];
            let arrayFormLineList = arrayFormLineModel.getArrayFormLineList();
            if (arrayFormLineModel.getSheetId() !== this._activeSheetId) {
                continue;
            }
            for (let j = 0; j < arrayFormLineList.length; j++) {
                let arrayFormLine = arrayFormLineList[j];
                let antPath = this._createArrayFormLinePathBySheetIdAndRange(arrayFormLineModel.getSheetId(), arrayFormLine.getRange());
                arrayFormLine.setPath(antPath);
                this.getSheetViewScene().addObjects(antPath);
            }
        }
    }

    /**
     * Create ArrayFormLineController
     * @param plugin
     */
    constructor(private _plugin: FormulaPlugin) {
        this._sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this._arrayFormLineModelList = [];
        this._sheetPlugin
            .getContext()
            .getContextObserver('onAfterChangeActiveSheetObservable')
            .add(() => {
                this._activeSheetId = this._sheetPlugin.getWorkbook().getActiveSheet().getSheetId();
                this._makeUpdateSceneArrayFormLinePath();
            });
        this._sheetPlugin
            .getContext()
            .getContextObserver('onSheetRenderDidMountObservable')
            .add(() => {
                this._activeSheetId = this._sheetPlugin.getWorkbook().getActiveSheet().getSheetId();
                this._makeUpdateSceneArrayFormLinePath();
            });
    }

    /**
     * Remove ArrayFormLine By SheetId
     * @param sheetId
     */
    removeSheetArrayFormLine(sheetId: string = this._activeSheetId): void {
        this._removeArrayFormLineModelBySheetId(sheetId);
        this._makeUpdateSceneArrayFormLinePath();
    }

    /**
     * Add New ArrayFormLine By SheetId
     * @param sheetId
     * @param range
     */
    addArrayFormLineToSheet(range: IArrayFormLineRange, sheetId: string = this._activeSheetId): void {
        const arrayFormLineModel = this._findArrayFormLineModelBySheetId(sheetId, new ArrayFormLineModel(sheetId));
        arrayFormLineModel.addArrayFormLine(new ArrayFormLine(range));
        this._saveOrUpdateArrayFormLineModel(arrayFormLineModel);
        this._makeUpdateSceneArrayFormLinePath();
    }

    refreshArrayFormLine(value: ArrayFormulaDataType) {
        this._arrayFormLineModelList.length = 0;

        Object.keys(value).forEach((sheetId) => {
            const arrayFormula = value[sheetId];
            arrayFormula.forValue((r, c, v) => {
                const arrayFormLineModel = new ArrayFormLineModel(sheetId);
                arrayFormLineModel.addArrayFormLine(new ArrayFormLine(v));
                this._arrayFormLineModelList.push(arrayFormLineModel);
            });
        });

        this._makeUpdateSceneArrayFormLinePath();
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
}

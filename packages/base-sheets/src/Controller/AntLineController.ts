import { Inject } from '@wendellhu/redi';
import { ICurrentUniverService, ObserverManager } from '@univerjs/core';
import { Rect, Scene } from '@univerjs/base-render';

import { AntLine, AntLineModel, IAntLineRange } from '../Model/AntLineModel';
import { CanvasView } from '../View';

enum ANT_LINE_MANAGER_KEY {
    AntLine = '__AntLineShape__',
}

/**
 * Ant Line Controller
 */
export class AntLineControl {
    private _antLineModelList: AntLineModel[];

    private _activeSheetId: string;

    /**
     * Create AntLineController
     */
    constructor(
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        @ICurrentUniverService private readonly _currentUniverSheet: ICurrentUniverService,
        @Inject(CanvasView) private readonly _canvasView: CanvasView
    ) {
        this._antLineModelList = [];

        this._observerManager.requiredObserver('onAfterChangeActiveSheetObservable', 'core').add(() => {
            this._activeSheetId = this._currentUniverSheet.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
            this._makeUpdateSceneAntLineRect();
        });
        this._observerManager.requiredObserver('onSheetRenderDidMountObservable', 'core').add(() => {
            this._activeSheetId = this._currentUniverSheet.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
            this._makeUpdateSceneAntLineRect();
        });
    }

    /**
     * Remove AntLine By SheetId
     * @param sheetId
     */
    removeSheetAntLine(sheetId: string = this._activeSheetId): void {
        this._removeAntLineModelBySheetId(sheetId);
        this._makeUpdateSceneAntLineRect();
    }

    /**
     * Add New AntLine By SheetId
     * @param sheetId
     * @param range
     */
    addAntLineToSheet(range: IAntLineRange, sheetId: string = this._activeSheetId): void {
        const antLineModel = this._findAntLineModelBySheetId(sheetId, new AntLineModel(sheetId));
        antLineModel.addAntLine(new AntLine(range));
        this._saveOrUpdateAntLineModel(antLineModel);
        this._makeUpdateSceneAntLineRect();
    }

    /**
     * Return SheetView Scene
     * @returns
     */
    private getSheetViewScene(): Scene {
        return this._canvasView.getSheetView().getScene();
    }

    /**
     * Remove AntLineModel By SheetId
     * @param sheetId
     */
    private _removeAntLineModelBySheetId(sheetId: string): void {
        const index = this._antLineModelList.findIndex((model) => model.getSheetId() !== sheetId);
        if (index > -1) {
            this._antLineModelList.splice(index, 1);
        }
    }

    /**
     * Find AntLineModel By SheetId
     * @param sheetId
     * @returns
     */
    private _findAntLineModelBySheetId(sheetId: string, defaultValue: AntLineModel): AntLineModel {
        return this._antLineModelList.find((model) => model.getSheetId() === sheetId) ?? defaultValue;
    }

    /**
     * Save Or Update AntLineModel By SheetId
     * @param model
     * @returns
     */
    private _saveOrUpdateAntLineModel(model: AntLineModel): void {
        for (let i = 0; i < this._antLineModelList.length; i++) {
            const itemModel = this._antLineModelList[i];
            if (itemModel.getSheetId() === model.getSheetId()) {
                this._antLineModelList[i] = model;
                return;
            }
        }
        this._antLineModelList.push(model);
    }

    /**
     * Create A Sheet AntLine Rect
     * @param sheetId
     * @param range
     */
    private _createAntLineRectBySheetIdAndRange(sheetId: string, range: IAntLineRange): Rect {
        let workbook = this._currentUniverSheet.getCurrentUniverSheetInstance().getWorkBook();
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

        return new Rect(ANT_LINE_MANAGER_KEY.AntLine, {
            stroke: 'red',
            strokeWidth: 2,
            left: offsetLeft + rowTitleWidth,
            top: offsetTop + columnTitleHeight,
            height: totalHeight,
            width: totalWidth,
            strokeDashArray: [5],
            evented: false,
        });
    }

    /**
     * Delete AntLine Canvas UI
     */
    private _deleteSceneAllAntLineRect(): void {
        for (let i = 0; i < this._antLineModelList.length; i++) {
            let antLineModel = this._antLineModelList[i];
            let antLineList = antLineModel.getAntLineList();
            for (let j = 0; j < antLineList.length; j++) {
                let antLine = antLineList[j];
                let antRect = antLine.getRect();
                if (antRect) {
                    this.getSheetViewScene().removeObject(antRect);
                }
            }
        }
    }

    /**
     * Make Update AntLine Canvas UI
     */
    private _makeUpdateSceneAntLineRect(): void {
        this._deleteSceneAllAntLineRect();
        for (let i = 0; i < this._antLineModelList.length; i++) {
            let antLineModel = this._antLineModelList[i];
            let antLineList = antLineModel.getAntLineList();
            if (antLineModel.getSheetId() !== this._activeSheetId) {
                continue;
            }
            for (let j = 0; j < antLineList.length; j++) {
                let antLine = antLineList[j];
                let antRect = this._createAntLineRectBySheetIdAndRange(antLineModel.getSheetId(), antLine.getRange());
                antLine.setRect(antRect);
                console.log(antRect);
                this.getSheetViewScene().addObject(antRect);
            }
        }
    }
}

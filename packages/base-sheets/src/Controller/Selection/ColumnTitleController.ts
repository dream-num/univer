import { IMouseEvent, IPointerEvent } from '@univer/base-render';
import { SelectionManager } from './SelectionManager';

export class ColumnTitleController {
    private _manager: SelectionManager;

    private _leftTopWidth: number;

    private _startOffsetX: number = 0;

    private _startOffsetY: number = 0;

    constructor(manager: SelectionManager) {
        this._manager = manager;
        this._leftTopWidth = this._manager.getSheetView().getSpreadsheetLeftTopPlaceholder().getState().width;
    }

    pointerDown(e: IPointerEvent | IMouseEvent) {
        // this._manager.getDragLineControl().show();
        const main = this._manager.getMainComponent();
        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = e;
        this._startOffsetX = evtOffsetX;
        this._startOffsetY = evtOffsetY;
        const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);
        const clientX = e.clientX - scrollXY.x - this._leftTopWidth;
        const columnWidthAccumulation = main.getSkeleton()?.columnWidthAccumulation;
        for (let i = 0; i < columnWidthAccumulation?.length; i++) {}
    }

    highlightColumn() {}
}

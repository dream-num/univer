import { IMouseEvent, IPointerEvent, Rect } from '@univer/base-render';
import { Nullable } from '@univer/core';
import { DragLineDirection } from './DragLineController';
import { SelectionManager } from './SelectionManager';

export class RowTitleController {
    private _manager: SelectionManager;

    private _leftTopHeight: number;

    private _startOffsetX: number = 0;

    private _startOffsetY: number = 0;

    private _index: number = 0;

    private _currentHeight: number = 0;

    private _highlightItem: Rect;

    constructor(manager: SelectionManager) {
        this._manager = manager;
        this._leftTopHeight = this._manager.getSheetView().getSpreadsheetLeftTopPlaceholder().getState().height;

        // 创建高亮item
        this._highlightItem = new Rect('HighLightRowTitle', {
            width: this._manager.getSheetView().getSpreadsheetSkeleton().rowTitleWidth,
            height: 0,
            top: 0,
            fill: 'rgb(220,220,220,0.5)',
        });

        this._highlightItem.hide();

        this._highlightItem.evented = false;

        const scene = this._manager.getScene();

        scene.addObject(this._highlightItem, 3);
    }

    pointerDown(e: IPointerEvent | IMouseEvent) {
        const main = this._manager.getMainComponent();
        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = e;
        this._startOffsetX = evtOffsetX;
        this._startOffsetY = evtOffsetY;
        const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);
        const contentRef = this._manager.getPlugin().getSheetContainerControl().getContentRef();
        const clientY = e.clientY + scrollXY.y - this._leftTopHeight - contentRef.current!.getBoundingClientRect().top;
        const rowHeightAccumulation = main.getSkeleton()?.rowHeightAccumulation ?? [];

        for (let i = 0; i < rowHeightAccumulation?.length; i++) {
            if (rowHeightAccumulation[i] >= clientY) {
                this._index = i;
                break;
            }
        }
        // 当前列宽度
        this._currentHeight = rowHeightAccumulation[0];
        if (this._index) {
            this._currentHeight = rowHeightAccumulation[this._index] - rowHeightAccumulation[this._index - 1];
        }

        // 显示拖动线
        if (rowHeightAccumulation[this._index] - clientY <= 5) {
            const end = rowHeightAccumulation[this._index] + this._leftTopHeight;
            const start = (this._index ? rowHeightAccumulation[this._index - 1] : 0) + this._leftTopHeight;

            this._manager.getDragLineControl().create({
                direction: DragLineDirection.HORIZONTAL,
                end,
                start,
                dragUp: this.setRowHeight.bind(this),
            });
            this._manager.getDragLineControl().dragDown(e);
        }
        // 高亮当前行
        this.highlightRow();
    }

    setRowHeight(height: Nullable<number>) {
        const plugin = this._manager.getPlugin();
        const sheet = plugin.getContext().getWorkBook().getActiveSheet();
        if (height === null) {
            sheet.setRowHeights(this._index, 1, 5);
        } else {
            sheet.setRowHeights(this._index, 1, height! + this._currentHeight);
        }
        this.highlightRow();
    }

    highlightRow() {
        this._manager.clearSelectionControls();
        const sheet = this._manager.getPlugin().getWorkbook().getActiveSheet();
        this._manager.addControlToCurrentByRangeData(
            {
                startRow: this._index,
                startColumn: 0,
                endColumn: sheet.getColumnCount() - 1,
                endRow: this._index,
            },
            {
                row: this._index,
                column: 0,
            }
        );
    }

    highlightRowTitle(e: IPointerEvent | IMouseEvent) {
        const main = this._manager.getMainComponent();
        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = e;
        this._startOffsetX = evtOffsetX;
        this._startOffsetY = evtOffsetY;
        const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);
        const contentRef = this._manager.getPlugin().getSheetContainerControl().getContentRef();
        const clientY = e.clientY + scrollXY.y - this._leftTopHeight - contentRef.current!.getBoundingClientRect().top;
        const rowHeightAccumulation = main.getSkeleton()?.rowHeightAccumulation ?? [];

        for (let i = 0; i < rowHeightAccumulation?.length; i++) {
            if (rowHeightAccumulation[i] >= clientY) {
                this._index = i;
                break;
            }
        }
        // 当前行高
        this._currentHeight = rowHeightAccumulation[0];
        let top = this._leftTopHeight;
        if (this._index) {
            this._currentHeight = rowHeightAccumulation[this._index] - rowHeightAccumulation[this._index - 1];
            top = this._leftTopHeight + rowHeightAccumulation[this._index - 1];
        }

        this._highlightItem.transformByState({
            height: this._currentHeight,
            top,
        });

        this._highlightItem.show();
    }

    unHighlightRowTitle() {
        this._highlightItem.hide();
    }
}

import { IMouseEvent, IPointerEvent, Rect } from '@univer/base-render';
import { Nullable } from '@univer/core';
import { DragLineDirection } from './DragLineController';
import { SelectionManager } from './SelectionManager';

export class ColumnTitleController {
    private _manager: SelectionManager;

    private _leftTopWidth: number;

    private _startOffsetX: number = 0;

    private _startOffsetY: number = 0;

    private _index: number = 0;

    private _currentWidth: number = 0;

    private _highlightItem: Rect;

    constructor(manager: SelectionManager) {
        this._manager = manager;
        this._leftTopWidth = this._manager.getSheetView().getSpreadsheetLeftTopPlaceholder().getState().width;
        // 创建高亮item
        this._highlightItem = new Rect('HighLightColumnTitle', {
            width: 0,
            height: this._manager.getSheetView().getSpreadsheetSkeleton().columnTitleHeight,
            left: 0,
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
        const clientX = e.clientX - scrollXY.x - this._leftTopWidth - contentRef.current!.getBoundingClientRect().left;
        const columnWidthAccumulation = main.getSkeleton()?.columnWidthAccumulation ?? [];

        for (let i = 0; i < columnWidthAccumulation?.length; i++) {
            if (columnWidthAccumulation[i] >= clientX) {
                this._index = i;
                break;
            }
        }
        // 当前列宽度
        this._currentWidth = columnWidthAccumulation[0];
        if (this._index) {
            this._currentWidth = columnWidthAccumulation[this._index] - columnWidthAccumulation[this._index - 1];
        }
        // 显示拖动线
        if (columnWidthAccumulation[this._index] - clientX <= 5) {
            const end = columnWidthAccumulation[this._index] + this._leftTopWidth;
            const start = (this._index ? columnWidthAccumulation[this._index - 1] : 0) + this._leftTopWidth;

            this._manager.getDragLineControl().create({
                direction: DragLineDirection.VERTICAL,
                end,
                start,
                dragUp: this.setColumnWidth.bind(this),
            });
            this._manager.getDragLineControl().dragDown(e);
        }
        // 高亮当前列
        this.highlightColumn();
    }

    setColumnWidth(width: Nullable<number>) {
        const plugin = this._manager.getPlugin();
        const sheet = plugin.getContext().getWorkBook().getActiveSheet();
        if (width === null) {
            sheet.setColumnWidth(this._index, 1, 5);
        } else {
            sheet.setColumnWidth(this._index, 1, width! + this._currentWidth);
        }
        this.highlightColumn();
    }

    highlightColumn() {
        this._manager.clearSelectionControls();
        const sheet = this._manager.getPlugin().getWorkbook().getActiveSheet();
        this._manager.addControlToCurrentByRangeData({
            startRow: 0,
            startColumn: this._index,
            endColumn: this._index,
            endRow: sheet.getRowCount() - 1,
        });
    }

    highlightColumnTitle(e: IPointerEvent | IMouseEvent) {
        const main = this._manager.getMainComponent();
        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = e;
        this._startOffsetX = evtOffsetX;
        this._startOffsetY = evtOffsetY;
        const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);
        const contentRef = this._manager.getPlugin().getSheetContainerControl().getContentRef();
        const clientX = e.clientX - scrollXY.x - this._leftTopWidth - contentRef.current!.getBoundingClientRect().left;
        const columnWidthAccumulation = main.getSkeleton()?.columnWidthAccumulation ?? [];

        for (let i = 0; i < columnWidthAccumulation?.length; i++) {
            if (columnWidthAccumulation[i] >= clientX) {
                this._index = i;
                break;
            }
        }

        // 当前列宽度
        this._currentWidth = columnWidthAccumulation[0];
        let left = this._leftTopWidth;
        if (this._index) {
            this._currentWidth = columnWidthAccumulation[this._index] - columnWidthAccumulation[this._index - 1];
            left = this._leftTopWidth + columnWidthAccumulation[this._index - 1];
        }

        this._highlightItem.transformByState({
            width: this._currentWidth,
            left,
        });

        this._highlightItem.show();
    }

    unHighlightColumnTitle() {
        this._highlightItem.hide();
    }
}

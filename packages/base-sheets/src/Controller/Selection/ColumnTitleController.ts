import { CURSOR_TYPE, Group, IMouseEvent, IPointerEvent, Rect } from '@univer/base-render';
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

    private _highlightItem: Group;

    private _content: Rect;

    private _Item: Rect;

    constructor(manager: SelectionManager) {
        this._manager = manager;
        this._leftTopWidth = this._manager.getSheetView().getSpreadsheetLeftTopPlaceholder().getState().width;
        // 创建高亮item
        this._content = new Rect('HighLightContent', {
            width: 0,
            height: this._manager.getSheetView().getSpreadsheetSkeleton().columnTitleHeight,
            left: 0,
            fill: 'rgb(220,220,220,0.5)',
        });
        this._Item = new Rect('HighLightItem', {
            width: 5,
            height: this._manager.getSheetView().getSpreadsheetSkeleton().columnTitleHeight,
            left: 0,
            fill: 'rgb(220,220,220,0.5)',
        });
        this._highlightItem = new Group('HighLightColumnTitle', this._content, this._Item);
        this._highlightItem.hide();

        const scene = this._manager.getScene();

        scene.addObject(this._highlightItem, 3);

        this._initialize();
    }

    // 拖拽图标
    private _initialize() {
        this._highlightItem.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this._highlightItem.show();
        });
        this._highlightItem.onPointerMoveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this._highlightItem.show();
        });
        this._highlightItem.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this._highlightItem.hide();
        });
        this._Item.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this._Item.cursor = CURSOR_TYPE.COLUMN_RESIZE;
        });
        this._Item.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this._Item.resetCursor();
        });
        this._Item.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this.pointerDown(evt);
        });
    }

    pointerDown(e: IPointerEvent | IMouseEvent) {
        const main = this._manager.getMainComponent();
        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = e;
        this._startOffsetX = evtOffsetX;
        this._startOffsetY = evtOffsetY;
        const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);
        const contentRef = this._manager.getPlugin().getSheetContainerControl().getContentRef();
        const clientX = e.clientX + scrollXY.x - this._leftTopWidth - contentRef.current!.getBoundingClientRect().left;
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
                dragUp: (width, e) => {
                    this.setColumnWidth(width);
                    this.highlightColumnTitle(e);
                },
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
        this._manager.addControlToCurrentByRangeData(
            {
                startRow: 0,
                startColumn: this._index,
                endColumn: this._index,
                endRow: sheet.getRowCount() - 1,
            },
            {
                row: 0,
                column: this._index,
            }
        );
    }

    highlightColumnTitle(e: IPointerEvent | IMouseEvent) {
        const main = this._manager.getMainComponent();
        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = e;
        this._startOffsetX = evtOffsetX;
        this._startOffsetY = evtOffsetY;
        const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);
        const contentRef = this._manager.getPlugin().getSheetContainerControl().getContentRef();
        const clientX = e.clientX + scrollXY.x - this._leftTopWidth - contentRef.current!.getBoundingClientRect().left;
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

        this._content.transformByState({
            width: this._currentWidth - 5,
        });

        this._Item.transformByState({
            left: this._currentWidth - 5,
        });

        this._highlightItem.transformByState({
            width: this._currentWidth,
            left,
        });
        this._highlightItem.show();
    }
}

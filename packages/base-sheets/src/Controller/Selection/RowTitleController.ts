import { CURSOR_TYPE, Group, IMouseEvent, IPointerEvent, Rect } from '@univerjs/base-render';
import { Nullable, SheetContext } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { DragLineController, DragLineDirection } from './DragLineController';
import { CanvasView } from '../../View';
import { ISheetContext } from '../../Services/tokens';
import { IColumnTitleControllerHandlers } from './Shared';

export class RowTitleController {
    private _leftTopHeight: number;

    private _startOffsetX: number = 0;

    private _startOffsetY: number = 0;

    private _index: number = 0;

    private _currentHeight: number = 0;

    private _highlightItem: Group;

    private _content: Rect;

    private _Item: Rect;

    private handlers: IColumnTitleControllerHandlers | null = null;

    constructor(
        @ISheetContext private readonly _sheetContext: SheetContext,
        @Inject(CanvasView) private readonly _canvasView: CanvasView,
        @Inject(DragLineController) private readonly _dragLineController: DragLineController
    ) {
        const sheetView = this._canvasView.getSheetView();
        this._leftTopHeight = sheetView.getSpreadsheetLeftTopPlaceholder().getState().height;

        const width = sheetView.getSpreadsheetSkeleton().rowTitleWidth;
        // 创建高亮item
        this._content = new Rect('RowTitleContent', {
            width,
            height: 0,
            top: 0,
            fill: 'rgb(220,220,220,0.5)',
        });
        this._Item = new Rect('RowTitleItem', {
            width,
            height: 5,
            top: 0,
            fill: 'rgb(220,220,220,0.5)',
        });
        this._highlightItem = new Group('RowTitleGroup', this._content, this._Item);
        this._highlightItem.hide();

        const scene = sheetView.getScene();

        scene.addObject(this._highlightItem, 3);

        this._initialize();
    }

    setHandlers(handlers: IColumnTitleControllerHandlers): void {
        this.handlers = handlers;
    }

    pointerDown(e: IPointerEvent | IMouseEvent) {
        const main = this._canvasView.getSheetView().getSpreadsheet();
        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = e;
        this._startOffsetX = evtOffsetX;
        this._startOffsetY = evtOffsetY;
        const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);

        // TODO 配合selection改造 @tony
        // const contentRef = this._manager.getPlugin().getSheetContainerControl().getContentRef();
        // const clientY = e.clientY + scrollXY.y - this._leftTopHeight - contentRef.current!.getBoundingClientRect().top;
        const clientY = 100;
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

            this._dragLineController.create({
                direction: DragLineDirection.HORIZONTAL,
                end,
                start,
                dragUp: this.setRowHeight.bind(this),
            });
            this._dragLineController.dragDown(e);
        }
        // 高亮当前行
        this.highlightRow();
    }

    setRowHeight(height: Nullable<number>) {
        const sheet = this._sheetContext.getWorkBook().getActiveSheet();
        if (height === null) {
            sheet.setRowHeights(this._index, 1, 5);
        } else {
            sheet.setRowHeights(this._index, 1, height! + this._currentHeight);
        }
        this.highlightRow();
    }

    highlightRow() {
        this.handlers?.clearSelectionControls();
        const sheet = this._sheetContext.getWorkBook().getActiveSheet();
        this.handlers?.addControlToCurrentByRangeData(
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
        const main = this._canvasView.getSheetView().getSpreadsheet();
        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = e;
        this._startOffsetX = evtOffsetX;
        this._startOffsetY = evtOffsetY;
        const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);

        // TODO 配合selection改造 @tony
        // const contentRef = this._manager.getPlugin().getSheetContainerControl().getContentRef();
        // const clientY = e.clientY + scrollXY.y - this._leftTopHeight - contentRef.current!.getBoundingClientRect().top;
        const clientY = 100;
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

        this._content.transformByState({
            height: this._currentHeight - 5,
        });

        this._Item.transformByState({
            top: this._currentHeight - 5,
        });

        this._highlightItem.transformByState({
            height: this._currentHeight,
            top,
        });

        this._highlightItem.show();
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
            this._Item.cursor = CURSOR_TYPE.ROW_RESIZE;
        });
        this._Item.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this._Item.resetCursor();
        });
        this._Item.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this.pointerDown(evt);
        });
    }
}
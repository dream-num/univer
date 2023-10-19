import {
    BooleanNumber,
    DocumentModelSimple,
    getColorStyle,
    HorizontalAlign,
    IBorderStyleData,
    ICellData,
    IColumnData,
    IDocumentData,
    IDocumentRenderConfig,
    IPaddingData,
    IRange,
    IRowData,
    ISelectionCellWithCoord,
    isEmptyCell,
    IStyleBase,
    IStyleData,
    ITextRotation,
    ITextStyle,
    IWorksheetConfig,
    LocaleService,
    Nullable,
    ObjectArrayType,
    ObjectMatrix,
    searchArray,
    Styles,
    TextDirection,
    TextDirectionType,
    Tools,
    VerticalAlign,
    Worksheet,
    WrapStrategy,
} from '@univerjs/core';

import { BORDER_TYPE, COLOR_BLACK_RGB } from '../../Basics/Const';
import {
    fixLineWidthByScale,
    getCellByIndex,
    getCellPositionByIndex,
    getFontStyleString,
    isRectIntersect,
    mergeInfoOffset,
} from '../../Basics/Tools';
import { IBoundRect } from '../../Basics/Vector2';
import { DocumentSkeleton } from '../Docs/DocSkeleton';
import { Skeleton } from '../Skeleton';
import { BorderCache, IStylesCache } from './Interfaces';

interface ISetCellCache {
    cache: IStylesCache;
    skipBackgroundAndBorder: boolean;
    styles?: Styles;
    cellData?: ObjectMatrix<ICellData>;
}

interface CellOtherConfig {
    /**
     * textRotation
     */
    textRotation?: ITextRotation;
    /** *
     * textDirection
     */
    textDirection?: Nullable<TextDirection>;
    /**
     * horizontalAlignment
     */
    horizontalAlign?: HorizontalAlign;
    /**
     * verticalAlignment
     */
    verticalAlign?: VerticalAlign;
    /**
     * wrapStrategy
     */
    wrapStrategy?: WrapStrategy;
    /**
     * padding
     */
    paddingData?: IPaddingData;
}

interface IRowColumnSegment {
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
}

const DEFAULT_ROTATE_ANGLE = 90;

export class SpreadsheetSkeleton extends Skeleton {
    private _rowHeightAccumulation: number[] = [];

    private _rowTotalHeight: number = 0;

    private _columnWidthAccumulation: number[] = [];

    private _columnTotalWidth: number = 0;

    private _rowHeaderWidth = 0;

    private _columnHeaderHeight = 0;

    private _rowColumnSegment: IRowColumnSegment = {
        startRow: -1,
        endRow: -1,
        startColumn: -1,
        endColumn: -1,
    };

    private _dataMergeCache: IRange[] = [];

    // private _dataMergeCacheAll: ObjectMatrix<IRange>;

    private _overflowCache: ObjectMatrix<IRange> = new ObjectMatrix();

    private _stylesCache: IStylesCache = {
        background: {},
        font: {},
        border: new ObjectMatrix<BorderCache>(),
    };

    private _showGridlines: BooleanNumber = BooleanNumber.TRUE;

    private _marginTop: number = 0;

    private _marginLeft: number = 0;

    constructor(
        private _worksheet: Worksheet | undefined,
        private _config: IWorksheetConfig,
        private _cellData: ObjectMatrix<ICellData>,
        private _styles: Styles,
        _localeService: LocaleService
    ) {
        super(_localeService);

        this.updateLayout();
        // this.updateDataMerge();
    }

    get rowHeightAccumulation() {
        return this._rowHeightAccumulation;
    }

    get rowTotalHeight() {
        return this._rowTotalHeight;
    }

    get columnWidthAccumulation() {
        return this._columnWidthAccumulation;
    }

    get columnTotalWidth() {
        return this._columnTotalWidth;
    }

    get rowHeaderWidth() {
        return this._rowHeaderWidth;
    }

    get columnHeaderHeight() {
        return this._columnHeaderHeight;
    }

    get rowColumnSegment() {
        return this._rowColumnSegment;
    }

    get dataMergeCache() {
        return this._dataMergeCache;
    }

    get stylesCache() {
        return this._stylesCache;
    }

    get overflowCache() {
        return this._overflowCache;
    }

    get showGridlines() {
        return this._showGridlines;
    }

    get mergeData() {
        return this._config.mergeData;
    }

    get rowHeaderWidthAndMarginLeft() {
        return this.rowHeaderWidth + this._marginLeft;
    }

    get columnHeaderHeightAndMarginTop() {
        return this.columnHeaderHeight + this._marginTop;
    }

    // get dataMergeCacheAll() {
    //     return this._dataMergeCacheAll;
    // }

    /**
     * @deprecated
     * @param config
     * @param cellData
     * @param styles
     * @param LocaleService
     * @returns
     */
    static create(
        worksheet: Worksheet | undefined,
        config: IWorksheetConfig,
        cellData: ObjectMatrix<ICellData>,
        styles: Styles,
        LocaleService: LocaleService
    ) {
        return new SpreadsheetSkeleton(worksheet, config, cellData, styles, LocaleService);
    }

    /**
     * @deprecated should never expose a property that is provided by another module!
     * @returns
     */
    getWorksheetConfig() {
        return this._config;
    }

    /**
     * @deprecated should never expose a property that is provided by another module!
     * @returns
     */
    getCellData() {
        return this._cellData;
    }

    /**
     * @deprecated should never expose a property that is provided by another module!
     * @returns
     */
    getsStyles() {
        return this._styles;
    }

    setOverflowCache(value: ObjectMatrix<IRange>) {
        this._overflowCache = value;
    }

    setMarginLeft(left: number) {
        this._marginLeft = left;
    }

    setMarginTop(top: number) {
        this._marginTop = top;
    }

    calculate(bounds?: IBoundRect) {
        if (!this._config) {
            return;
        }

        this.updateLayout();

        if (!this._rowHeightAccumulation || !this._columnWidthAccumulation) {
            return;
        }

        const { mergeData } = this._config;

        this._rowColumnSegment = this.getRowColumnSegment(bounds);
        this._dataMergeCache = mergeData && this._getMergeCells(mergeData, this._rowColumnSegment);
        this._calculateStylesCache();
        // this._overflowCache = this._calculateOverflowCache();
        return this;
    }

    updateLayout() {
        if (!this.dirty) {
            return;
        }
        const {
            rowData,
            columnData,
            defaultRowHeight,
            defaultColumnWidth,
            rowCount,
            columnCount,
            rowHeader,
            columnHeader,
            showGridlines,
        } = this._config;
        const { rowTotalHeight, rowHeightAccumulation } = this._generateRowMatrixCache(
            rowCount,
            rowData,
            defaultRowHeight
        );
        const { columnTotalWidth, columnWidthAccumulation } = this._generateColumnMatrixCache(
            columnCount,
            columnData,
            defaultColumnWidth
        );

        this._rowHeaderWidth = rowHeader.hidden !== BooleanNumber.TRUE ? rowHeader.width : 0;
        this._columnHeaderHeight = columnHeader.hidden !== BooleanNumber.TRUE ? columnHeader.height : 0;

        this._rowTotalHeight = rowTotalHeight;
        this._rowHeightAccumulation = rowHeightAccumulation;
        this._columnTotalWidth = columnTotalWidth;
        this._columnWidthAccumulation = columnWidthAccumulation;
        this._showGridlines = showGridlines;

        this.makeDirty(false);

        return this;
    }

    // updateDataMerge() {
    //     const { mergeData } = this._config;
    //     this._dataMergeCacheAll = mergeData && this._getMergeCells(mergeData);
    // }

    getRowColumnSegment(bounds?: IBoundRect) {
        return this._getBounding(this._rowHeightAccumulation, this._columnWidthAccumulation, bounds);
    }

    // eslint-disable-next-line max-lines-per-function
    getMergeBounding(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        const mergeData = this._config.mergeData;
        if (!mergeData) {
            return {
                startRow,
                startColumn,
                endRow,
                endColumn,
            };
        }

        let isSearching = true;
        const searchedMarge = new ObjectMatrix<boolean>();

        // the loop breaks when there are not merged cells intersect with the current range
        // NOTE: what about the performance issue?
        while (isSearching) {
            isSearching = false;

            for (let i = 0; i < mergeData.length; i++) {
                const {
                    startRow: mainStartRow,
                    startColumn: mainStartColumn,
                    endRow: mainEndRow,
                    endColumn: mainEndColumn,
                } = mergeData[i];

                if (searchedMarge.getValue(mainStartRow, mainStartColumn)) {
                    continue;
                }

                const rect1 = {
                    left: startColumn,
                    top: startRow,
                    right: endColumn,
                    bottom: endRow,
                };

                const rect2 = {
                    left: mainStartColumn,
                    top: mainStartRow,
                    right: mainEndColumn,
                    bottom: mainEndRow,
                };

                if (isRectIntersect(rect1, rect2)) {
                    startRow = Math.min(startRow, mainStartRow);
                    startColumn = Math.min(startColumn, mainStartColumn);
                    endRow = Math.max(endRow, mainEndRow);
                    endColumn = Math.max(endColumn, mainEndColumn);
                    searchedMarge.setValue(mainStartRow, mainStartColumn, true);
                    isSearching = true;
                }
            }
        }

        return {
            startRow,
            startColumn,
            endRow,
            endColumn,
        };
    }

    appendToOverflowCache(row: number, column: number, startColumn: number, endColumn: number) {
        this._overflowCache.setValue(row, column, {
            startRow: row,
            endRow: row,
            startColumn,
            endColumn,
        });
    }

    getColumnCount() {
        return this._columnWidthAccumulation.length;
    }

    getRowCount() {
        return this._rowHeightAccumulation.length;
    }

    getOverflowPosition(
        contentSize: { width: number; height: number },
        horizontalAlign: HorizontalAlign,
        row: number,
        column: number,
        columnCount: number
    ) {
        const { width: contentWidth, height: contentHeight } = contentSize;

        let startColumn = column;
        let endColumn = column;

        // console.log('documentSkeleton', cell?.v, column, endColumn, row, column, columnCount, contentWidth);

        if (horizontalAlign === HorizontalAlign.CENTER) {
            startColumn = this._getOverflowBound(row, column, 0, contentWidth / 2);
            endColumn = this._getOverflowBound(row, column, columnCount - 1, contentWidth / 2);
        } else if (horizontalAlign === HorizontalAlign.RIGHT) {
            startColumn = this._getOverflowBound(row, column, 0, contentWidth);
        } else {
            endColumn = this._getOverflowBound(row, column, columnCount - 1, contentWidth);
        }

        return {
            startColumn,
            endColumn,
        };
    }

    getNoMergeCellPositionByIndex(rowIndex: number, columnIndex: number, scaleX: number, scaleY: number) {
        const {
            rowHeightAccumulation,
            columnWidthAccumulation,
            rowHeaderWidthAndMarginLeft,
            columnHeaderHeightAndMarginTop,
        } = this;
        // const { scaleX = 1, scaleY = 1 } = this.getParentScale();
        let { startY, endY, startX, endX } = getCellPositionByIndex(
            rowIndex,
            columnIndex,
            rowHeightAccumulation,
            columnWidthAccumulation
        );

        startY = fixLineWidthByScale(startY + columnHeaderHeightAndMarginTop, scaleY);
        endY = fixLineWidthByScale(endY + columnHeaderHeightAndMarginTop, scaleY);
        startX = fixLineWidthByScale(startX + rowHeaderWidthAndMarginLeft, scaleX);
        endX = fixLineWidthByScale(endX + rowHeaderWidthAndMarginLeft, scaleX);

        return {
            startY,
            endY,
            startX,
            endX,
        };
    }

    getNoMergeCellPositionByIndexWithNoHeader(rowIndex: number, columnIndex: number, scaleX: number, scaleY: number) {
        const { rowHeightAccumulation, columnWidthAccumulation } = this;
        // const { scaleX = 1, scaleY = 1 } = this.getParentScale();
        let { startY, endY, startX, endX } = getCellPositionByIndex(
            rowIndex,
            columnIndex,
            rowHeightAccumulation,
            columnWidthAccumulation
        );

        startY = fixLineWidthByScale(startY, scaleY);
        endY = fixLineWidthByScale(endY, scaleY);
        startX = fixLineWidthByScale(startX, scaleX);
        endX = fixLineWidthByScale(endX, scaleX);

        return {
            startY,
            endY,
            startX,
            endX,
        };
    }

    calculateCellIndexByPosition(
        offsetX: number,
        offsetY: number,
        scaleX: number,
        scaleY: number,
        scrollXY: { x: number; y: number }
    ): Nullable<ISelectionCellWithCoord> {
        const { row, column } = this.getCellPositionByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);

        return this.getCellByIndex(row, column, scaleX, scaleY);
    }

    /**
     *
     * @param offsetX scaled offset x
     * @param offsetY scaled offset y
     * @param scaleX scale x
     * @param scaleY scale y
     * @param scrollXY
     * @returns
     */
    getCellPositionByOffset(
        offsetX: number,
        offsetY: number,
        scaleX: number,
        scaleY: number,
        scrollXY: { x: number; y: number }
    ) {
        const row = this.getRowPositionByOffsetY(offsetY, scaleY, scrollXY);

        const column = this.getColumnPositionByOffsetX(offsetX, scaleX, scrollXY);

        return {
            row,
            column,
        };
    }

    /**
     *
     * @param offsetX scaled offset x
     * @param scaleX scale x
     * @param scrollXY
     * @returns
     */

    getColumnPositionByOffsetX(offsetX: number, scaleX: number, scrollXY: { x: number; y: number }) {
        offsetX = this.getTransformOffsetX(offsetX, scaleX, scrollXY);

        const { columnWidthAccumulation } = this;

        let column = searchArray(columnWidthAccumulation, offsetX);

        if (column === Infinity) {
            column = columnWidthAccumulation.length - 1;
        } else if (column === -1) {
            column = 0;
        }

        // if (column === -1) {
        //     const columnLength = columnWidthAccumulation.length - 1;
        //     const lastColumnValue = columnWidthAccumulation[columnLength];
        //     if (lastColumnValue <= offsetX) {
        //         column = columnWidthAccumulation.length - 1;
        //     } else {
        //         column = 0;
        //     }
        // }

        return column;
    }

    /**
     *
     * @param offsetY scaled offset y
     * @param scaleY scale y
     * @param scrollXY
     * @returns
     */
    getRowPositionByOffsetY(offsetY: number, scaleY: number, scrollXY: { x: number; y: number }) {
        const { rowHeightAccumulation } = this;

        offsetY = this.getTransformOffsetY(offsetY, scaleY, scrollXY);

        let row = searchArray(rowHeightAccumulation, offsetY);

        if (row === Infinity) {
            row = rowHeightAccumulation.length - 1;
        } else if (row === -1) {
            row = 0;
        }

        // if (row === -1) {
        //     const rowLength = rowHeightAccumulation.length - 1;
        //     const lastRowValue = rowHeightAccumulation[rowLength];
        //     if (lastRowValue <= offsetY) {
        //         row = rowHeightAccumulation.length - 1;
        //     } else {
        //         row = 0;
        //     }
        // }

        return row;
    }

    getTransformOffsetX(offsetX: number, scaleX: number, scrollXY: { x: number; y: number }) {
        const { x: scrollX } = scrollXY;

        // so we should map physical positions to ideal positions
        offsetX = offsetX / scaleX + scrollX - this.rowHeaderWidthAndMarginLeft;

        return offsetX;
    }

    getTransformOffsetY(offsetY: number, scaleY: number, scrollXY: { x: number; y: number }) {
        const { y: scrollY } = scrollXY;

        // these values are not affected by zooming (ideal positions)
        offsetY = offsetY / scaleY + scrollY - this.columnHeaderHeightAndMarginTop;

        return offsetY;
    }

    getOffsetByPositionX(column: number): number {
        const { columnWidthAccumulation, rowHeaderWidthAndMarginLeft } = this;

        const lastColumnIndex = columnWidthAccumulation.length - 1;
        const columnValue = columnWidthAccumulation[column];
        if (columnValue != null) {
            return columnValue + rowHeaderWidthAndMarginLeft;
        }

        if (column < 0) {
            return rowHeaderWidthAndMarginLeft;
        }

        return columnWidthAccumulation[lastColumnIndex] + rowHeaderWidthAndMarginLeft;
    }

    getOffsetByPositionY(row: number) {
        const { rowHeightAccumulation, columnHeaderHeightAndMarginTop } = this;
        const lastRowIndex = rowHeightAccumulation.length - 1;
        const rowValue = rowHeightAccumulation[row];
        if (rowValue != null) {
            return rowValue + columnHeaderHeightAndMarginTop;
        }

        if (row < 0) {
            return columnHeaderHeightAndMarginTop;
        }

        return rowHeightAccumulation[lastRowIndex] + columnHeaderHeightAndMarginTop;
    }

    getCellByIndex(row: number, column: number, scaleX: number, scaleY: number) {
        const {
            rowHeightAccumulation,
            columnWidthAccumulation,
            rowHeaderWidthAndMarginLeft,
            columnHeaderHeightAndMarginTop,
        } = this;

        const primary = getCellByIndex(
            row,
            column,
            rowHeightAccumulation,
            columnWidthAccumulation,
            this._config.mergeData
        );
        const { isMerged, isMergedMainCell } = primary;
        let { startY, endY, startX, endX, mergeInfo } = primary;

        startY = fixLineWidthByScale(startY + columnHeaderHeightAndMarginTop, scaleY);
        endY = fixLineWidthByScale(endY + columnHeaderHeightAndMarginTop, scaleY);
        startX = fixLineWidthByScale(startX + rowHeaderWidthAndMarginLeft, scaleX);
        endX = fixLineWidthByScale(endX + rowHeaderWidthAndMarginLeft, scaleX);

        mergeInfo = mergeInfoOffset(
            mergeInfo,
            rowHeaderWidthAndMarginLeft,
            columnHeaderHeightAndMarginTop,
            scaleX,
            scaleY
        );

        return {
            actualRow: row,
            actualColumn: column,
            startY,
            endY,
            startX,
            endX,
            isMerged,
            isMergedMainCell,
            mergeInfo,
        };
    }

    getCellByIndexWithNoHeader(row: number, column: number, scaleX: number, scaleY: number) {
        const { rowHeightAccumulation, columnWidthAccumulation } = this;

        const primary = getCellByIndex(
            row,
            column,
            rowHeightAccumulation,
            columnWidthAccumulation,
            this._config.mergeData
        );
        const { isMerged, isMergedMainCell } = primary;
        let { startY, endY, startX, endX, mergeInfo } = primary;

        startY = fixLineWidthByScale(startY, scaleY);
        endY = fixLineWidthByScale(endY, scaleY);
        startX = fixLineWidthByScale(startX, scaleX);
        endX = fixLineWidthByScale(endX, scaleX);

        mergeInfo = mergeInfoOffset(mergeInfo, 0, 0, scaleX, scaleY);

        return {
            actualRow: row,
            actualColumn: column,
            startY,
            endY,
            startX,
            endX,
            isMerged,
            isMergedMainCell,
            mergeInfo,
        };
    }

    // getScrollXYByRelativeCoords(coord: Vector2) {
    //     const scene = this.getParent() as Scene;
    //     let x = 0;
    //     let y = 0;
    //     const viewPort = scene.getActiveViewportByRelativeCoord(coord);
    //     if (viewPort) {
    //         const actualX = viewPort.actualScrollX || 0;
    //         const actualY = viewPort.actualScrollY || 0;
    //         x += actualX;
    //         y += actualY;
    //     }
    //     return {
    //         x,
    //         y,
    //     };
    // }

    // getAncestorScrollXY(offsetX: number, offsetY: number) {
    //     let parent: any = this.getParent();

    //     let x = 0;
    //     let y = 0;
    //     const coord = Vector2.FromArray([offsetX, offsetY]);
    //     while (parent) {
    //         if (parent.classType === RENDER_CLASS_TYPE.SCENE) {
    //             const scene = parent as Scene;
    //             const viewPort = scene.getActiveViewportByCoord(coord);
    //             if (viewPort) {
    //                 const actualX = viewPort.actualScrollX || 0;
    //                 const actualY = viewPort.actualScrollY || 0;
    //                 x += actualX;
    //                 y += actualY;
    //             }
    //         }
    //         parent = parent?.getParent && parent?.getParent();
    //     }
    //     return {
    //         x,
    //         y,
    //     };
    // }

    getSelectionBounding(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        return this.getMergeBounding(startRow, startColumn, endRow, endColumn);
    }

    getCellModel(row: number, column: number) {
        const cell = this._cellData.getValue(row, column);
        const style = this._styles.getStyleByCell(cell);
        if (!cell) {
            return;
        }
        const content = cell.m || cell.v;

        let documentModel: Nullable<DocumentModelSimple>;
        let fontString = 'document';
        const cellOtherConfig = this._getOtherStyle(style) as CellOtherConfig;
        // const {
        //     textRotation = { a: 0, v: BooleanNumber.FALSE },
        //     horizontalAlign = HorizontalAlign.UNSPECIFIED,
        //     verticalAlign = VerticalAlign.UNSPECIFIED,
        //     wrapStrategy = WrapStrategy.UNSPECIFIED,
        // }= CellOtherConfig;
        const textRotation: ITextRotation = cellOtherConfig.textRotation || { a: 0, v: BooleanNumber.FALSE };
        const horizontalAlign: HorizontalAlign = cellOtherConfig.horizontalAlign || HorizontalAlign.UNSPECIFIED;
        const verticalAlign: VerticalAlign = cellOtherConfig.verticalAlign || VerticalAlign.UNSPECIFIED;
        const wrapStrategy: WrapStrategy = cellOtherConfig.wrapStrategy || WrapStrategy.UNSPECIFIED;
        if (cell.p) {
            const { a: angle = 0, v: isVertical = BooleanNumber.FALSE } = textRotation;
            let centerAngle = 0;
            let vertexAngle = angle;
            if (isVertical === BooleanNumber.TRUE) {
                centerAngle = DEFAULT_ROTATE_ANGLE;
                vertexAngle = DEFAULT_ROTATE_ANGLE;
            }
            documentModel = this._updateRenderConfigAndHorizon(cell.p, horizontalAlign, {
                horizontalAlign,
                verticalAlign,
                centerAngle,
                vertexAngle,
                wrapStrategy,
            });
        } else if (content) {
            const textStyle = this._getFontFormat(style);
            fontString = getFontStyleString(textStyle, this._localService).fontCache;

            documentModel = this._getDocumentDataByStyle(content.toString(), textStyle, cellOtherConfig);
        }

        return {
            documentModel,
            fontString,
            textRotation,
            wrapStrategy,
            verticalAlign,
            horizontalAlign,
        };
    }

    getDecomposedOffset(offsetX: number, offsetY: number) {
        let column = searchArray(this._columnWidthAccumulation, offsetX);
        let columnOffset = 0;
        if (column === -1 || column === 0) {
            column = 0;
            columnOffset = offsetX;
        } else {
            columnOffset = offsetX - this._columnWidthAccumulation[column - 1];
        }

        let row = searchArray(this._rowHeightAccumulation, offsetY);
        let rowOffset = 0;
        if (row === -1 || row === 0) {
            row = 0;
            rowOffset = offsetY;
        } else {
            rowOffset = offsetY - this._rowHeightAccumulation[row - 1];
        }
        return {
            row,
            column,
            columnOffset,
            rowOffset,
        };
    }

    /**
     *
     * @param rowHeightAccumulation Row layout information
     * @param columnWidthAccumulation Column layout information
     * @param bounds The range of the visible area of the canvas
     * @returns The range cell index of the canvas visible area
     */
    protected _getBounding(rowHeightAccumulation: number[], columnWidthAccumulation: number[], bounds?: IBoundRect) {
        const rhaLength = rowHeightAccumulation.length;
        const cwaLength = columnWidthAccumulation.length;

        if (!bounds) {
            return {
                startRow: 0,
                endRow: rhaLength - 1,
                startColumn: 0,
                endColumn: cwaLength - 1,
            };
        }

        let dataset_row_st = -1;
        let dataset_row_ed = -1;
        let dataset_col_st = -1;
        let dataset_col_ed = -1;

        const row_st = searchArray(rowHeightAccumulation, bounds.tl.y - this.columnHeaderHeightAndMarginTop);
        const row_ed = searchArray(rowHeightAccumulation, bounds.bl.y - this.columnHeaderHeightAndMarginTop);

        if (row_st === -1 && row_ed === -1) {
            dataset_row_st = -1;
            dataset_row_ed = -1;
        } else {
            if (row_st === -1) {
                dataset_row_st = 0;
            } else {
                dataset_row_st = row_st;
            }

            if (row_ed === Infinity) {
                dataset_row_ed = rhaLength - 1;
            } else if (row_ed >= rhaLength) {
                dataset_row_ed = rhaLength - 1;
            } else {
                dataset_row_ed = row_ed;
            }
        }

        const col_st = searchArray(columnWidthAccumulation, bounds.tl.x - this.rowHeaderWidthAndMarginLeft);
        const col_ed = searchArray(columnWidthAccumulation, bounds.tr.x - this.rowHeaderWidthAndMarginLeft);

        if (col_st === -1 && col_ed === -1) {
            dataset_col_st = -1;
            dataset_col_ed = -1;
        } else {
            if (col_st === -1) {
                dataset_col_st = 0;
            } else {
                dataset_col_st = col_st;
            }

            if (col_ed === Infinity) {
                dataset_col_ed = cwaLength - 1;
            } else if (col_ed >= cwaLength) {
                dataset_col_ed = cwaLength - 1;
            } else {
                dataset_col_ed = col_ed;
            }
        }

        return {
            startRow: dataset_row_st,
            endRow: dataset_row_ed,
            startColumn: dataset_col_st,
            endColumn: dataset_col_ed,
        };
    }

    private _generateRowMatrixCache(
        rowCount: number,
        rowData: ObjectArrayType<Partial<IRowData>>,
        defaultRowHeight: number
    ) {
        let rowTotalHeight = 0;
        const rowHeightAccumulation: number[] = [];
        const data = Tools.createObjectArray(rowData);
        for (let r = 0; r < rowCount; r++) {
            let rowHeight = defaultRowHeight;

            if (data.get(r) != null) {
                const rowDataItem = data.get(r);

                if (!rowDataItem) {
                    continue;
                }

                if (rowDataItem.h != null) {
                    rowHeight = rowDataItem.h;
                } else if (rowDataItem.ah != null) {
                    rowHeight = rowDataItem.ah;
                }

                if (rowDataItem.hd === BooleanNumber.TRUE) {
                    rowHeight = 0;
                }
            }

            rowTotalHeight += rowHeight;

            rowHeightAccumulation.push(rowTotalHeight); // 行的临时长度分布
        }

        return {
            rowTotalHeight,
            rowHeightAccumulation,
        };
    }

    private _generateColumnMatrixCache(
        colCount: number,
        columnData: ObjectArrayType<Partial<IColumnData>>,
        defaultColumnWidth: number
    ) {
        let columnTotalWidth = 0;
        const columnWidthAccumulation: number[] = [];

        const data = Tools.createObjectArray(columnData);

        for (let c = 0; c < colCount; c++) {
            let columnWidth = defaultColumnWidth;

            if (data.get(c) != null) {
                const columnDataItem = data.get(c);

                if (!columnDataItem) {
                    continue;
                }

                if (columnDataItem.w != null) {
                    columnWidth = columnDataItem.w;
                }

                if (columnDataItem.hd === BooleanNumber.TRUE) {
                    columnWidth = 0;
                }
            }

            columnTotalWidth += columnWidth;

            columnWidthAccumulation.push(columnTotalWidth); // 列的临时长度分布
        }

        return {
            columnTotalWidth,
            columnWidthAccumulation,
        };
    }

    // private _calculateOverflowCache() {
    //     const { font: fontList } = this.stylesCache;
    //     // const mergeRangeCache = this._getMergeRangeCache();
    //     const overflowCache = new ObjectMatrix<IRange>();
    //     const columnCount = this.getColumnCount();
    //     fontList &&
    //         Object.keys(fontList).forEach((fontFormat: string) => {
    //             const fontObjectArray = fontList[fontFormat];
    //             fontObjectArray.forEach((row, fontArray) => {
    //                 fontArray.forEach((column, docsSkeleton) => {
    //                     // overflow handler
    //                     const { documentSkeleton, angle, verticalAlign, horizontalAlign, wrapStrategy } = docsSkeleton;
    //                     const cell = this._cellData.getValue(row, column);
    //                     if (wrapStrategy !== WrapStrategy.OVERFLOW || cell?.n === BooleanNumber.TRUE) {
    //                         return true;
    //                     }

    //                     if (horizontalAlign === HorizontalAlign.JUSTIFIED) {
    //                         return true;
    //                     }

    //                     let contentSize = documentSkeleton.getLastPageSize(angle);

    //                     if (!contentSize) {
    //                         return true;
    //                     }

    //                     // if(angle!==0){
    //                     //     contentSize = {
    //                     //         width: contentSize.width,

    //                     //     }
    //                     // }

    //                     const position = this.getOverflowPosition(contentSize, horizontalAlign, row, column, columnCount);

    //                     const { startColumn, endColumn } = position;
    //                     overflowCache.setValue(row, column, {
    //                         startRow: row,
    //                         endRow: row,
    //                         startColumn,
    //                         endColumn,
    //                     });

    //                     // console.log('appendToOverflowCache', angle, contentSize, { row, column, startColumn, endColumn });
    //                 });
    //             });
    //         });

    //     return overflowCache;
    // }

    private _getOverflowBound(row: number, startColumn: number, endColumn: number, contentWidth: number) {
        let cumWidth = 0;
        if (startColumn > endColumn) {
            const columnCount = this._columnWidthAccumulation.length - 1;
            for (let i = startColumn; i >= endColumn; i--) {
                const column = i;
                const cell = this._cellData.getValue(row, column);
                if ((!isEmptyCell(cell) && column !== startColumn) || this._intersectMergeRange(row, column)) {
                    if (column === startColumn) {
                        return column;
                    }
                    return column + 1 > columnCount ? columnCount : column + 1;
                }
                const { startX, endX } = getCellPositionByIndex(
                    row,
                    column,
                    this.rowHeightAccumulation,
                    this.columnWidthAccumulation
                );
                cumWidth += endX - startX;
                if (contentWidth < cumWidth) {
                    return column;
                }
            }
            return startColumn;
        }
        for (let i = startColumn; i <= endColumn; i++) {
            const column = i;
            const cell = this._cellData.getValue(row, column);
            if ((!isEmptyCell(cell) && column !== startColumn) || this._intersectMergeRange(row, column)) {
                if (column === startColumn) {
                    return column;
                }

                return column - 1 < 0 ? 0 : column - 1;
            }
            const { startX, endX } = getCellPositionByIndex(
                row,
                column,
                this.rowHeightAccumulation,
                this.columnWidthAccumulation
            );
            cumWidth += endX - startX;
            if (contentWidth < cumWidth) {
                return column;
            }
        }
        return endColumn;
    }

    private _intersectMergeRange(row: number, column: number) {
        const dataMergeCache = this.dataMergeCache;
        let isIntersected = false;
        for (const dataCache of dataMergeCache) {
            const {
                startRow: startRowMargeIndex,
                endRow: endRowMargeIndex,
                startColumn: startColumnMargeIndex,
                endColumn: endColumnMargeIndex,
            } = dataCache;
            if (
                row >= startRowMargeIndex &&
                row <= endRowMargeIndex &&
                column >= startColumnMargeIndex &&
                column <= endColumnMargeIndex
            ) {
                isIntersected = true;
                return false;
            }
        }
        // dataMergeCache?.forEach((r, dataMergeRow) => {
        //     dataMergeRow?.forEach((c, dataCache) => {

        //     });
        // });
        return isIntersected;
    }

    // private _getMergeRangeCache() {
    //     const dataMergeCache = this.dataMergeCache;
    //     const mergeRangeCache = new ObjectMatrix<ObjectMatrix<boolean>>();
    //     dataMergeCache?.forEach((r, dataMergeRow) => {
    //         dataMergeRow?.forEach((c, dataCache) => {
    //             const { startRow: startRowMargeIndex, endRow: endRowMargeIndex, startColumn: startColumnMargeIndex, endColumn: endColumnMargeIndex } = dataCache;
    //             const endObject = new ObjectMatrix<boolean>();
    //             endObject.setValue(endRowMargeIndex, endColumnMargeIndex, true);
    //             mergeRangeCache.setValue(startRowMargeIndex, startColumnMargeIndex, endObject);
    //         });
    //     });
    //     return mergeRangeCache;
    // }

    // eslint-disable-next-line max-lines-per-function
    private _calculateStylesCache() {
        this._resetCache();

        const dataMergeCache = this._dataMergeCache;
        const rowColumnSegment = this._rowColumnSegment;
        const columnWidthAccumulation = this.columnWidthAccumulation;
        const { startRow, endRow, startColumn, endColumn } = rowColumnSegment;

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                this._setCellCache(r, c, false);
            }

            // 针对溢出的情况计算文本长度，可视范围左侧列
            for (let c = 0; c < startColumn; c++) {
                this._setCellCache(r, c, true);
            }

            // 针对溢出的情况计算文本长度，可视范围右侧列
            for (let c = endColumn + 1; c < columnWidthAccumulation.length; c++) {
                this._setCellCache(r, c, true);
            }
        }

        for (const data of dataMergeCache) {
            this._setCellCache(data.startRow, data.startColumn, false);
        }

        // dataMergeCache &&
        //     dataMergeCache.forEach((rowIndex: number, row: ObjectArray<IRange>) => {
        //         row.forEach((columnIndex: number, mainCell: IRange) => {
        //             if (!mainCell) {
        //                 return true;
        //             }

        //             this._setCellCache(
        //                 rowIndex,
        //                 columnIndex,
        //                 false,
        //             );
        //         });
        //     });
    }

    private _resetCache() {
        this._stylesCache = {
            background: {},
            font: {},
            border: new ObjectMatrix<BorderCache>(),
        };
    }

    private _setCellCache(r: number, c: number, skipBackgroundAndBorder: boolean) {
        if (!this._cellData) {
            return true;
        }
        const cell = this._cellData.getValue(r, c);
        if (!cell) {
            return true;
        }

        const cache = this._stylesCache;

        // style supports inline styles
        // const style = styles && styles.get(cell.s);
        // const style = getStyle(styles, cell);
        const style = this._styles.getStyleByCell(cell);

        if (!skipBackgroundAndBorder && style && style.bg && style.bg.rgb) {
            const rgb = style.bg.rgb;
            if (!cache.background![rgb]) {
                cache.background![rgb] = new ObjectMatrix();
            }
            const bgCache = cache.background![rgb];

            bgCache.setValue(r, c, rgb);
        }

        if (!skipBackgroundAndBorder && style && style.bd) {
            this._setBorderProps(r, c, BORDER_TYPE.TOP, style, cache);
            this._setBorderProps(r, c, BORDER_TYPE.BOTTOM, style, cache);
            this._setBorderProps(r, c, BORDER_TYPE.LEFT, style, cache);
            this._setBorderProps(r, c, BORDER_TYPE.RIGHT, style, cache);
        }

        const modelObject = this.getCellModel(r, c);

        if (modelObject == null) {
            return;
        }

        const { documentModel, fontString, textRotation, wrapStrategy, verticalAlign, horizontalAlign } = modelObject;

        if (!cache.font![fontString]) {
            cache.font![fontString] = new ObjectMatrix();
        }

        const fontCache = cache.font![fontString];

        let { a: angle } = textRotation as ITextRotation;

        const { v: isVertical = BooleanNumber.FALSE } = textRotation as ITextRotation;
        if (isVertical === BooleanNumber.TRUE) {
            angle = DEFAULT_ROTATE_ANGLE;
        }

        if (documentModel) {
            const documentSkeleton = DocumentSkeleton.create(documentModel, this._localService);
            if (angle === 0 || wrapStrategy !== WrapStrategy.WRAP) {
                documentSkeleton.calculate();
                // console.log(cell.v, documentSkeleton);
            }
            fontCache.setValue(r, c, {
                documentSkeleton,
                angle,
                verticalAlign,
                horizontalAlign,
                wrapStrategy,
                // content: content?.toString(),
            });
        }
    }

    private _updateRenderConfigAndHorizon(
        document: IDocumentData,
        horizontalAlign: HorizontalAlign,
        renderConfig?: IDocumentRenderConfig
    ) {
        if (!renderConfig) {
            return;
        }

        if (!document.body?.dataStream) {
            return;
        }

        if (!document.documentStyle) {
            document.documentStyle = {};
        }
        document.documentStyle.renderConfig = renderConfig;

        const paragraphs = document.body.paragraphs || [];

        for (const paragraph of paragraphs) {
            if (!paragraph.paragraphStyle) {
                paragraph.paragraphStyle = {};
            }

            paragraph.paragraphStyle.horizontalAlign = horizontalAlign;
        }

        return new DocumentModelSimple(document);
    }

    private _getDocumentDataByStyle(content: string, textStyle: ITextStyle, config: CellOtherConfig) {
        const contentLength = content.length;
        const {
            textRotation = { a: 0, v: BooleanNumber.FALSE },
            textDirection = TextDirection.UNSPECIFIED,
            paddingData = {
                t: 0,
                r: 2,
                b: 0,
                l: 2,
            },
            horizontalAlign = HorizontalAlign.UNSPECIFIED,
            verticalAlign = VerticalAlign.UNSPECIFIED,
            wrapStrategy = WrapStrategy.UNSPECIFIED,
        } = config;

        const { a: angle = 0, v: isVertical = BooleanNumber.FALSE } = textRotation;
        const { t: marginTop, r: marginRight, b: marginBottom, l: marginLeft } = paddingData;
        let textDirectionDocument = TextDirectionType.NORMAL;
        let centerAngle = 0;
        let vertexAngle = angle;
        if (isVertical === BooleanNumber.TRUE) {
            centerAngle = DEFAULT_ROTATE_ANGLE;
            vertexAngle = DEFAULT_ROTATE_ANGLE;
            textDirectionDocument = TextDirectionType.TBRL;
        }
        const documentData: IDocumentData = {
            id: 'd',
            body: {
                dataStream: `${content}\r\n`,
                textRuns: [
                    {
                        ts: textStyle,
                        st: 0,
                        ed: contentLength - 1,
                    },
                ],
                paragraphs: [
                    {
                        startIndex: contentLength,
                        paragraphStyle: {
                            horizontalAlign,
                        },
                    },
                ],
            },
            documentStyle: {
                pageSize: {
                    width: Infinity,
                    height: Infinity,
                },
                marginTop,
                marginBottom,
                marginRight,
                marginLeft,
                renderConfig: {
                    horizontalAlign,
                    verticalAlign,
                    centerAngle,
                    vertexAngle,
                    wrapStrategy,
                },
            },
        };

        return new DocumentModelSimple(documentData);
    }

    private _setBorderProps(r: number, c: number, type: BORDER_TYPE, style: IStyleData, cache: IStylesCache) {
        const props: Nullable<IBorderStyleData> = style.bd?.[type];
        if (!props || !cache.border) {
            return true;
        }
        const rgb = getColorStyle(props.cl) || COLOR_BLACK_RGB;

        const borderCache = cache.border;

        if (!borderCache.getValue(r, c)) {
            borderCache.setValue(r, c, { [type]: {} });
        }

        borderCache.getValue(r, c)![type] = {
            type,
            style: props.s,
            color: rgb,
        };
    }

    private _getFontFormat(format?: Nullable<IStyleData>): IStyleBase {
        if (!format) {
            return {};
        }
        const { ff, fs, it, bl, ul, st, ol, cl, bg, bd } = format;
        const style: IStyleBase = {};
        ff && (style.ff = ff);
        fs && (style.fs = fs);
        it && (style.it = it);
        bl && (style.bl = bl);
        ul && (style.ul = ul);
        st && (style.st = st);
        ol && (style.ol = ol);
        cl && (style.cl = cl);
        return style;
    }

    private _getOtherStyle(format?: Nullable<IStyleData>) {
        if (!format) {
            return {};
        }

        const {
            tr: textRotation,

            td: textDirection,

            ht: horizontalAlign,

            vt: verticalAlign,

            tb: wrapStrategy,

            pd: paddingData,
        } = format;

        return {
            textRotation,
            textDirection,
            horizontalAlign,
            verticalAlign,
            wrapStrategy,
            paddingData,
        };
    }

    private _getMergeCells(mergeData: IRange[], rowColumnSegment?: IRowColumnSegment) {
        // const rowColumnSegment = this._rowColumnSegment;
        const endColumnLast = this.columnWidthAccumulation.length - 1;
        if (!rowColumnSegment) {
            const endRow = this.rowHeightAccumulation.length - 1;
            rowColumnSegment = { startRow: 0, startColumn: 0, endRow, endColumn: endColumnLast };
        } else {
            rowColumnSegment = {
                startRow: rowColumnSegment.startRow,
                endRow: rowColumnSegment.endRow,
                endColumn: endColumnLast,
                startColumn: 0,
            };
        }
        const { startRow, startColumn, endRow, endColumn } = rowColumnSegment;
        const cacheDataMerge: IRange[] = [];
        for (let i = 0; i < mergeData.length; i++) {
            const {
                startRow: mergeStartRow,
                endRow: mergeEndRow,
                startColumn: mergeStartColumn,
                endColumn: mergeEndColumn,
            } = mergeData[i];
            for (let r = startRow; r <= endRow; r++) {
                let isBreak = false;
                for (let c = startColumn; c <= endColumn; c++) {
                    if (r >= mergeStartRow && r <= mergeEndRow && c >= mergeStartColumn && c <= mergeEndColumn) {
                        cacheDataMerge.push({
                            startRow: mergeStartRow,
                            endRow: mergeEndRow,
                            startColumn: mergeStartColumn,
                            endColumn: mergeEndColumn,
                        });
                        isBreak = true;
                        break;
                    }
                }
                if (isBreak) {
                    break;
                }
            }
        }
        return cacheDataMerge;
    }
}

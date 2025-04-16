/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-param-reassign */
import type { IObjectArrayPrimitiveType, Nullable } from '../shared';
import type {
    IDocumentData,
    IDocumentRenderConfig,
    IPaddingData,
} from '../types/interfaces';
import type { Styles } from './styles';
import type {
    ICellData,
    ICellInfo,
    ICellWithCoord,
    IColumnData,
    IPosition,
    IRange,
    IRowData,
    ISelectionCell,
    IWorksheetData,
} from './typedef';
import type { Worksheet } from './worksheet';
import { Inject, Injector } from '@wendellhu/redi';
import { AUTO_HEIGHT_FOR_MERGED_CELLS, IS_ROW_STYLE_PRECEDE_COLUMN_STYLE } from '../common/const';
import { DocumentDataModel } from '../docs/data-model/document-data-model';
import { IConfigService } from '../services/config/config.service';
import { IContextService } from '../services/context/context.service';
import { LocaleService } from '../services/locale/locale.service';
import { isCellCoverable, ObjectMatrix, searchArray, Tools } from '../shared';
import { ImageCacheMap } from '../shared/cache/image-cache';
import { getIntersectRange } from '../shared/range';
import { Skeleton } from '../skeleton';
import { BooleanNumber, HorizontalAlign } from '../types/enum';

export interface IGetRowColByPosOptions {
    closeFirst?: boolean;

    /**
     * For searchArray(rowHeightAccumulation) & searchArray(colWidthAccumulation)
     * true means return first matched index in matched sequence.
     * default return last index in matched sequence.
     */
    firstMatch?: boolean;
}

export class SheetSkeleton extends Skeleton {
    /**
     * @deprecated avoid use `IWorksheetData` directly, use API provided by `Worksheet`, otherwise
     * `ViewModel` will be not working.
     */
    protected _worksheetData: IWorksheetData;
    protected _renderRawFormula = false;
    protected _cellData: ObjectMatrix<Nullable<ICellData>>;
    protected _imageCacheMap: ImageCacheMap;
    /**
     * Whether the row style precedes the column style.
     */
    protected _isRowStylePrecedeColumnStyle = false;

    /**
     * Whether auto height for merged cells
     */
    protected _skipAutoHeightForMergedCells = true;

    constructor(
        readonly worksheet: Worksheet,
        protected _styles: Styles,
        @Inject(LocaleService) _localeService: LocaleService,
        @IContextService protected readonly _contextService: IContextService,
        @IConfigService protected readonly _configService: IConfigService,
        @Inject(Injector) protected _injector: Injector
    ) {
        super(_localeService);
        this._worksheetData = this.worksheet.getConfig();
        this._cellData = this.worksheet.getCellMatrix();
        this._imageCacheMap = new ImageCacheMap(this._injector);

        this.initConfig();
    }

    initConfig() {
        this._skipAutoHeightForMergedCells = !(this._configService.getConfig(AUTO_HEIGHT_FOR_MERGED_CELLS) ?? false);
        this._isRowStylePrecedeColumnStyle = this._configService.getConfig(IS_ROW_STYLE_PRECEDE_COLUMN_STYLE) ?? false;
    }

    resetCache() {
        //
    }

    /**
     * @deprecated should never expose a property that is provided by another module!
     */
    getWorksheetConfig(): IWorksheetData {
        return this._worksheetData;
    }

    /**
     * Get which Workbook and Worksheet this skeleton is attached to.
     * @returns [unitId, sheetId]
     */
    getLocation(): [string, string] {
        return [this.worksheet.getUnitId(), this.worksheet.getSheetId()];
    }

    private _rowTotalHeight = 0;
    private _columnTotalWidth = 0;
    private _rowHeaderWidth = 0;
    private _columnHeaderHeight = 0;
    private _rowHeightAccumulation: number[] = [];
    private _columnWidthAccumulation: number[] = [];
    private _marginTop: number = 0;
    private _marginLeft: number = 0;
    /** Scale of Scene */
    protected _scaleX: number;
    protected _scaleY: number;
    /** Viewport scrolled value */
    protected _scrollX: number;
    /** Viewport scrolled value */
    protected _scrollY: number;

    set columnHeaderHeight(value: number) {
        this._columnHeaderHeight = value;
        this._worksheetData.columnHeader.height = value;
    }

    set rowHeaderWidth(value: number) {
        this._rowHeaderWidth = value;
        this._worksheetData.rowHeader.width = value;
    }

    get rowHeightAccumulation(): number[] {
        return this._rowHeightAccumulation;
    }

    get rowTotalHeight(): number {
        return this._rowTotalHeight;
    }

    get columnWidthAccumulation(): number[] {
        return this._columnWidthAccumulation;
    }

    get columnTotalWidth(): number {
        return this._columnTotalWidth;
    }

    get rowHeaderWidth(): number {
        return this._rowHeaderWidth;
    }

    get columnHeaderHeight(): number {
        return this._columnHeaderHeight;
    }

    setMarginLeft(left: number): void {
        this._marginLeft = left;
    }

    setMarginTop(top: number): void {
        this._marginTop = top;
    }

    setScale(value: number, valueY?: number): void {
        this._updateLayout();
        this._scaleX = value;
        this._scaleY = valueY || value;
        this._updateLayout();
    }

    setScroll(scrollX?: number, scrollY?: number) {
        if (Tools.isDefine(scrollX)) {
            this._scrollX = scrollX;
        }
        if (Tools.isDefine(scrollY)) {
            this._scrollY = scrollY;
        }
    }

    get scrollX(): number {
        return this._scrollX;
    }

    get scrollY(): number {
        return this._scrollY;
    }

    get scaleX(): number {
        return this._scaleX;
    }

    get scaleY(): number {
        return this._scaleY;
    }

    get rowHeaderWidthAndMarginLeft(): number {
        return this.rowHeaderWidth + this._marginLeft;
    }

    get columnHeaderHeightAndMarginTop(): number {
        return this.columnHeaderHeight + this._marginTop;
    }

    get imageCacheMap(): ImageCacheMap {
        return this._imageCacheMap;
    }

    private _generateRowMatrixCache(
        rowCount: number,
        rowData: IObjectArrayPrimitiveType<Partial<IRowData>>,
        defaultRowHeight: number
    ): { rowTotalHeight: number; rowHeightAccumulation: number[] } {
        let rowTotalHeight = 0;
        const rowHeightAccumulation: number[] = [];
        const data = rowData;
        for (let r = 0; r < rowCount; r++) {
            let rowHeight = defaultRowHeight;

            if (this.worksheet.getRowFiltered(r)) {
                rowHeight = 0;
            } else if (data[r] != null) {
                const rowDataItem = data[r];
                if (!rowDataItem) {
                    continue;
                }

                const { h = defaultRowHeight, ah, ia } = rowDataItem;
                if (
                    (ia == null || ia === BooleanNumber.TRUE) &&
                    typeof ah === 'number'
                ) {
                    rowHeight = ah;
                } else {
                    rowHeight = h;
                }

                if (rowDataItem.hd === BooleanNumber.TRUE) {
                    rowHeight = 0;
                }
            }

            rowTotalHeight += rowHeight;

            rowHeightAccumulation.push(rowTotalHeight);
        }

        return {
            rowTotalHeight,
            rowHeightAccumulation,
        };
    }

    /**
     * Calc columnWidthAccumulation by columnData
     * @param colCount
     * @param columnData
     * @param defaultColumnWidth
     */
    private _generateColumnMatrixCache(
        colCount: number,
        columnData: IObjectArrayPrimitiveType<Partial<IColumnData>>,
        defaultColumnWidth: number
    ): { columnTotalWidth: number; columnWidthAccumulation: number[] } {
        let columnTotalWidth = 0;
        const columnWidthAccumulation: number[] = [];

        const data = columnData;

        for (let c = 0; c < colCount; c++) {
            let columnWidth = defaultColumnWidth;

            if (data[c] != null) {
                const columnDataItem = data[c];

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
            columnWidthAccumulation.push(columnTotalWidth);
        }

        return {
            columnTotalWidth,
            columnWidthAccumulation,
        };
    }

    intersectMergeRange(row: number, column: number): boolean {
        const mergedData = this.worksheet.getMergedCell(row, column);
        return Boolean(mergedData);
    }

    //eslint-disable-next-line complexity
    protected _getOverflowBound(
        row: number,
        startColumn: number,
        endColumn: number,
        contentWidth: number,
        horizontalAlign = HorizontalAlign.LEFT
    ): number {
        let cumWidth = 0;
        if (startColumn > endColumn) {
            const columnCount = this._columnWidthAccumulation.length - 1;
            for (let i = startColumn; i >= endColumn; i--) {
                const column = i;
                const cell = this.worksheet.getCell(row, column);
                if (
                    (!isCellCoverable(cell) && column !== startColumn) ||
                    this.intersectMergeRange(row, column)
                ) {
                    if (column === startColumn) {
                        return column;
                    }
                    return column + 1 > columnCount ? columnCount : column + 1;
                }
                const { startX, endX } = getCellWithCoordByIndexCore(
                    row,
                    column,
                    this.rowHeightAccumulation,
                    this.columnWidthAccumulation
                );

                // For center alignment, the current cell's width needs to be divided in half for comparison.
                if (
                    horizontalAlign === HorizontalAlign.CENTER &&
                    column === startColumn
                ) {
                    cumWidth += (endX - startX) / 2;
                } else {
                    cumWidth += endX - startX;
                }

                if (contentWidth < cumWidth) {
                    return column;
                }
            }
            return startColumn;
        }
        for (let i = startColumn; i <= endColumn; i++) {
            const column = i;
            const cell = this.worksheet.getCell(row, column);
            if (
                (!isCellCoverable(cell) && column !== startColumn) ||
                this.intersectMergeRange(row, column)
            ) {
                if (column === startColumn) {
                    return column;
                }

                return column - 1 < 0 ? 0 : column - 1;
            }
            const { startX, endX } = getCellWithCoordByIndexCore(
                row,
                column,
                this.rowHeightAccumulation,
                this.columnWidthAccumulation
            );

            if (
                horizontalAlign === HorizontalAlign.CENTER &&
                column === startColumn
            ) {
                cumWidth += (endX - startX) / 2;
            } else {
                cumWidth += endX - startX;
            }

            if (contentWidth < cumWidth) {
                return column;
            }
        }
        return endColumn;
    }

    /**
     * Calculate data for row col & cell position.
     * This method should be called whenever a sheet is dirty.
     * Update position value to this._rowHeaderWidth & this._rowHeightAccumulation & this._columnHeaderHeight & this._columnWidthAccumulation.
     */
    protected _updateLayout(): void {
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
        } = this._worksheetData;

        const { rowTotalHeight, rowHeightAccumulation } =
            this._generateRowMatrixCache(rowCount, rowData, defaultRowHeight);

        const { columnTotalWidth, columnWidthAccumulation } =
            this._generateColumnMatrixCache(
                columnCount,
                columnData,
                defaultColumnWidth
            );

        this._rowHeaderWidth =
            rowHeader.hidden !== BooleanNumber.TRUE
                ? this._dynamicallyUpdateRowHeaderWidth(rowHeader)
                : 0;
        this._columnHeaderHeight =
            columnHeader.hidden !== BooleanNumber.TRUE
                ? columnHeader.height
                : 0;

        this._rowTotalHeight = rowTotalHeight;
        this._rowHeightAccumulation = rowHeightAccumulation;
        this._columnTotalWidth = columnTotalWidth;
        this._columnWidthAccumulation = columnWidthAccumulation;

        this.makeDirty(false);
    }

    /**
     * Refresh cache after markDirty by SheetSkeletonManagerService.reCalculate()
     * @param bounds
     */
    calculate(): Nullable<SheetSkeleton> {
        this.resetCache();
        this._updateLayout();

        return this;
    }

    resetRangeCache(_ranges: IRange[]): void {
        // ...
    }

    private _dynamicallyUpdateRowHeaderWidth(rowHeader: {
        width: number;
    }): number {
        const SIZE_BY_EACH_CHARACTER = 8;
        const widthByComputation =
            `${this.worksheet.getRowCount()}`.length * SIZE_BY_EACH_CHARACTER;
        return Math.max(rowHeader.width, widthByComputation);
    }

    protected _hasUnMergedCellInRow(
        rowIndex: number,
        startColumn: number,
        endColumn: number
    ): boolean {
        const mergeData = this.worksheet.getMergeData();
        if (!mergeData) {
            return false;
        }

        for (let i = startColumn; i <= endColumn; i++) {
            const { isMerged, isMergedMainCell } =
                this.worksheet.getCellInfoInMergeData(rowIndex, i);

            if (!isMerged && !isMergedMainCell) {
                return true;
            }
        }

        return false;
    }

    /**
     * expand curr range if it's intersect with merge range.
     * @param range
     * @returns {IRange} expanded range because merge info.
     */
    expandRangeByMerge(range: IRange): IRange {
        let { startRow, startColumn, endRow, endColumn } = range;
        const mergeData = this._worksheetData.mergeData;
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
                    startColumn,
                    startRow,
                    endColumn,
                    endRow,
                };

                const rect2 = {
                    startColumn: mainStartColumn,
                    startRow: mainStartRow,
                    endColumn: mainEndColumn,
                    endRow: mainEndRow,
                };

                if (getIntersectRange(rect1, rect2)) {
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
        } as IRange;
    }

    getColumnCount(): number {
        return this._columnWidthAccumulation.length;
    }

    getRowCount(): number {
        return this._rowHeightAccumulation.length;
    }

    /**
     * New version to get merge data.
     * @param row
     * @param column
     * @returns {ISelectionCell} The cell info with merge data
     */
    protected _getCellMergeInfo(row: number, column: number): ISelectionCell {
        return this.worksheet.getCellInfoInMergeData(row, column);
    }

    /**
     * @deprecated use getNoMergeCellWithCoordByIndex instead.
     * @param rowIndex
     * @param columnIndex
     * @param header
     * @returns
     */
    getNoMergeCellPositionByIndex(
        rowIndex: number,
        columnIndex: number,
        header: boolean = true
    ) {
        return this.getNoMergeCellWithCoordByIndex(rowIndex, columnIndex, header);
    }

    /**
     * Original name: getNoMergeCellPositionByIndex
     * @param rowIndex
     * @param columnIndex
     */
    getNoMergeCellWithCoordByIndex(
        rowIndex: number,
        columnIndex: number,
        header: boolean = true
    ): IPosition {
        const {
            rowHeightAccumulation,
            columnWidthAccumulation,
            rowHeaderWidthAndMarginLeft,
            columnHeaderHeightAndMarginTop,
        } = this;

        let { startY, endY, startX, endX } = getCellWithCoordByIndexCore(
            rowIndex,
            columnIndex,
            rowHeightAccumulation,
            columnWidthAccumulation
        );

        if (header) {
            startY += columnHeaderHeightAndMarginTop;
            endY += columnHeaderHeightAndMarginTop;
            startX += rowHeaderWidthAndMarginLeft;
            endX += rowHeaderWidthAndMarginLeft;
        }

        return {
            startY,
            endY,
            startX,
            endX,
        };
    }

    /**
     * @deprecated use getNoMergeCellWithCoordByIndex(row, col, false)
     * @param rowIndex
     * @param columnIndex
     */
    getNoMergeCellPositionByIndexWithNoHeader(
        rowIndex: number,
        columnIndex: number
    ): IPosition {
        const { rowHeightAccumulation, columnWidthAccumulation } = this;

        const { startY, endY, startX, endX } = getCellWithCoordByIndexCore(
            rowIndex,
            columnIndex,
            rowHeightAccumulation,
            columnWidthAccumulation
        );

        return {
            startY,
            endY,
            startX,
            endX,
        };
    }

    /**
     *
     * @param offsetY scaled offset y
     * @param scaleY scale y
     * @param scrollXY
     * @param scrollXY.x
     * @param scrollXY.y
     */
    getRowIndexByOffsetY(
        offsetY: number,
        scaleY: number,
        scrollXY: { x: number; y: number },
        options?: IGetRowColByPosOptions
    ): number {
        const { rowHeightAccumulation } = this;
        offsetY = getTransformOffsetY(
            offsetY,
            scaleY,
            scrollXY,
            this.columnHeaderHeightAndMarginTop
        );

        let row = searchArray(
            rowHeightAccumulation,
            offsetY,
            options?.firstMatch
        );

        if (options?.closeFirst) {
            // check if upper row was closer than current
            if (
                Math.abs(rowHeightAccumulation[row] - offsetY) <
                Math.abs(offsetY - (rowHeightAccumulation[row - 1] ?? 0))
            ) {
                row = row + 1;
            }
        }

        return row;
    }

    /**
     * Get column index by offset x.
     * @param offsetX scaled offset x
     * @param scaleX scale x
     * @param scrollXY scrollXY
     * @returns column index
     */
    getColumnIndexByOffsetX(
        evtOffsetX: number,
        scaleX: number,
        scrollXY: { x: number; y: number },
        options?: IGetRowColByPosOptions
    ): number {
        const offsetX = getTransformOffsetX(
            evtOffsetX,
            scaleX,
            scrollXY,
            this.rowHeaderWidthAndMarginLeft
        );
        const { columnWidthAccumulation } = this;
        let column = searchArray(
            columnWidthAccumulation,
            offsetX,
            options?.firstMatch
        );

        if (options?.closeFirst) {
            // check if upper column was closer than current
            if (
                Math.abs(columnWidthAccumulation[column] - offsetX) <
                Math.abs(offsetX - (columnWidthAccumulation[column - 1] ?? 0))
            ) {
                column = column + 1;
            }
        }

        return column;
    }

    /**
     * Get cell index by offset(o)
     * @param offsetX position X in viewport.
     * @param offsetY position Y in viewport.
     * @param scaleX render scene scale x-axis, scene.getAncestorScale
     * @param scaleY render scene scale y-axis, scene.getAncestorScale
     * @param scrollXY  render viewport scroll {x, y}, scene.getScrollXYByRelativeCoords, scene.getScrollXY
     * @param scrollXY.x
     * @param scrollXY.y
     * @returns {row, col}
     */
    getCellIndexByOffset(
        offsetX: number,
        offsetY: number,
        scaleX: number,
        scaleY: number,
        scrollXY: { x: number; y: number },
        options?: IGetRowColByPosOptions
    ): { row: number; column: number } {
        const row = this.getRowIndexByOffsetY(
            offsetY,
            scaleY,
            scrollXY,
            options
        );
        const column = this.getColumnIndexByOffsetX(
            offsetX,
            scaleX,
            scrollXY,
            options
        );

        return {
            row,
            column,
        };
    }

    /**
     * Unlike getCellWithCoordByOffset, returning data doesn't include coord.
     * @param offsetX
     * @param offsetY
     * @param scaleX
     * @param scaleY
     * @param scrollXY
     */
    getCellByOffset(
        offsetX: number,
        offsetY: number,
        scaleX: number,
        scaleY: number,
        scrollXY: { x: number; y: number }
    ): Nullable<ICellInfo> {
        const cellIndex = this?.getCellIndexByOffset(
            offsetX,
            offsetY,
            scaleX,
            scaleY,
            scrollXY,
            { firstMatch: true } // for visible
        );
        if (!cellIndex) return null;

        const selectionCell: ISelectionCell =
            this.worksheet.getCellInfoInMergeData(
                cellIndex.row,
                cellIndex.column
            );
        return selectionCell;
    }

    /**
     * Return cell information corresponding to the current coordinates, including the merged cell object.
     *
     * @param row Specified Row Coordinate
     * @param column Specified Column Coordinate
     */
    getCellWithCoordByIndex(
        row: number,
        column: number,
        header: boolean = true
    ): ICellWithCoord {
        const {
            rowHeightAccumulation,
            columnWidthAccumulation,
            rowHeaderWidthAndMarginLeft,
            columnHeaderHeightAndMarginTop,
        } = this;

        const primary: ICellWithCoord = getCellWithCoordByIndexCore(
            row,
            column,
            rowHeightAccumulation,
            columnWidthAccumulation,
            this.worksheet.getCellInfoInMergeData(row, column)
        );
        const { isMerged, isMergedMainCell } = primary;
        let { startY, endY, startX, endX, mergeInfo } = primary;

        let offsetX = rowHeaderWidthAndMarginLeft;
        let offsetY = columnHeaderHeightAndMarginTop;
        if (header === false) {
            offsetX = 0;
            offsetY = 0;
        }

        startY += offsetY;
        endY += offsetY;
        startX += offsetX;
        endX += offsetX;

        mergeInfo.startY += offsetY;
        mergeInfo.endY += offsetY;
        mergeInfo.startX += offsetX;
        mergeInfo.endX += offsetX;

        // mergeInfo = mergeInfoOffset(mergeInfo, rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop);

        return {
            actualRow: row,
            actualColumn: column,
            startX,
            startY,
            endX,
            endY,
            isMerged,
            isMergedMainCell,
            mergeInfo,
        };
    }

    /**
     * Get cell by pos(offsetX, offsetY). Combine getCellIndexByOffset and then getCellWithCoordByIndex.
     *
     * options.matchFirst true means get cell would skip all invisible cells.
     * @param offsetX position X in viewport.
     * @param offsetY position Y in viewport.
     * @param scaleX render scene scale x-axis, scene.getAncestorScale
     * @param scaleY render scene scale y-axis, scene.getAncestorScale
     * @param scrollXY render viewportScroll {x, y}
     * @param options {IGetRowColByPosOptions}
     * @returns {ICellWithCoord} Selection data with coordinates
     */
    getCellWithCoordByOffset(
        offsetX: number,
        offsetY: number,
        scaleX: number,
        scaleY: number,
        scrollXY: { x: number; y: number },
        options?: IGetRowColByPosOptions
    ): ICellWithCoord {
        const { row, column } = this.getCellIndexByOffset(
            offsetX,
            offsetY,
            scaleX,
            scaleY,
            scrollXY,
            options
        );

        return this.getCellWithCoordByIndex(row, column);
    }

    /**
     * Original name: getOffsetByPositionX
     * @param column
     * @returns
     */
    getOffsetByColumn(column: number): number {
        const { columnWidthAccumulation, rowHeaderWidthAndMarginLeft } = this;

        const lastColumnIndex = columnWidthAccumulation.length - 1;
        const columnValue = columnWidthAccumulation[column];
        if (columnValue != null) {
            return columnValue + rowHeaderWidthAndMarginLeft;
        }

        if (column < 0) {
            return rowHeaderWidthAndMarginLeft;
        }

        return (
            columnWidthAccumulation[lastColumnIndex] +
            rowHeaderWidthAndMarginLeft
        );
    }

    /**
     * Original name: getOffsetByPositionY
     * @param row
     */
    getOffsetByRow(row: number): number {
        const { rowHeightAccumulation, columnHeaderHeightAndMarginTop } = this;
        const lastRowIndex = rowHeightAccumulation.length - 1;
        const rowValue = rowHeightAccumulation[row];
        if (rowValue != null) {
            return rowValue + columnHeaderHeightAndMarginTop;
        }

        if (row < 0) {
            return columnHeaderHeightAndMarginTop;
        }

        return (
            rowHeightAccumulation[lastRowIndex] + columnHeaderHeightAndMarginTop
        );
    }

    /**
     * Original name: getDecomposedOffset
     * @param offsetX
     * @param offsetY
     */
    getOffsetRelativeToRowCol(
        offsetX: number,
        offsetY: number
    ): {
            row: number;
            column: number;
            columnOffset: number;
            rowOffset: number;
        } {
        const column = searchArray(this.columnWidthAccumulation, offsetX);
        let columnOffset = 0;
        if (column === 0) {
            columnOffset = offsetX;
        } else {
            columnOffset = offsetX - this._columnWidthAccumulation[column - 1];
        }

        const row = searchArray(this.rowHeightAccumulation, offsetY);
        let rowOffset = 0;
        if (row === 0) {
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

    protected _updateConfigAndGetDocumentModel(
        documentData: IDocumentData,
        horizontalAlign: HorizontalAlign,
        paddingData: IPaddingData,
        renderConfig?: IDocumentRenderConfig
    ): Nullable<DocumentDataModel> {
        if (!renderConfig) {
            return;
        }

        if (!documentData.body?.dataStream) {
            return;
        }

        if (!documentData.documentStyle) {
            documentData.documentStyle = {};
        }

        documentData.documentStyle.marginTop = paddingData.t ?? 0;
        documentData.documentStyle.marginBottom = paddingData.b ?? 2;
        documentData.documentStyle.marginLeft = paddingData.l ?? 2;
        documentData.documentStyle.marginRight = paddingData.r ?? 2;

        // Fix https://github.com/dream-num/univer/issues/1586
        documentData.documentStyle.pageSize = {
            width: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
        };

        documentData.documentStyle.renderConfig = {
            ...documentData.documentStyle.renderConfig,
            ...renderConfig,
        };

        const paragraphs = documentData.body.paragraphs || [];

        for (const paragraph of paragraphs) {
            if (!paragraph.paragraphStyle) {
                paragraph.paragraphStyle = {};
            }

            paragraph.paragraphStyle.horizontalAlign = horizontalAlign;
        }

        return new DocumentDataModel(documentData);
    }

    override dispose(): void {
        super.dispose();

        this._rowHeightAccumulation = [];
        this._columnWidthAccumulation = [];
        this._rowTotalHeight = 0;
        this._columnTotalWidth = 0;
        this._rowHeaderWidth = 0;
        this._columnHeaderHeight = 0;

        this._worksheetData = null as unknown as IWorksheetData;
        this._cellData = null as unknown as ObjectMatrix<Nullable<ICellData>>;
        this._styles = null as unknown as Styles;
    }
}

/**
 * Not same as getCellWithCoordByIndex, Only the coordinates of the corresponding cells in rows and columns are considered, without taking into account the merged data.
 *
 * @param row
 * @param column
 * @param rowHeightAccumulation
 * @param columnWidthAccumulation
 */
export function getCellCoordByIndexSimple(
    row: number,
    column: number,
    rowHeightAccumulation: number[],
    columnWidthAccumulation: number[]
): IPosition {
    const startRow = row - 1;
    const startColumn = column - 1;

    const startY = rowHeightAccumulation[startRow] || 0;
    let endY = rowHeightAccumulation[row];

    if (endY == null) {
        endY = rowHeightAccumulation[rowHeightAccumulation.length - 1];
    }

    const startX = columnWidthAccumulation[startColumn] || 0;
    let endX = columnWidthAccumulation[column];

    if (endX == null) {
        endX = columnWidthAccumulation[columnWidthAccumulation.length - 1];
    }

    return {
        startY,
        endY,
        startX,
        endX,
    };
}

/**
 * @deprecated use `getCellCoordByIndexSimple` instead.
 * @param row
 * @param column
 * @param rowHeightAccumulation
 * @param columnWidthAccumulation
 * @returns
 */
export function getCellPositionByIndexSimple(
    row: number,
    column: number,
    rowHeightAccumulation: number[],
    columnWidthAccumulation: number[]
): IPosition {
    return getCellCoordByIndexSimple(row, column, rowHeightAccumulation, columnWidthAccumulation);
}

/**
 * @description Get the cell position information of the specified row and column, including the position of the cell and the merge info
 * @param {number} row The row index of the cell
 * @param {number} column The column index of the cell
 * @param {number[]} rowHeightAccumulation The accumulated height of each row
 * @param {number[]} columnWidthAccumulation The accumulated width of each column
 * @param {ICellInfo} mergeData The merge information of the cell
 * @returns {ICellWithCoord} The cell position information of the specified row and column, including the position information of the cell and the merge information of the cell
 */
// eslint-disable-next-line max-lines-per-function
export function getCellWithCoordByIndexCore(
    row: number,
    column: number,
    rowHeightAccumulation: number[],
    columnWidthAccumulation: number[],
    mergeDataInfo: Nullable<ICellInfo>
): ICellWithCoord {
    row = Tools.clamp(row, 0, rowHeightAccumulation.length - 1);
    column = Tools.clamp(column, 0, columnWidthAccumulation.length - 1);
    // eslint-disable-next-line prefer-const
    let { startY, endY, startX, endX } = getCellCoordByIndexSimple(
        row,
        column,
        rowHeightAccumulation,
        columnWidthAccumulation
    );

    if (!mergeDataInfo) {
        return {
            startY,
            endY,
            startX,
            endX,
            isMerged: false,
            isMergedMainCell: false,
            actualRow: row,
            actualColumn: column,
            mergeInfo: {
                startY,
                endY,
                startX,
                endX,
                startRow: row,
                startColumn: column,
                endRow: row,
                endColumn: column,
            },
        };
    }

    const {
        isMerged,
        isMergedMainCell,
        startRow,
        startColumn,
        endRow,
        endColumn,
    } = mergeDataInfo;

    let mergeInfo = {
        startRow,
        startColumn,
        endRow,
        endColumn,
        startY,
        endY,
        startX,
        endX,
    };

    const rowAccumulationCount = rowHeightAccumulation.length - 1;
    const columnAccumulationCount = columnWidthAccumulation.length - 1;

    if (isMerged && startRow !== -1 && startColumn !== -1) {
        const mergeStartY = rowHeightAccumulation[startRow - 1] || 0;
        const mergeEndY =
            rowHeightAccumulation[endRow] ||
            rowHeightAccumulation[rowAccumulationCount];

        const mergeStartX = columnWidthAccumulation[startColumn - 1] || 0;
        const mergeEndX =
            columnWidthAccumulation[endColumn] ||
            columnWidthAccumulation[columnAccumulationCount];
        mergeInfo = {
            ...mergeInfo,
            startY: mergeStartY,
            endY: mergeEndY,
            startX: mergeStartX,
            endX: mergeEndX,
        };
    } else if (!isMerged && endRow !== -1 && endColumn !== -1) {
        const mergeEndY =
            rowHeightAccumulation[endRow] ||
            rowHeightAccumulation[rowAccumulationCount];
        const mergeEndX =
            columnWidthAccumulation[endColumn] ||
            columnWidthAccumulation[columnAccumulationCount];

        mergeInfo = {
            ...mergeInfo,
            startY,
            endY: mergeEndY,
            startX,
            endX: mergeEndX,
        };
    }

    return {
        isMerged,
        isMergedMainCell,
        actualRow: row,
        actualColumn: column,
        startY,
        endY,
        startX,
        endX,
        mergeInfo,
    } as ICellWithCoord;
}

/**
 * Get x in sheet coordinate. Already handled scrolling and zooming.
 * @param offsetX Offset value from PointerEvent in canvas element.
 * @param scaleX from scene.getAncestorScale
 * @param scrollXY Scroll value of viewport
 * @returns {number} x in sheet coordinate.
 */
export function getTransformOffsetX(
    offsetX: number,
    scaleX: number,
    scrollXY: { x: number; y: number },
    rowHeaderWidth: number
): number {
    const { x: scrollX } = scrollXY;

    // so we should map physical positions to ideal positions
    const afterOffsetX = offsetX / scaleX + scrollX - rowHeaderWidth; //this.rowHeaderWidthAndMarginLeft;

    return afterOffsetX;
}

/**
 * @param offsetY
 * @param scaleY
 * @param scrollXY
 */
export function getTransformOffsetY(
    offsetY: number,
    scaleY: number,
    scrollXY: { x: number; y: number },
    columnHeight: number
): number {
    const { y: scrollY } = scrollXY;

    // these values are not affected by zooming (ideal positions)
    offsetY = offsetY / scaleY + scrollY - columnHeight; //this.columnHeaderHeightAndMarginTop;

    return offsetY;
}

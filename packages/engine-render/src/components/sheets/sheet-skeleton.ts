/**
 * Copyright 2023-present DreamNum Inc.
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

import type {
    BorderStyleTypes,
    IBorderStyleData,
    ICellData,
    ICellDataForSheetInterceptor,
    ICellInfo,
    ICellWithCoord,
    IColAutoWidthInfo,
    IColumnData,
    IColumnRange,
    IDocumentData,
    IDocumentRenderConfig,
    IObjectArrayPrimitiveType,
    IPaddingData,
    IPosition,
    IRange,
    IRowAutoHeightInfo,
    IRowData,
    IRowRange,
    ISelectionCell,
    ISize,
    IStyleData,
    ITextRotation,
    IWorksheetData,
    Nullable,
    Styles,
    VerticalAlign,
    Worksheet,
} from '@univerjs/core';
import type { IDocumentSkeletonColumn } from '../../basics/i-document-skeleton-cached';
import type { IBoundRectNoAngle, IViewportInfo } from '../../basics/vector2';
import {
    addLinkToDocumentModel,
    BooleanNumber,
    CellValueType,
    composeStyles,
    DEFAULT_STYLES,
    DocumentDataModel,
    extractPureTextFromCell,
    getColorStyle,
    HorizontalAlign,
    IConfigService,
    IContextService,
    Inject,
    IS_ROW_STYLE_PRECEDE_COLUMN_STYLE,
    isCellCoverable,
    isNullCell,
    isWhiteColor,
    LocaleService,
    ObjectMatrix,
    searchArray,
    Tools,
    WrapStrategy,
} from '@univerjs/core';
import { distinctUntilChanged, startWith } from 'rxjs';
import { BORDER_TYPE as BORDER_LTRB, COLOR_BLACK_RGB, MAXIMUM_COL_WIDTH, MAXIMUM_ROW_HEIGHT, MIN_COL_WIDTH } from '../../basics/const';
import { getRotateOffsetAndFarthestHypotenuse } from '../../basics/draw';
import { convertTextRotation, VERTICAL_ROTATE_ANGLE } from '../../basics/text-rotation';
import {
    degToRad,
    getCellPositionByIndex,
    getCellWithCoordByIndexCore,
    getFontStyleString,
    isRectIntersect,
} from '../../basics/tools';
import { DocumentSkeleton } from '../docs/layout/doc-skeleton';
import { columnIterator } from '../docs/layout/tools';
import { DocumentViewModel } from '../docs/view-model/document-view-model';
import { Skeleton } from '../skeleton';
import { EXPAND_SIZE_FOR_RENDER_OVERFLOW, MEASURE_EXTENT, MEASURE_EXTENT_FOR_PARAGRAPH } from './constants';
import { type BorderCache, type IFontCacheItem, type IStylesCache, SHEET_VIEWPORT_KEY } from './interfaces';
import { createDocumentModelWithStyle, extractOtherStyle, getFontFormat } from './util';

/**
 * Obtain the height and width of a cell's text, taking into account scenarios with rotated text.
 * @param documentSkeleton Data of the document's ViewModel
 * @param angleInDegree The rotation angle of an Excel cell, it's **degree**
 */
export function getDocsSkeletonPageSize(documentSkeleton: DocumentSkeleton, angleInDegree: number = 0): Nullable<Required<ISize>> {
    const skeletonData = documentSkeleton?.getSkeletonData();
    const angle = degToRad(angleInDegree);

    if (!skeletonData) {
        return null;
    }
    const { pages } = skeletonData;
    const lastPage = pages[pages.length - 1];
    const { width, height } = lastPage;

    if (angle === 0) {
        return { width, height };
    }

    if (Math.abs(angle) === Math.PI / 2) {
        return { width: height, height: width };
    }

    let allRotatedWidth = 0;
    let allRotatedHeight = 0;

    const widthArray: Array<{ rotatedWidth: number; spaceWidth: number }> = [];

    columnIterator([lastPage], (column: IDocumentSkeletonColumn) => {
        const { lines, width: columnWidth, spaceWidth } = column;

        const { rotatedHeight, rotatedWidth } = getRotateOffsetAndFarthestHypotenuse(lines, columnWidth, angle);

        allRotatedHeight += rotatedHeight;

        widthArray.push({ rotatedWidth, spaceWidth });
    });

    const widthCount = widthArray.length;

    for (let i = 0; i < widthCount; i++) {
        const { rotatedWidth } = widthArray[i];

        if (i === 0) {
            allRotatedWidth += rotatedWidth;
        }
    }

    return {
        width: allRotatedWidth,
        height: allRotatedHeight,
    };
}

interface ICellDocumentModelOption {
    isDeepClone?: boolean;
    displayRawFormula?: boolean;
    ignoreTextRotation?: boolean;
}

const DEFAULT_CELL_DOCUMENT_MODEL_OPTION: ICellDocumentModelOption = {
    isDeepClone: false,
    displayRawFormula: false,
    ignoreTextRotation: false,
};

interface IRowColumnRange extends IRowRange, IColumnRange { }
export interface IDocumentLayoutObject {
    documentModel: Nullable<DocumentDataModel>;
    fontString: string;
    textRotation: ITextRotation;
    wrapStrategy: WrapStrategy;
    verticalAlign: VerticalAlign;
    horizontalAlign: HorizontalAlign;
    paddingData: IPaddingData;
    fill?: Nullable<string>;
}

export const DEFAULT_PADDING_DATA = {
    t: 0,
    b: 2, // must over 1, see https://github.com/dream-num/univer/issues/2727
    l: 2,
    r: 2,
};

export const RENDER_RAW_FORMULA_KEY = 'RENDER_RAW_FORMULA';

export interface ICacheItem {
    bg: boolean;
    border: boolean;
}

export interface IGetRowColByPosOptions {
    closeFirst?: boolean;

    /**
     * For searchArray(rowHeightAccumulation) & searchArray(colWidthAccumulation)
     * true means return first matched index in matched sequence.
     * default return last index in matched sequence.
     */
    firstMatch?: boolean;
}

export interface IGetPosByRowColOptions {
    closeFirst?: boolean;

    /**
     * for searchArray(rowHeightAccumulation) & searchArray(colWidthAccumulation)
     * true means return first matched index in array
     */
    firstMatch?: boolean;
}

export class SpreadsheetSkeleton extends Skeleton {
    private _rowHeightAccumulation: number[] = [];
    private _columnWidthAccumulation: number[] = [];

    private _rowTotalHeight = 0;
    private _columnTotalWidth = 0;
    private _rowHeaderWidth = 0;
    private _columnHeaderHeight = 0;

    /**
     * Range viewBounds. only update by viewBounds.
     * It would change multiple times in one frame if there is multiple viewport (after freeze row&col)
     */
    private _visibleRange: IRowColumnRange = {
        startRow: -1,
        endRow: -1,
        startColumn: -1,
        endColumn: -1,
    };

    private _visibleRangeMap: Map<SHEET_VIEWPORT_KEY, IRowColumnRange> = new Map();

    // private _dataMergeCache: IRange[] = [];
    private _overflowCache: ObjectMatrix<IRange> = new ObjectMatrix();
    private _stylesCache: IStylesCache = {
        background: {},
        backgroundPositions: new ObjectMatrix<ICellWithCoord>(),
        font: {} as Record<string, ObjectMatrix<IFontCacheItem>>,
        fontMatrix: new ObjectMatrix<IFontCacheItem>(),
        border: new ObjectMatrix<BorderCache>(),
    };

    /** A matrix to store if a (row, column) position has render cache. */
    private _handleBgMatrix = new ObjectMatrix<boolean>();
    private _handleBorderMatrix = new ObjectMatrix<boolean>();
    private _handleFontMatrix = new ObjectMatrix<boolean>();

    private _showGridlines: BooleanNumber = BooleanNumber.TRUE;
    private _marginTop: number = 0;
    private _marginLeft: number = 0;

    /**
     * Whether the row style precedes the column style.
     */
    private _isRowStylePrecedeColumnStyle = false;

    private _renderRawFormula = false;

    constructor(
        readonly worksheet: Worksheet,

        /**
         * @deprecated avoid use `IWorksheetData` directly, use API provided by `Worksheet`, otherwise
         * `ViewModel` will be not working.
         */
        private _worksheetData: IWorksheetData,
        private _cellData: ObjectMatrix<Nullable<ICellData>>,
        private _styles: Styles,
        @Inject(LocaleService) _localeService: LocaleService,
        @IContextService private readonly _contextService: IContextService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super(_localeService);

        this._updateLayout();
        this._initContextListener();
        this._isRowStylePrecedeColumnStyle = this._configService.getConfig(IS_ROW_STYLE_PRECEDE_COLUMN_STYLE) ?? false;
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

    /**
     * Range of visible area(range in viewBounds)
     */
    get rowColumnSegment(): IRowColumnRange {
        return this._visibleRange;
    }

    visibleRangeByViewportKey(viewportKey: SHEET_VIEWPORT_KEY): Nullable<IRowColumnRange> {
        return this._visibleRangeMap.get(viewportKey);
    }

    // get dataMergeCache(): IRange[] {
    //     return this._dataMergeCache;
    // }

    get stylesCache(): IStylesCache {
        return this._stylesCache;
    }

    get overflowCache(): ObjectMatrix<IRange> {
        return this._overflowCache;
    }

    get showGridlines(): BooleanNumber {
        return this._showGridlines;
    }

    get mergeData(): IRange[] {
        return this._worksheetData.mergeData;
    }

    get rowHeaderWidthAndMarginLeft(): number {
        return this.rowHeaderWidth + this._marginLeft;
    }

    get columnHeaderHeightAndMarginTop(): number {
        return this.columnHeaderHeight + this._marginTop;
    }

    override dispose(): void {
        super.dispose();

        this._rowHeightAccumulation = [];
        this._columnWidthAccumulation = [];
        this._rowTotalHeight = 0;
        this._columnTotalWidth = 0;
        this._rowHeaderWidth = 0;
        this._columnHeaderHeight = 0;
        this._visibleRange = {
            startRow: -1,
            endRow: -1,
            startColumn: -1,
            endColumn: -1,
        };
        // this._dataMergeCache = [];
        this._stylesCache = {
            background: {},
            backgroundPositions: new ObjectMatrix<ICellWithCoord>(),
            font: {} as Record<string, ObjectMatrix<IFontCacheItem>>,
            fontMatrix: new ObjectMatrix<IFontCacheItem>(),
            border: new ObjectMatrix<BorderCache>(),
        };
        this._handleBgMatrix.reset();
        this._handleBorderMatrix.reset();
        this._overflowCache.reset();

        this._worksheetData = null as unknown as IWorksheetData;
        this._cellData = null as unknown as ObjectMatrix<Nullable<ICellData>>;
        this._styles = null as unknown as Styles;
    }

    /**
     * @deprecated should never expose a property that is provided by another module!
     */
    getsStyles(): Styles {
        return this._styles;
    }

    /**
     * Get which Workbook and Worksheet this skeleton is attached to.
     * @returns [unitId, sheetId]
     */
    getLocation(): [string, string] {
        return [this.worksheet.getUnitId(), this.worksheet.getSheetId()];
    }

    private _initContextListener(): void {
        this.disposeWithMe(
            this._contextService.subscribeContextValue$(RENDER_RAW_FORMULA_KEY).pipe(
                startWith(false),
                distinctUntilChanged()
            ).subscribe((renderRaw) => {
                this._renderRawFormula = renderRaw;
                this._resetCache();
                this.makeDirty(true);
            })
        );
    }

    setOverflowCache(value: ObjectMatrix<IRange>): void {
        this._overflowCache = value;
    }

    setMarginLeft(left: number): void {
        this._marginLeft = left;
    }

    setMarginTop(top: number): void {
        this._marginTop = top;
    }

    getFont(rowIndex: number, columnIndex: number): Nullable<IFontCacheItem> {
        const fontCache = this.stylesCache.fontMatrix;
        if (!fontCache) {
            return null;
        }
        const fontItem = fontCache.getValue(rowIndex, columnIndex);
        if (fontItem) {
            return fontItem;
        }
        return null;
    }

    /**
     * Get range in visible area (range in viewbounds) and set into this._rowColumnSegment.
     * @param bounds
     * @returns boolean
     */
    updateVisibleRange(bounds?: IViewportInfo): boolean {
        if (!this._worksheetData) {
            return false;
        }

        this._updateLayout();

        if (!this._rowHeightAccumulation || !this._columnWidthAccumulation) {
            return false;
        }

        if (bounds != null) {
            const range = this.getRangeByBounding(bounds);
            this._visibleRange = range;
            this._visibleRangeMap.set(bounds.viewportKey as SHEET_VIEWPORT_KEY, range);
        }

        return true;
    }

    /**
     * Set border background and font to this._stylesCache by visible range, which derives from bounds)
     * @param bounds viewBounds
     */
    setStylesCache(bounds?: IViewportInfo): Nullable<SpreadsheetSkeleton> {
        if (!this.updateVisibleRange(bounds)) {
            return;
        }

        const rowColumnSegment = this._visibleRange;
        const columnWidthAccumulation = this.columnWidthAccumulation;
        const { startRow: visibleStartRow, endRow: visibleEndRow, startColumn: visibleStartColumn, endColumn: visibleEndColumn } = rowColumnSegment;

        if (visibleEndColumn === -1 || visibleEndRow === -1) return;

        const mergeRanges = this.getCurrentRowColumnSegmentMergeData(this._visibleRange);
        for (const mergeRange of mergeRanges) {
            this._setStylesCacheForOneCell(mergeRange.startRow, mergeRange.startColumn, {
                mergeRange,
            });
        }

        // expandStartCol & expandEndCol is slightly expand curr col range. This is for calculating text for overflow situations.
        const expandStartCol = Math.max(0, visibleStartColumn - EXPAND_SIZE_FOR_RENDER_OVERFLOW);
        const expandEndCol = Math.min(columnWidthAccumulation.length - 1, visibleEndColumn + EXPAND_SIZE_FOR_RENDER_OVERFLOW);
        for (let r = visibleStartRow; r <= visibleEndRow; r++) {
            if (this.worksheet.getRowVisible(r) === false) continue;

            for (let c = visibleStartColumn; c <= visibleEndColumn; c++) {
                this._setStylesCacheForOneCell(r, c, { cacheItem: { bg: true, border: true } });
            }

            // Calculate the text length for overflow situations, focusing on the leftmost column within the visible range.
            for (let c = expandStartCol; c < visibleEndColumn; c++) {
                this._setStylesCacheForOneCell(r, c, { cacheItem: { bg: false, border: false } });
            }
            if (visibleEndColumn === 0) continue;

            // Calculate the text length for overflow situations, focusing on the rightmost column within the visible range.
            for (let c = visibleEndColumn + 1; c < expandEndCol; c++) {
                this._setStylesCacheForOneCell(r, c, { cacheItem: { bg: false, border: false } });
            }
        }

        return this;
    }

    calculate(bounds?: IViewportInfo): Nullable<SpreadsheetSkeleton> {
        this._resetCache();

        this.setStylesCache(bounds);

        return this;
    }

    private _hasUnMergedCellInRow(rowIndex: number, startColumn: number, endColumn: number): boolean {
        const mergeData = this.worksheet.getMergeData();
        if (!mergeData) {
            return false;
        }

        for (let i = startColumn; i <= endColumn; i++) {
            const { isMerged, isMergedMainCell } = this.worksheet.getCellInfoInMergeData(rowIndex, i);

            if (!isMerged && !isMergedMainCell) {
                return true;
            }
        }

        return false;
    }

    //#region auto height
    /**
     * Calc all auto height by getDocsSkeletonPageSize in ranges
     * @param ranges
     * @returns {IRowAutoHeightInfo[]} result
     */
    calculateAutoHeightInRange(ranges: Nullable<IRange[]>): IRowAutoHeightInfo[] {
        if (!Tools.isArray(ranges)) {
            return [];
        }

        const results: IRowAutoHeightInfo[] = [];
        const { rowData } = this._worksheetData;
        const rowObjectArray = rowData;
        const calculatedRows = new Set<number>();

        for (const range of ranges) {
            const { startRow, endRow, startColumn, endColumn } = range;

            for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
                // If the row has already been calculated, it does not need to be calculated
                if (calculatedRows.has(rowIndex)) {
                    continue;
                }

                // The row sets ia to false, and there is no need to calculate the automatic row height for the row.
                if (rowObjectArray[rowIndex]?.ia === BooleanNumber.FALSE) {
                    continue;
                }

                const hasUnMergedCell = this._hasUnMergedCellInRow(rowIndex, startColumn, endColumn);

                if (hasUnMergedCell) {
                    const autoHeight = this._calculateRowAutoHeight(rowIndex);
                    calculatedRows.add(rowIndex);
                    results.push({
                        row: rowIndex,
                        autoHeight,
                    });
                }
            }
        }

        return results;
    }

    private _calculateRowAutoHeight(rowNum: number): number {
        const worksheet = this.worksheet;
        const { columnCount, columnData, defaultRowHeight, defaultColumnWidth } = this._worksheetData;
        let height = defaultRowHeight;

        for (let i = 0; i < columnCount; i++) {
            // When calculating the automatic height of a row, if a cell is in a merged cell,
            // skip the cell directly, which currently follows the logic of Excel
            const { isMerged, isMergedMainCell } = this.worksheet.getCellInfoInMergeData(rowNum, i);

            if (isMerged || isMergedMainCell) {
                continue;
            }
            const cell = worksheet.getCell(rowNum, i);
            if (cell?.interceptorAutoHeight) {
                const cellHeight = cell.interceptorAutoHeight();
                if (cellHeight) {
                    height = Math.max(height, cellHeight);
                    continue;
                }
            }

            const modelObject = cell && this._getCellDocumentModel(cell);
            if (modelObject == null) {
                continue;
            }

            const { documentModel, textRotation, wrapStrategy } = modelObject;
            if (documentModel == null) {
                continue;
            }

            const documentViewModel = new DocumentViewModel(documentModel);

            const { vertexAngle: angle } = convertTextRotation(textRotation);

            const colWidth = columnData[i]?.w ?? defaultColumnWidth;
            if (typeof colWidth === 'number' && wrapStrategy === WrapStrategy.WRAP) {
                documentModel.updateDocumentDataPageSize(colWidth);
            }

            const documentSkeleton = DocumentSkeleton.create(documentViewModel, this._localeService);
            documentSkeleton.calculate();

            let { height: h = 0 } = getDocsSkeletonPageSize(documentSkeleton, angle) ?? {};

            // When calculating the auto Height, need take the margin information into account,
            // because there is margin information when rendering
            if (documentSkeleton) {
                const skeletonData = documentSkeleton.getSkeletonData()!;
                const {
                    marginTop: t,
                    marginBottom: b,
                    marginLeft: l,
                    marginRight: r,
                } = skeletonData.pages[skeletonData.pages.length - 1];

                const absAngleInRad = Math.abs(degToRad(angle));

                h +=
                    t * Math.cos(absAngleInRad) +
                    r * Math.sin(absAngleInRad) +
                    b * Math.cos(absAngleInRad) +
                    l * Math.sin(absAngleInRad);
            }

            height = Math.max(height, h);
        }

        return Math.min(height, MAXIMUM_ROW_HEIGHT);
    }
    //#endregion

    //#region calculate auto width
    calculateAutoWidthInRange(ranges: Nullable<IRange[]>): IColAutoWidthInfo[] {
        if (!Tools.isArray(ranges)) {
            return [];
        }

        const results: IColAutoWidthInfo[] = [];
        const calculatedCols = new Set<number>();

        for (const range of ranges) {
            const { startColumn, endColumn } = range;

            for (let colIndex = startColumn; colIndex <= endColumn; colIndex++) {
                if (!this.worksheet.getColVisible(colIndex)) continue;
                // If the row has already been calculated, it does not need to be recalculated
                if (calculatedCols.has(colIndex)) continue;

                const autoWidth = this._calculateColWidth(colIndex);
                calculatedCols.add(colIndex);
                results.push({
                    col: colIndex,
                    width: autoWidth,
                });
            }
        }

        return results;
    }

    /**
     * Iterate rows in visible area(and rows around it) and return column width of the specified column(by column index)
     *
     * @param colIndex
     * @returns {number} width
     */

    private _calculateColWidth(colIndex: number): number {
        const worksheet = this.worksheet;

        // row has default height, but col does not, col can be very narrow near zero
        let colWidth = 0;

        // for cell with only v, auto size for content width in visible range and ± 10000 rows around.
        // for cell with p, auto width for content in visible range and ± 1000 rows, 1/10 of situation above.
        // first row and last row should be considered.
        // skip hidden row
        // also handle multiple viewport situation (freeze row & freeze row&col)
        // if there are no content in this column, return current column width.

        const visibleRangeViewMain = this.visibleRangeByViewportKey(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (!visibleRangeViewMain) return colWidth;

        const { startRow: startRowOfViewMain, endRow: endRowOfViewMain } = visibleRangeViewMain;
        const rowCount = this.worksheet.getRowCount();

        // check width of first row and last row,
        const otherRowIndex: Set<number> = new Set();
        otherRowIndex.add(0);
        otherRowIndex.add(rowCount - 1);

        // add rows in viewMainTop(viewMainTopLeft are included)
        const visibleRangeViewMainTop = this.visibleRangeByViewportKey(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP);
        if (visibleRangeViewMainTop) {
            const { startRow: startRowOfViewMainTop, endRow: endRowOfViewMainTop } = visibleRangeViewMainTop;
            for (let i = startRowOfViewMainTop; i <= endRowOfViewMainTop; i++) {
                otherRowIndex.add(i);
            }
        }

        // create a array, which contains all rows need to check
        const createRowSequence = (start: number, end: number, additionalArr: number[] | Set<number>) => {
            const range = Array.from(
                { length: end - start + 1 },
                (_, i) => i + start
            );
            return [...range, ...additionalArr];
        };

        const checkStartRow = Math.max(0, startRowOfViewMain - MEASURE_EXTENT); // 0
        const checkEndRow = Math.min(rowCount, endRowOfViewMain + MEASURE_EXTENT); // rowCount
        const rowIdxArr = createRowSequence(checkStartRow, checkEndRow, otherRowIndex);

        const preColIndex = Math.max(0, colIndex - 1);
        let currColWidth = this._columnWidthAccumulation[colIndex] - this._columnWidthAccumulation[preColIndex];
        if (colIndex === 0) {
            currColWidth = this._columnWidthAccumulation[colIndex];
        }

        for (let i = 0; i < rowIdxArr.length; i++) {
            const row = rowIdxArr[i];
            const { isMerged, isMergedMainCell } = this._getCellMergeInfo(colIndex, row);
            if (isMerged && !isMergedMainCell) continue;
            if (!this.worksheet.getRowVisible(row)) continue;
            const cell = worksheet.getCell(row, colIndex);
            if (!cell) continue;

            // for cell with paragraph, only check ±1000 rows around visible area, continue the loop if out of range
            if (cell.p) {
                if (row + MEASURE_EXTENT_FOR_PARAGRAPH <= startRowOfViewMain || row - MEASURE_EXTENT_FOR_PARAGRAPH >= endRowOfViewMain) continue;
            }

            let measuredWidth = this._getMeasuredWidthByCell(cell, currColWidth);
            if (cell.fontRenderExtension) {
                measuredWidth += ((cell.fontRenderExtension?.leftOffset || 0) + (cell.fontRenderExtension?.rightOffset || 0));
            }
            colWidth = Math.max(colWidth, measuredWidth);

            // early return, if maxColWidth is larger than MAXIMUM_COL_WIDTH
            if (colWidth >= MAXIMUM_COL_WIDTH) return MAXIMUM_COL_WIDTH;
        }
        if (colWidth === 0) return currColWidth; // if column is empty, do not modify colWidth, like Google sheet.
        return Math.max(MIN_COL_WIDTH, colWidth); // min col width is 2
    }

    /**
     * For _calculateColMaxWidth
     * @param cell
     * @returns {number} width
     */
    _getMeasuredWidthByCell(cell: ICellDataForSheetInterceptor, currColWidth: number) {
        let measuredWidth = 0;

        // isSkip means the text in this cell would not rendering.
        if (cell.fontRenderExtension?.isSkip && cell?.interceptorAutoWidth) {
            const cellWidth = cell.interceptorAutoWidth?.();
            if (cellWidth) {
                return cellWidth;
            }
        }

        const modelObject = this._getCellDocumentModel(cell);
        if (modelObject == null) {
            return measuredWidth;
        }

        const { documentModel, textRotation } = modelObject;
        if (documentModel == null) {
            return measuredWidth;
        }

        const documentViewModel = new DocumentViewModel(documentModel);
        const { vertexAngle: angle } = convertTextRotation(textRotation);
        const cellStyle = this._styles.getStyleByCell(cell);

        if (cellStyle?.tb === WrapStrategy.WRAP) {
            documentModel.updateDocumentDataPageSize(currColWidth, Infinity);
        } else {
            documentModel.updateDocumentDataPageSize(Infinity, Infinity);
        }

        const documentSkeleton = DocumentSkeleton.create(documentViewModel, this._localeService);

        documentSkeleton.calculate();
        // key
        measuredWidth = (getDocsSkeletonPageSize(documentSkeleton, angle) ?? { width: 0 }).width;
        // When calculating the auto Height, need take the margin information into account,
        // because there is margin information when rendering
        if (documentSkeleton) {
            const skeletonData = documentSkeleton.getSkeletonData()!;
            const {
                marginTop: t,
                marginBottom: b,
                marginLeft: l,
                marginRight: r,
            } = skeletonData.pages[skeletonData.pages.length - 1];

            const absAngleInRad = Math.abs(degToRad(angle));

            measuredWidth +=
                t * Math.sin(absAngleInRad) +
                r * Math.cos(absAngleInRad) +
                b * Math.sin(absAngleInRad) +
                l * Math.cos(absAngleInRad);
        }
        return measuredWidth;
    };
    //#endregion

    /**
     * Calculate data for row col & cell position, then update position value to this._rowHeaderWidth & this._rowHeightAccumulation & this._columnHeaderHeight & this._columnWidthAccumulation.
     */
    private _updateLayout(): void {
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
        } = this._worksheetData;

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

        this._rowHeaderWidth = rowHeader.hidden !== BooleanNumber.TRUE ? this._dynamicallyUpdateRowHeaderWidth(rowHeader) : 0;
        this._columnHeaderHeight = columnHeader.hidden !== BooleanNumber.TRUE ? columnHeader.height : 0;

        this._rowTotalHeight = rowTotalHeight;
        this._rowHeightAccumulation = rowHeightAccumulation;
        this._columnTotalWidth = columnTotalWidth;
        this._columnWidthAccumulation = columnWidthAccumulation;
        this._showGridlines = showGridlines;

        this.makeDirty(false);
    }

    private _dynamicallyUpdateRowHeaderWidth(rowHeader: { width: number }): number {
        const SIZE_BY_EACH_CHARACTER = 8;
        const widthByComputation = (`${this.worksheet.getRowCount()}`.length * SIZE_BY_EACH_CHARACTER);
        return Math.max(rowHeader.width, widthByComputation);
    }

    getRangeByBounding(bounds?: IViewportInfo): IRange {
        return this._getRangeByViewBounding(this._rowHeightAccumulation, this._columnWidthAccumulation, bounds?.cacheBound);
    }

    /**
     * @deprecated should never expose a property that is provided by another module!
     * @returns
     */
    getWorksheetConfig(): IWorksheetData {
        return this._worksheetData;
    }

    getRangeByViewBound(bound?: IBoundRectNoAngle): IRange {
        return this._getRangeByViewBounding(this._rowHeightAccumulation, this._columnWidthAccumulation, bound);
    }

    getMergeBounding(startRow: number, startColumn: number, endRow: number, endColumn: number): IRange {
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

    /**
     * expand curr range if it's intersect with merge range.
     * @param range
     * @returns {IRange} expanded range because merge info.
     */
    expandRangeByMerge(range: IRange): IRange {
        return this.getMergeBounding(range.startRow, range.startColumn, range.endRow, range.endColumn);
    }

    appendToOverflowCache(row: number, column: number, startColumn: number, endColumn: number): void {
        this._overflowCache.setValue(row, column, {
            startRow: row,
            endRow: row,
            startColumn,
            endColumn,
        });
    }

    getColumnCount(): number {
        return this._columnWidthAccumulation.length;
    }

    getRowCount(): number {
        return this._rowHeightAccumulation.length;
    }

    getOverflowPosition(
        contentSize: Required<ISize>,
        horizontalAlign: HorizontalAlign,
        row: number,
        column: number,
        columnCount: number
    ): IColumnRange {
        const contentWidth = contentSize?.width ?? 0;
        let startColumn = column;
        let endColumn = column;

        if (horizontalAlign === HorizontalAlign.CENTER) {
            startColumn = this._getOverflowBound(row, column, 0, contentWidth / 2, horizontalAlign);
            endColumn = this._getOverflowBound(row, column, columnCount - 1, contentWidth / 2, horizontalAlign);
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

    getNoMergeCellPositionByIndex(rowIndex: number, columnIndex: number): IPosition {
        const {
            rowHeightAccumulation,
            columnWidthAccumulation,
            rowHeaderWidthAndMarginLeft,
            columnHeaderHeightAndMarginTop,
        } = this;

        // const rowCount = this.getRowCount();

        // const columnCount = this.getColumnCount();

        // if (rowIndex >= rowCount || rowIndex < 0 || columnIndex >= columnCount || columnIndex < 0) {
        //     return {
        //         startY: -100,
        //         endY: -100,
        //         startX: -100,
        //         endX: -100,
        //     };
        // }

        let { startY, endY, startX, endX } = getCellPositionByIndex(
            rowIndex,
            columnIndex,
            rowHeightAccumulation,
            columnWidthAccumulation
        );

        startY += columnHeaderHeightAndMarginTop;
        endY += columnHeaderHeightAndMarginTop;
        startX += rowHeaderWidthAndMarginLeft;
        endX += rowHeaderWidthAndMarginLeft;

        return {
            startY,
            endY,
            startX,
            endX,
        };
    }

    getNoMergeCellPositionByIndexWithNoHeader(rowIndex: number, columnIndex: number): IPosition {
        const { rowHeightAccumulation, columnWidthAccumulation } = this;

        const { startY, endY, startX, endX } = getCellPositionByIndex(
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
     * Get cell by pos(offsetX, offsetY).
     * @deprecated Please use `getCellWithCoordByOffset` instead.
     */
    calculateCellIndexByPosition(
        offsetX: number,
        offsetY: number,
        scaleX: number,
        scaleY: number,
        scrollXY: { x: number; y: number }
    ): Nullable<ICellWithCoord> {
        return this.getCellWithCoordByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);
    }

    /**
     * Get cell by pos(offsetX, offsetY).
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
        const { row, column } = this.getCellIndexByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY, options);

        return this.getCellWithCoordByIndex(row, column);
    }

    /**
     * This method has the same implementation as `getCellIndexByOffset`,
     * but uses a different name to maintain backward compatibility with previous calls.
     *
     * @deprecated Please use `getCellIndexByOffset` method instead.
     */
    getCellPositionByOffset(
        offsetX: number,
        offsetY: number,
        scaleX: number,
        scaleY: number,
        scrollXY: { x: number; y: number },
        options?: IGetRowColByPosOptions
    ): { row: number; column: number } {
        return this.getCellIndexByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY, options);
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
     * @returns cell index
     */
    getCellIndexByOffset(
        offsetX: number,
        offsetY: number,
        scaleX: number,
        scaleY: number,
        scrollXY: { x: number; y: number },
        options?: IGetRowColByPosOptions
    ): { row: number; column: number } {
        const row = this.getRowIndexByOffsetY(offsetY, scaleY, scrollXY, options);
        const column = this.getColumnIndexByOffsetX(offsetX, scaleX, scrollXY, options);

        return {
            row,
            column,
        };
    }

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

        const selectionCell = this.worksheet.getCellInfoInMergeData(cellIndex.row, cellIndex.column);
        return selectionCell;
    }

    getCellWithMergeInfoByIndex(row: number, column: number): Nullable<ICellInfo> {
        const selectionCell = this.worksheet.getCellInfoInMergeData(row, column);
        return selectionCell;
    }

    /**
     * Same as getColumnIndexByOffsetX
     * @deprecated Please use `getColumnIndexByOffsetX` method instead.
     */
    getColumnPositionByOffsetX(offsetX: number, scaleX: number, scrollXY: { x: number; y: number }, options?: IGetRowColByPosOptions): number {
        return this.getColumnIndexByOffsetX(offsetX, scaleX, scrollXY, options);
    }

    /**
     * Get column index by offset x.
     * @param offsetX scaled offset x
     * @param scaleX scale x
     * @param scrollXY scrollXY
     * @returns column index
     */
    getColumnIndexByOffsetX(evtOffsetX: number, scaleX: number, scrollXY: { x: number; y: number }, options?: IGetRowColByPosOptions): number {
        const offsetX = this.getTransformOffsetX(evtOffsetX, scaleX, scrollXY);
        const { columnWidthAccumulation } = this;
        let column = searchArray(columnWidthAccumulation, offsetX, options?.firstMatch);

        if (options?.closeFirst) {
            // check if upper column was closer than current
            if (Math.abs(columnWidthAccumulation[column] - offsetX) < Math.abs(offsetX - (columnWidthAccumulation[column - 1] ?? 0))) {
                column = column + 1;
            }
        }

        return column;
    }

    /**
     * Same as getRowIndexByOffsetY
     * @deprecated Please use `getRowIndexByOffsetY` method instead.
     */
    getRowPositionByOffsetY(offsetY: number, scaleY: number, scrollXY: { x: number; y: number }, options?: IGetRowColByPosOptions): number {
        return this.getRowIndexByOffsetY(offsetY, scaleY, scrollXY, options);
    }

    /**
     *
     * @param offsetY scaled offset y
     * @param scaleY scale y
     * @param scrollXY
     * @param scrollXY.x
     * @param scrollXY.y
     */
    getRowIndexByOffsetY(offsetY: number, scaleY: number, scrollXY: { x: number; y: number }, options?: IGetRowColByPosOptions): number {
        const { rowHeightAccumulation } = this;
        offsetY = this.getTransformOffsetY(offsetY, scaleY, scrollXY);

        let row = searchArray(rowHeightAccumulation, offsetY, options?.firstMatch);

        if (options?.closeFirst) {
            // check if upper row was closer than current
            if (Math.abs(rowHeightAccumulation[row] - offsetY) < Math.abs(offsetY - (rowHeightAccumulation[row - 1] ?? 0))) {
                row = row + 1;
            }
        }

        return row;
    }

    getTransformOffsetX(offsetX: number, scaleX: number, scrollXY: { x: number; y: number }): number {
        const { x: scrollX } = scrollXY;

        // so we should map physical positions to ideal positions
        const afterOffsetX = offsetX / scaleX + scrollX - this.rowHeaderWidthAndMarginLeft;

        return afterOffsetX;
    }

    getTransformOffsetY(offsetY: number, scaleY: number, scrollXY: { x: number; y: number }): number {
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

    getOffsetByPositionY(row: number): number {
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

    /**
     * Same as getCellWithCoordByIndex, but uses a different name to maintain backward compatibility with previous calls.
     * @deprecated Please use `getCellWithCoordByIndex` instead.
     */
    getCellByIndex(row: number, column: number): ICellWithCoord {
        return this.getCellWithCoordByIndex(row, column);
    }

    /**
     * @deprecated Please use `getCellWithCoordByIndex(row, col, false)` instead.
     * @param row
     * @param column
     */
    getCellByIndexWithNoHeader(row: number, column: number) {
        return this.getCellWithCoordByIndex(row, column, false);
    }

    /**
     * Return cell information corresponding to the current coordinates, including the merged cell object.
     *
     * @param row Specified Row Coordinate
     * @param column Specified Column Coordinate
     */
    getCellWithCoordByIndex(row: number, column: number, header: boolean = true): ICellWithCoord {
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
     * convert canvas content position to physical position in screen
     * @param offsetX
     * @param scaleX
     * @param scrollXY
     */
    convertTransformToOffsetX(offsetX: number, scaleX: number, scrollXY: { x: number; y: number }): number {
        const { x: scrollX } = scrollXY;
        return (offsetX - scrollX) * scaleX;
    }

    /**
     * convert canvas content position to physical position in screen
     * @param offsetY
     * @param scaleY
     * @param scrollXY
     */
    convertTransformToOffsetY(offsetY: number, scaleY: number, scrollXY: { x: number; y: number }): number {
        const { y: scrollY } = scrollXY;
        return (offsetY - scrollY) * scaleY;
    }

    /**
     * Only used for cell edit, and no need to rotate text when edit cell content!
     * @deprecated use same method in worksheet.
     * @param cell
     */
    getBlankCellDocumentModel(cell: Nullable<ICellData>): IDocumentLayoutObject {
        const documentModelObject = this._getCellDocumentModel(cell, { ignoreTextRotation: true });

        const style = this._styles.getStyleByCell(cell);
        const textStyle = getFontFormat(style);

        if (documentModelObject != null) {
            if (documentModelObject.documentModel == null) {
                documentModelObject.documentModel = createDocumentModelWithStyle('', textStyle);
            }
            return documentModelObject;
        }

        const content = '';

        let fontString = 'document';

        const textRotation: ITextRotation = DEFAULT_STYLES.tr;
        const horizontalAlign: HorizontalAlign = DEFAULT_STYLES.ht;
        const verticalAlign: VerticalAlign = DEFAULT_STYLES.vt;
        const wrapStrategy: WrapStrategy = DEFAULT_STYLES.tb;
        const paddingData: IPaddingData = DEFAULT_PADDING_DATA;

        fontString = getFontStyleString({}).fontCache;

        const documentModel = createDocumentModelWithStyle(content, textStyle);

        return {
            documentModel,
            fontString,
            textRotation,
            wrapStrategy,
            verticalAlign,
            horizontalAlign,
            paddingData,
        };
    }

    /**
     * Only used for cell edit, and no need to rotate text when edit cell content!
     * @deprecated use same method in worksheet.
     * @param cell
     */
    getCellDocumentModelWithFormula(cell: ICellData): Nullable<IDocumentLayoutObject> {
        return this._getCellDocumentModel(cell, {
            isDeepClone: true,
            displayRawFormula: true,
            ignoreTextRotation: true,
        });
    }

    /**
     * This method generates a document model based on the cell's properties and handles the associated styles and configurations.
     * If the cell does not exist, it will return null.
     *
     * @deprecated use same method in worksheet.
     * PS: This method has significant impact on performance.
     * @param cell
     * @param options
     */
    // eslint-disable-next-line complexity, max-lines-per-function
    private _getCellDocumentModel(
        cell: Nullable<ICellDataForSheetInterceptor>,
        options: ICellDocumentModelOption = DEFAULT_CELL_DOCUMENT_MODEL_OPTION
    ): Nullable<IDocumentLayoutObject> {
        const { isDeepClone, displayRawFormula, ignoreTextRotation } = {
            ...DEFAULT_CELL_DOCUMENT_MODEL_OPTION,
            ...options,
        };

        const style = this._styles.getStyleByCell(cell);

        if (!cell) return;

        let documentModel: Nullable<DocumentDataModel>;
        let fontString = 'document';
        const cellOtherConfig = extractOtherStyle(style);

        const textRotation: ITextRotation = ignoreTextRotation
            ? DEFAULT_STYLES.tr
            : cellOtherConfig.textRotation || DEFAULT_STYLES.tr;
        let horizontalAlign: HorizontalAlign = cellOtherConfig.horizontalAlign || DEFAULT_STYLES.ht;
        const verticalAlign: VerticalAlign = cellOtherConfig.verticalAlign || DEFAULT_STYLES.vt;
        const wrapStrategy: WrapStrategy = cellOtherConfig.wrapStrategy || DEFAULT_STYLES.tb;
        const paddingData: IPaddingData = cellOtherConfig.paddingData || DEFAULT_PADDING_DATA;

        if (cell.f && displayRawFormula) {
            // The formula does not detect horizontal alignment and rotation.
            documentModel = createDocumentModelWithStyle(cell.f.toString(), {}, { verticalAlign });
            horizontalAlign = DEFAULT_STYLES.ht;
        } else if (cell.p) {
            const { centerAngle, vertexAngle } = convertTextRotation(textRotation);
            documentModel = this._updateConfigAndGetDocumentModel(
                isDeepClone ? Tools.deepClone(cell.p) : cell.p,
                horizontalAlign,
                paddingData,
                {
                    horizontalAlign,
                    verticalAlign,
                    centerAngle,
                    vertexAngle,
                    wrapStrategy,
                }
            );
        } else if (cell.v != null) {
            const textStyle = getFontFormat(style);
            fontString = getFontStyleString(textStyle).fontCache;

            let cellText = extractPureTextFromCell(cell);

            // Add a single quotation mark to the force string type. Don't add single quotation mark in extractPureTextFromCell, because copy and paste will be affected.
            // edit mode when displayRawFormula is true
            if (cell.t === CellValueType.FORCE_STRING && displayRawFormula) {
                cellText = `'${cellText}`;
            }

            documentModel = createDocumentModelWithStyle(cellText, textStyle, {
                ...cellOtherConfig,
                textRotation,
                cellValueType: cell.t!,
            });
        }

        // This is a compatible code. cc @weird94
        if (documentModel && cell.linkUrl && cell.linkId) {
            addLinkToDocumentModel(documentModel, cell.linkUrl, cell.linkId);
        }

        /**
         * the alignment mode is returned with respect to the offset of the sheet cell,
         * because the document needs to render the layout for cells and
         * support alignment across multiple cells (e.g., horizontal alignment of long text in overflow mode).
         * The alignment mode of the document itself cannot meet this requirement,
         * so an additional renderConfig needs to be added during the rendering of the document component.
         * This means that there are two coexisting alignment modes.
         * In certain cases, such as in an editor, conflicts may arise,
         * requiring only one alignment mode to be retained.
         * By removing the relevant configurations in renderConfig,
         * the alignment mode of the sheet cell can be modified.
         * The alternative alignment mode is applied to paragraphs within the document.
         */
        return {
            documentModel,
            fontString,
            textRotation,
            wrapStrategy,
            verticalAlign,
            horizontalAlign,
            paddingData,
            fill: style?.bg?.rgb,
        };
    }

    getDecomposedOffset(offsetX: number, offsetY: number): { row: number; column: number; columnOffset: number; rowOffset: number } {
        const column = searchArray(this._columnWidthAccumulation, offsetX);
        let columnOffset = 0;
        if (column === 0) {
            columnOffset = offsetX;
        } else {
            columnOffset = offsetX - this._columnWidthAccumulation[column - 1];
        }

        const row = searchArray(this._rowHeightAccumulation, offsetY);
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

    /**
     * Calculate the overflow of cell text. If there is no value on either side of the cell,
     * the text content of this cell can be drawn to both sides, not limited by the cell's width.
     * Overflow on the left or right is aligned according to the text's horizontal alignment.
     */
    // eslint-disable-next-line complexity, max-lines-per-function
    private _calculateOverflowCell(row: number, column: number, docsConfig: IFontCacheItem): boolean {
        // wrap and angle handler
        const { documentSkeleton, vertexAngle = 0, centerAngle = 0, horizontalAlign, wrapStrategy } = docsConfig;
        const cell = this._cellData.getValue(row, column);
        const { t: cellValueType = CellValueType.STRING } = cell || {};
        let horizontalAlignPos = horizontalAlign;
        /**
         * #univer-pro/issues/334
         * When horizontal alignment is not set, the default alignment for rotation angles varies to accommodate overflow scenarios.
         */
        if (horizontalAlign === HorizontalAlign.UNSPECIFIED) {
            if (centerAngle === VERTICAL_ROTATE_ANGLE && vertexAngle === VERTICAL_ROTATE_ANGLE) {
                horizontalAlignPos = HorizontalAlign.CENTER;
            } else if ((vertexAngle > 0 && vertexAngle !== VERTICAL_ROTATE_ANGLE) || vertexAngle === -VERTICAL_ROTATE_ANGLE) {
                horizontalAlignPos = HorizontalAlign.RIGHT;
            }
        }

        /**
         * Numerical and Boolean values are not displayed with overflow.
         */
        if (
            (wrapStrategy === WrapStrategy.OVERFLOW || wrapStrategy === WrapStrategy.UNSPECIFIED) &&
            cellValueType !== CellValueType.NUMBER &&
            cellValueType !== CellValueType.BOOLEAN &&
            horizontalAlign !== HorizontalAlign.JUSTIFIED
        ) {
            // Merged cells do not support overflow.
            if (this.intersectMergeRange(row, column)) {
                return true;
            }

            let contentSize = getDocsSkeletonPageSize(documentSkeleton, vertexAngle);

            if (!contentSize) {
                return true;
            }

            if (vertexAngle !== 0) {
                const { startY, endY, startX, endX } = getCellWithCoordByIndexCore(
                    row,
                    column,
                    this.rowHeightAccumulation,
                    this.columnWidthAccumulation,
                    this.worksheet.getCellInfoInMergeData(row, column)
                );
                const cellWidth = endX - startX;
                const cellHeight = endY - startY;

                if (contentSize.height > cellHeight) {
                    contentSize = {
                        width: cellHeight / Math.tan(Math.abs(vertexAngle)) + cellWidth,
                        height: cellHeight,
                    };
                }
            }

            const position = this.getOverflowPosition(contentSize, horizontalAlignPos, row, column, this.getColumnCount());

            const { startColumn, endColumn } = position;

            if (startColumn === endColumn) {
                return true;
            }

            this.appendToOverflowCache(row, column, startColumn, endColumn);
        } else if (wrapStrategy === WrapStrategy.WRAP && vertexAngle !== 0) {
            // Merged cells do not support overflow.
            if (this.intersectMergeRange(row, column)) {
                return true;
            }

            const { startY, endY } = getCellWithCoordByIndexCore(
                row,
                column,
                this.rowHeightAccumulation,
                this.columnWidthAccumulation,
                this.worksheet.getCellInfoInMergeData(row, column)
            );

            const cellHeight = endY - startY;
            documentSkeleton.getViewModel().getDataModel().updateDocumentDataPageSize(cellHeight);
            documentSkeleton.calculate();
            const contentSize = getDocsSkeletonPageSize(documentSkeleton, vertexAngle);

            if (!contentSize) {
                return true;
            }

            const { startColumn, endColumn } = this.getOverflowPosition(
                contentSize,
                horizontalAlignPos,
                row,
                column,
                this.getColumnCount()
            );

            if (startColumn === endColumn) {
                return true;
            }

            this.appendToOverflowCache(row, column, startColumn, endColumn);
        }
        return false;
    }

    /**
     * Get the range of the bounding area of the canvas.
     * @param rowHeightAccumulation Row layout information
     * @param columnWidthAccumulation Column layout information
     * @param viewBound The range of the visible area of the canvas
     * @returns The range cell index of the canvas visible area
     */
    protected _getRangeByViewBounding(
        rowHeightAccumulation: number[],
        columnWidthAccumulation: number[],
        viewBound?: IBoundRectNoAngle
    ): IRange {
        const lenOfRowData = rowHeightAccumulation.length;
        const lenOfColData = columnWidthAccumulation.length;

        if (!viewBound) {
            return {
                startRow: 0,
                endRow: lenOfRowData - 1,
                startColumn: 0,
                endColumn: lenOfColData - 1,
            };
        }

        // viewBound contains header, so need to subtract the header height and margin
        const startRow = searchArray(rowHeightAccumulation, Math.round(viewBound.top) - this.columnHeaderHeightAndMarginTop);
        const endRow = searchArray(rowHeightAccumulation, Math.round(viewBound.bottom) - this.columnHeaderHeightAndMarginTop);
        const startColumn = searchArray(columnWidthAccumulation, Math.round(viewBound.left) - this.rowHeaderWidthAndMarginLeft);
        const endColumn = searchArray(columnWidthAccumulation, Math.round(viewBound.right) - this.rowHeaderWidthAndMarginLeft);

        return {
            startRow,
            endRow,
            startColumn,
            endColumn,
        } as IRange;
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
                if ((ia == null || ia === BooleanNumber.TRUE) && typeof ah === 'number') {
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

    //eslint-disable-next-line complexity
    private _getOverflowBound(
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
                if ((!isCellCoverable(cell) && column !== startColumn) || this.intersectMergeRange(row, column)) {
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

                // For center alignment, the current cell's width needs to be divided in half for comparison.
                if (horizontalAlign === HorizontalAlign.CENTER && column === startColumn) {
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
            if ((!isCellCoverable(cell) && column !== startColumn) || this.intersectMergeRange(row, column)) {
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

            if (horizontalAlign === HorizontalAlign.CENTER && column === startColumn) {
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

    intersectMergeRange(row: number, column: number): boolean {
        const mergedData = this.worksheet.getMergedCell(row, column);
        return Boolean(mergedData);
    }

    /**
     * get the current row and column segment visible merge data
     * @returns {IRange} The visible merge data
     */
    public getCurrentRowColumnSegmentMergeData(range?: IRange): IRange[] {
        const endColumnLast = this.columnWidthAccumulation.length - 1;
        if (!range) {
            const endRow = this.rowHeightAccumulation.length - 1;
            range = { startRow: 0, startColumn: 0, endRow, endColumn: endColumnLast };
        } else {
            range = {
                startRow: range.startRow,
                endRow: range.endRow,
                endColumn: endColumnLast,
                startColumn: 0,
            };
        }

        return this.worksheet.getSpanModel().getMergedCellRangeForSkeleton(range.startRow, range.startColumn, range.endRow, range.endColumn);
    }

    resetCache(): void {
        this._resetCache();
    }

    /**
     * Any changes to sheet model would reset cache.
     */
    private _resetCache(): void {
        this._stylesCache = {
            background: {},
            backgroundPositions: new ObjectMatrix<ICellWithCoord>(),
            font: {},
            fontMatrix: new ObjectMatrix<IFontCacheItem>(),
            border: new ObjectMatrix<BorderCache>(),
        };
        this._handleBgMatrix.reset();
        this._handleBorderMatrix.reset();
        this._overflowCache.reset();
    }

    _setBorderStylesCache(row: number, col: number, style: Nullable<IStyleData>, options: {
        mergeRange?: IRange;
        cacheItem?: ICacheItem;
    } | undefined) {
        const handledThisCell = Tools.isDefine(this._handleBorderMatrix.getValue(row, col));
        if (handledThisCell) return;
        // by default, style cache should includes border and background info.
        const cacheItem = options?.cacheItem || { bg: true, border: true };
        if (!cacheItem.border) return;

        this._handleBorderMatrix.setValue(row, col, true);
        if (style && style.bd) {
            const mergeRange = options?.mergeRange;
            if (mergeRange) {
                this._setMergeBorderProps(BORDER_LTRB.TOP, this._stylesCache, mergeRange);
                this._setMergeBorderProps(BORDER_LTRB.BOTTOM, this._stylesCache, mergeRange);
                this._setMergeBorderProps(BORDER_LTRB.LEFT, this._stylesCache, mergeRange);
                this._setMergeBorderProps(BORDER_LTRB.RIGHT, this._stylesCache, mergeRange);
            } else if (!this.intersectMergeRange(row, col)) {
                this._setBorderProps(row, col, BORDER_LTRB.TOP, style, this._stylesCache);
                this._setBorderProps(row, col, BORDER_LTRB.BOTTOM, style, this._stylesCache);
                this._setBorderProps(row, col, BORDER_LTRB.LEFT, style, this._stylesCache);
                this._setBorderProps(row, col, BORDER_LTRB.RIGHT, style, this._stylesCache);
            }

            this._setBorderProps(row, col, BORDER_LTRB.TL_BR, style, this._stylesCache);
            this._setBorderProps(row, col, BORDER_LTRB.TL_BC, style, this._stylesCache);
            this._setBorderProps(row, col, BORDER_LTRB.TL_MR, style, this._stylesCache);
            this._setBorderProps(row, col, BORDER_LTRB.BL_TR, style, this._stylesCache);
            this._setBorderProps(row, col, BORDER_LTRB.ML_TR, style, this._stylesCache);
            this._setBorderProps(row, col, BORDER_LTRB.BC_TR, style, this._stylesCache);
        }
    }

    _setBgStylesCache(row: number, col: number, style: Nullable<IStyleData>, options: {
        mergeRange?: IRange;
        cacheItem?: ICacheItem;
    } | undefined) {
        const handledThisCell = Tools.isDefine(this._handleBgMatrix.getValue(row, col));
        if (handledThisCell) return;
        // by default, style cache should includes border and background info.
        const cacheItem = options?.cacheItem || { bg: true, border: true };
        if (!cacheItem.bg) return;

        this._handleBgMatrix.setValue(row, col, true);
        if (style && style.bg && style.bg.rgb) {
            const rgb = style.bg.rgb;
            if (!this._stylesCache.background![rgb]) {
                this._stylesCache.background![rgb] = new ObjectMatrix();
            }

            const bgCache = this._stylesCache.background![rgb];
            bgCache.setValue(row, col, rgb);
            const cellInfo = this.getCellWithCoordByIndex(row, col, false);
            this._stylesCache.backgroundPositions?.setValue(row, col, cellInfo);
        }
    }

    _setFontStylesCache(row: number, col: number, cell: Nullable<ICellData>) {
        if (isNullCell(cell)) return;

        this._handleFontMatrix.setValue(row, col, true);
        if (this._stylesCache.fontMatrix.getValue(row, col)) return;

        const modelObject = this._getCellDocumentModel(cell, {
            displayRawFormula: this._renderRawFormula,
        });
        if (modelObject == null) return;
        const { documentModel } = modelObject;
        if (documentModel == null) return;

        const { fontString: _fontString, textRotation, wrapStrategy, verticalAlign, horizontalAlign } = modelObject;

        const documentViewModel = new DocumentViewModel(documentModel);
        if (documentViewModel) {
            const { vertexAngle, centerAngle } = convertTextRotation(textRotation);
            const documentSkeleton = DocumentSkeleton.create(documentViewModel, this._localeService);
            documentSkeleton.calculate();

            const config: IFontCacheItem = {
                documentSkeleton,
                vertexAngle,
                centerAngle,
                verticalAlign,
                horizontalAlign,
                wrapStrategy,
            };
            this._stylesCache.fontMatrix.setValue(row, col, config);
            this._calculateOverflowCell(row, col, config);
        }
    }

    /**
     * Set border background and font to this._stylesCache cell by cell.
     * @param row {number}
     * @param col {number}
     * @param options {{ mergeRange: IRange; cacheItem: ICacheItem } | undefined}
     */
    private _setStylesCacheForOneCell(row: number, col: number, options: { mergeRange?: IRange; cacheItem?: ICacheItem }): void {
        if (row === -1 || col === -1) {
            return;
        }

        const handledBgCell = Tools.isDefine(this._handleBgMatrix.getValue(row, col));
        const handledBorderCell = Tools.isDefine(this._handleBorderMatrix.getValue(row, col));

        // worksheet.getCell has significant performance overhead, if we had handled this cell then return first.
        if (handledBgCell && handledBorderCell) {
            return;
        }

        if (!options) {
            options = { cacheItem: { bg: true, border: true } };
        }

        const { isMerged, isMergedMainCell, startRow, startColumn, endRow, endColumn } = this.worksheet.getCellInfoInMergeData(row, col);
        options.mergeRange = { startRow, startColumn, endRow, endColumn };

        const hidden = this.worksheet.getColVisible(col) === false || this.worksheet.getRowVisible(row) === false;

        // hidden and not in mergeRange return.
        if (hidden) {
            // If the cell is merged and is not the main cell, the cell is not rendered.
            if (isMerged && !isMergedMainCell) {
                return;
                // If the cell no merged, the cell is not rendered.
            } else if (!isMergedMainCell) {
                return;
            }
        }

        const cell = this.worksheet.getCell(row, col) || this.worksheet.getCellRaw(row, col);

        const cellStyle = this._styles.getStyleByCell(cell);
        const columnStyle = this.worksheet.getColumnStyle(col) as IStyleData;
        const rowStyle = this.worksheet.getRowStyle(row) as IStyleData;
        const defaultStyle = this.worksheet.getDefaultCellStyleInternal();

        const style = this._isRowStylePrecedeColumnStyle ? composeStyles(defaultStyle, columnStyle, rowStyle, cellStyle) : composeStyles(defaultStyle, rowStyle, columnStyle, cellStyle);

        this._setBgStylesCache(row, col, style, options);
        this._setBorderStylesCache(row, col, style, options);
        this._setFontStylesCache(row, col, cell);
    }

    private _updateConfigAndGetDocumentModel(
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

        documentData.documentStyle.renderConfig = renderConfig;

        const paragraphs = documentData.body.paragraphs || [];

        for (const paragraph of paragraphs) {
            if (!paragraph.paragraphStyle) {
                paragraph.paragraphStyle = {};
            }

            paragraph.paragraphStyle.horizontalAlign = horizontalAlign;
        }

        return new DocumentDataModel(documentData);
    }

    /**
     * pro/issues/344
     * In Excel, for the border rendering of merged cells to take effect, the outermost cells need to have the same border style.
     */
    private _setMergeBorderProps(type: BORDER_LTRB, cache: IStylesCache, mergeRange: IRange): void {
        if (!this.worksheet || !cache.border) return;

        const borders: Array<{ style: BorderStyleTypes; color: string; r: number; c: number }> = [];
        let isAddBorders = true;
        let forStart = mergeRange.startRow;
        let forEnd = mergeRange.endRow;
        let row = mergeRange.startRow;
        let column = mergeRange.startColumn;

        if (type === BORDER_LTRB.TOP) {
            row = mergeRange.startRow;
            forStart = mergeRange.startColumn;
            forEnd = mergeRange.endColumn;
        } else if (type === BORDER_LTRB.BOTTOM) {
            row = mergeRange.endRow;
            forStart = mergeRange.startColumn;
            forEnd = mergeRange.endColumn;
        } else if (type === BORDER_LTRB.LEFT) {
            column = mergeRange.startColumn;
            forStart = mergeRange.startRow;
            forEnd = mergeRange.endRow;
        } else if (type === BORDER_LTRB.RIGHT) {
            column = mergeRange.endColumn;
            forStart = mergeRange.startRow;
            forEnd = mergeRange.endRow;
        }

        for (let i = forStart; i <= forEnd; i++) {
            if (type === BORDER_LTRB.TOP) {
                column = i;
            } else if (type === BORDER_LTRB.BOTTOM) {
                column = i;
            } else if (type === BORDER_LTRB.LEFT) {
                row = i;
            } else if (type === BORDER_LTRB.RIGHT) {
                row = i;
            }

            const cell = this.worksheet.getCell(row, column);
            if (!cell) {
                isAddBorders = false;
                break;
            }

            const style = this._styles.getStyleByCell(cell);
            if (!style) {
                isAddBorders = false;
                break;
            }

            const props: Nullable<IBorderStyleData> = style.bd?.[type];
            if (props) {
                const rgb = getColorStyle(props.cl) || COLOR_BLACK_RGB;
                borders.push({
                    r: row,
                    c: column,
                    style: props.s,
                    color: rgb,
                });
            } else {
                isAddBorders = false;
            }
        }

        if (isAddBorders) {
            borders.forEach((border) => {
                const { r, c, style, color } = border;
                if (!cache.border!.getValue(r, c)) {
                    cache.border!.setValue(r, c, {});
                }
                cache.border!.getValue(r, c)![type] = {
                    type,
                    style,
                    color,
                };
            });
        }
    }

    private _setBorderProps(r: number, c: number, type: BORDER_LTRB, style: IStyleData, cache: IStylesCache): void {
        const props: Nullable<IBorderStyleData> = style.bd?.[type];
        if (!props || !cache.border) {
            return;
        }
        const rgb = getColorStyle(props.cl) || COLOR_BLACK_RGB;

        const borderCache = cache.border;

        if (!borderCache.getValue(r, c)) {
            borderCache.setValue(r, c, { [type]: {} });
        }

        /**
         * pro/issues/344
         * Compatible with Excel's border rendering.
         * When the top border of a cell and the bottom border of the cell above it (r-1) overlap,
         * if the top border of cell r is white, then the rendering is ignored.
         */
        if (type === BORDER_LTRB.TOP) {
            const borderBottom = borderCache.getValue(r - 1, c)?.[BORDER_LTRB.BOTTOM];
            if (borderBottom && isWhiteColor(rgb)) {
                return;
            }
        } else if (type === BORDER_LTRB.LEFT) {
            const borderRight = borderCache.getValue(r, c - 1)?.[BORDER_LTRB.RIGHT];
            if (borderRight && isWhiteColor(rgb)) {
                return;
            }
        }

        borderCache.getValue(r, c)![type] = {
            type,
            style: props.s,
            color: rgb,
        };
    }

    /**
     * New version to get merge data.
     * @param row
     * @param column
     * @returns {ISelectionCell} The cell info with merge data
     */
    private _getCellMergeInfo(row: number, column: number): ISelectionCell {
        return this.worksheet.getCellInfoInMergeData(row, column);
    }
}

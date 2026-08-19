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

import type { BorderStyleTypes, IBorderStyleData, ICellDataForSheetInterceptor, ICellInfo, ICellWithCoord, IColAutoWidthInfo, IColumnRange, IDocumentData, IPaddingData, IRange, IRowAutoHeightInfo, IRowRange, ISize, IStyleData, ITextRotation, Nullable, Styles, Worksheet } from '@univerjs/core';
import type { IDocumentSkeletonColumn } from '../../basics/i-document-skeleton-cached';
import type { ITransformChangeState } from '../../basics/interfaces';
import type { IBoundRectNoAngle, IPoint, IViewportInfo } from '../../basics/vector2';
import type { Scene } from '../../scene';
import type { IBorderCache, IFontCacheItem, IStylesCache } from './interfaces';
import {
    BooleanNumber,

    CellValueType,
    ColorKit,
    DEFAULT_STYLES,
    DocumentDataModel,
    getColorStyle,
    getDisplayValueFromCell,
    HorizontalAlign,

    IConfigService,
    IContextService,

    Inject,
    Injector,

    isCellCoverable,
    isDefaultFormat,

    isNullCell,

    isWhiteColor,

    LocaleService,

    numfmt,
    ObjectMatrix,
    Range,
    searchArray,
    SheetSkeleton,

    ThemeService,
    Tools,
    VerticalAlign,

    WrapStrategy,
} from '@univerjs/core';
import { distinctUntilChanged, startWith } from 'rxjs';
import { FontCache } from '../../basics';
import { BORDER_TYPE, COLOR_BLACK_RGB, MAXIMUM_COL_WIDTH, MAXIMUM_ROW_HEIGHT, MIN_COL_WIDTH } from '../../basics/const';
import { getRotateOffsetAndFarthestHypotenuse } from '../../basics/draw';
import { convertTextRotation, VERTICAL_ROTATE_ANGLE } from '../../basics/text-rotation';
import { degToRad, getFontStyleString } from '../../basics/tools';
import { DocSimpleSkeleton } from '../docs/layout/doc-simple-skeleton';
import { DocumentSkeleton } from '../docs/layout/doc-skeleton';
import { columnIterator } from '../docs/layout/tools';
import { DocumentViewModel } from '../docs/view-model/document-view-model';
import { EXPAND_SIZE_FOR_RENDER_OVERFLOW, MEASURE_EXTENT, MEASURE_EXTENT_FOR_PARAGRAPH, shouldRenderRowText } from './constants';
import { SHEET_VIEWPORT_KEY } from './interfaces';

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

const GENERAL_NUMBER_MAX_SIGNIFICANT_DIGITS = 15;
const GENERAL_NUMBER_RESERVE_GLYPH = '0';

export function getShrinkToFitScale(contentWidth: number, availableWidth: number, fontSize: number): number {
    if (contentWidth <= availableWidth || contentWidth <= 0 || availableWidth <= 0 || fontSize <= 0) {
        return 1;
    }

    return Math.max(1 / fontSize, availableWidth / contentWidth);
}

export function getGeneralNumberDisplayText(
    value: number,
    displayText: string,
    fontString: string,
    availableWidth: number
): string {
    if (availableWidth <= 0) {
        return displayText;
    }

    const roundingReserveWidth = FontCache.getMeasureText(GENERAL_NUMBER_RESERVE_GLYPH, fontString).width;
    if (FontCache.getMeasureText(displayText, fontString).width + roundingReserveWidth <= availableWidth) {
        return displayText;
    }

    let bestFit = '';
    for (let decimalPlaces = 0; decimalPlaces < GENERAL_NUMBER_MAX_SIGNIFICANT_DIGITS; decimalPlaces++) {
        const pattern = decimalPlaces === 0 ? '0E+00' : `0.${'#'.repeat(decimalPlaces)}E+00`;
        const candidate = numfmt.format(pattern, value);
        if (FontCache.getMeasureText(candidate, fontString).width + roundingReserveWidth > availableWidth) {
            break;
        }
        bestFit = candidate;
    }

    if (bestFit) {
        return bestFit;
    }

    if (Math.abs(value) < 1 && FontCache.getMeasureText('0', fontString).width < availableWidth) {
        return '0';
    }

    const hashWidth = FontCache.getMeasureText('#', fontString).width;
    if (hashWidth <= 0) {
        return '#';
    }
    return '#'.repeat(Math.max(1, Math.floor(availableWidth / hashWidth)));
}

export function scaleDocumentDataForShrinkToFit(documentData: IDocumentData, scale: number, fallbackFontSize: number): IDocumentData {
    const scaled = Tools.deepClone(documentData);
    const defaultTextStyle = scaled.documentStyle.textStyle ?? {};
    const defaultFontSize = defaultTextStyle.fs ?? fallbackFontSize;
    scaled.documentStyle.textStyle = {
        ...defaultTextStyle,
        fs: defaultFontSize * scale,
    };

    scaled.body?.textRuns?.forEach((textRun) => {
        const textStyle = textRun.ts ?? {};
        textRun.ts = {
            ...textStyle,
            fs: (textStyle.fs ?? defaultFontSize) * scale,
        };
    });

    return scaled;
}

function getResolvedRenderHorizontalAlign(
    horizontalAlign: HorizontalAlign,
    cellData: Nullable<ICellDataForSheetInterceptor>
): HorizontalAlign {
    if (horizontalAlign !== HorizontalAlign.UNSPECIFIED) {
        return horizontalAlign;
    }

    if (cellData?.t === CellValueType.NUMBER || (!Tools.isDefine(cellData?.t) && typeof cellData?.v === 'number')) {
        return HorizontalAlign.RIGHT;
    }

    if (cellData?.t === CellValueType.BOOLEAN) {
        return HorizontalAlign.CENTER;
    }

    return horizontalAlign;
}

function setRenderTextCache(cacheItem: IFontCacheItem, cellData: Nullable<ICellDataForSheetInterceptor>): void {
    if (cacheItem.documentSkeleton) {
        cacheItem.displayText = undefined;
        cacheItem.resolvedHorizontalAlign = undefined;
        return;
    }

    cacheItem.displayText = getDisplayValueFromCell(cellData);
    cacheItem.resolvedHorizontalAlign = getResolvedRenderHorizontalAlign(
        cacheItem.horizontalAlign ?? HorizontalAlign.UNSPECIFIED,
        cellData
    );
}

function pushRowRange(ranges: IRange[], row: number, startColumn: number, endColumn: number): void {
    if (endColumn < startColumn) {
        return;
    }

    const last = ranges[ranges.length - 1];
    if (last && last.startRow === row && last.endRow === row && last.endColumn + 1 === startColumn) {
        last.endColumn = endColumn;
        return;
    }

    ranges.push({
        startRow: row,
        endRow: row,
        startColumn,
        endColumn,
    });
}

export interface ICacheItem {
    bg: boolean;
    border: boolean;
}

interface ISetStylesCacheForOneCellOptions {
    mergeRange?: IRange;
    cacheItem?: ICacheItem;
    reuseExisting?: boolean;
    hasMergeData?: boolean;
    rowVisible?: boolean;
    skipFontCache?: boolean;
}

export interface ISetStylesCacheOptions {
    scaleY?: number;
}

export interface IGetPosByRowColOptions {
    closeFirst?: boolean;

    /**
     * for searchArray(rowHeightAccumulation) & searchArray(colWidthAccumulation)
     * true means return first matched index in array
     */
    firstMatch?: boolean;
}

const CACHE_COUNT = 100;

export class SpreadsheetSkeleton extends SheetSkeleton {
    /**
     * Range viewBounds. only update by viewBounds.
     * It would change multiple times in one frame if there is multiple viewport (after freeze row&col)
     */
    private _drawingRange: IRowColumnRange = {
        startRow: -1,
        endRow: -1,
        startColumn: -1,
        endColumn: -1,
    };

    private _cacheRangeMap: Map<SHEET_VIEWPORT_KEY, IRowColumnRange> = new Map();
    private _visibleRangeMap: Map<SHEET_VIEWPORT_KEY, IRowColumnRange> = new Map();

    // private _dataMergeCache: IRange[] = [];
    private _overflowCache: ObjectMatrix<IRange> = new ObjectMatrix();

    private _incrementalFontRenderRanges: IRange[] = [];
    private _stylesCache: IStylesCache = {
        background: {},
        backgroundPositions: new ObjectMatrix<ICellWithCoord>(),
        fontMatrix: new ObjectMatrix<IFontCacheItem>(),
        border: new ObjectMatrix<IBorderCache>(),
    };

    private _clearTaskId: Nullable<number> = null;
    /** A matrix to store if a (row, column) position has render cache. */
    private _handleBgMatrix = new ObjectMatrix<boolean>();
    private _handleBorderMatrix = new ObjectMatrix<boolean>();
    private _showGridlines: BooleanNumber = BooleanNumber.TRUE;
    private _gridlinesColor: string | undefined = undefined;
    private _defaultGridlinesColor!: string;
    private _scene: Nullable<Scene> = null;

    constructor(
        worksheet: Worksheet,
        _styles: Styles,
        @Inject(LocaleService) _localeService: LocaleService,
        @IContextService _contextService: IContextService,
        @IConfigService _configService: IConfigService,
        @Inject(Injector) _injector: Injector
    ) {
        super(worksheet, _styles, _localeService, _contextService, _configService, _injector);
        const themeService = _injector.get(ThemeService);
        this.disposeWithMe(themeService.currentTheme$.subscribe(() => {
            const gray200 = themeService.getColorFromTheme('gray.200');
            const gray900 = themeService.getColorFromTheme('gray.900');
            this._defaultGridlinesColor = ColorKit.mix(gray200, gray900, 0.07).toHexString();
            this._scene?.getViewports().forEach((viewport) => viewport.markDirty(true));
            this._scene?.makeDirty(true);
        }));
        this._updateLayout();
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

    registerGetCellHeight() {
        this.disposeWithMe(
            this.worksheet.__registerGetCellHeight((row, col) => {
                return this.calculateAutoHeightForCell(row, col) ?? 0;
            })
        );
    }

    setScene(scene: Scene) {
        this._scene = scene;
        this.disposeWithMe(
            this._scene.onTransformChange$.subscribeEvent((param: ITransformChangeState) => {
                this.setScale(param.value.scaleX || 1, param.value.scaleY);
            })
        );
    }

    override _updateLayout() {
        const {
            showGridlines,
            gridlinesColor,
        } = this._worksheetData;

        this._showGridlines = showGridlines;
        this._gridlinesColor = gridlinesColor;
        super._updateLayout(); // make dirty false
    }

    /**
     * Range of visible area(range in viewBounds)
     */
    get rowColumnSegment(): IRowColumnRange {
        return this._drawingRange;
    }

    /**
     * Get range needs to render.
     * @param viewportKey
     * @returns
     */
    visibleRangeByViewportKey(viewportKey: SHEET_VIEWPORT_KEY): Nullable<IRowColumnRange> {
        return this._cacheRangeMap.get(viewportKey);
    }

    get stylesCache(): IStylesCache {
        return this._stylesCache;
    }

    get overflowCache(): ObjectMatrix<IRange> {
        return this._overflowCache;
    }

    get incrementalFontRenderRanges(): IRange[] {
        return this._incrementalFontRenderRanges;
    }

    get showGridlines(): BooleanNumber {
        return this._showGridlines;
    }

    get gridlinesColor(): string | undefined {
        return this._gridlinesColor;
    }

    get defaultGridlinesColor(): string {
        return this._defaultGridlinesColor;
    }

    override dispose(): void {
        super.dispose();

        this._drawingRange = {
            startRow: -1,
            endRow: -1,
            startColumn: -1,
            endColumn: -1,
        };
        this._stylesCache = {
            background: {},
            backgroundPositions: new ObjectMatrix<ICellWithCoord>(),
            fontMatrix: new ObjectMatrix<IFontCacheItem>(),
            border: new ObjectMatrix<IBorderCache>(),
        };
        this._handleBgMatrix.reset();
        this._handleBorderMatrix.reset();
        this._overflowCache.reset();
    }

    setOverflowCache(value: ObjectMatrix<IRange>): void {
        this._overflowCache = value;
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
     * Get range in visible area (range in view bounds) and set into this._rowColumnSegment.
     * @param vpInfo
     * @returns boolean
     */
    updateVisibleRange(vpInfo?: IViewportInfo): boolean {
        if (!this._worksheetData || !this.rowHeightAccumulation || !this.columnWidthAccumulation) {
            return false;
        }

        if (vpInfo) {
            const range = this.getRangeByViewport(vpInfo);
            this._visibleRangeMap.set(vpInfo.viewportKey as SHEET_VIEWPORT_KEY, range);

            const cacheRange = this.getCacheRangeByViewport(vpInfo);
            this._drawingRange = cacheRange;
            this._cacheRangeMap.set(vpInfo.viewportKey as SHEET_VIEWPORT_KEY, cacheRange);
        }

        return true;
    }

    getVisibleRangeByViewport(viewportKey: SHEET_VIEWPORT_KEY) {
        return this._visibleRangeMap.get(viewportKey);
    }

    getVisibleRanges() {
        return this._visibleRangeMap;
    }

    /**
     * Clear cache out of visible range when browser are free.
     */
    private _clearCacheOutOfVisibleRange(visibleStartRow: number, visibleEndRow: number, visibleStartColumn: number, visibleEndColumn: number) {
        if (this._clearTaskId) {
            cancelIdleCallback(this._clearTaskId);
        }

        this._clearTaskId = requestIdleCallback(() => {
            this._stylesCache.fontMatrix.forValue((row, col) => {
                if (
                    row < (visibleStartRow - CACHE_COUNT) ||
                    row > (visibleEndRow + CACHE_COUNT) ||
                    col < (visibleStartColumn - CACHE_COUNT) ||
                    col > (visibleEndColumn + CACHE_COUNT)
                ) {
                    this._stylesCache.fontMatrix.realDeleteValue(row, col);
                }
            });

            this._clearTaskId = null;
        });
    }

    /**
     * Set border background and font to this._stylesCache by visible range, which derives from bounds)
     * @param vpInfo viewBounds
     * @param options screen scale
     */
    // eslint-disable-next-line max-lines-per-function, complexity
    setStylesCache(vpInfo?: IViewportInfo, options?: ISetStylesCacheOptions): Nullable<SpreadsheetSkeleton> {
        if (!this._worksheetData) return;
        if (!this.rowHeightAccumulation || !this.columnWidthAccumulation) return;

        this.updateVisibleRange(vpInfo);

        const rowColumnSegment = this._drawingRange;
        const columnWidthAccumulation = this.columnWidthAccumulation;
        const isIncrementalScroll = !!vpInfo && !vpInfo.isDirty && !vpInfo.isForceDirty && (
            !!vpInfo.diffBounds?.length ||
            !!vpInfo.diffCacheBounds?.length ||
            !!vpInfo.diffX ||
            !!vpInfo.diffY
        );
        const hasMergeData = this.worksheet.getMergeData().length > 0;
        const shouldRefreshCacheForScroll = isIncrementalScroll && !!vpInfo.shouldCacheUpdate && !!vpInfo.diffX;
        const shouldUseIncrementalStyleRange = isIncrementalScroll && !shouldRefreshCacheForScroll;
        const styleRanges = shouldUseIncrementalStyleRange
            ? (vpInfo.shouldCacheUpdate ? (vpInfo.diffCacheBounds?.map((bound) => this.getRangeByViewBound(bound)) ?? []) : [])
            : [rowColumnSegment];
        const visibleCellOptions: ISetStylesCacheForOneCellOptions = { cacheItem: { bg: true, border: true }, reuseExisting: isIncrementalScroll, hasMergeData, rowVisible: true };
        const shortRowVisibleCellOptions: ISetStylesCacheForOneCellOptions = { ...visibleCellOptions, skipFontCache: true };
        const overflowCellOptions: ISetStylesCacheForOneCellOptions = { cacheItem: { bg: false, border: false }, reuseExisting: isIncrementalScroll, hasMergeData, rowVisible: true };
        const scaleY = options?.scaleY ?? 1;
        const hasRenderContext = options !== undefined;
        this._incrementalFontRenderRanges = [];

        // clear cache out of visible range
        // this._clearCacheOutOfVisibleRange(visibleStartRow, visibleEndRow, visibleStartColumn, visibleEndColumn);

        for (const styleRange of styleRanges) {
            const { startRow: visibleStartRow, endRow: visibleEndRow, startColumn: visibleStartColumn, endColumn: visibleEndColumn } = styleRange;

            if (visibleEndColumn === -1 || visibleEndRow === -1) continue;

            const mergeVisibleRanges: IRange[] = [];
            let mergeVisibleRangeStartRow = visibleStartRow;

            // expandStartCol & expandEndCol is slightly expand curr col range. This is for calculating text for overflow situations.
            const expandStartCol = Math.max(0, visibleStartColumn - EXPAND_SIZE_FOR_RENDER_OVERFLOW);
            const expandEndCol = Math.min(columnWidthAccumulation.length - 1, visibleEndColumn + EXPAND_SIZE_FOR_RENDER_OVERFLOW);
            for (let r = visibleStartRow; r <= visibleEndRow; r++) {
                if (this.worksheet.getRowVisible(r) === false) {
                    if (mergeVisibleRangeStartRow < r) {
                        mergeVisibleRanges.push({
                            startRow: mergeVisibleRangeStartRow,
                            endRow: r - 1,
                            startColumn: visibleStartColumn,
                            endColumn: visibleEndColumn,
                        });
                    }
                    mergeVisibleRangeStartRow = r + 1;
                    continue;
                };

                if (r === visibleEndRow) {
                    mergeVisibleRanges.push({
                        startRow: mergeVisibleRangeStartRow,
                        endRow: r,
                        startColumn: visibleStartColumn,
                        endColumn: visibleEndColumn,
                    });
                }

                const rowStartPosition = this.rowHeightAccumulation[r - 1] ?? 0;
                const rowEndPosition = this.rowHeightAccumulation[r] ?? rowStartPosition;
                const rowGap = this.gapConfig?.rowGaps?.[r]?.size ?? 0;
                const rowHeight = Math.max(0, rowEndPosition - rowStartPosition - rowGap);
                // Merged-cell fonts are cached by the dedicated merge pass below.
                const skipFontCacheForRow = hasRenderContext && !shouldRenderRowText(rowHeight, scaleY);
                const cellOptions = skipFontCacheForRow ? shortRowVisibleCellOptions : visibleCellOptions;
                for (let c = visibleStartColumn; c <= visibleEndColumn; c++) {
                    this._setStylesCacheForOneCell(r, c, cellOptions);
                }
                if (shouldUseIncrementalStyleRange && !skipFontCacheForRow) {
                    pushRowRange(this._incrementalFontRenderRanges, r, visibleStartColumn, visibleEndColumn);
                }

                if (skipFontCacheForRow) {
                    continue;
                }

                // Calculate text length for overflow cells just outside the visible range.
                for (let c = visibleStartColumn - 1; c >= expandStartCol; c--) {
                    this._setStylesCacheForOneCell(r, c, overflowCellOptions);
                    if (shouldUseIncrementalStyleRange) {
                        pushRowRange(this._incrementalFontRenderRanges, r, c, c);
                    }
                    const cell = this.worksheet.getCell(r, c);
                    if (!isCellCoverable(cell) || (hasMergeData && this.intersectMergeRange(r, c))) {
                        break;
                    }
                }
                if (visibleEndColumn === 0) continue;

                // Calculate text length for overflow cells just outside the visible range.
                for (let c = visibleEndColumn + 1; c <= expandEndCol; c++) {
                    this._setStylesCacheForOneCell(r, c, overflowCellOptions);
                    if (shouldUseIncrementalStyleRange) {
                        pushRowRange(this._incrementalFontRenderRanges, r, c, c);
                    }
                    const cell = this.worksheet.getCell(r, c);
                    if (!isCellCoverable(cell) || (hasMergeData && this.intersectMergeRange(r, c))) {
                        break;
                    }
                }
            }

            const mergeRanges: IRange[] = [];
            for (const mergeVisibleRange of mergeVisibleRanges) {
                const mergeRangeInVisible = this.getCurrentRowColumnSegmentMergeData(mergeVisibleRange);
                mergeRanges.push(...mergeRangeInVisible);
            }
            for (const mergeRange of mergeRanges) {
                this._setStylesCacheForOneCell(mergeRange.startRow, mergeRange.startColumn, {
                    mergeRange,
                    reuseExisting: isIncrementalScroll,
                    hasMergeData,
                });
                if (shouldUseIncrementalStyleRange) {
                    pushRowRange(this._incrementalFontRenderRanges, mergeRange.startRow, mergeRange.startColumn, mergeRange.startColumn);
                }
            }
        }

        return this;
    }

    //#region auto height
    /**
     * Calc all auto height by getDocsSkeletonPageSize in ranges
     * @param ranges
     * @returns {IRowAutoHeightInfo[]} result
     */
    calculateAutoHeightInRange(ranges: Nullable<IRange[]>, currentCellHeights?: ObjectMatrix<number>): IRowAutoHeightInfo[] {
        if (!Tools.isArray(ranges)) {
            return [];
        }

        const results: IRowAutoHeightInfo[] = [];
        const { rowData } = this._worksheetData;
        const rowObjectArray = rowData;
        const calculatedRows = new Set<number>();
        const rowCount = this.worksheet.getRowCount();

        for (const range of ranges) {
            const { startRow, endRow, startColumn, endColumn } = range;
            const end = Math.min(endRow, rowCount);
            for (let rowIndex = startRow; rowIndex <= end; rowIndex++) {
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
                    // if `currentCellHeights` is provided, we just need to compare `newHeights` with `currentCellHeights` to figure out if we should update the row height
                    if (currentCellHeights) {
                        const currentAutoHeight = this.worksheet.getRowHeight(rowIndex);
                        let maxPrev = 0;
                        let maxCurrent = 0;
                        for (let colIndex = startColumn; colIndex <= endColumn; colIndex++) {
                            const autoHeight = currentCellHeights.getValue(rowIndex, colIndex) ?? 0;
                            maxPrev = Math.max(maxPrev, autoHeight);
                            const currentHeight = this.calculateAutoHeightForCell(rowIndex, colIndex) ?? this._worksheetData.defaultRowHeight;
                            maxCurrent = Math.max(maxCurrent, currentHeight);
                        }

                        if (maxPrev < currentAutoHeight) {
                            calculatedRows.add(rowIndex);

                            results.push({
                                row: rowIndex,
                                autoHeight: Math.max(currentAutoHeight, maxCurrent),
                            });
                        } else {
                            if (maxCurrent >= currentAutoHeight) {
                                calculatedRows.add(rowIndex);
                                results.push({
                                    row: rowIndex,
                                    autoHeight: maxCurrent,
                                });
                            } else {
                                const autoHeight = this._calculateRowAutoHeight(rowIndex);
                                calculatedRows.add(rowIndex);
                                results.push({
                                    row: rowIndex,
                                    autoHeight,
                                });
                            }
                        }
                    } else {
                        const autoHeight = this._calculateRowAutoHeight(rowIndex);
                        calculatedRows.add(rowIndex);
                        results.push({
                            row: rowIndex,
                            autoHeight,
                        });
                    }
                }
            }
        }

        return results;
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    calculateAutoHeightForCell(row: number, col: number) {
        const { columnData, defaultColumnWidth } = this._worksheetData;
        const cellMergeInfo = this.worksheet.getCellInfoInMergeData(row, col);
        if (this._skipAutoHeightForMergedCells) {
            if (cellMergeInfo.isMerged || cellMergeInfo.isMergedMainCell) {
                return undefined;
            }
        }

        // TODO@weird94: in future, we should use `getCellRaw` instead of `getCell` to improve performance.
        const cell = this.worksheet.getCell(row, col);
        const style = this.worksheet.getComposedCellStyleByCellData(row, col, cell);

        if (cell?.interceptorAutoHeight) {
            const cellHeight = cell.interceptorAutoHeight();
            if (cellHeight) {
                return cellHeight;
            }
        }

        const sideGap = (cell?.fontRenderExtension?.leftOffset ?? 0) + (cell?.fontRenderExtension?.rightOffset ?? 0);

        const { vertexAngle, centerAngle } = convertTextRotation(style?.tr ?? { a: 0 });
        const isRichText = cell?.p || vertexAngle || centerAngle;

        let colWidth = columnData[col]?.w ?? defaultColumnWidth;
        if (cellMergeInfo.isMergedMainCell) {
            const mergeCellStartCol = cellMergeInfo.startColumn;
            const mergeCellEndCol = cellMergeInfo.endColumn;

            colWidth = Array.from(
                { length: mergeCellEndCol - mergeCellStartCol + 1 },
                (_, index) => mergeCellStartCol + index
            ).reduce((sum, colIndex) => {
                return sum + (columnData[colIndex]?.w ?? defaultColumnWidth);
            }, 0);
        }

        colWidth -= sideGap;

        if (isRichText) {
            const modelObject = cell && this.worksheet.getCellDocumentModel(cell, style);
            if (modelObject == null) {
                return undefined;
            }

            const { documentModel, textRotation, wrapStrategy } = modelObject;
            if (documentModel == null) {
                return undefined;
            }

            const documentViewModel = new DocumentViewModel(documentModel);
            const { vertexAngle: angle } = convertTextRotation(textRotation);

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

            return h;
        } else {
            if (cell?.v === undefined || cell?.v === null) {
                return undefined;
            }
            const paddingLeft = style.pd?.l ?? DEFAULT_PADDING_DATA.l;
            const paddingRight = style.pd?.r ?? DEFAULT_PADDING_DATA.r;
            const paddingTop = style.pd?.t ?? DEFAULT_PADDING_DATA.t;
            const paddingBottom = style.pd?.b ?? DEFAULT_PADDING_DATA.b;

            if (style?.tb === WrapStrategy.WRAP) {
                const skeleton = new DocSimpleSkeleton(
                    getDisplayValueFromCell(cell),
                    getFontStyleString(style).fontCache,
                    style?.tb === WrapStrategy.WRAP,
                    colWidth - paddingLeft - paddingRight,
                    Infinity
                );
                skeleton.calculate();
                return skeleton.getTotalHeight() + paddingTop + paddingBottom;
            } else {
                // For same fontStyle, the height of the text is fixed.
                // So we can use a fixed text to calculate the height to make a speed up.
                const textSize = FontCache.getMeasureText('A', getFontStyleString(style).fontCache);
                return textSize.fontBoundingBoxAscent + textSize.fontBoundingBoxDescent + paddingTop + paddingBottom;
            }
        }
    }

    private _calculateRowAutoHeight(rowNum: number): number {
        const { columnCount, defaultRowHeight } = this._worksheetData;
        let height = defaultRowHeight;

        for (let i = 0; i < columnCount; i++) {
            const cellHeight = this.calculateAutoHeightForCell(rowNum, i);
            if (cellHeight) {
                height = Math.max(height, cellHeight);
            }
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
                    width: Math.max(this._worksheetData.defaultColumnWidth, autoWidth),
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
        let currColWidth = this.columnWidthAccumulation[colIndex] - this.columnWidthAccumulation[preColIndex];
        if (colIndex === 0) {
            currColWidth = this.columnWidthAccumulation[colIndex];
        }

        for (let i = 0; i < rowIdxArr.length; i++) {
            const row = rowIdxArr[i];
            const { isMerged, isMergedMainCell } = this.worksheet.getCellInfoInMergeData(colIndex, row);
            if (isMerged && !isMergedMainCell) continue;
            if (!this.worksheet.getRowVisible(row)) continue;
            const cell = worksheet.getCell(row, colIndex);
            if (!cell) continue;

            // for cell with paragraph, only check ±1000 rows around visible area, continue the loop if out of range
            if (cell.p) {
                if (row + MEASURE_EXTENT_FOR_PARAGRAPH <= startRowOfViewMain || row - MEASURE_EXTENT_FOR_PARAGRAPH >= endRowOfViewMain) continue;
            }

            let measuredWidth = this._getMeasuredWidthByCell(cell, row, colIndex, currColWidth);
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

    getColWidth(colIndex: number) {
        const preColIndex = Math.max(0, colIndex - 1);
        const currColWidth = this.columnWidthAccumulation[colIndex] - this.columnWidthAccumulation[preColIndex];
        return currColWidth;
    }

    getRowHeight(rowIndex: number) {
        const preRowIndex = Math.max(0, rowIndex - 1);
        const currRowHeight = this.rowHeightAccumulation[rowIndex] - this.rowHeightAccumulation[preRowIndex];
        return currRowHeight;
    }

    /**
     * For _calculateColMaxWidth
     * @param cell
     * @returns {number} currColWidth
     */
    _getMeasuredWidthByCell(cell: ICellDataForSheetInterceptor, row: number, column: number, currColWidth: number) {
        let measuredWidth = 0;

        // isSkip means the text in this cell would not rendering.
        if (cell.fontRenderExtension?.isSkip && cell?.interceptorAutoWidth) {
            const cellWidth = cell.interceptorAutoWidth?.();
            if (cellWidth) {
                return cellWidth;
            }
        }
        const style = this.worksheet.getComposedCellStyleByCellData(row, column, cell);
        const modelObject = this.worksheet.getCellDocumentModel(cell, style);
        if (modelObject == null) {
            return measuredWidth;
        }

        const { documentModel, textRotation } = modelObject;
        if (documentModel == null) {
            return measuredWidth;
        }

        const documentViewModel = new DocumentViewModel(documentModel);
        const { vertexAngle: angle } = convertTextRotation(textRotation);

        if (style?.tb === WrapStrategy.WRAP) {
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

    getRangeByViewport(vpInfo?: IViewportInfo): IRange {
        return this._getRangeByViewBounding(this.rowHeightAccumulation, this.columnWidthAccumulation, vpInfo?.viewBound);
    }

    getCacheRangeByViewport(vpInfo?: IViewportInfo, isPrinting?: boolean): IRange {
        return this._getRangeByViewBounding(this.rowHeightAccumulation, this.columnWidthAccumulation, vpInfo?.cacheBound, isPrinting);
    }

    getRangeByViewBound(bound?: IBoundRectNoAngle): IRange {
        return this._getRangeByViewBounding(this.rowHeightAccumulation, this.columnWidthAccumulation, bound);
    }

    appendToOverflowCache(row: number, column: number, startColumn: number, endColumn: number): void {
        this._overflowCache.setValue(row, column, {
            startRow: row,
            endRow: row,
            startColumn,
            endColumn,
        });
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

    private _isOverflowBlockedByAdjacentCell(row: number, column: number, horizontalAlign: HorizontalAlign, hasMergeData = true): boolean {
        const leftBlocked = () => this._isOverflowSideBlocked(row, column, -1, hasMergeData);
        const rightBlocked = () => this._isOverflowSideBlocked(row, column, 1, hasMergeData);

        if (horizontalAlign === HorizontalAlign.CENTER) {
            return leftBlocked() && rightBlocked();
        }

        if (horizontalAlign === HorizontalAlign.RIGHT) {
            return leftBlocked();
        }

        return rightBlocked();
    }

    private _isOverflowSideBlocked(row: number, column: number, direction: -1 | 1, hasMergeData = true): boolean {
        const adjacentColumn = column + direction;
        if (adjacentColumn < 0 || adjacentColumn >= this.getColumnCount()) {
            return true;
        }

        const rawAdjacentCell = this._cellData.getValue(row, adjacentColumn);
        if (rawAdjacentCell && !isCellCoverable(rawAdjacentCell)) {
            return true;
        }

        const cachedAdjacentCell = this._stylesCache.fontMatrix.getValue(row, adjacentColumn)?.cellData;
        const adjacentCell = cachedAdjacentCell ?? this.worksheet.getCell(row, adjacentColumn);
        return !isCellCoverable(adjacentCell) || (hasMergeData && this.intersectMergeRange(row, adjacentColumn));
    }

    getCellWithMergeInfoByIndex(row: number, column: number): Nullable<ICellInfo> {
        const selectionCell = this.worksheet.getCellInfoInMergeData(row, column);
        return selectionCell;
    }

    /**
     * Calculate the overflow of cell text. If there is no value on either side of the cell,
     * the text content of this cell can be drawn to both sides, not limited by the cell's width.
     * Overflow on the left or right is aligned according to the text's horizontal alignment.
     */
    // eslint-disable-next-line complexity, max-lines-per-function
    private _calculateOverflowCell(row: number, column: number, docsConfig: IFontCacheItem, hasMergeData = true): boolean {
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
            docsConfig.textFitsCurrentCell = false;
            // Merged cells do not support overflow.
            if (hasMergeData && this.intersectMergeRange(row, column)) {
                return true;
            }

            const columnStart = this.columnWidthAccumulation[column - 1] || 0;
            const columnEnd = this.columnWidthAccumulation[column] || columnStart;
            const currentColumnWidth = columnEnd - columnStart;
            const rawText = docsConfig.cellData?.p?.body?.dataStream ?? docsConfig.cellData?.v;
            const mayOverflowCurrentColumn = Boolean(documentSkeleton) || `${rawText ?? ''}`.length * 4 > currentColumnWidth;
            if (mayOverflowCurrentColumn && this._isOverflowBlockedByAdjacentCell(row, column, horizontalAlignPos, hasMergeData)) {
                return true;
            }

            let contentSize;

            if (documentSkeleton) {
                contentSize = getDocsSkeletonPageSize(documentSkeleton, vertexAngle);
            } else {
                const textSize = FontCache.getMeasureText(`${docsConfig.cellData!.v!}`, docsConfig.fontString);
                contentSize = {
                    width: textSize.width,
                    height: textSize.fontBoundingBoxDescent + textSize.fontBoundingBoxAscent,
                };
            }
            if (!contentSize) {
                return true;
            }

            if (vertexAngle !== 0) {
                const { startY, endY, startX, endX } = this.getCellWithCoordByIndex(
                    row,
                    column
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

            if (contentSize.width < currentColumnWidth) {
                docsConfig.textFitsCurrentCell = true;
                return true;
            }

            const position = this.getOverflowPosition(contentSize, horizontalAlignPos, row, column, this.getColumnCount());

            const { startColumn, endColumn } = position;

            if (startColumn === endColumn) {
                return true;
            }

            this.appendToOverflowCache(row, column, startColumn, endColumn);
        } else if (wrapStrategy === WrapStrategy.WRAP && vertexAngle !== 0) {
            // Merged cells do not support overflow.
            if (hasMergeData && this.intersectMergeRange(row, column)) {
                return true;
            }

            const { startY, endY } = this.getCellWithCoordByIndex(
                row,
                column
            );

            const cellHeight = endY - startY;
            documentSkeleton!.getViewModel().getDataModel().updateDocumentDataPageSize(cellHeight);
            documentSkeleton!.calculate();
            const contentSize = getDocsSkeletonPageSize(documentSkeleton!, vertexAngle);

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
        viewBound?: IBoundRectNoAngle,
        isPrinting?: boolean
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

        const endY = Math.round(viewBound.bottom) - this.columnHeaderHeightAndMarginTop;
        let endRow = searchArray(rowHeightAccumulation, endY);
        // If the endY is exactly on the boundary, need to minus 1 to get the correct endRow.
        const isEndYOnBoundary = endRow < lenOfRowData && rowHeightAccumulation[endRow - 1] === endY;
        if (isEndYOnBoundary) {
            endRow -= 1;
        }

        const startColumn = searchArray(columnWidthAccumulation, Math.round(viewBound.left) - this.rowHeaderWidthAndMarginLeft);

        const endX = Math.round(viewBound.right) - this.rowHeaderWidthAndMarginLeft;
        let endColumn = searchArray(columnWidthAccumulation, endX);
        // If the endX is exactly on the boundary, need to minus 1 to get the correct endColumn.
        const isEndXOnBoundary = endColumn < lenOfColData && columnWidthAccumulation[endColumn - 1] === endX;
        if (isEndXOnBoundary) {
            endColumn -= 1;
        }

        // Printing excludes a row or column reached only by a small viewport overlap.
        // An exact boundary was already adjusted above and must not be decremented twice.
        if (isPrinting) {
            return {
                startRow,
                endRow: endRow === lenOfRowData - 1 || isEndYOnBoundary ? endRow : endRow - 1,
                startColumn,
                endColumn: endColumn === lenOfColData - 1 || isEndXOnBoundary ? endColumn : endColumn - 1,
            };
        }

        return {
            startRow,
            endRow,
            startColumn,
            endColumn,
        } as IRange;
    }

    /**
     * Get the current row and column segment visible merge data.
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
                startColumn: 0,
                endRow: range.endRow,
                endColumn: endColumnLast,
            };
        }

        return this.worksheet.getMergedCellRange(range.startRow, range.startColumn, range.endRow, range.endColumn);
    }

    override resetCache(): void {
        this._resetCache();
    }

    /**
     * Any changes to sheet model would reset cache.
     */
    _resetCache(): void {
        this._stylesCache = {
            background: {},
            backgroundPositions: new ObjectMatrix<ICellWithCoord>(),
            fontMatrix: new ObjectMatrix<IFontCacheItem>(),
            border: new ObjectMatrix<IBorderCache>(),
        };

        this._handleBgMatrix?.reset();
        this._handleBorderMatrix?.reset();
        this._overflowCache?.reset();
    }

    override resetRangeCache(ranges: IRange[]): void {
        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            Range.foreach(range, (row, col) => {
                this._stylesCache.fontMatrix.realDeleteValue(row, col);
                this._stylesCache.border?.realDeleteValue(row, col);
                this._stylesCache.backgroundPositions?.realDeleteValue(row, col);
                this._handleBgMatrix.realDeleteValue(row, col);
                this._handleBorderMatrix.realDeleteValue(row, col);
                Object.values(this._stylesCache.background ?? {}).forEach((backgroundMatrix) => {
                    backgroundMatrix.realDeleteValue(row, col);
                });
            });
        }
        this.makeDirty(true);
    }

    _setBorderStylesCache(row: number, col: number, style: Nullable<IStyleData>, options: ISetStylesCacheForOneCellOptions | undefined) {
        const handledThisCell = Tools.isDefine(this._handleBorderMatrix.getValue(row, col));
        if (handledThisCell && !options?.mergeRange) return;
        // by default, style cache should includes border and background info.
        const cacheItem = options?.cacheItem || { bg: true, border: true };
        if (!cacheItem.border) return;

        this._handleBorderMatrix.setValue(row, col, true);
        if (style && style.bd) {
            const mergeRange = options?.mergeRange;
            if (mergeRange) {
                this._setMergeBorderProps(BORDER_TYPE.TOP, this._stylesCache, mergeRange);
                this._setMergeBorderProps(BORDER_TYPE.BOTTOM, this._stylesCache, mergeRange);
                this._setMergeBorderProps(BORDER_TYPE.LEFT, this._stylesCache, mergeRange);
                this._setMergeBorderProps(BORDER_TYPE.RIGHT, this._stylesCache, mergeRange);
            } else if (!this.intersectMergeRange(row, col)) {
                this._setBorderProps(row, col, BORDER_TYPE.TOP, style, this._stylesCache);
                this._setBorderProps(row, col, BORDER_TYPE.BOTTOM, style, this._stylesCache);
                this._setBorderProps(row, col, BORDER_TYPE.LEFT, style, this._stylesCache);
                this._setBorderProps(row, col, BORDER_TYPE.RIGHT, style, this._stylesCache);
            }

            this._setBorderProps(row, col, BORDER_TYPE.TL_BR, style, this._stylesCache);
            this._setBorderProps(row, col, BORDER_TYPE.TL_BC, style, this._stylesCache);
            this._setBorderProps(row, col, BORDER_TYPE.TL_MR, style, this._stylesCache);
            this._setBorderProps(row, col, BORDER_TYPE.BL_TR, style, this._stylesCache);
            this._setBorderProps(row, col, BORDER_TYPE.ML_TR, style, this._stylesCache);
            this._setBorderProps(row, col, BORDER_TYPE.BC_TR, style, this._stylesCache);
        }
    }

    _setBgStylesCache(row: number, col: number, style: Nullable<IStyleData>, options: ISetStylesCacheForOneCellOptions | undefined) {
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

    private _applyShrinkToFit(row: number, col: number, fontCache: IFontCacheItem, style: IStyleData): void {
        if (style.stf !== BooleanNumber.TRUE) {
            return;
        }

        const cellInfo = this.getCellWithCoordByIndex(row, col, false);
        const startX = cellInfo.isMergedMainCell ? cellInfo.mergeInfo.startX : cellInfo.startX;
        const endX = cellInfo.isMergedMainCell ? cellInfo.mergeInfo.endX : cellInfo.endX;
        const padding = style.pd ?? DEFAULT_PADDING_DATA;
        const extension = fontCache.cellData?.fontRenderExtension;
        const availableWidth = endX - startX
            - (padding.l ?? DEFAULT_PADDING_DATA.l)
            - (padding.r ?? DEFAULT_PADDING_DATA.r)
            - (extension?.leftOffset ?? 0)
            - (extension?.rightOffset ?? 0);
        const fallbackFontSize = style.fs ?? DEFAULT_STYLES.fs;
        const contentWidth = fontCache.documentSkeleton
            ? (getDocsSkeletonPageSize(fontCache.documentSkeleton, fontCache.vertexAngle) ?? { width: 0 }).width
            : FontCache.getMeasureText(
                fontCache.displayText ?? getDisplayValueFromCell(fontCache.cellData),
                fontCache.fontString
            ).width;
        const scale = getShrinkToFitScale(contentWidth, availableWidth, fallbackFontSize);

        if (scale >= 1) {
            return;
        }

        fontCache.shrinkScale = scale;
        if (fontCache.documentSkeleton) {
            const snapshot = fontCache.documentSkeleton.getViewModel().getDataModel().getSnapshot();
            const documentModel = new DocumentDataModel(scaleDocumentDataForShrinkToFit(snapshot, scale, fallbackFontSize));
            const documentSkeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), this._localeService);
            documentSkeleton.calculate();
            fontCache.documentSkeleton = documentSkeleton;
        } else {
            fontCache.fontString = getFontStyleString({
                ...style,
                fs: fallbackFontSize * scale,
            }).fontCache;
        }
    }

    private _applyGeneralNumberDisplay(row: number, col: number, fontCache: IFontCacheItem, style: IStyleData): void {
        const cellData = fontCache.cellData;
        if (!cellData || style.stf === BooleanNumber.TRUE || fontCache.documentSkeleton) {
            return;
        }
        if (!isDefaultFormat(style.n?.pattern)) {
            return;
        }
        if (cellData.t !== CellValueType.NUMBER && (Tools.isDefine(cellData.t) || typeof cellData.v !== 'number')) {
            return;
        }

        const value = Number(cellData.v);
        if (!Number.isFinite(value)) {
            return;
        }

        const cellInfo = this.getCellWithCoordByIndex(row, col, false);
        const startX = cellInfo.isMergedMainCell ? cellInfo.mergeInfo.startX : cellInfo.startX;
        const endX = cellInfo.isMergedMainCell ? cellInfo.mergeInfo.endX : cellInfo.endX;
        const padding = style.pd ?? DEFAULT_PADDING_DATA;
        const extension = cellData.fontRenderExtension;
        const availableWidth = endX - startX
            - (padding.l ?? DEFAULT_PADDING_DATA.l)
            - (padding.r ?? DEFAULT_PADDING_DATA.r)
            - (extension?.leftOffset ?? 0)
            - (extension?.rightOffset ?? 0);
        fontCache.displayText = getGeneralNumberDisplayText(
            value,
            fontCache.displayText ?? getDisplayValueFromCell(cellData),
            fontCache.fontString,
            availableWidth
        );
    }

    _setFontStylesCache(row: number, col: number, cellData: Nullable<ICellDataForSheetInterceptor>, style: IStyleData, hasMergeData = true) {
        if (isNullCell(cellData)) return;

        let config: Partial<IFontCacheItem> = {
            cellData,
            imageCacheMap: this._imageCacheMap,
        };

        const cacheValue = this._stylesCache.fontMatrix.getValue(row, col);
        if (!cacheValue) {
            this._stylesCache.fontMatrix.setValue(row, col, config as IFontCacheItem);
        } else {
            const cacheItem = cacheValue as IFontCacheItem;
            cacheItem.cellData = cellData;
            setRenderTextCache(cacheItem, cellData);
            this._applyGeneralNumberDisplay(row, col, cacheItem, style);
            this._stylesCache.fontMatrix.setValue(row, col, cacheValue as IFontCacheItem);
            return;
        }
        const { vertexAngle, centerAngle } = convertTextRotation(style?.tr ?? { a: 0 });
        const isRichText = cellData?.p || vertexAngle || centerAngle;

        const modelObject = isRichText ?
            this.worksheet.getCellDocumentModel(cellData, style, { displayRawFormula: this._renderRawFormula })
            : null;

        if (modelObject) {
            const { documentModel } = modelObject;
            if (documentModel) {
                const { fontString, wrapStrategy, verticalAlign, horizontalAlign } = modelObject;
                const documentViewModel = new DocumentViewModel(documentModel);
                if (documentViewModel) {
                    const documentSkeleton = DocumentSkeleton.create(documentViewModel, this._localeService);
                    documentSkeleton.calculate();

                    config = {
                        documentSkeleton,
                        vertexAngle,
                        centerAngle,
                        verticalAlign,
                        horizontalAlign,
                        wrapStrategy,
                        imageCacheMap: this._imageCacheMap,
                        cellData,
                        fontString,
                        style,
                    };
                }
            }
        } else {
            const fontString = getFontStyleString(style ?? undefined).fontCache;
            const { vt: verticalAlign, ht: horizontalAlign, tb: wrapStrategy } = style ?? {};
            config = {
                documentSkeleton: undefined,
                vertexAngle,
                centerAngle,
                verticalAlign: verticalAlign ?? VerticalAlign.UNSPECIFIED,
                horizontalAlign: horizontalAlign ?? HorizontalAlign.UNSPECIFIED,
                wrapStrategy: wrapStrategy ?? WrapStrategy.OVERFLOW,
                imageCacheMap: this._imageCacheMap,
                cellData,
                fontString,
                style,
            };
        }
        const fontCacheItem = config as IFontCacheItem;
        setRenderTextCache(fontCacheItem, cellData);
        this._applyGeneralNumberDisplay(row, col, fontCacheItem, style);
        this._applyShrinkToFit(row, col, fontCacheItem, style);
        this._calculateOverflowCell(row, col, fontCacheItem, hasMergeData);
        this._stylesCache.fontMatrix.setValue(row, col, fontCacheItem);
    }

    /**
     * Set border background and font to this._stylesCache cell by cell.
     * @param row {number}
     * @param col {number}
     * @param options {{ mergeRange: IRange; cacheItem: ICacheItem } | undefined}
     */
    private _setStylesCacheForOneCell(row: number, col: number, options: ISetStylesCacheForOneCellOptions): void {
        // when row/col would be negative ?
        if (row === -1 || col === -1) {
            return;
        }

        // const handledBgCell = Tools.isDefine(this._handleBgMatrix.getValue(row, col));
        // const handledBorderCell = Tools.isDefine(this._handleBorderMatrix.getValue(row, col));

        // // worksheet.getCell has significant performance overhead, if we had handled this cell then return first.
        // if (handledBgCell && handledBorderCell) {
        //     return;
        // }

        if (!options) {
            options = { cacheItem: { bg: true, border: true } };
        }

        const cacheItem = options.cacheItem;
        if (options.reuseExisting && cacheItem && !options.mergeRange) {
            const bgHandled = !cacheItem.bg || Tools.isDefine(this._handleBgMatrix.getValue(row, col));
            const borderHandled = !cacheItem.border || Tools.isDefine(this._handleBorderMatrix.getValue(row, col));
            if (bgHandled && borderHandled && (options.skipFontCache || this._stylesCache.fontMatrix.getValue(row, col))) {
                return;
            }
        }

        const hasMergeData = options.hasMergeData ?? true;
        let isMerged = false;
        let isMergedMainCell = false;
        if (hasMergeData) {
            const mergeInfo = this.worksheet.getCellInfoInMergeData(row, col);
            isMerged = mergeInfo.isMerged;
            isMergedMainCell = mergeInfo.isMergedMainCell;
        }

        const rowVisible = options.rowVisible ?? this.worksheet.getRowVisible(row);
        const hidden = this.worksheet.getColVisible(col) === false || rowVisible === false;

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
        const style = this.worksheet.getComposedCellStyleByCellData(row, col, cell);
        if (!cell && Object.keys(style).length === 0) return;

        this._setBgStylesCache(row, col, style, options);
        this._setBorderStylesCache(row, col, style, options);
        if (!options.skipFontCache) {
            this._setFontStylesCache(row, col, { ...cell, s: style }, style, options.hasMergeData ?? true);
        }
    }

    /**
     * pro/issues/344
     * In Excel, for the border rendering of merged cells to take effect, the outermost cells need to have the same border style.
     */
    private _setMergeBorderProps(type: BORDER_TYPE, cache: IStylesCache, mergeRange: IRange): void {
        if (!this.worksheet || !cache.border) return;

        const borders: Array<{ style: BorderStyleTypes; color: string; r: number; c: number }> = [];
        let isAddBorders = true;
        let forStart = mergeRange.startRow;
        let forEnd = mergeRange.endRow;
        let row = mergeRange.startRow;
        let column = mergeRange.startColumn;

        if (type === BORDER_TYPE.TOP) {
            row = mergeRange.startRow;
            forStart = mergeRange.startColumn;
            forEnd = mergeRange.endColumn;
        } else if (type === BORDER_TYPE.BOTTOM) {
            row = mergeRange.endRow;
            forStart = mergeRange.startColumn;
            forEnd = mergeRange.endColumn;
        } else if (type === BORDER_TYPE.LEFT) {
            column = mergeRange.startColumn;
            forStart = mergeRange.startRow;
            forEnd = mergeRange.endRow;
        } else if (type === BORDER_TYPE.RIGHT) {
            column = mergeRange.endColumn;
            forStart = mergeRange.startRow;
            forEnd = mergeRange.endRow;
        }

        for (let i = forStart; i <= forEnd; i++) {
            if (type === BORDER_TYPE.TOP) {
                column = i;
            } else if (type === BORDER_TYPE.BOTTOM) {
                column = i;
            } else if (type === BORDER_TYPE.LEFT) {
                row = i;
            } else if (type === BORDER_TYPE.RIGHT) {
                row = i;
            }

            const cell = this.worksheet.getCell(row, column);
            if (!cell) {
                isAddBorders = false;
                break;
            }

            const themeStyleBackground = cell.themeStyle?.bd;

            const style = this.worksheet.getComposedCellStyleByCellData(row, column, cell);
            if (!style && !themeStyleBackground) {
                isAddBorders = false;
                break;
            }

            const props: Nullable<IBorderStyleData> = style?.bd?.[type] ?? themeStyleBackground?.[type];
            if (props) {
                const rgb = getColorStyle(props.cl) || COLOR_BLACK_RGB;
                borders.push({
                    r: row,
                    c: column,
                    style: props.s,
                    color: rgb,
                });
            } else {
                // if one cell has no border, then clear others cells which have border? why do this?
                // isAddBorders = false;
            }
        }

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

    private _setBorderProps(r: number, c: number, type: BORDER_TYPE, style: IStyleData, cache: IStylesCache): void {
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
        if (type === BORDER_TYPE.TOP) {
            const borderBottom = borderCache.getValue(r - 1, c)?.[BORDER_TYPE.BOTTOM];
            if (borderBottom && isWhiteColor(rgb)) {
                return;
            }
        } else if (type === BORDER_TYPE.LEFT) {
            const borderRight = borderCache.getValue(r, c - 1)?.[BORDER_TYPE.RIGHT];
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

    getDistanceFromTopLeft(row: number, col: number): IPoint {
        return {
            x: this.colStartX(col),
            y: this.rowStartY(row),
        };
    }

    colStartX(col: number): number {
        const arr = this.columnWidthAccumulation;
        const i = col - 1;
        if (i === -1) return 0;
        return arr[i];
    }

    rowStartY(row: number): number {
        const arr = this.rowHeightAccumulation;
        const i = row - 1;
        if (i === -1) return 0;
        return arr[i];
    }

    getHiddenRowsInRange(range: IRowRange) {
        const hiddenRows = [];
        for (let i = range.startRow; i <= range.endRow; i++) {
            if (!this.worksheet.getRowVisible(i)) {
                hiddenRows.push(i);
            }
        }
        return hiddenRows;
    }

    getHiddenColumnsInRange(range: IColumnRange) {
        const hiddenCols = [];
        for (let i = range.startColumn; i <= range.endColumn; i++) {
            if (!this.worksheet.getColVisible(i)) {
                hiddenCols.push(i);
            }
        }
        return hiddenCols;
    }
}

/**
 * convert canvas content position to physical position in screen
 * @param offsetX
 * @param scaleX
 * @param scrollXY
 */
export function convertTransformToOffsetX(
    offsetX: number,
    scaleX: number,
    scrollXY: { x: number; y: number }
): number {
    const { x: scrollX } = scrollXY;
    return (offsetX - scrollX) * scaleX;
}

/**
 * convert canvas content position to physical position in screen
 * @param offsetY
 * @param scaleY
 * @param scrollXY
 */
export function convertTransformToOffsetY(
    offsetY: number,
    scaleY: number,
    scrollXY: { x: number; y: number }
): number {
    const { y: scrollY } = scrollXY;
    return (offsetY - scrollY) * scaleY;
}

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
    if (!pages || pages.length === 0) {
        return null;
    }
    const lastPage = pages[pages.length - 1];
    if (!lastPage) {
        return null;
    }
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

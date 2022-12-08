import {
    BlockType,
    BooleanNumber,
    SheetContext,
    HorizontalAlign,
    IBorderStyleData,
    ICellData,
    IDocumentData,
    IPaddingData,
    IRangeData,
    IStyleBase,
    IStyleData,
    ITextRotation,
    ITextStyle,
    ObjectArray,
    ObjectMatrix,
    ParagraphElementType,
    Styles,
    TextDirection,
    TextDirectionType,
    VerticalAlign,
    WrapStrategy,
    IRowData,
    IColumnData,
    ObjectArrayType,
    IWorksheetConfig,
    searchArray,
    isEmptyCell,
    Nullable,
    getColorStyle,
    IDocumentRenderConfig,
} from '@univer/core';
import { BORDER_TYPE, COLOR_BLACK_RGB } from '../../Basics/Const';
import { IStylesCache, BorderCache } from './Interfaces';
import { getFontStyleString, getCellPositionByIndex, isRectIntersect } from '../../Basics/Tools';
import { IFontLocale } from '../../Basics/Interfaces';
import { IBoundRect } from '../../Basics/Vector2';
import { Skeleton } from '../Skeleton';
import { DocumentSkeleton } from '../Docs/DocSkeleton';

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

export class SpreadsheetSkeleton extends Skeleton {
    private _rowHeightAccumulation: number[];

    private _rowTotalHeight: number;

    private _columnWidthAccumulation: number[];

    private _columnTotalWidth: number;

    private _rowTitleWidth = 0;

    private _columnTitleHeight = 0;

    private _rowColumnSegment: IRowColumnSegment;

    private _dataMergeCache: ObjectMatrix<IRangeData>;

    private _dataMergeCacheAll: ObjectMatrix<IRangeData>;

    private _overflowCache: ObjectMatrix<IRangeData>;

    private _stylesCache: IStylesCache;

    constructor(private _config: IWorksheetConfig, private _cellData: ObjectMatrix<ICellData>, private _styles: Styles, context: SheetContext) {
        super(context);
        this.updateLayout();
        this.updateDataMerge();
    }

    getWorksheetConfig() {
        return this._config;
    }

    getCellData() {
        return this._cellData;
    }

    getsStyles() {
        return this._styles;
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

    get rowTitleWidth() {
        return this._rowTitleWidth;
    }

    get columnTitleHeight() {
        return this._columnTitleHeight;
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

    setOverflowCache(value: ObjectMatrix<IRangeData>) {
        this._overflowCache = value;
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
        this._stylesCache = this._calculateStylesCache();
        // this._overflowCache = this._calculateOverflowCache();
        return this;
    }

    updateLayout() {
        if (!this.dirty) {
            return;
        }
        const { rowData, columnData, defaultRowHeight, defaultColumnWidth, rowCount, columnCount, rowTitle, columnTitle } = this._config;
        const { rowTotalHeight, rowHeightAccumulation } = this._generateRowMatrixCache(rowCount, rowData, defaultRowHeight);
        const { columnTotalWidth, columnWidthAccumulation } = this._generateColumnMatrixCache(columnCount, columnData, defaultColumnWidth);

        this._rowTitleWidth = rowTitle.hidden !== BooleanNumber.TRUE ? rowTitle.width : 0;
        this._columnTitleHeight = columnTitle.hidden !== BooleanNumber.TRUE ? columnTitle.height : 0;

        this._rowTotalHeight = rowTotalHeight;
        this._rowHeightAccumulation = rowHeightAccumulation;
        this._columnTotalWidth = columnTotalWidth;
        this._columnWidthAccumulation = columnWidthAccumulation;

        this.makeDirty(true);

        return this;
    }

    updateDataMerge() {
        const { mergeData } = this._config;
        this._dataMergeCacheAll = mergeData && this._getMergeCells(mergeData);
    }

    getRowColumnSegment(bounds?: IBoundRect) {
        return this._getBounding(this._rowHeightAccumulation, this._columnWidthAccumulation, bounds);
    }

    getMergeBounding(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        const dataMergeCache = this._dataMergeCacheAll;
        if (!dataMergeCache) {
            return {
                startRow,
                startColumn,
                endRow,
                endColumn,
            };
        }
        let isSearching = true;
        let searchedMarge = new ObjectMatrix<boolean>();
        while (isSearching) {
            isSearching = false;
            dataMergeCache.forEach((row: number, rowArray: ObjectArray<IRangeData>) => {
                rowArray.forEach((column: number, mainCell: IRangeData) => {
                    if (!mainCell || searchedMarge.getValue(row, column)) {
                        return true;
                    }
                    const { startRow: mainStartRow, startColumn: mainStartColumn, endRow: mainEndRow, endColumn: mainEndColumn } = mainCell;

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
                        searchedMarge.setValue(row, column, true);
                        isSearching = true;
                    }
                });
            });
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

    get dataMergeCacheAll() {
        return this._dataMergeCacheAll;
    }

    private _generateRowMatrixCache(rowCount: number, rowData: ObjectArrayType<Partial<IRowData>>, defaultRowHeight: number) {
        let rowTotalHeight = 0;
        const rowHeightAccumulation: number[] = [];
        const data = new ObjectArray<IRowData>(rowData);
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

    private _generateColumnMatrixCache(colCount: number, columnData: ObjectArrayType<Partial<IColumnData>>, defaultColumnWidth: number) {
        let columnTotalWidth = 0;
        const columnWidthAccumulation: number[] = [];

        const data = new ObjectArray<IColumnData>(columnData);

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

        dataset_row_st = searchArray(rowHeightAccumulation, bounds.tl.y - this.columnTitleHeight);
        dataset_row_ed = searchArray(rowHeightAccumulation, bounds.bl.y - this.columnTitleHeight);

        if (dataset_row_st === -1) {
            dataset_row_st = 0;
        }

        if (dataset_row_ed === -1) {
            dataset_row_ed = rhaLength - 1;
        }

        if (dataset_row_ed >= rhaLength) {
            dataset_row_ed = rhaLength - 1;
        }

        dataset_col_st = searchArray(columnWidthAccumulation, bounds.tl.x - this.rowTitleWidth);
        dataset_col_ed = searchArray(columnWidthAccumulation, bounds.tr.x - this.rowTitleWidth);

        if (dataset_col_st === -1) {
            dataset_col_st = 0;
        }

        if (dataset_col_ed === -1) {
            dataset_col_ed = cwaLength - 1;
        }

        if (dataset_col_ed >= cwaLength) {
            dataset_col_ed = cwaLength - 1;
        }

        return {
            startRow: dataset_row_st - 1,
            endRow: dataset_row_ed + 1,
            startColumn: dataset_col_st - 1,
            endColumn: dataset_col_ed + 1,
        };
    }

    // private _calculateOverflowCache() {
    //     const { font: fontList } = this.stylesCache;
    //     // const mergeRangeCache = this._getMergeRangeCache();
    //     const overflowCache = new ObjectMatrix<IRangeData>();
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

    getOverflowPosition(contentSize: { width: number; height: number }, horizontalAlign: HorizontalAlign, row: number, column: number, columnCount: number) {
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
                const { startX, endX } = getCellPositionByIndex(row, column, this.rowHeightAccumulation, this.columnWidthAccumulation);
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
            const { startX, endX } = getCellPositionByIndex(row, column, this.rowHeightAccumulation, this.columnWidthAccumulation);
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
        dataMergeCache?.forEach((r, dataMergeRow) => {
            dataMergeRow?.forEach((c, dataCache) => {
                const { startRow: startRowMargeIndex, endRow: endRowMargeIndex, startColumn: startColumnMargeIndex, endColumn: endColumnMargeIndex } = dataCache;
                if (row >= startRowMargeIndex && row <= endRowMargeIndex && column >= startColumnMargeIndex && column <= endColumnMargeIndex) {
                    isIntersected = true;
                    return false;
                }
            });
        });
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

    private _calculateStylesCache() {
        const cache: IStylesCache = {
            background: {},
            font: {},
            border: new ObjectMatrix<BorderCache>(),
        };

        const fontLocale = this.getFontLocale();

        const dataMergeCache = this._dataMergeCache;
        const rowColumnSegment = this._rowColumnSegment;
        const columnWidthAccumulation = this.columnWidthAccumulation;
        const styles = this._styles;
        const cellData = this._cellData;

        const { startRow, endRow, startColumn, endColumn } = rowColumnSegment;

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                this.__setCellCache(
                    r,
                    c,
                    {
                        cache,
                        styles,
                        cellData,
                        skipBackgroundAndBorder: false,
                    },
                    fontLocale
                );
            }

            // 针对溢出的情况计算文本长度，可视范围左侧列
            for (let c = 0; c < startColumn; c++) {
                this.__setCellCache(
                    r,
                    c,
                    {
                        cache,
                        styles,
                        cellData,
                        skipBackgroundAndBorder: true,
                    },
                    fontLocale
                );
            }

            // 针对溢出的情况计算文本长度，可视范围右侧列
            for (let c = endColumn + 1; c < columnWidthAccumulation.length; c++) {
                this.__setCellCache(
                    r,
                    c,
                    {
                        cache,
                        styles,
                        cellData,
                        skipBackgroundAndBorder: true,
                    },
                    fontLocale
                );
            }
        }

        dataMergeCache &&
            dataMergeCache.forEach((rowIndex: number, row: ObjectArray<IRangeData>) => {
                row.forEach((columnIndex: number, mainCell: IRangeData) => {
                    if (!mainCell) {
                        return true;
                    }

                    this.__setCellCache(
                        rowIndex,
                        columnIndex,
                        {
                            cache,
                            styles,
                            cellData,
                            skipBackgroundAndBorder: false,
                        },
                        fontLocale
                    );
                });
            });
        return cache;
    }

    private __setCellCache(r: number, c: number, props: ISetCellCache, fontLocale?: IFontLocale) {
        const { cache, skipBackgroundAndBorder = false, styles, cellData } = props;
        if (!cellData) {
            return true;
        }
        const cell = cellData.getValue(r, c);
        if (!cell) {
            return true;
        }

        // style supports inline styles
        // const style = styles && styles.get(cell.s);
        // const style = getStyle(styles, cell);
        const style = styles && styles.getStyleByCell(cell);

        if (!skipBackgroundAndBorder && style && style.bg && style.bg.rgb) {
            const rgb = style.bg.rgb;
            if (!cache.background![rgb]) {
                cache.background![rgb] = new ObjectMatrix();
            }
            const bgCache = cache.background![rgb];

            bgCache.setValue(r, c, rgb);
        }

        if (!skipBackgroundAndBorder && style && style.bd) {
            this.___setBorderProps(r, c, BORDER_TYPE.TOP, style, cache);
            this.___setBorderProps(r, c, BORDER_TYPE.BOTTOM, style, cache);
            this.___setBorderProps(r, c, BORDER_TYPE.LEFT, style, cache);
            this.___setBorderProps(r, c, BORDER_TYPE.RIGHT, style, cache);
        }

        const content = cell.m || cell.v;

        let documentData: Nullable<IDocumentData>;
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
            if (!cache.font![fontString]) {
                cache.font![fontString] = new ObjectMatrix();
            }
            let { a: angle = 0, v: isVertical = BooleanNumber.FALSE } = textRotation;
            let centerAngle = 0;
            let vertexAngle = angle;
            if (isVertical === BooleanNumber.TRUE) {
                centerAngle = 90;
                vertexAngle = 90;
            }
            documentData = this._updateRenderConfigAndHorizon(cell.p, horizontalAlign, {
                horizontalAlign,
                verticalAlign,
                centerAngle,
                vertexAngle,
                wrapStrategy,
            });
        } else if (content) {
            const textStyle = this._getFontFormat(style);
            fontString = getFontStyleString(textStyle, fontLocale).fontString;
            if (!cache.font![fontString]) {
                cache.font![fontString] = new ObjectMatrix();
            }

            documentData = this._getDocumentDataByStyle(content.toString(), textStyle, cellOtherConfig);
        }

        const fontCache = cache.font![fontString];

        let { a: angle, v: isVertical = BooleanNumber.FALSE } = textRotation as ITextRotation;
        if (isVertical === BooleanNumber.TRUE) {
            angle = 90;
        }
        if (documentData) {
            const documentSkeleton = DocumentSkeleton.create(documentData, this.getContext());
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
                content: content?.toString(),
            });
        }
    }

    private _updateRenderConfigAndHorizon(document: IDocumentData, horizontalAlign: HorizontalAlign, renderConfig?: IDocumentRenderConfig) {
        if (!renderConfig) {
            return;
        }

        if (!document.body?.blockElements) {
            return;
        }

        if (!document.documentStyle) {
            document.documentStyle = {};
        }
        document.documentStyle.renderConfig = renderConfig;

        const blockElements = document.body.blockElements;
        const blockKeys = Object.keys(document.body.blockElements);
        for (let key of blockKeys) {
            const blockElement = blockElements[key];
            // if (blockElement.blockType === BlockType.SECTION_BREAK) {
            //     if (!blockElement.sectionBreak) {
            //         blockElement.sectionBreak = {};
            //     }

            //     blockElement.sectionBreak.renderConfig = renderConfig;
            // } else
            if (blockElement.blockType === BlockType.PARAGRAPH) {
                if (!blockElement.paragraph) {
                    continue;
                }

                if (!blockElement.paragraph.paragraphStyle) {
                    blockElement.paragraph.paragraphStyle = {};
                }

                blockElement.paragraph.paragraphStyle.horizontalAlign = horizontalAlign;
            }
        }
        return document;
    }

    private _getDocumentDataByStyle(content: string, textStyle: ITextStyle, config: CellOtherConfig) {
        const contentLength = content.length - 1;
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
            centerAngle = 90;
            vertexAngle = 90;
            textDirectionDocument = TextDirectionType.TBRL;
        }
        const documentData: IDocumentData = {
            documentId: 'd',
            body: {
                blockElements: {
                    oneParagraph: {
                        blockId: 'oneParagraph',
                        st: 0,
                        ed: contentLength,
                        blockType: BlockType.PARAGRAPH,
                        paragraph: {
                            paragraphStyle: {
                                horizontalAlign,
                            },
                            elements: {
                                oneElement: {
                                    eId: 'oneElement',
                                    st: 0,
                                    ed: contentLength,
                                    et: ParagraphElementType.TEXT_RUN,
                                    tr: {
                                        ct: content,
                                        ts: textStyle,
                                    },
                                },
                            },
                            elementOrder: [{ elementId: 'oneElement', paragraphElementType: ParagraphElementType.TEXT_RUN }],
                        },
                    },
                    // oneSectionBreak: {
                    //     blockId: 'oneSectionBreak',
                    //     st: 0,
                    //     ed: 0,
                    //     blockType: BlockType.SECTION_BREAK,
                    //     sectionBreak: {
                    //         columnProperties: [],
                    //         columnSeparatorType: ColumnSeparatorType.NONE,
                    //         sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
                    //         // textDirection: textDirectionDocument,
                    //         // contentDirection: textDirection!,
                    //     },
                    // },
                },
                blockElementOrder: ['oneParagraph'],
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

        return documentData;
    }

    private ___setBorderProps(r: number, c: number, type: BORDER_TYPE, style: IStyleData, cache: IStylesCache) {
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

        return {
            ff,
            fs,
            it,
            bl,
            ul,
            st,
            ol,
            cl,
        };
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

    private _getMergeCells(mergeData: IRangeData[], rowColumnSegment?: IRowColumnSegment) {
        // const rowColumnSegment = this._rowColumnSegment;
        const endColumnLast = this.columnWidthAccumulation.length - 1;
        if (!rowColumnSegment) {
            const endRow = this.rowHeightAccumulation.length - 1;
            rowColumnSegment = { startRow: 0, startColumn: 0, endRow, endColumn: endColumnLast };
        } else {
            rowColumnSegment = { startRow: rowColumnSegment.startRow, endRow: rowColumnSegment.endRow, endColumn: endColumnLast, startColumn: 0 };
        }
        const { startRow, startColumn, endRow, endColumn } = rowColumnSegment;
        const cacheDataMerge = new ObjectMatrix<IRangeData>();
        for (let i = 0; i < mergeData.length; i++) {
            const { startRow: mergeStartRow, endRow: mergeEndRow, startColumn: mergeStartColumn, endColumn: mergeEndColumn } = mergeData[i];
            for (let r = startRow; r <= endRow; r++) {
                let isBreak = false;
                for (let c = startColumn; c <= endColumn; c++) {
                    if (r >= mergeStartRow && r <= mergeEndRow && c >= mergeStartColumn && c <= mergeEndColumn) {
                        cacheDataMerge.setValue(mergeStartRow, mergeStartColumn, {
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

    static create(config: IWorksheetConfig, cellData: ObjectMatrix<ICellData>, styles: Styles, context: SheetContext) {
        return new SpreadsheetSkeleton(config, cellData, styles, context);
    }
}

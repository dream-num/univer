import { HorizontalAlign, IColorStyle, ObjectMatrix, WrapStrategy } from '@univer/core';
import { SpreadsheetSkeleton } from '../SheetSkeleton';
import { SheetExtension } from './SheetExtension';
import { IScale } from '../../../Basics/Interfaces';
import { SpreadsheetExtensionRegistry } from '../../Extension';
import { Spreadsheet } from '../Spreadsheet';
import { fixLineWidthByScale } from '../../../Basics/Tools';
import { fontCacheItem } from '../Interfaces';

const UNIQUE_KEY = 'DefaultFontExtension';
export class Font extends SheetExtension {
    uKey = UNIQUE_KEY;

    zIndex = 40;

    getDocuments() {
        const parent = this.parent as Spreadsheet;
        return parent.getDocuments();
    }

    changeFontColor: ObjectMatrix<IColorStyle>;

    setChangeFontColor(r: number, c: number, color: IColorStyle) {
        this.changeFontColor.setValue(r, c, color);
    }

    draw(ctx: CanvasRenderingContext2D, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { rowColumnSegment, rowTitleWidth, columnTitleHeight, stylesCache, dataMergeCache, overflowCache } = spreadsheetSkeleton;
        const { font: fontList } = stylesCache;
        if (!spreadsheetSkeleton) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } = spreadsheetSkeleton;

        if (!rowHeightAccumulation || !columnWidthAccumulation || columnTotalWidth === undefined || rowTotalHeight === undefined) {
            return;
        }
        ctx.save();
        const scale = this._getScale(parentScale);
        const { scaleX = 1, scaleY = 1 } = parentScale;

        fontList &&
            Object.keys(fontList).forEach((fontFormat: string) => {
                const fontObjectArray = fontList[fontFormat];
                fontObjectArray.forEach((rowIndex, fontArray) => {
                    fontArray.forEach((columnIndex, docsConfig) => {
                        let { isMerged, isMergedMainCell, startY, endY, startX, endX, mergeInfo } = this.getCellIndex(
                            rowIndex,
                            columnIndex,
                            rowHeightAccumulation,
                            columnWidthAccumulation,
                            dataMergeCache
                        );

                        if (isMerged) {
                            return true;
                        }

                        startY = fixLineWidthByScale(startY, scaleY);
                        endY = fixLineWidthByScale(endY, scaleY);
                        startX = fixLineWidthByScale(startX, scaleX);
                        endX = fixLineWidthByScale(endX, scaleX);

                        const cellWidth = endX - startX;
                        const cellHeight = endY - startY;

                        const overflowRectangle = overflowCache.getValue(rowIndex, columnIndex);

                        const { horizontalAlign } = docsConfig;

                        ctx.save();
                        ctx.beginPath();
                        if (overflowRectangle) {
                            const { startColumn, startRow, endColumn, endRow } = overflowRectangle;
                            if (startColumn === endColumn && startColumn === columnIndex) {
                                ctx.rect(startX, startY, cellWidth, cellHeight);
                            } else {
                                if (horizontalAlign === HorizontalAlign.CENTER) {
                                    this._clipRectangle(ctx, startRow, endRow, startColumn, endColumn, scale, rowHeightAccumulation, columnWidthAccumulation);
                                } else if (horizontalAlign === HorizontalAlign.RIGHT) {
                                    // console.log('horizontalAlign === HorizontalAlign.RIGHT', { rowIndex, startColumn, columnIndex, endColumn });
                                    this._clipRectangle(ctx, startRow, rowIndex, startColumn, columnIndex, scale, rowHeightAccumulation, columnWidthAccumulation);
                                } else {
                                    this._clipRectangle(ctx, rowIndex, endRow, columnIndex, endColumn, scale, rowHeightAccumulation, columnWidthAccumulation);
                                }
                            }
                        } else {
                            ctx.rect(startX, startY, cellWidth, cellHeight);
                        }
                        ctx.clip();
                        ctx.translate(startX, startY);
                        this._renderDocuments(ctx, docsConfig, startX, startY, endX, endY, rowIndex, columnIndex);
                        ctx.restore();
                    });
                });
            });
        ctx.restore();
    }

    private _renderDocuments(ctx: CanvasRenderingContext2D, docsConfig: fontCacheItem, startX: number, startY: number, endX: number, endY: number, row: number, column: number) {
        const documents = this.getDocuments();
        const { documentSkeleton, angle, verticalAlign, horizontalAlign, wrapStrategy, content } = docsConfig;
        const cellWidth = endX - startX;
        const cellHeight = endY - startY;

        if (wrapStrategy === WrapStrategy.WRAP && angle === 0) {
            documentSkeleton.updateDocumentDataPageSize(cellWidth);
            documentSkeleton.calculate();
        }

        documentSkeleton.makeDirty(false);

        documents.resize(cellWidth, cellHeight);

        documents.changeSkeleton(documentSkeleton).render(ctx);
    }

    private _clipRectangle(
        ctx: CanvasRenderingContext2D,
        startRow: number,
        endRow: number,
        startColumn: number,
        endColumn: number,
        scale: number,
        rowHeightAccumulation: number[],
        columnWidthAccumulation: number[]
    ) {
        const startY = fixLineWidthByScale(rowHeightAccumulation[startRow - 1] || 0, scale);
        const endY = fixLineWidthByScale(rowHeightAccumulation[endRow], scale);

        const startX = fixLineWidthByScale(columnWidthAccumulation[startColumn - 1] || 0, scale);
        const endX = fixLineWidthByScale(columnWidthAccumulation[endColumn], scale);

        ctx.rect(startX, startY, endX - startX, endY - startY);
    }
}

SpreadsheetExtensionRegistry.add(new Font());

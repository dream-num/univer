import { HorizontalAlign, IColorStyle, IScale, ObjectMatrix, WrapStrategy } from '@univerjs/core';

import { fixLineWidthByScale } from '../../../basics/tools';
import { Documents } from '../..';
import { SpreadsheetExtensionRegistry } from '../../extension';
import { IFontCacheItem } from '../interfaces';
import { SheetComponent } from '../sheet-component';
import { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultFontExtension';
export class Font extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 40;

    changeFontColor: ObjectMatrix<IColorStyle> = new ObjectMatrix();

    getDocuments() {
        const parent = this.parent as SheetComponent;
        return parent?.getDocuments();
    }

    setChangeFontColor(r: number, c: number, color: IColorStyle) {
        this.changeFontColor.setValue(r, c, color);
    }

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { rowColumnSegment, rowHeaderWidth, columnHeaderHeight, stylesCache, dataMergeCache, overflowCache } =
            spreadsheetSkeleton;
        const { font: fontList } = stylesCache;
        if (!spreadsheetSkeleton) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } =
            spreadsheetSkeleton;

        if (
            !rowHeightAccumulation ||
            !columnWidthAccumulation ||
            columnTotalWidth === undefined ||
            rowTotalHeight === undefined
        ) {
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
                        const cellInfo = this.getCellIndex(
                            rowIndex,
                            columnIndex,
                            rowHeightAccumulation,
                            columnWidthAccumulation,
                            dataMergeCache
                        );
                        let { startY, endY, startX, endX } = cellInfo;
                        const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;

                        if (isMerged) {
                            return true;
                        }

                        if (isMergedMainCell) {
                            startY = mergeInfo.startY;
                            endY = mergeInfo.endY;
                            startX = mergeInfo.startX;
                            endX = mergeInfo.endX;
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
                                    this._clipRectangle(
                                        ctx,
                                        startRow,
                                        endRow,
                                        startColumn,
                                        endColumn,
                                        scale,
                                        rowHeightAccumulation,
                                        columnWidthAccumulation
                                    );
                                } else if (horizontalAlign === HorizontalAlign.RIGHT) {
                                    // console.log('horizontalAlign === HorizontalAlign.RIGHT', { rowIndex, startColumn, columnIndex, endColumn });
                                    this._clipRectangle(
                                        ctx,
                                        startRow,
                                        rowIndex,
                                        startColumn,
                                        columnIndex,
                                        scale,
                                        rowHeightAccumulation,
                                        columnWidthAccumulation
                                    );
                                } else {
                                    this._clipRectangle(
                                        ctx,
                                        rowIndex,
                                        endRow,
                                        columnIndex,
                                        endColumn,
                                        scale,
                                        rowHeightAccumulation,
                                        columnWidthAccumulation
                                    );
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

    private _renderDocuments(
        ctx: CanvasRenderingContext2D,
        docsConfig: IFontCacheItem,
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        row: number,
        column: number
    ) {
        const documents = this.getDocuments() as Documents;

        if (documents == null) {
            throw new Error('documents is null');
        }

        const { documentSkeleton, angle, verticalAlign, horizontalAlign, wrapStrategy } = docsConfig;
        const cellWidth = endX - startX;
        const cellHeight = endY - startY;

        if (wrapStrategy === WrapStrategy.WRAP && angle === 0) {
            documentSkeleton.getModel().updateDocumentDataPageSize(cellWidth);
            documentSkeleton.calculate();
        } else {
            documentSkeleton.getModel().updateDocumentDataPageSize(Infinity);
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

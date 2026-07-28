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

import type { IRange, IScale, Worksheet } from '@univerjs/core';
import type { IDefinedNamesService } from '@univerjs/engine-formula';
import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import { deserializeRangeWithSheet } from '@univerjs/engine-formula';
import { SheetExtension } from '@univerjs/engine-render';

const PAGE_BREAK_PREVIEW_BACKGROUND_KEY = 'xlsx-page-break-preview-background';
const PAGE_BREAK_PREVIEW_OVERLAY_KEY = 'xlsx-page-break-preview-overlay';
const PAGE_BREAK_PREVIEW_BACKGROUND_Z_INDEX = 20;
const PAGE_BREAK_PREVIEW_OVERLAY_Z_INDEX = 44;

interface IXlsxWorksheetData {
    _xlsx?: {
        raw?: {
            sheetViews?: string;
        };
    };
}

export function resolvePageBreakPreviewRange(
    worksheet: Worksheet,
    definedNamesService: IDefinedNamesService
): IRange | null {
    const snapshot = worksheet.getSnapshot() as unknown as IXlsxWorksheetData;
    const sheetViews = snapshot._xlsx?.raw?.sheetViews;
    if (!sheetViews || !/\bview\s*=\s*(["'])pageBreakPreview\1/u.test(sheetViews)) {
        return null;
    }

    const definedName = definedNamesService.getValueByName(
        worksheet.getUnitId(),
        '_xlnm.Print_Area',
        worksheet.getSheetId()
    );
    if (!definedName?.formulaOrRefString) {
        return null;
    }

    try {
        const formulaOrRefString = definedName.formulaOrRefString.replace(/^=/u, '');
        const { range } = deserializeRangeWithSheet(formulaOrRefString);
        return {
            startRow: Math.max(0, range.startRow),
            startColumn: Math.max(0, range.startColumn),
            endRow: Math.min(worksheet.getMaxRows() - 1, range.endRow),
            endColumn: Math.min(worksheet.getMaxColumns() - 1, range.endColumn),
        };
    } catch {
        return null;
    }
}

function getPreviewRange(
    spreadsheetSkeleton: SpreadsheetSkeleton,
    definedNamesService: IDefinedNamesService
): IRange | null {
    const worksheet = spreadsheetSkeleton.worksheet;
    return worksheet ? resolvePageBreakPreviewRange(worksheet, definedNamesService) : null;
}

export class PageBreakPreviewBackgroundExtension extends SheetExtension {
    override uKey = PAGE_BREAK_PREVIEW_BACKGROUND_KEY;
    override Z_INDEX = PAGE_BREAK_PREVIEW_BACKGROUND_Z_INDEX;

    constructor(private readonly _definedNamesService: IDefinedNamesService) {
        super();
    }

    override draw(
        ctx: UniverRenderingContext,
        _parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton
    ): void {
        const printRange = getPreviewRange(spreadsheetSkeleton, this._definedNamesService);
        if (!printRange) {
            return;
        }

        const { startRow, startColumn, endRow, endColumn } = spreadsheetSkeleton.rowColumnSegment;
        const visibleStart = spreadsheetSkeleton.getCellWithCoordByIndex(startRow, startColumn, false);
        const visibleEnd = spreadsheetSkeleton.getCellWithCoordByIndex(endRow, endColumn, false);
        const printStart = spreadsheetSkeleton.getCellWithCoordByIndex(
            printRange.startRow,
            printRange.startColumn,
            false
        );
        const printEnd = spreadsheetSkeleton.getCellWithCoordByIndex(
            printRange.endRow,
            printRange.endColumn,
            false
        );
        if (!visibleStart || !visibleEnd || !printStart || !printEnd) {
            return;
        }

        ctx.save();
        ctx.fillStyle = '#a6a6a6';
        ctx.fillRect(
            visibleStart.startX,
            visibleStart.startY,
            visibleEnd.endX - visibleStart.startX,
            visibleEnd.endY - visibleStart.startY
        );
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
            printStart.startX,
            printStart.startY,
            printEnd.endX - printStart.startX,
            printEnd.endY - printStart.startY
        );

        ctx.beginPath();
        for (let column = printRange.startColumn; column <= printRange.endColumn; column++) {
            const cell = spreadsheetSkeleton.getCellWithCoordByIndex(printRange.startRow, column, false);
            if (!cell) continue;
            ctx.moveTo(cell.startX, printStart.startY);
            ctx.lineTo(cell.startX, printEnd.endY);
            if (column === printRange.endColumn) {
                ctx.moveTo(cell.endX, printStart.startY);
                ctx.lineTo(cell.endX, printEnd.endY);
            }
        }
        for (let row = printRange.startRow; row <= printRange.endRow; row++) {
            const cell = spreadsheetSkeleton.getCellWithCoordByIndex(row, printRange.startColumn, false);
            if (!cell) continue;
            ctx.moveTo(printStart.startX, cell.startY);
            ctx.lineTo(printEnd.endX, cell.startY);
            if (row === printRange.endRow) {
                ctx.moveTo(printStart.startX, cell.endY);
                ctx.lineTo(printEnd.endX, cell.endY);
            }
        }
        ctx.setLineWidthByPrecision(1);
        ctx.strokeStyle = '#d9d9d9';
        ctx.stroke();
        ctx.restore();
    }
}

export class PageBreakPreviewOverlayExtension extends SheetExtension {
    override uKey = PAGE_BREAK_PREVIEW_OVERLAY_KEY;
    override Z_INDEX = PAGE_BREAK_PREVIEW_OVERLAY_Z_INDEX;

    constructor(private readonly _definedNamesService: IDefinedNamesService) {
        super();
    }

    override draw(
        ctx: UniverRenderingContext,
        _parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton
    ): void {
        const printRange = getPreviewRange(spreadsheetSkeleton, this._definedNamesService);
        if (!printRange) {
            return;
        }

        const printStart = spreadsheetSkeleton.getCellWithCoordByIndex(
            printRange.startRow,
            printRange.startColumn,
            false
        );
        const printEnd = spreadsheetSkeleton.getCellWithCoordByIndex(
            printRange.endRow,
            printRange.endColumn,
            false
        );
        if (!printStart || !printEnd) {
            return;
        }

        const width = printEnd.endX - printStart.startX;
        const height = printEnd.endY - printStart.startY;
        ctx.save();
        ctx.setLineWidthByPrecision(3);
        ctx.strokeStyle = '#0000ff';
        ctx.strokeRect(printStart.startX, printStart.startY, width, height);
        ctx.fillStyle = '#8c8c8c';
        ctx.font = `${Math.max(24, Math.min(48, height * 0.32))}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Page 1', printStart.startX + width / 2, printStart.startY + height / 2);
        ctx.restore();
    }
}

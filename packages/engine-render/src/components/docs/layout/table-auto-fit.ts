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

import type { ITable } from '@univerjs/core';
import {
    DataStreamTreeNodeType,
    NumberUnitType,
    resolveDocumentParagraphBullet,
    resolveDocumentParagraphStyle,
    TableLayoutType,
    TableSizeType,
} from '@univerjs/core';
import type { ISectionBreakConfig } from '../../../basics/interfaces';
import type { DataStreamTreeNode } from '../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../view-model/document-view-model';
import type { ILayoutContext } from './tools';
import { getDocumentCompatibilityPolicy, isTraditionalDocumentCompatibility } from '../document-compatibility';
import { shaping } from './block/paragraph/shaping';
import { createNullCellPage } from './model/page';
import { clearFontCreateConfigCache, getNumberUnitValue, resolveParagraphCharacterIndents } from './tools';

export function resolveTableAutoFitColumns(
    ctx: ILayoutContext,
    viewModel: DocumentViewModel,
    tableNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    table: ITable,
    availableWidth = Number.POSITIVE_INFINITY
): ITable {
    const snapshot = viewModel.getSnapshot?.();
    if (table.layout === TableLayoutType.FIXED || !snapshot || table.tableColumns.length === 0 ||
        (table.size.type === TableSizeType.SPECIFIED && !table.tableRows.some((row) =>
            row.tableCells.some((cell) => cell.tcWidthType != null)))) {
        return table;
    }
    // shortcut: nested, vertical and merged cells keep their authored grid until their intrinsic measures are available.
    if (table.tableRows.some((row) => row.gridBefore || row.gridAfter || row.tableCells.some((cell) =>
        (cell.columnSpan ?? 1) !== 1 || (cell.rowSpan ?? 1) !== 1 || (cell.textDirection && cell.textDirection !== 'lrTb')))) {
        return table;
    }
    const grid = table.tableColumns.map((column) => column.size.width.v);
    const total = grid.reduce((sum, width) => sum + width, 0);
    if (!Number.isFinite(total) || total <= 0 || grid.some((width) => !Number.isFinite(width) || width <= 0)) {
        return table;
    }
    const minimums = grid.map(() => 0);
    const maximums = grid.map(() => 0);
    const preferred: Array<number | undefined> = grid.map(() => undefined);
    try {
        for (const [rowIndex, row] of table.tableRows.entries()) {
            const rowNode = tableNode.children[rowIndex];
            if (!rowNode || row.tableCells.length !== grid.length) {
                return table;
            }
            for (const [column, cell] of row.tableCells.entries()) {
                const section = rowNode.children[column]?.children[0];
                if (!section || section.children.some((paragraph) => paragraph.nodeType !== DataStreamTreeNodeType.PARAGRAPH || paragraph.children.length > 0)) {
                    return table;
                }
                // Grid widths may be too narrow even for padding; measure the authored insets before that clamp.
                const wide = createNullCellPage(ctx, sectionBreakConfig, {
                    ...table,
                    tableColumns: table.tableColumns.map((source) => ({ ...source, size: { ...source.size, width: { ...source.size.width, v: total } } })),
                }, rowIndex, column);
                const padding = wide.page.marginLeft + wide.page.marginRight;
                for (const paragraphNode of section.children) {
                    const paragraph = viewModel.getParagraph(paragraphNode.endIndex);
                    if (paragraph && resolveDocumentParagraphBullet(snapshot, paragraph)) {
                        return table;
                    }
                    clearFontCreateConfigCache();
                    const pieces = shaping(ctx, paragraphNode.content ?? '', viewModel, paragraphNode, wide.sectionBreakConfig);
                    let paragraphPadding = padding;
                    let firstLineIndent = 0;
                    if (paragraph && isTraditionalDocumentCompatibility(sectionBreakConfig.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy())) {
                        const style = resolveParagraphCharacterIndents(
                            ctx,
                            pieces.flatMap((piece) => piece.glyphs),
                            resolveDocumentParagraphStyle(snapshot.documentStyle, paragraph.paragraphStyle, {
                                styles: snapshot.styles,
                                paragraphStyleId: paragraph.styleId,
                            })
                        );
                        paragraphPadding += getNumberUnitValue(style.indentStart, 0) + getNumberUnitValue(style.indentEnd, 0);
                        const first = getNumberUnitValue(style.indentFirstLine, 0);
                        firstLineIndent = first > 0 ? first : -Math.max(0, getNumberUnitValue(style.hanging, 0));
                    }
                    let maximum = 0;
                    let trailing = 0;
                    for (const [pieceIndex, piece] of pieces.entries()) {
                        let width = 0;
                        let pieceTrailing = 0;
                        for (const glyph of piece.glyphs) {
                            width += glyph.width;
                            if (glyph.raw.trim().length === 0) {
                                pieceTrailing += glyph.width;
                            } else {
                                pieceTrailing = 0;
                            }
                        }
                        minimums[column] = Math.max(minimums[column], width - pieceTrailing + paragraphPadding + (pieceIndex === 0 ? firstLineIndent : 0));
                        maximum += width;
                        trailing = width === pieceTrailing ? trailing + pieceTrailing : pieceTrailing;
                    }
                    maximums[column] = Math.max(maximums[column], maximum - trailing + paragraphPadding + firstLineIndent);
                }
                const width = cell.size?.width;
                let value: number | undefined;
                if (width?.u === NumberUnitType.PERCENT) {
                    value = total * width.v / 100;
                } else if (cell.tcWidthType === 'pct' && width) {
                    value = total * width.v * 15 / 5000;
                } else if ((cell.tcWidthType == null || cell.tcWidthType === 'dxa') && width) {
                    value = width.v;
                }
                if (value != null && Number.isFinite(value) && value > 0) {
                    preferred[column] = Math.max(preferred[column] ?? 0, value);
                }
            }
        }
    } finally {
        clearFontCreateConfigCache();
    }
    const minimum = minimums.map((width) => Math.ceil(width * 15 - 1e-8) / 15);
    const minTotal = minimum.reduce((sum, width) => sum + width, 0);
    const widths = grid.map((_, column) => Math.max(minimum[column], preferred[column] ?? maximums[column]));
    const desired = widths.reduce((sum, width) => sum + width, 0);
    if (desired <= 0) {
        return table;
    }
    // An automatic table's grid is a starting point, not a preferred table width.
    const target = table.size.type === TableSizeType.SPECIFIED
        ? Math.max(total, minTotal)
        : Math.ceil(Math.max(minTotal, Math.min(availableWidth, desired)) * 15 - 1e-8) / 15;
    if (desired > target) {
        const flexible = desired - minTotal;
        for (let column = 0; column < widths.length; column++) {
            widths[column] -= (desired - target) * (widths[column] - minimum[column]) / flexible;
        }
    } else if (desired < target) {
        let weights = widths.map((width, column) => preferred[column] == null ? Math.max(0, maximums[column] - minimum[column]) : 0);
        let weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
        if (weightTotal === 0) {
            weights = widths.map((width, column) => preferred[column] == null ? Math.max(width, 1) : 0);
            weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
        }
        if (weightTotal === 0) {
            weights = widths;
            weightTotal = desired;
        }
        for (let column = 0; column < widths.length; column++) {
            widths[column] += (target - desired) * weights[column] / weightTotal;
        }
    }
    let used = 0;
    const resolved = widths.map((width, column) => {
        const value = column === widths.length - 1 ? target - used : Math.round(width * 15) / 15;
        used += value;
        return value;
    });
    if (resolved.every((width, column) => Math.abs(width - grid[column]) < 0.01)) {
        return table;
    }
    return { ...table, tableColumns: table.tableColumns.map((column, index) => ({
        ...column,
        size: { ...column.size, width: { ...column.size.width, v: resolved[index] } },
    })) };
}

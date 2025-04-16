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

import type {
    DocumentDataModel,
    IBullet,
    IDocumentStyle,
    INumberUnit,
    IObjectPositionH,
    IObjectPositionV,
    IParagraph,
    IParagraphStyle,
    ISectionBreak,
    ITextStyle,
    Nullable,
} from '@univerjs/core';
import type {
    IDocumentSkeletonCached,
    IDocumentSkeletonColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonFontStyle,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonSection,
    ISkeletonResourceReference,
} from '../../../basics/i-document-skeleton-cached';
import type { IDocsConfig, IParagraphConfig, ISectionBreakConfig } from '../../../basics/interfaces';

import type { DataStreamTreeNode } from '../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../view-model/document-view-model';
import type { Hyphen } from './hyphenation/hyphen';
import type { LanguageDetector } from './hyphenation/language-detector';
import {
    AlignTypeH,
    AlignTypeV,
    BooleanNumber,
    ColumnSeparatorType,
    DataStreamTreeTokenType,
    DocumentFlavor,
    GridType,
    HorizontalAlign,
    mergeWith,
    NAMED_STYLE_MAP,
    NumberUnitType,
    ObjectMatrix,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PageOrientType,
    SectionType,
    SpacingRule,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { DEFAULT_DOCUMENT_FONTSIZE } from '../../../basics/const';
import { GlyphType } from '../../../basics/i-document-skeleton-cached';
import { getFontStyleString, isFunction, ptToPixel } from '../../../basics/tools';
import { updateInlineDrawingPosition } from './block/paragraph/layout-ruler';
import { getCustomDecorationStyle } from './style/custom-decoration';
import { getCustomRangeStyle } from './style/custom-range';

export function getLastPage(pages: IDocumentSkeletonPage[]) {
    return pages[pages.length - 1];
}

export function getLastSection(page: IDocumentSkeletonPage) {
    return page.sections?.[page.sections.length - 1];
}

export function getLastColumn(page: IDocumentSkeletonPage) {
    const columns = getLastSection(page).columns;
    return columns?.[columns.length - 1];
}

export function getLastLine(page: IDocumentSkeletonPage) {
    const lines = getLastNotFullColumnInfo(page)?.column.lines;
    return lines?.[lines.length - 1];
}

export function getLastLineByColumn(column: IDocumentSkeletonColumn) {
    return column.lines[column.lines.length - 1];
}

export function getPageContentWidth(page: IDocumentSkeletonPage) {
    const { pageWidth, marginLeft: pageMarginLeft, marginRight: pageMarginRight } = page;

    return pageWidth - pageMarginLeft - pageMarginRight;
}

export function getPreLine(line: IDocumentSkeletonLine) {
    const column = line.parent;
    const index = column?.lines.indexOf(line);
    if (!index || index === -1 || index - 1 < 0) {
        return;
    }

    return column?.lines[index - 1];
}

export function getColumnByDivide(divide: IDocumentSkeletonDivide) {
    const column = divide.parent?.parent;
    if (column) {
        return column;
    }
}

export function getLastNotFullColumnInfo(page: IDocumentSkeletonPage) {
    const section = getLastSection(page);
    for (let i = 0; i < section.columns.length; i++) {
        const column = section.columns[i];
        if (!column.isFull) {
            return {
                column,
                isLast: i === section.columns.length - 1,
                index: i,
            };
        }
    }
}

export function getLastNotFullDivideInfo(page: IDocumentSkeletonPage) {
    const line = getLastLine(page);
    if (!line) {
        return;
    }
    for (let i = 0; i < line.divides.length; i++) {
        const divide = line.divides[i];
        if (!divide.isFull) {
            return {
                divide,
                isLast: i === line.divides.length - 1,
                index: i,
            };
        }
    }
}

export function getNextDivide(curLine: IDocumentSkeletonLine, curDivide: IDocumentSkeletonDivide) {
    const index = curLine.divides.indexOf(curDivide);
    if (index === -1) {
        return;
    }
    return curLine.divides[index + 1];
}

export function getLastRemainingDivide(curLine: IDocumentSkeletonLine) {
    // Except for divide, the other elements will not be created in advance.
    if (!curLine) {
        return;
    }
    for (let i = 0; i < curLine.divides.length; i++) {
        const curDivide = curLine.divides[i];
        const nextDivide = curLine.divides[i + 1];
        if (curDivide.glyphGroup.length === 0) {
            return curDivide;
        }
        if (!nextDivide || nextDivide.glyphGroup.length === 0) {
            return curDivide;
        }
    }
}

export function getLastSpan(page: IDocumentSkeletonPage) {
    const glyphGroup = getLastNotFullDivideInfo(page)?.divide.glyphGroup;
    return glyphGroup?.[glyphGroup.length - 1];
}

export function isColumnFull(page: IDocumentSkeletonPage) {
    const section = getLastSection(page);
    const columnsLen = section.columns.length;
    for (let i = 0; i < columnsLen; i++) {
        const column = section.columns[i];
        if (!column.isFull) {
            return false;
        }
    }
    return true;
}

export function isBlankPage(page: IDocumentSkeletonPage) {
    if (page.sections.length > 1) {
        return false;
    }

    const section = getLastSection(page);
    const columnsLen = section.columns.length;

    for (let i = 0; i < columnsLen; i++) {
        const column = section.columns[i];
        const state = isBlankColumn(column);

        if (!state) {
            return false;
        }
    }

    return true;
}

export function isBlankColumn(column: IDocumentSkeletonColumn) {
    const lines = column.lines;
    if (lines.length > 1) {
        return false;
    }

    const line = lines[lines.length - 1];

    return isLineBlank(line);
}

function isLineBlank(line?: IDocumentSkeletonLine) {
    if (!line) {
        return true;
    }

    for (let i = 0; i < line.divides.length; i++) {
        const spanCount = line.divides[i].glyphGroup.length;
        if (spanCount > 1) {
            return false;
        }
        if (spanCount === 1) {
            const lastSpan = line.divides[i].glyphGroup[0];
            const { glyphType } = lastSpan;
            if (glyphType !== GlyphType.TAB && glyphType !== GlyphType.LIST) {
                return false;
            }
        }
    }

    return true;
}

export function getNumberUnitValue(unitValue: Nullable<INumberUnit>, benchMark: number) {
    if (!unitValue) {
        return 0;
    }

    const { v: value, u: unit } = unitValue;

    if (!unit) {
        return value;
    }

    if (unit === NumberUnitType.PIXEL) {
        return value;
    }

    return value * benchMark;
}

// Return charSpaceApply, choose between grid or font to calculate the length of a tab, where one tab represents a length of 1 character.
export function getCharSpaceApply(
    charSpace: number = 0,
    defaultTabStop: number,
    gridType = GridType.LINES,
    snapToGrid = BooleanNumber.TRUE
) {
    let charSpaceApply = 1;

    if (validationGrid(gridType, snapToGrid)) {
        // When the character grid is enabled, the reference for defaultTabStop is charSpace.
        charSpaceApply = charSpace;
    }
    charSpaceApply *= defaultTabStop; // Multiply it by the value set for defaultTabStop.

    return charSpaceApply;
}

export function validationGrid(gridType = GridType.LINES, snapToGrid = BooleanNumber.FALSE) {
    return (
        snapToGrid === BooleanNumber.TRUE &&
        (gridType === GridType.LINES_AND_CHARS || gridType === GridType.SNAP_TO_CHARS)
    );
}

export function getLineHeightConfig(sectionBreakConfig: ISectionBreakConfig, paragraphConfig: IParagraphConfig) {
    const { paragraphStyle = {} } = paragraphConfig;
    const { linePitch = 15.6, gridType = GridType.LINES, paragraphLineGapDefault = 0 } = sectionBreakConfig;
    const { lineSpacing = 0, spacingRule = SpacingRule.AUTO, snapToGrid = BooleanNumber.TRUE } = paragraphStyle;

    // The default line spacing in Word is 1. Here, if the lines layout is used, the default line spacing is set to 1.
    let lineSpacingApply = lineSpacing;
    if ((gridType === GridType.LINES || gridType === GridType.LINES_AND_CHARS) && lineSpacing === 0 && spacingRule === SpacingRule.AUTO) {
        lineSpacingApply = 1;
    }

    return { paragraphLineGapDefault, linePitch, gridType, lineSpacing: lineSpacingApply, spacingRule, snapToGrid };
}

export function getCharSpaceConfig(sectionBreakConfig: ISectionBreakConfig, paragraphConfig: IParagraphConfig) {
    const { paragraphStyle = {} } = paragraphConfig;

    const {
        charSpace = 0,
        gridType = GridType.LINES,
        defaultTabStop = 36,
        documentTextStyle = {},
    } = sectionBreakConfig;

    const { fs: documentFontSize = DEFAULT_DOCUMENT_FONTSIZE } = documentTextStyle;

    const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;

    return {
        charSpace,
        documentFontSize,
        defaultTabStop,
        gridType,
        snapToGrid,
    };
}

export function updateBlockIndex(pages: IDocumentSkeletonPage[], start: number = -1) {
    let prePageStartIndex = start;

    for (const page of pages) {
        const { sections, skeTables } = page;
        const pageStartIndex = prePageStartIndex;
        const pageEndIndex = pageStartIndex;
        let preSectionStartIndex = pageStartIndex;
        let maxContentWidth = Number.NEGATIVE_INFINITY;
        let contentHeight = 0;

        for (const section of sections) {
            const { columns } = section;
            const sectionStartIndex = preSectionStartIndex;
            const sectionEndIndex = pageStartIndex;
            let preColumnStartIndex = sectionStartIndex;
            let maxSectionHeight = Number.NEGATIVE_INFINITY;
            let sectionWidth = 0;

            for (const column of columns) {
                const { lines } = column;
                const columStartIndex = preColumnStartIndex;
                const columnEndIndex = columStartIndex;
                let preLineStartIndex = columStartIndex;
                let columnHeight = 0;
                let maxColumnWidth = Number.NEGATIVE_INFINITY;
                // const preLine: Nullable<IDocumentSkeletonLine> = null;

                for (const line of lines) {
                    const { divides, lineHeight, top, isBehindTable, tableId } = line;
                    let lineStartIndex = preLineStartIndex;
                    if (isBehindTable && tableId) {
                        const table = skeTables.get(tableId);
                        if (table) {
                            lineStartIndex = table.ed;
                        }
                    }
                    const lineEndIndex = lineStartIndex;
                    let preDivideStartIndex = lineStartIndex;
                    let actualWidth = 0;
                    let maxLineAsc = 0;
                    let macLineDsc = 0;
                    columnHeight = top + lineHeight;
                    const divideLength = divides.length;
                    let lineHasGlyph = false;

                    for (let i = 0; i < divideLength; i++) {
                        const divide = divides[i];
                        const { glyphGroup } = divide;

                        const divStartIndex = preDivideStartIndex;
                        let divEndIndex = divStartIndex;

                        for (const glyph of glyphGroup) {
                            const increaseValue = glyph.glyphType === GlyphType.LIST ? 0 : glyph.count;

                            divEndIndex += increaseValue;

                            const bBox = glyph.bBox;
                            const { ba, bd } = bBox;

                            maxLineAsc = Math.max(maxLineAsc, ba);
                            macLineDsc = Math.max(macLineDsc, bd);

                            if (i === divideLength - 1) {
                                actualWidth += glyph.width;
                            }
                        }

                        // When the width is set to Infinity, the last divide should also be Infinity, and an actual width needs to be calculated.
                        // Use to fix issue: https://github.com/dream-num/univer/issues/2002
                        // Because the Chinese punctuation marks at the beginning and end of the line are squeezed and narrowed,
                        // the extruded width needs to be added when calculating the overall width.
                        if (glyphGroup.length === 0) {
                            continue;
                        }

                        lineHasGlyph = true;

                        if (glyphGroup[0].xOffset !== 0 && i === divideLength - 1) {
                            actualWidth -= glyphGroup[0].xOffset;
                        }

                        if (i === divideLength - 1) {
                            // if (divide.width === Infinity) {
                            //     divide.width = actualWidth;
                            // } else {
                            //     actualWidth += divide.width;
                            // }
                            actualWidth += divide.left;
                        }

                        divide.st = divStartIndex + 1;
                        divide.ed = divEndIndex >= divide.st ? divEndIndex : divide.st;

                        preDivideStartIndex = divide.ed;
                    }

                    line.st = lineHasGlyph ? lineStartIndex + 1 : lineStartIndex;
                    line.ed = preDivideStartIndex >= line.st ? preDivideStartIndex : line.st;
                    line.width = actualWidth;
                    line.asc = maxLineAsc;
                    line.dsc = macLineDsc;
                    maxColumnWidth = Math.max(maxColumnWidth, actualWidth);
                    // Please do not use pre line's top and height to calculate the current's top,
                    // because of float objects will between lines.
                    preLineStartIndex = line.ed;
                }
                column.st = columStartIndex + 1;
                column.ed = preLineStartIndex >= column.st ? preLineStartIndex : column.st;
                column.height = columnHeight;

                column.width = maxColumnWidth;
                sectionWidth += maxColumnWidth;

                maxSectionHeight = Math.max(maxSectionHeight, column.height);

                preColumnStartIndex = column.ed;
            }

            section.st = sectionStartIndex + 1;
            section.ed = preColumnStartIndex >= section.st ? preColumnStartIndex : section.st;
            section.height = maxSectionHeight;
            contentHeight += maxSectionHeight;

            maxContentWidth = Math.max(maxContentWidth, sectionWidth);

            preSectionStartIndex = section.ed;
        }

        // Some tables may across pages, so we need to calculate the page's end index by the tables.
        for (const table of skeTables.values()) {
            const { ed } = table;

            preSectionStartIndex = Math.max(preSectionStartIndex, ed);
        }

        page.st = pageStartIndex + 1;
        page.ed = preSectionStartIndex >= page.st ? preSectionStartIndex : page.st;
        page.height = contentHeight;
        page.width = maxContentWidth;

        prePageStartIndex = page.ed;
    }
}

export function updateInlineDrawingCoordsAndBorder(ctx: ILayoutContext, pages: IDocumentSkeletonPage[]) {
    lineIterator(pages, (line, _, __, page) => {
        const { segmentId } = page;
        const paragraphConfig = ctx.paragraphConfigCache.get(segmentId)?.get(line.paragraphIndex);

        const affectInlineDrawings = paragraphConfig?.paragraphInlineSkeDrawings;
        const drawingAnchor = ctx.skeletonResourceReference?.drawingAnchor?.get(segmentId)?.get(line.paragraphIndex);
        // Update inline drawings after the line is layout.
        if (affectInlineDrawings && affectInlineDrawings.size > 0) {
            updateInlineDrawingPosition(line, affectInlineDrawings, drawingAnchor?.top);
        }

        const paragraphStyle = paragraphConfig?.paragraphStyle;
        const lastDivide = line.divides[line.divides.length - 1];
        const lastGlyph = lastDivide.glyphGroup[lastDivide.glyphGroup.length - 1];

        if (lastGlyph.streamType === DataStreamTreeTokenType.PARAGRAPH && paragraphStyle?.borderBottom) {
            line.borderBottom = paragraphStyle.borderBottom;
        }
    });
}

export function glyphIterator(
    pages: IDocumentSkeletonPage[],
    cb: (
        glyph: IDocumentSkeletonGlyph,
        divide: IDocumentSkeletonDivide,
        line: IDocumentSkeletonLine,
        column: IDocumentSkeletonColumn,
        section: IDocumentSkeletonSection,
        page: IDocumentSkeletonPage
    ) => void
) {
    for (const page of pages) {
        const { sections } = page;

        for (const section of sections) {
            const { columns } = section;

            for (const column of columns) {
                const { lines } = column;

                for (const line of lines) {
                    const { divides } = line;
                    const divideLength = divides.length;
                    for (let i = 0; i < divideLength; i++) {
                        const divide = divides[i];
                        const { glyphGroup } = divide;

                        for (const glyph of glyphGroup) {
                            if (cb && isFunction(cb)) {
                                cb(glyph, divide, line, column, section, page);
                            }
                        }
                    }
                }
            }
        }
    }
}

export function lineIterator(
    pagesOrCells: (IDocumentSkeletonPage)[],
    cb: (
        line: IDocumentSkeletonLine,
        column: IDocumentSkeletonColumn,
        section: IDocumentSkeletonSection,
        page: IDocumentSkeletonPage
    ) => void
) {
    for (const pageOrCell of pagesOrCells) {
        const { sections } = pageOrCell;

        for (const section of sections) {
            const { columns } = section;

            for (const column of columns) {
                const { lines } = column;

                for (const line of lines) {
                    if (cb && isFunction(cb)) {
                        cb(line, column, section, pageOrCell);
                    }
                }
            }
        }
    }
}

export function columnIterator(
    pages: IDocumentSkeletonPage[],
    iteratorFunction: (column: IDocumentSkeletonColumn) => void
) {
    for (const page of pages) {
        const { sections } = page;

        for (const section of sections) {
            const { columns } = section;

            for (const column of columns) {
                if (iteratorFunction && isFunction(iteratorFunction)) {
                    iteratorFunction(column);
                }
            }
        }
    }
}

export function getPositionHorizon(
    positionH: IObjectPositionH,
    column: IDocumentSkeletonColumn,
    page: IDocumentSkeletonPage,
    objectWidth: number,
    isPageBreak: boolean = false
) {
    const { relativeFrom, align, posOffset, percent } = positionH;

    if (align != null) {
        if (align === AlignTypeH.INSIDE || align === AlignTypeH.OUTSIDE) {
            if (relativeFrom === ObjectRelativeFromH.MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.PAGE) {
                // TODO
            }
        } else {
            if (relativeFrom === ObjectRelativeFromH.COLUMN) {
                const { width, left } = column;
                let absoluteLeft = 0;
                if (align === AlignTypeH.LEFT) {
                    absoluteLeft = left;
                } else if (align === AlignTypeH.RIGHT) {
                    absoluteLeft = left + width - objectWidth;
                } else if (align === AlignTypeH.CENTER) {
                    absoluteLeft = left + width / 2 - objectWidth / 2;
                }
                return absoluteLeft;
            }
            if (relativeFrom === ObjectRelativeFromH.LEFT_MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.RIGHT_MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.INSIDE_MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.OUTSIDE_MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.PAGE) {
                const { pageWidth } = page;
                let absoluteLeft = 0;
                if (align === AlignTypeH.RIGHT) {
                    absoluteLeft = pageWidth - objectWidth;
                } else if (align === AlignTypeH.CENTER) {
                    absoluteLeft = pageWidth / 2 - objectWidth / 2;
                }
                return absoluteLeft;
            }
        }
    } else if (posOffset) {
        const { pageWidth, marginLeft, marginRight } = page;
        const boundaryLeft = marginLeft;
        const boundaryRight = pageWidth - marginRight;

        let absoluteLeft = 0;
        if (relativeFrom === ObjectRelativeFromH.COLUMN) {
            absoluteLeft = (isPageBreak ? 0 : column?.left || 0) + posOffset;
        } else if (relativeFrom === ObjectRelativeFromH.LEFT_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.MARGIN) {
            absoluteLeft = posOffset + marginLeft;
        } else if (relativeFrom === ObjectRelativeFromH.RIGHT_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.PAGE) {
            absoluteLeft = posOffset;
        }

        if (absoluteLeft + objectWidth > boundaryRight) {
            absoluteLeft = boundaryRight - objectWidth;
        }
        return absoluteLeft;
    } else if (percent) {
        const { pageWidth, marginLeft, marginRight } = page;
        if (relativeFrom === ObjectRelativeFromH.LEFT_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.RIGHT_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.PAGE) {
            return percent * pageWidth;
        }
    }
}

export function getPositionVertical(
    positionV: IObjectPositionV,
    page: IDocumentSkeletonPage,
    lineTop: number,
    lineHeight: number,
    objectHeight: number,
    blockAnchorTop?: number,
    isPageBreak: boolean = false
) {
    const { relativeFrom, align, posOffset, percent } = positionV;

    if (align != null) {
        if (relativeFrom === ObjectRelativeFromV.LINE) {
            let absoluteTop = 0;
            if (align === AlignTypeV.BOTTOM) {
                absoluteTop = lineTop + lineHeight - objectHeight;
            } else if (align === AlignTypeV.TOP) {
                absoluteTop = lineTop;
            } else if (align === AlignTypeV.CENTER) {
                absoluteTop = lineTop + lineHeight / 2 - objectHeight / 2;
            }
            return absoluteTop;
        } else if (relativeFrom === ObjectRelativeFromV.TOP_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.BOTTOM_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.PAGE) {
            const { pageHeight } = page;
            let absoluteTop = 0;
            if (align === AlignTypeV.BOTTOM) {
                absoluteTop = pageHeight - objectHeight;
            } else if (align === AlignTypeV.CENTER) {
                absoluteTop = pageHeight / 2 - objectHeight / 2;
            }
            return absoluteTop;
        }
    } else if (posOffset != null) {
        let absoluteTop = 0;
        const { marginTop } = page;

        if (relativeFrom === ObjectRelativeFromV.LINE) {
            absoluteTop = (lineTop || 0) + posOffset;
        } else if (relativeFrom === ObjectRelativeFromV.TOP_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.MARGIN) {
            absoluteTop = posOffset;
        } else if (relativeFrom === ObjectRelativeFromV.BOTTOM_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.PAGE) {
            absoluteTop = posOffset - marginTop;
        } else if (relativeFrom === ObjectRelativeFromV.PARAGRAPH) {
            absoluteTop = (isPageBreak ? 0 : blockAnchorTop == null ? lineTop : blockAnchorTop) + posOffset;
        }
        return absoluteTop;
    } else if (percent != null) {
        const { pageHeight, marginBottom, marginTop } = page;
        if (relativeFrom === ObjectRelativeFromV.TOP_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.BOTTOM_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.PAGE) {
            return percent * pageHeight;
        }
    }
}

export function getGlyphGroupWidth(divide: IDocumentSkeletonDivide) {
    let width = 0;

    for (const glyph of divide.glyphGroup) {
        width += glyph.width;
    }

    return width;
}

interface IFontCreateConfig {
    fontStyle: IDocumentSkeletonFontStyle;
    textStyle: ITextStyle;
    charSpace: number;
    gridType: GridType;
    snapToGrid: BooleanNumber;
    pageWidth: number;
}

const fontCreateConfigCache = new ObjectMatrix<IFontCreateConfig>();

export function clearFontCreateConfigCache() {
    fontCreateConfigCache.reset();
}

export function getFontConfigFromLastGlyph(
    glyph: IDocumentSkeletonGlyph,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    const { ts, fontStyle } = glyph;
    const {
        gridType = GridType.LINES,
        charSpace = 0,
        pageSize = {
            width: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
        },
        marginRight = 0,
        marginLeft = 0,
    } = sectionBreakConfig;
    const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;
    const pageWidth = pageSize.width || Number.POSITIVE_INFINITY - marginLeft - marginRight;

    const result = {
        fontStyle: fontStyle!,
        textStyle: ts!,
        charSpace,
        gridType,
        snapToGrid,
        pageWidth,
    };

    return result;
}

function getBulletParagraphTextStyle(bullet: IBullet, viewModel: DocumentViewModel) {
    const { listType } = bullet;
    const lists = viewModel.getDataModel().getBulletPresetList();

    return lists[listType].nestingLevel[0].paragraphProperties?.textStyle;
}

const DEFAULT_TEXT_RUN = { ts: {}, st: 0, ed: 0 };

export function getFontCreateConfig(
    index: number,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraph: IParagraph
) {
    const {
        gridType = GridType.LINES,
        charSpace = 0,
        documentTextStyle = {},
        pageSize = {
            width: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
        },
        marginRight = 0,
        marginLeft = 0,
        // localeService,
        renderConfig = {},
    } = sectionBreakConfig;
    const { paragraphStyle = {}, bullet } = paragraph;
    const { isRenderStyle } = renderConfig;
    const { startIndex } = paragraphNode;
    const originTextRun = viewModel.getTextRun(index + startIndex);

    const textRun = isRenderStyle === BooleanNumber.FALSE
        ? DEFAULT_TEXT_RUN
        : originTextRun ?? DEFAULT_TEXT_RUN;
    const customDecoration = viewModel.getCustomDecoration(index + startIndex);
    const showCustomDecoration = customDecoration && (customDecoration.show !== false);
    const customDecorationStyle = showCustomDecoration ? getCustomDecorationStyle(customDecoration) : null;
    const customRange = viewModel.getCustomRange(index + startIndex);
    const showCustomRange = customRange && (customRange.show !== false);
    const customRangeStyle = showCustomRange ? getCustomRangeStyle(customRange) : null;
    const hasAddonStyle = showCustomRange || showCustomDecoration || !!bullet || paragraphStyle?.namedStyleType;
    const { st, ed } = textRun;
    let { ts: textStyle = {} } = textRun;
    const cache = fontCreateConfigCache.getValue(st, ed);
    if (cache && !hasAddonStyle && originTextRun) {
        return cache;
    }

    const { snapToGrid = BooleanNumber.TRUE, namedStyleType } = paragraphStyle;
    const bulletTextStyle = bullet ? getBulletParagraphTextStyle(bullet, viewModel) : null;
    // Apply named style if it exists
    const namedStyle = namedStyleType ? NAMED_STYLE_MAP[namedStyleType] : null;

    textStyle = {
        ...documentTextStyle,
        ...namedStyle,
        ...textStyle,
        ...customDecorationStyle,
        ...customRangeStyle,
        ...bulletTextStyle,
    };

    const fontStyle = getFontStyleString(textStyle);

    const mixTextStyle: ITextStyle = {
        ...documentTextStyle,
        ...textStyle,
    };

    const pageWidth = pageSize.width || Number.POSITIVE_INFINITY - marginLeft - marginRight;

    const result = {
        fontStyle,
        textStyle: mixTextStyle,
        charSpace,
        gridType,
        snapToGrid,
        pageWidth,
    };

    if (!hasAddonStyle && originTextRun) {
        // TODO: cache should more precisely, take custom-range, custom-decoration, paragraphStyle into considering.
        fontCreateConfigCache.setValue(st, ed, result);
    }

    return result;
}

// Generate an empty doc skeleton with the initial states.
export function getNullSkeleton(): IDocumentSkeletonCached {
    return {
        pages: [],
        left: 0,
        top: 0,
        st: 0,
        skeHeaders: new Map(),
        skeFooters: new Map(),
        skeListLevel: new Map(), // TODO: 移到 context 中管理？
        drawingAnchor: new Map(), // TODO: 移到 context 中管理
    };
}

export function setPageParent(pages: IDocumentSkeletonPage[], parent: IDocumentSkeletonCached) {
    for (const page of pages) {
        page.parent = parent;
    }
}

export enum FloatObjectType {
    IMAGE = 'IMAGE',
    TABLE = 'TABLE',
}

export interface IFloatObject {
    id: string;
    top: number;
    left: number;
    width: number;
    height: number;
    angle: number;
    type: FloatObjectType;
    positionV: IObjectPositionV;
}

// The context state of the layout process, which is used to store some cache and intermediate states in the typesetting process,
// as well as identifying information such as the pointer of the layout.
export interface ILayoutContext {
    // The view model of current layout document.
    viewModel: DocumentViewModel;
    // The data model of current layout document.
    dataModel: DocumentDataModel;
    // The document style: pageSize, renderConfig, etc.
    // documentStyle: IDocumentStyle;
    // Configuration for document layout.
    docsConfig: IDocsConfig;
    // The initial layout skeleton, it will be the empty skeleton if it's the first layout.
    skeleton: IDocumentSkeletonCached;
    // The position coordinates of the layout,
    // which are used to indicate which section and paragraph are currently layout,
    // and used to support the starting point of the reflow when re-layout.
    // Layout from the beginning if the paragraphIndex is null.
    layoutStartPointer: Record<string, Nullable<number>>;
    // It is used to identify whether it is a re-layout,
    // and if it is a re-layout, the skeleton needs to be backtracked to the layoutStartPointer states.
    isDirty: boolean;
    // Used to store the resource of document and resource cache.
    skeletonResourceReference: ISkeletonResourceReference;
    // Positioned float objects cache.
    floatObjectsCache: Map<string, {
        count: number;
        page: IDocumentSkeletonPage;
        floatObject: IFloatObject;
    }>;
    paragraphConfigCache: Map<string, Map<number, IParagraphConfig>>;
    sectionBreakConfigCache: Map<number, ISectionBreakConfig>;
    paragraphsOpenNewPage: Set<number>;
    // Use for hyphenation.
    hyphen: Hyphen;
    // Use for detect language for paragraph content.
    languageDetector: LanguageDetector;
}

const DEFAULT_SECTION_BREAK: ISectionBreak = {
    columnProperties: [],
    columnSeparatorType: ColumnSeparatorType.NONE,
    sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
    startIndex: 0,
};

export const DEFAULT_PAGE_SIZE = { width: Number.POSITIVE_INFINITY, height: Number.POSITIVE_INFINITY };

const DEFAULT_MODERN_DOCUMENT_STYLE: IDocumentStyle = {
    pageNumberStart: 1,
    pageSize: {
        width: ptToPixel(595),
        height: Number.POSITIVE_INFINITY,
    },
    marginTop: ptToPixel(50),
    marginBottom: ptToPixel(50),
    marginRight: ptToPixel(50),
    marginLeft: ptToPixel(50),
    renderConfig: {
        vertexAngle: 0,
        centerAngle: 0,
        background: {
            rgb: '#FFFFFF',
        },
    },
    defaultHeaderId: '',
    defaultFooterId: '',
    evenPageHeaderId: '',
    evenPageFooterId: '',
    firstPageHeaderId: '',
    firstPageFooterId: '',
    evenAndOddHeaders: BooleanNumber.FALSE,
    useFirstPageHeaderFooter: BooleanNumber.FALSE,
    marginHeader: 0,
    marginFooter: 0,
};

const DEFAULT_MODERN_SECTION_BREAK: Partial<ISectionBreak> = {
    columnProperties: [],
    columnSeparatorType: ColumnSeparatorType.NONE,
    sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
};

export function prepareSectionBreakConfig(ctx: ILayoutContext, nodeIndex: number) {
    const { viewModel, dataModel, docsConfig } = ctx;
    const sectionNode = viewModel.getChildren()[nodeIndex];
    let { documentStyle } = dataModel;
    const { documentFlavor } = documentStyle;
    let sectionBreak = viewModel.getSectionBreak(sectionNode.endIndex) || DEFAULT_SECTION_BREAK;

    // If the configuration is in modern mode, use the style configuration of modern mode to overwrite the original configuration.
    // In modern mode, there are no pages, no sections, no columns. There are no headers and footers, and margins are all defaults.
    if (documentFlavor === DocumentFlavor.MODERN) {
        sectionBreak = Object.assign({}, sectionBreak, DEFAULT_MODERN_SECTION_BREAK);
        documentStyle = Object.assign({}, documentStyle, DEFAULT_MODERN_DOCUMENT_STYLE);
    }

    const {
        pageNumberStart: global_pageNumberStart = 1, // pageNumberStart
        pageSize: global_pageSize = DEFAULT_PAGE_SIZE,
        pageOrient: global_pageOrient = PageOrientType.PORTRAIT,
        defaultHeaderId: global_defaultHeaderId,
        defaultFooterId: global_defaultFooterId,
        evenPageHeaderId: global_evenPageHeaderId,
        evenPageFooterId: global_evenPageFooterId,
        firstPageHeaderId: global_firstPageHeaderId,
        firstPageFooterId: global_firstPageFooterId,
        useFirstPageHeaderFooter: global_useFirstPageHeaderFooter,
        evenAndOddHeaders: global_evenAndOddHeaders,

        marginTop: global_marginTop = 0,
        marginBottom: global_marginBottom = 0,
        marginRight: global_marginRight = 0,
        marginLeft: global_marginLeft = 0,
        marginHeader: global_marginHeader = 0,
        marginFooter: global_marginFooter = 0,

        autoHyphenation = BooleanNumber.FALSE,
        doNotHyphenateCaps = BooleanNumber.FALSE,
        consecutiveHyphenLimit = Number.POSITIVE_INFINITY,
        hyphenationZone,

        renderConfig: global_renderConfig = {
            horizontalAlign: HorizontalAlign.LEFT,
            verticalAlign: VerticalAlign.TOP,
            centerAngle: 0,
            vertexAngle: 0,
            wrapStrategy: WrapStrategy.UNSPECIFIED,
        },
    } = documentStyle;
    const {
        charSpace = 0, // charSpace
        linePitch = 15.6, // linePitch pt
        gridType = GridType.LINES, // gridType

        pageNumberStart = global_pageNumberStart,
        pageSize = global_pageSize,
        pageOrient = global_pageOrient,
        marginTop = global_marginTop,
        marginBottom = global_marginBottom,
        marginRight = global_marginRight,
        marginLeft = global_marginLeft,
        marginHeader = global_marginHeader,
        marginFooter = global_marginFooter,

        defaultHeaderId = global_defaultHeaderId,
        defaultFooterId = global_defaultFooterId,
        evenPageHeaderId = global_evenPageHeaderId,
        evenPageFooterId = global_evenPageFooterId,
        firstPageHeaderId = global_firstPageHeaderId,
        firstPageFooterId = global_firstPageFooterId,
        useFirstPageHeaderFooter = global_useFirstPageHeaderFooter,
        evenAndOddHeaders = global_evenAndOddHeaders,

        columnProperties = [],
        columnSeparatorType = ColumnSeparatorType.NONE,
        contentDirection,
        sectionType,
        textDirection,
        renderConfig = global_renderConfig,
    } = sectionBreak;

    const sectionNodeNext = viewModel.getChildren()[nodeIndex + 1];
    const sectionTypeNext = viewModel.getSectionBreak(sectionNodeNext?.endIndex)?.sectionType;

    const headerIds = { defaultHeaderId, evenPageHeaderId, firstPageHeaderId };
    const footerIds = { defaultFooterId, evenPageFooterId, firstPageFooterId };

    if (pageSize.width === null) {
        pageSize.width = Number.POSITIVE_INFINITY;
    }

    if (pageSize.height === null) {
        pageSize.height = Number.POSITIVE_INFINITY;
    }

    const sectionBreakConfig: ISectionBreakConfig = {
        charSpace,
        linePitch,
        gridType,

        pageNumberStart,
        pageSize,
        pageOrient,
        marginTop,
        marginBottom,
        marginRight,
        marginLeft,
        marginHeader,
        marginFooter,

        headerIds,
        footerIds,

        useFirstPageHeaderFooter,
        evenAndOddHeaders,

        columnProperties,
        columnSeparatorType,
        contentDirection,
        sectionType,
        sectionTypeNext,
        textDirection,
        renderConfig,

        autoHyphenation,
        doNotHyphenateCaps,
        consecutiveHyphenLimit,
        hyphenationZone,

        ...docsConfig,
    };

    return sectionBreakConfig;
}

export function resetContext(ctx: ILayoutContext) {
    ctx.isDirty = false;
    ctx.skeleton.drawingAnchor?.clear();
}

export function mergeByV<T = unknown>(object: unknown, originObject: unknown, type: 'max' | 'min') {
    const mergeIterator = (obj: unknown, originObj: unknown, key: string) => {
        if (key !== 'v') {
            if (typeof originObj === 'object') {
                return mergeWith(obj, originObj, mergeIterator);
            } else {
                return originObj ?? obj;
            }
        }
        if (typeof originObj === 'number') {
            if (typeof obj === 'number') {
                return type === 'max' ? Math.max(originObj, obj) : Math.min(originObj, obj);
            }
        }
        return originObj ?? obj;
    };
    return mergeWith(object, originObject, mergeIterator) as T;
}

export function getPageFromPath(skeletonData: IDocumentSkeletonCached, path: (string | number)[]): Nullable<IDocumentSkeletonPage> {
    const pathCopy = [...path];
    let page: Nullable<IDocumentSkeletonPage> = null;

    while (pathCopy.length > 0) {
        const field = pathCopy.shift();

        if (field === 'pages') {
            const pageIndex = pathCopy.shift() as number;
            page = skeletonData.pages[pageIndex];
        } else if (field === 'skeTables') {
            const tableId = pathCopy.shift() as string;
            pathCopy.shift(); // rows
            const rowIndex = pathCopy.shift() as number;
            pathCopy.shift(); // cells
            const cellIndex = pathCopy.shift() as number;

            page = page!.skeTables?.get(tableId)?.rows[rowIndex]?.cells[cellIndex];
        }
    }

    return page;
}

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

import type { ICellWithCoord, ICustomRange, Injector, IParagraph, ITextRangeParam, Workbook } from '@univerjs/core';
import type { DocumentSkeleton, IBoundRectNoAngle, IDocumentSkeletonGlyph, IFontCacheItem } from '@univerjs/engine-render';
import { CustomRangeType, HorizontalAlign, IUniverInstanceService, PresetListType, UniverInstanceType, VerticalAlign } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { DOC_VERTICAL_PADDING, getLineBounding, NodePositionConvertToCursor } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IEditorBridgeService } from '../editor-bridge.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

const calcDocRangePositions = (range: ITextRangeParam, skeleton: DocumentSkeleton): IBoundRectNoAngle[] | undefined => {
    const pageIndex = -1;
    const startPosition = skeleton.findNodePositionByCharIndex(range.startOffset, true, range.segmentId, pageIndex);
    const skeletonData = skeleton.getSkeletonData();
    let end = range.endOffset;
    if (range.segmentId) {
        const root = Array.from(skeletonData?.skeFooters.get(range.segmentId)?.values() ?? [])[0] ?? Array.from(skeletonData?.skeHeaders.get(range.segmentId)?.values() ?? [])[0];
        if (root) {
            end = Math.min(root.ed, end);
        }
    }
    const endPosition = skeleton.findNodePositionByCharIndex(end, true, range.segmentId, pageIndex);
    if (!endPosition || !startPosition) {
        return;
    }

    const documentOffsetConfig = {
        docsLeft: 0,
        docsTop: 0,
        pageMarginLeft: 0,
        pageMarginTop: 0,
    };
    const convertor = new NodePositionConvertToCursor(documentOffsetConfig as any, skeleton);
    const { borderBoxPointGroup } = convertor.getRangePointData(startPosition, endPosition);
    const bounds = getLineBounding(borderBoxPointGroup);

    return bounds.map((rect) => ({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
    }));
};

const calcDocGlyphPosition = (glyph: IDocumentSkeletonGlyph, skeleton: DocumentSkeleton, pageIndex = -1): IBoundRectNoAngle | undefined => {
    const start = skeleton.findPositionByGlyph(glyph, pageIndex);
    if (!start) {
        return;
    }

    const startPosition = { ...start, isBack: true };
    const documentOffsetConfig = {
        docsLeft: 0,
        docsTop: 0,
        pageMarginLeft: 0,
        pageMarginTop: 0,
    };
    const convertor = new NodePositionConvertToCursor(documentOffsetConfig as any, skeleton);
    const { borderBoxPointGroup } = convertor.getRangePointData(startPosition, startPosition);
    const bounds = getLineBounding(borderBoxPointGroup);
    const rect = bounds[0];

    return {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
    };
};

const calcLinkPosition = (skeleton: DocumentSkeleton, range: ICustomRange, paddingLeft = 0, paddingTop = 0) => {
    const rects = calcDocRangePositions({ startOffset: range.startIndex, endOffset: range.endIndex + 1, collapsed: false }, skeleton);
    if (rects) {
        return {
            rects: rects.map((rect) => ({
                top: rect.top + paddingTop,
                bottom: rect.bottom + paddingTop,
                left: rect.left + paddingLeft,
                right: rect.right + paddingLeft,
            })),
            range,
        };
    }
};

const calcBulletPosition = (skeleton: DocumentSkeleton, paragraph: IParagraph, paddingLeft = 0, paddingTop = 0) => {
    const node = skeleton.findNodeByCharIndex(paragraph.startIndex);
    const divide = node?.parent;
    const line = divide?.parent;
    const column = line?.parent;
    const targetLine = column?.lines.find((l) => l.paragraphStart && l.paragraphIndex === paragraph.startIndex);
    const bulletNode = targetLine?.divides?.[0]?.glyphGroup?.[0];

    if (!bulletNode) {
        return;
    }

    if (!bulletNode) {
        return;
    }

    const rect = calcDocGlyphPosition(bulletNode, skeleton);

    if (!rect) {
        return;
    }

    return {
        rect: {
            top: rect.top + paddingTop,
            bottom: rect.bottom + paddingTop,
            left: rect.left + paddingLeft,
            right: rect.right + paddingLeft,
        },
        segmentId: undefined,
        segmentPageIndex: -1,
        paragraph,
    };
};

export const calculateDocSkeletonRects = (docSkeleton: DocumentSkeleton, paddingLeft = 0, paddingTop = 0) => {
    const docModel = docSkeleton.getViewModel().getDataModel();
    const hyperLinks = docModel.getBody()?.customRanges?.filter((range) => range.rangeType === CustomRangeType.HYPERLINK) ?? [];
    const checkLists = docModel.getBody()?.paragraphs?.filter((p) => p.bullet?.listType.indexOf(PresetListType.CHECK_LIST) === 0) ?? [];
    const drawings = docSkeleton.getSkeletonData()?.pages[0].skeDrawings;
    return {
        links: hyperLinks.map((link) => calcLinkPosition(docSkeleton, link, paddingLeft, paddingTop)!).filter(Boolean),
        checkLists: checkLists.map((list) => calcBulletPosition(docSkeleton, list, paddingLeft, paddingTop)!).filter(Boolean),
        drawings: drawings
            ? Array.from(drawings.keys()).map((key) => ({
                drawingId: key,
                rect: {
                    top: drawings!.get(key)!.aTop,
                    bottom: drawings!.get(key)!.aTop + drawings!.get(key)!.width,
                    left: drawings!.get(key)!.aLeft,
                    right: drawings!.get(key)!.aLeft + drawings!.get(key)!.height,
                },
                drawing: drawings.get(key)!,
            }))
            : [],
    };
};

export function calcPadding(cell: ICellWithCoord, font: IFontCacheItem, isNum: boolean) {
    const height = font.documentSkeleton?.getSkeletonData()?.pages[0].height ?? 0;
    const width = font.documentSkeleton?.getSkeletonData()?.pages[0].width ?? 0;
    const vt = font.verticalAlign;
    const ht = font.horizontalAlign;

    let paddingTop = 0;
    switch (vt) {
        case VerticalAlign.UNSPECIFIED:
        case VerticalAlign.BOTTOM:
            paddingTop = cell.mergeInfo.endY - cell.mergeInfo.startY - height;
            break;
        case VerticalAlign.MIDDLE:
            paddingTop = (cell.mergeInfo.endY - cell.mergeInfo.startY - height) / 2;
            break;
        default:
            break;
    }

    let paddingLeft = 0;
    switch (ht) {
        case HorizontalAlign.RIGHT:
            paddingLeft = cell.mergeInfo.endX - cell.mergeInfo.startX - width;
            break;
        case HorizontalAlign.CENTER:
            paddingLeft = (cell.mergeInfo.endX - cell.mergeInfo.startX - width) / 2;
            break;
        case HorizontalAlign.UNSPECIFIED:{
            if (isNum) {
                paddingLeft = cell.mergeInfo.endX - cell.mergeInfo.startX - width;
            }
            break;
        }
        default:
            break;
    }

    return {
        paddingLeft,
        paddingTop,
    };
}

export const getCustomRangePosition = (injector: Injector, unitId: string, subUnitId: string, row: number, col: number, rangeId: string) => {
    const univerInstanceService = injector.get(IUniverInstanceService);
    const renderManagerService = injector.get(IRenderManagerService);
    const workbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
    if (!workbook) {
        return null;
    }

    const worksheet = workbook.getSheetBySheetId(subUnitId);
    if (!worksheet) {
        return null;
    }

    const currentRender = renderManagerService.getRenderById(workbook.getUnitId());
    const skeletonParam = currentRender?.with(SheetSkeletonManagerService).getSkeletonParam(worksheet.getSheetId());

    const skeleton = skeletonParam?.skeleton;

    if (!skeleton || !currentRender) return;

    const font = skeleton.getFont(row, col);
    const docSkeleton = font?.documentSkeleton;
    if (!docSkeleton) {
        return null;
    }
    const customRange = docSkeleton.getViewModel().getBody()?.customRanges?.find((range) => range.rangeId === rangeId);
    if (!customRange) {
        return null;
    }

    const PADDING = DOC_VERTICAL_PADDING;

    const cellIndex = skeleton.getCellWithCoordByIndex(row, col);
    let { actualColumn, actualRow } = cellIndex;

    skeleton.overflowCache.forValue((r, c, range) => {
        if (range.startRow <= actualRow && range.endRow >= actualRow && range.startColumn <= actualColumn && range.endColumn >= actualColumn) {
            actualColumn = c;
            actualRow = r;
        }
    });

    const actualCell = skeleton.getCellWithCoordByIndex(actualRow, actualColumn);
    const cellData = worksheet.getCell(actualCell.actualRow, actualCell.actualColumn);
    const { topOffset = 0, leftOffset = 0 } = cellData?.fontRenderExtension ?? {};
    const { paddingLeft, paddingTop } = calcPadding(actualCell, font, false);
    const rects = calcDocRangePositions({ startOffset: customRange.startIndex, endOffset: customRange.endIndex, collapsed: false }, docSkeleton);

    return {
        rects: rects?.map((rect) => ({
            top: rect.top + actualCell.mergeInfo.startY + paddingTop + topOffset + PADDING,
            bottom: rect.bottom + actualCell.mergeInfo.startY + paddingTop + topOffset + PADDING,
            left: rect.left + actualCell.mergeInfo.startX + paddingLeft + leftOffset,
            right: rect.right + actualCell.mergeInfo.startX + paddingLeft + leftOffset,
        })),
        customRange,
        label: docSkeleton.getViewModel().getBody()!.dataStream.slice(customRange.startIndex, customRange.endIndex + 1),
    };
};

export const getEditingCustomRangePosition = (injector: Injector, unitId: string, subUnitId: string, row: number, col: number, rangeId: string) => {
    const editorBridgeService = injector.get(IEditorBridgeService);

    const state = editorBridgeService.getEditCellState();
    if (!state) {
        return null;
    }
    const visible = editorBridgeService.isVisible();
    if (!visible.visible) {
        return null;
    }
    const { editorUnitId, unitId: editingUnitId, sheetId, row: editRow, column: editCol } = state;
    if (unitId !== editingUnitId || subUnitId !== sheetId || editRow !== row || editCol !== col) {
        return null;
    }

    const renderManagerService = injector.get(IRenderManagerService);
    const renderer = renderManagerService.getRenderById(editorUnitId);
    const sheetRenderer = renderManagerService.getRenderById(unitId);
    if (!renderer || !sheetRenderer) {
        return null;
    }

    const docSkeleton = renderer.with(DocSkeletonManagerService).getSkeleton();
    const sheetSkeleton = sheetRenderer.with(SheetSkeletonManagerService).getSkeletonParam(sheetId)?.skeleton;

    if (!docSkeleton || !sheetSkeleton) {
        return null;
    }

    const customRange = docSkeleton.getViewModel().getBody()?.customRanges?.find((range) => range.rangeId === rangeId);
    if (!customRange) {
        return null;
    }

    const PADDING = 4;
    const rects = calcDocRangePositions({ startOffset: customRange.startIndex, endOffset: customRange.endIndex, collapsed: false }, docSkeleton);
    const canvasClientRect = renderer.engine.getCanvasElement().getBoundingClientRect();

    return {
        rects: rects?.map((rect) => ({
            top: rect.top + canvasClientRect.top - PADDING,
            bottom: rect.bottom + canvasClientRect.top + PADDING,
            left: rect.left + canvasClientRect.left,
            right: rect.right + canvasClientRect.left,
        })),
        customRange,
        label: docSkeleton.getViewModel().getBody()!.dataStream.slice(customRange.startIndex, customRange.endIndex + 1),
    };
};

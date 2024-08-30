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

import type { ICustomRange, IParagraph, ITextRangeParam } from '@univerjs/core';
import { CustomRangeType, PresetListType } from '@univerjs/core';
import type { DocumentSkeleton, IBoundRectNoAngle, IDocumentSkeletonGlyph } from '@univerjs/engine-render';
import { getLineBounding, NodePositionConvertToCursor } from '@univerjs/engine-render';

const calcDocRangePositions = (range: ITextRangeParam, skeleton: DocumentSkeleton): IBoundRectNoAngle[] | undefined => {
    const pageIndex = -1;
    const startPosition = skeleton.findNodePositionByCharIndex(range.startOffset, false, range.segmentId, pageIndex);
    const skeletonData = skeleton.getSkeletonData();
    let end = range.endOffset;
    if (range.segmentId) {
        const root = Array.from(skeletonData?.skeFooters.get(range.segmentId)?.values() ?? [])[0] ?? Array.from(skeletonData?.skeHeaders.get(range.segmentId)?.values() ?? [])[0];
        if (root) {
            end = Math.min(root.ed, end);
        }
    }
    const endPosition = skeleton.findNodePositionByCharIndex(end, false, range.segmentId, pageIndex);
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
        right: rect.left,
    };
};

const calcLinkPosition = (skeleton: DocumentSkeleton, range: ICustomRange) => {
    const rects = calcDocRangePositions({ startOffset: range.startIndex, endOffset: range.endIndex + 1, collapsed: false }, skeleton);
    if (rects) {
        return {
            rects,
            range,
        };
    }
};

const calcBulletPosition = (skeleton: DocumentSkeleton, paragraph: IParagraph) => {
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
        rect,
        segmentId: undefined,
        segmentPageIndex: -1,
        paragraph,
    };
};

export const calculateDocSkeletonRects = (docSkeleton: DocumentSkeleton) => {
    const docModel = docSkeleton.getViewModel().getDataModel();
    const hyperLinks = docModel.getBody()?.customRanges?.filter((range) => range.rangeType === CustomRangeType.HYPERLINK) ?? [];
    const checkLists = docModel.getBody()?.paragraphs?.filter((p) => p.bullet?.listType.indexOf(PresetListType.CHECK_LIST) === 0) ?? [];

    return {
        links: hyperLinks.map((link) => calcLinkPosition(docSkeleton, link)!).filter(Boolean),
        checkLists: checkLists.map((list) => calcBulletPosition(docSkeleton, list)!).filter(Boolean),
    };
};

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

import type { ITextRangeParam } from '@univerjs/core';
import type { Documents, DocumentSkeleton, IBoundRectNoAngle, IDocumentSkeletonGlyph } from '@univerjs/engine-render';
import { DOC_VERTICAL_PADDING } from '../../types/const/padding';
import { NodePositionConvertToCursor } from '../selection/convert-text-range';
import { getLineBounding } from '../selection/text-range';

export const calcDocRangePositions = (range: ITextRangeParam, documents: Documents, skeleton: DocumentSkeleton, pageIndex: number): IBoundRectNoAngle[] | undefined => {
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

    const documentOffsetConfig = documents.getOffsetConfig();
    const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);
    const { borderBoxPointGroup } = convertor.getRangePointData(startPosition, endPosition);
    const bounds = getLineBounding(borderBoxPointGroup);

    return bounds.map((rect) => ({
        top: rect.top + documentOffsetConfig.docsTop - DOC_VERTICAL_PADDING,
        bottom: rect.bottom + documentOffsetConfig.docsTop + DOC_VERTICAL_PADDING,
        left: rect.left + documentOffsetConfig.docsLeft,
        right: rect.right + documentOffsetConfig.docsLeft,
    }));
};

export const calcDocGlyphPosition = (glyph: IDocumentSkeletonGlyph, documents: Documents, skeleton: DocumentSkeleton, pageIndex = -1): IBoundRectNoAngle | undefined => {
    const start = skeleton.findPositionByGlyph(glyph, pageIndex);
    if (!start) {
        return;
    }

    const documentOffsetConfig = documents.getOffsetConfig();
    const startPosition = { ...start, isBack: true };
    const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);
    const { borderBoxPointGroup } = convertor.getRangePointData(startPosition, startPosition);
    const bounds = getLineBounding(borderBoxPointGroup);
    const rect = bounds[0];

    return {
        top: rect.top + documentOffsetConfig.docsTop,
        bottom: rect.bottom + documentOffsetConfig.docsTop,
        left: rect.left + documentOffsetConfig.docsLeft,
        right: rect.left + documentOffsetConfig.docsLeft + glyph.width,
    };
};

export interface ITablePositionInfo {
    id: string;
    rowAccumulateHeight: number[];
    colAccumulateWidth: number[];
    pageIndex: number;
    top: number;
    left: number;
    height: number;
    width: number;
}

export const calcTablePositions = (documents: Documents, skeleton: DocumentSkeleton) => {
    const offsetConfig = documents.getOffsetConfig();
    const { docsTop, docsLeft, pageMarginTop } = offsetConfig;
    const tableDatas: ITablePositionInfo[] = [];

    skeleton.getSkeletonData()?.pages.forEach((page, pageIndex) => page.skeTables.forEach((tableData, tableId) => {
        const pageTop = docsTop + (pageMarginTop + page.pageHeight) * pageIndex + page.marginTop + tableData.top;
        const pageLeft = docsLeft + page.marginLeft + tableData.left;
        let height = 0;
        let width = 0;
        const data: ITablePositionInfo = {
            id: tableId,
            rowAccumulateHeight: [],
            colAccumulateWidth: [],
            pageIndex,
            top: pageTop,
            left: pageLeft,
            height,
            width,
        };

        tableData.rows.forEach((rowData) => {
            height += rowData.height;
            data.rowAccumulateHeight.push(height);
        });

        tableData.rows[0].cells.forEach((cellData) => {
            width += cellData.pageWidth;
            data.colAccumulateWidth.push(width);
        });

        data.height = height;
        data.width = width;
        tableDatas.push(data);
    }));

    return tableDatas;
};

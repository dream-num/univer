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
    IDocumentBody,
    ISectionBreak,
    JSONXActions,
    SectionHeaderFooterReferenceKey,
    TextXAction,
} from '@univerjs/core';
import {
    getParagraphContentStartOffset,
    resolveSectionHeaderFooterReference,
    TextX,
    TextXActionType,
} from '@univerjs/core';
import { getTopLevelSectionBreaks } from '../../utils/sections';
import {
    getDocumentEntityPermissionObjectId,
    getDocumentParagraphPermissionObjectId,
    getDocumentSectionPermissionObjectId,
} from './document-permission';

const HEADER_FOOTER_REFERENCE_KEYS: SectionHeaderFooterReferenceKey[] = [
    'defaultHeaderId',
    'defaultFooterId',
    'firstPageHeaderId',
    'firstPageFooterId',
    'evenPageHeaderId',
    'evenPageFooterId',
];

export interface IDocumentPermissionRange {
    startOffset: number;
    endOffset: number;
}

export function getDocumentDrawingSegmentId(documentDataModel: DocumentDataModel, drawingId: string): string {
    const { body, headers = {}, footers = {} } = documentDataModel.getSnapshot();
    if (body?.customBlocks?.some((block) => block.blockId === drawingId)) {
        return '';
    }
    for (const [segmentId, header] of Object.entries(headers)) {
        if (header.body.customBlocks?.some((block) => block.blockId === drawingId)) {
            return segmentId;
        }
    }
    for (const [segmentId, footer] of Object.entries(footers)) {
        if (footer.body.customBlocks?.some((block) => block.blockId === drawingId)) {
            return segmentId;
        }
    }
    return '';
}

export function getDocumentEditTargetObjectIds(
    documentDataModel: DocumentDataModel,
    segmentId: string,
    range: IDocumentPermissionRange
): string[] {
    const body = documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();
    if (!body) {
        return [];
    }
    return [
        ...getSectionPermissionObjectIds(documentDataModel, segmentId, range),
        ...getParagraphPermissionObjectIds(body, segmentId, range),
        ...getEntityPermissionObjectIds(documentDataModel, body, segmentId, range),
    ];
}

export function getDocumentEditTargetObjectIdsFromActions(
    documentDataModel: DocumentDataModel,
    segmentId: string,
    actions: JSONXActions
): string[] {
    const textActions = getTextXActions(actions);
    const result = new Set<string>();
    if (textActions) {
        let offset = 0;
        const addRange = (startOffset: number, endOffset: number): void => {
            getDocumentEditTargetObjectIds(documentDataModel, segmentId, { startOffset, endOffset })
                .forEach((objectId) => result.add(objectId));
        };

        textActions.forEach((action) => {
            if (action.t === TextXActionType.INSERT) {
                addRange(offset, offset);
                return;
            }
            if (action.t === TextXActionType.DELETE) {
                addRange(offset, offset + action.len);
                offset += action.len;
                return;
            }
            if (action.body !== undefined || action.oldBody !== undefined || action.coverType !== undefined) {
                addRange(offset, offset + action.len);
            }
            offset += action.len;
        });
    }

    getDrawingIdsFromActions(actions).forEach((drawingId) => {
        result.add(getDocumentEntityPermissionObjectId(segmentId, 'drawing', drawingId));
        const body = documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        const block = body?.customBlocks?.find((item) => item.blockId === drawingId);
        if (block) {
            getSectionPermissionObjectIds(documentDataModel, segmentId, {
                startOffset: block.startIndex,
                endOffset: block.startIndex + 1,
            }).forEach((objectId) => result.add(objectId));
        }
    });

    return [...result];
}

function getDrawingIdsFromActions(actions: JSONXActions): string[] {
    const result = new Set<string>();
    const visit = (value: unknown): void => {
        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                if (item === 'drawings' && typeof value[index + 1] === 'string') {
                    result.add(value[index + 1]);
                }
                visit(item);
            });
            return;
        }
        if (!isRecord(value)) {
            return;
        }
        Object.values(value).forEach(visit);
    };
    visit(actions);
    return [...result];
}

function getTextXActions(actions: JSONXActions): TextXAction[] | null {
    if (!Array.isArray(actions) || actions.length !== 2 || actions[0] !== 'body' || !isRecord(actions[1])) {
        return null;
    }
    const edit = actions[1];
    return edit.et === TextX.id && Array.isArray(edit.e) && edit.e.every(isTextXAction) ? edit.e : null;
}

function isTextXAction(value: unknown): value is TextXAction {
    if (!isRecord(value) || typeof value.len !== 'number') return false;
    if (value.t === TextXActionType.INSERT) return isRecord(value.body);
    return value.t === TextXActionType.RETAIN || value.t === TextXActionType.DELETE;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getDocumentEntityParentPermissionObjectIds(
    documentDataModel: DocumentDataModel,
    segmentId: string,
    entityType: string,
    entityId: string
): string[] {
    const body = documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();
    const range = body ? getEntityRange(body, entityType, entityId) : null;
    return range ? getSectionPermissionObjectIds(documentDataModel, segmentId, range) : [];
}

export function getDocumentParagraphParentPermissionObjectIds(
    documentDataModel: DocumentDataModel,
    segmentId: string,
    paragraphId: string
): string[] {
    const body = documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();
    const paragraph = body?.paragraphs?.find((item) => item.paragraphId === paragraphId);
    if (!body || !paragraph) {
        return [];
    }
    return getSectionPermissionObjectIds(documentDataModel, segmentId, {
        startOffset: getParagraphContentStartOffset(body, paragraph),
        endOffset: paragraph.startIndex + 1,
    });
}

export function getDocumentSectionPermissionObjectIdsByIds(
    sectionIds: Iterable<string>
): string[] {
    return Array.from(sectionIds, (sectionId) => getDocumentSectionPermissionObjectId('', sectionId));
}

export function getDocumentSectionIdsAtOffset(body: IDocumentBody, offset: number): string[] {
    return getSectionsIntersectingRange(getTopLevelSectionBreaks(body), {
        startOffset: offset,
        endOffset: offset,
    }).map((section) => section.sectionId);
}

function getSectionPermissionObjectIds(
    documentDataModel: DocumentDataModel,
    segmentId: string,
    range: IDocumentPermissionRange
): string[] {
    if (segmentId) {
        return getHeaderFooterOwnerSectionIds(documentDataModel, segmentId)
            .map((sectionId) => getDocumentSectionPermissionObjectId('', sectionId));
    }
    const body = documentDataModel.getBody();
    if (!body) {
        return [];
    }
    return getSectionsIntersectingRange(getTopLevelSectionBreaks(body), range)
        .map((section) => getDocumentSectionPermissionObjectId('', section.sectionId));
}

function getParagraphPermissionObjectIds(
    body: IDocumentBody,
    segmentId: string,
    range: IDocumentPermissionRange
): string[] {
    const startOffset = Math.min(range.startOffset, range.endOffset);
    const endOffset = Math.max(range.startOffset, range.endOffset);
    return (body.paragraphs ?? [])
        .filter((paragraph) => intersectsRange(
            getParagraphContentStartOffset(body, paragraph),
            paragraph.startIndex + 1,
            startOffset,
            endOffset
        ))
        .flatMap((paragraph) => paragraph.paragraphId
            ? [getDocumentParagraphPermissionObjectId(segmentId, paragraph.paragraphId)]
            : []);
}

function getEntityPermissionObjectIds(
    documentDataModel: DocumentDataModel,
    body: IDocumentBody,
    segmentId: string,
    range: IDocumentPermissionRange
): string[] {
    const drawings = documentDataModel.getSnapshot().drawings ?? {};
    const candidates = [
        ...(body.tables ?? []).map((item) => ({ type: 'table', id: item.tableId, start: item.startIndex, end: item.endIndex })),
        ...(body.customBlocks ?? []).map((item) => ({
            type: drawings[item.blockId] ? 'drawing' : 'custom-block',
            id: item.blockId,
            start: item.startIndex,
            end: item.startIndex + 1,
        })),
        ...(body.blockRanges ?? []).map((item) => ({ type: 'block-range', id: item.blockId, start: item.startIndex, end: item.endIndex + 1 })),
        ...(body.customRanges ?? []).map((item) => ({ type: 'custom-range', id: item.rangeId, start: item.startIndex, end: item.endIndex + 1 })),
        ...(body.columnGroups ?? []).map((item) => ({ type: 'column-group', id: item.columnGroupId, start: item.startIndex, end: item.endIndex + 1 })),
    ];
    const startOffset = Math.min(range.startOffset, range.endOffset);
    const endOffset = Math.max(range.startOffset, range.endOffset);
    return candidates
        .filter((item) => intersectsRange(item.start, item.end, startOffset, endOffset))
        .map((item) => getDocumentEntityPermissionObjectId(segmentId, item.type, item.id));
}

function getEntityRange(
    body: IDocumentBody,
    entityType: string,
    entityId: string
): IDocumentPermissionRange | null {
    if (entityType === 'table') {
        const item = body.tables?.find((table) => table.tableId === entityId);
        return item ? { startOffset: item.startIndex, endOffset: item.endIndex } : null;
    }
    if (entityType === 'custom-block' || entityType === 'drawing') {
        const item = body.customBlocks?.find((block) => block.blockId === entityId);
        return item ? { startOffset: item.startIndex, endOffset: item.startIndex + 1 } : null;
    }
    if (entityType === 'block-range') {
        const item = body.blockRanges?.find((block) => block.blockId === entityId);
        return item ? { startOffset: item.startIndex, endOffset: item.endIndex + 1 } : null;
    }
    if (entityType === 'custom-range') {
        const item = body.customRanges?.find((customRange) => customRange.rangeId === entityId);
        return item ? { startOffset: item.startIndex, endOffset: item.endIndex + 1 } : null;
    }
    if (entityType === 'column-group') {
        const item = body.columnGroups?.find((columnGroup) => columnGroup.columnGroupId === entityId);
        return item ? { startOffset: item.startIndex, endOffset: item.endIndex + 1 } : null;
    }
    return null;
}

function getSectionsIntersectingRange(
    sections: ISectionBreak[],
    range: IDocumentPermissionRange
): ISectionBreak[] {
    const startOffset = Math.min(range.startOffset, range.endOffset);
    const endOffset = Math.max(range.startOffset, range.endOffset);
    return sections.filter((section, index) => intersectsRange(
        index === 0 ? 0 : sections[index - 1].startIndex + 1,
        section.startIndex + 1,
        startOffset,
        endOffset
    ));
}

function intersectsRange(
    targetStart: number,
    targetEnd: number,
    rangeStart: number,
    rangeEnd: number
): boolean {
    if (rangeStart === rangeEnd) {
        return rangeStart >= targetStart && rangeStart < targetEnd;
    }
    return rangeStart < targetEnd && rangeEnd > targetStart;
}

function getHeaderFooterOwnerSectionIds(
    documentDataModel: DocumentDataModel,
    segmentId: string
): string[] {
    const snapshot = documentDataModel.getSnapshot();
    const sections = snapshot.body ? getTopLevelSectionBreaks(snapshot.body) : [];
    const result = new Set<string>();
    sections.forEach((section, sectionIndex) => {
        if (HEADER_FOOTER_REFERENCE_KEYS.some((key) =>
            resolveSectionHeaderFooterReference(snapshot.documentStyle, sections, sectionIndex, key).segmentId === segmentId)) {
            result.add(section.sectionId);
        }
    });
    return [...result];
}

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
    getParagraphContentStartOffsets,
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

interface IDocumentPermissionEntityRange extends IDocumentPermissionRange {
    id: string;
    type: string;
}

interface IDocumentPermissionSegmentIndex {
    body: IDocumentBody | null;
    entities: IDocumentPermissionEntityRange[];
    entityRanges: Map<string, IDocumentPermissionRange>;
    paragraphContentStartOffsets: Map<number, number>;
    paragraphsById: Map<string, NonNullable<IDocumentBody['paragraphs']>[number]>;
}

interface IDocumentPermissionResolverIndex {
    drawingSegmentIds: Map<string, string>;
    mutationRevision: number;
    segments: Map<string, IDocumentPermissionSegmentIndex>;
    topLevelSections: ISectionBreak[];
}

const documentPermissionResolverIndexCache = new WeakMap<DocumentDataModel, IDocumentPermissionResolverIndex>();

export interface IDocumentPermissionRange {
    startOffset: number;
    endOffset: number;
}

function getDocumentPermissionResolverIndex(documentDataModel: DocumentDataModel): IDocumentPermissionResolverIndex {
    const mutationRevision = (documentDataModel as Partial<Pick<DocumentDataModel, 'getMutationRevision'>>)
        .getMutationRevision?.() ?? Number.NaN;
    const cached = documentPermissionResolverIndexCache.get(documentDataModel);
    if (cached?.mutationRevision === mutationRevision) {
        return cached;
    }

    const snapshot = documentDataModel.getSnapshot();
    const topLevelSections = snapshot.body ? getTopLevelSectionBreaks(snapshot.body) : [];
    const drawingSegmentIds = new Map<string, string>();
    const addDrawingSegments = (body: IDocumentBody | undefined, segmentId: string): void => {
        for (const block of body?.customBlocks ?? []) {
            if (!drawingSegmentIds.has(block.blockId)) {
                drawingSegmentIds.set(block.blockId, segmentId);
            }
        }
    };
    addDrawingSegments(snapshot.body, '');
    Object.entries(snapshot.headers ?? {}).forEach(([segmentId, header]) => addDrawingSegments(header.body, segmentId));
    Object.entries(snapshot.footers ?? {}).forEach(([segmentId, footer]) => addDrawingSegments(footer.body, segmentId));

    const index: IDocumentPermissionResolverIndex = {
        drawingSegmentIds,
        mutationRevision,
        segments: new Map(),
        topLevelSections,
    };
    documentPermissionResolverIndexCache.set(documentDataModel, index);
    return index;
}

function getDocumentPermissionSegmentIndex(
    documentDataModel: DocumentDataModel,
    segmentId: string,
    resolverIndex = getDocumentPermissionResolverIndex(documentDataModel)
): IDocumentPermissionSegmentIndex {
    const cached = resolverIndex.segments.get(segmentId);
    if (cached) {
        return cached;
    }

    const body = documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody() ?? null;
    const drawings = documentDataModel.getSnapshot().drawings ?? {};
    const entities: IDocumentPermissionEntityRange[] = body == null
        ? []
        : [
            ...(body.tables ?? []).map((item) => ({ type: 'table', id: item.tableId, startOffset: item.startIndex, endOffset: item.endIndex })),
            ...(body.customBlocks ?? []).map((item) => ({
                type: drawings[item.blockId] ? 'drawing' : 'custom-block',
                id: item.blockId,
                startOffset: item.startIndex,
                endOffset: item.startIndex + 1,
            })),
            ...(body.blockRanges ?? []).map((item) => ({ type: 'block-range', id: item.blockId, startOffset: item.startIndex, endOffset: item.endIndex + 1 })),
            ...(body.customRanges ?? []).map((item) => ({ type: 'custom-range', id: item.rangeId, startOffset: item.startIndex, endOffset: item.endIndex + 1 })),
            ...(body.columnGroups ?? []).map((item) => ({ type: 'column-group', id: item.columnGroupId, startOffset: item.startIndex, endOffset: item.endIndex + 1 })),
        ];
    const entityRanges = new Map(entities.map((entity) => [
        `${entity.type}:${entity.id}`,
        { startOffset: entity.startOffset, endOffset: entity.endOffset },
    ]));
    for (const block of body?.customBlocks ?? []) {
        const range = { startOffset: block.startIndex, endOffset: block.startIndex + 1 };
        entityRanges.set(`custom-block:${block.blockId}`, range);
        entityRanges.set(`drawing:${block.blockId}`, range);
    }
    const segmentIndex: IDocumentPermissionSegmentIndex = {
        body,
        entities,
        entityRanges,
        paragraphContentStartOffsets: body == null ? new Map() : getParagraphContentStartOffsets(body),
        paragraphsById: new Map((body?.paragraphs ?? [])
            .filter((paragraph) => paragraph.paragraphId != null)
            .map((paragraph) => [paragraph.paragraphId!, paragraph])),
    };
    resolverIndex.segments.set(segmentId, segmentIndex);
    return segmentIndex;
}

export function getDocumentDrawingSegmentId(documentDataModel: DocumentDataModel, drawingId: string): string {
    return getDocumentPermissionResolverIndex(documentDataModel).drawingSegmentIds.get(drawingId) ?? '';
}

export function getDocumentEditTargetObjectIds(
    documentDataModel: DocumentDataModel,
    segmentId: string,
    range: IDocumentPermissionRange
): string[] {
    const resolverIndex = getDocumentPermissionResolverIndex(documentDataModel);
    const segmentIndex = getDocumentPermissionSegmentIndex(documentDataModel, segmentId, resolverIndex);
    const { body } = segmentIndex;
    if (!body) {
        return [];
    }
    return [
        ...getSectionPermissionObjectIds(documentDataModel, segmentId, range, resolverIndex),
        ...getParagraphPermissionObjectIds(body, segmentId, range, segmentIndex),
        ...getEntityPermissionObjectIds(segmentId, range, segmentIndex),
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
    if (!isRecord(value) || typeof value.len !== 'number') {
        return false;
    }
    if (value.t === TextXActionType.INSERT) {
        return isRecord(value.body);
    }
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
    const resolverIndex = getDocumentPermissionResolverIndex(documentDataModel);
    const segmentIndex = getDocumentPermissionSegmentIndex(documentDataModel, segmentId, resolverIndex);
    const range = segmentIndex.entityRanges.get(`${entityType}:${entityId}`) ?? null;
    return range ? getSectionPermissionObjectIds(documentDataModel, segmentId, range, resolverIndex) : [];
}

export function getDocumentParagraphParentPermissionObjectIds(
    documentDataModel: DocumentDataModel,
    segmentId: string,
    paragraphId: string
): string[] {
    const resolverIndex = getDocumentPermissionResolverIndex(documentDataModel);
    const segmentIndex = getDocumentPermissionSegmentIndex(documentDataModel, segmentId, resolverIndex);
    const { body } = segmentIndex;
    const paragraph = segmentIndex.paragraphsById.get(paragraphId);
    if (!body || !paragraph) {
        return [];
    }
    return getSectionPermissionObjectIds(documentDataModel, segmentId, {
        startOffset: segmentIndex.paragraphContentStartOffsets.get(paragraph.startIndex) ?? getParagraphContentStartOffset(body, paragraph),
        endOffset: paragraph.startIndex + 1,
    }, resolverIndex);
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
    range: IDocumentPermissionRange,
    resolverIndex = getDocumentPermissionResolverIndex(documentDataModel)
): string[] {
    if (segmentId) {
        return getHeaderFooterOwnerSectionIds(documentDataModel, segmentId, resolverIndex.topLevelSections)
            .map((sectionId) => getDocumentSectionPermissionObjectId('', sectionId));
    }
    return getSectionsIntersectingRange(resolverIndex.topLevelSections, range)
        .map((section) => getDocumentSectionPermissionObjectId('', section.sectionId));
}

function getParagraphPermissionObjectIds(
    body: IDocumentBody,
    segmentId: string,
    range: IDocumentPermissionRange,
    segmentIndex: IDocumentPermissionSegmentIndex
): string[] {
    const startOffset = Math.min(range.startOffset, range.endOffset);
    const endOffset = Math.max(range.startOffset, range.endOffset);
    return (body.paragraphs ?? [])
        .filter((paragraph) => intersectsRange(
            segmentIndex.paragraphContentStartOffsets.get(paragraph.startIndex) ?? getParagraphContentStartOffset(body, paragraph),
            paragraph.startIndex + 1,
            startOffset,
            endOffset
        ))
        .flatMap((paragraph) => paragraph.paragraphId
            ? [getDocumentParagraphPermissionObjectId(segmentId, paragraph.paragraphId)]
            : []);
}

function getEntityPermissionObjectIds(
    segmentId: string,
    range: IDocumentPermissionRange,
    segmentIndex: IDocumentPermissionSegmentIndex
): string[] {
    const startOffset = Math.min(range.startOffset, range.endOffset);
    const endOffset = Math.max(range.startOffset, range.endOffset);
    return segmentIndex.entities
        .filter((item) => intersectsRange(item.startOffset, item.endOffset, startOffset, endOffset))
        .map((item) => getDocumentEntityPermissionObjectId(segmentId, item.type, item.id));
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
    segmentId: string,
    sections = getDocumentPermissionResolverIndex(documentDataModel).topLevelSections
): string[] {
    const snapshot = documentDataModel.getSnapshot();
    const result = new Set<string>();
    sections.forEach((section, sectionIndex) => {
        if (HEADER_FOOTER_REFERENCE_KEYS.some((key) =>
            resolveSectionHeaderFooterReference(snapshot.documentStyle, sections, sectionIndex, key).segmentId === segmentId)) {
            result.add(section.sectionId);
        }
    });
    return [...result];
}

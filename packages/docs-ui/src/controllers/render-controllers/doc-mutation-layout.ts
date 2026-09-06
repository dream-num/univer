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

import type { IDocStyles, IDocumentBody, IDocumentData, JSONXActions } from '@univerjs/core';
import type { IDocumentLayoutInvalidation } from '@univerjs/engine-render';
import { JSON1, TextX } from '@univerjs/core';

interface IDocumentLayoutRange {
    end: number;
    start: number;
}

export interface IDocumentMutationLayoutImpact {
    global: boolean;
    range?: IDocumentLayoutRange;
    unresolvedLocal?: boolean;
}

const BODY_RANGE_COLLECTIONS = new Set<keyof IDocumentBody>([
    'blockRanges',
    'columnGroups',
    'customBlocks',
    'customDecorations',
    'customRanges',
    'paragraphs',
    'renderedPageBreaks',
    'sectionBreaks',
    'tables',
    'textRuns',
]);

class DocumentMutationLayoutIndex {
    private _tableRanges: Map<string, IDocumentLayoutRange> | null = null;
    private _drawingRanges: Map<string, IDocumentLayoutRange> | null = null;
    private _listRanges: Map<string, IDocumentLayoutRange> | null = null;
    private _styleRanges: Map<string, IDocumentLayoutRange> | null = null;
    private _styleDependents: Map<string, string[]> | null = null;

    constructor(
        private readonly _body: IDocumentBody | undefined,
        private readonly _styles: IDocStyles | undefined
    ) {}

    getTableRange(tableId: string): IDocumentLayoutRange | undefined {
        if (this._tableRanges == null) {
            this._tableRanges = new Map();
            for (const table of this._body?.tables ?? []) {
                if (!this._tableRanges.has(table.tableId)) {
                    this._tableRanges.set(table.tableId, { start: table.startIndex, end: table.endIndex });
                }
            }
        }
        return this._tableRanges.get(tableId);
    }

    getDrawingRange(drawingId: string): IDocumentLayoutRange | undefined {
        if (this._drawingRanges == null) {
            this._drawingRanges = new Map();
            for (const block of this._body?.customBlocks ?? []) {
                if (!this._drawingRanges.has(block.blockId)) {
                    this._drawingRanges.set(block.blockId, { start: block.startIndex, end: block.startIndex + 1 });
                }
            }
        }
        return this._drawingRanges.get(drawingId);
    }

    getListRange(listIds: Set<string>): IDocumentLayoutRange | undefined {
        this._ensureParagraphRanges();
        return mergeRangesById(this._listRanges!, listIds);
    }

    getStyleRange(styleIds: Set<string>): IDocumentLayoutRange | undefined {
        this._ensureParagraphRanges();
        if (this._styleDependents == null) {
            this._styleDependents = new Map();
            for (const [styleId, style] of Object.entries(this._styles ?? {})) {
                if (style.basedOn == null) {
                    continue;
                }
                const dependents = this._styleDependents.get(style.basedOn) ?? [];
                dependents.push(styleId);
                this._styleDependents.set(style.basedOn, dependents);
            }
        }

        const affectedStyleIds = new Set(styleIds);
        const pendingStyleIds = [...styleIds];
        while (pendingStyleIds.length > 0) {
            const styleId = pendingStyleIds.pop()!;
            for (const dependent of this._styleDependents.get(styleId) ?? []) {
                if (!affectedStyleIds.has(dependent)) {
                    affectedStyleIds.add(dependent);
                    pendingStyleIds.push(dependent);
                }
            }
        }
        return mergeRangesById(this._styleRanges!, affectedStyleIds);
    }

    private _ensureParagraphRanges(): void {
        if (this._listRanges != null && this._styleRanges != null) {
            return;
        }
        this._listRanges = new Map();
        this._styleRanges = new Map();
        for (const paragraph of this._body?.paragraphs ?? []) {
            const paragraphRange = { start: paragraph.startIndex, end: paragraph.startIndex + 1 };
            const listId = paragraph.bullet?.listId;
            if (listId != null) {
                this._listRanges.set(listId, mergeLayoutRange(this._listRanges.get(listId), paragraphRange)!);
            }
            if (paragraph.styleId != null) {
                this._styleRanges.set(
                    paragraph.styleId,
                    mergeLayoutRange(this._styleRanges.get(paragraph.styleId), paragraphRange)!
                );
            }
        }
    }
}

function mergeRangesById(
    ranges: Map<string, IDocumentLayoutRange>,
    ids: Set<string>
): IDocumentLayoutRange | undefined {
    let range: IDocumentLayoutRange | undefined;
    for (const id of ids) {
        range = mergeLayoutRange(range, ranges.get(id));
    }
    return range;
}

export function getBodyTextXActions(actions: JSONXActions, segmentId?: string): unknown[] | undefined {
    if (segmentId || actions == null) {
        return undefined;
    }

    let result: unknown[] | undefined;
    let duplicate = false;
    try {
        const cursor = JSON1.type.readCursor(actions);
        cursor.traverse(null, (component) => {
            const path = cursor.getPath();
            if (
                path.length !== 1 ||
                path[0] !== 'body' ||
                component.et !== TextX.name ||
                !Array.isArray(component.e)
            ) {
                return;
            }

            if (result != null) {
                duplicate = true;
            } else {
                result = component.e;
            }
        });
    } catch {
        return undefined;
    }

    return duplicate ? undefined : result;
}

export function getSingleBodyTextXActions(actions: JSONXActions, segmentId?: string): unknown[] | undefined {
    return actions != null && actions.length === 2 && actions[0] === 'body'
        ? getBodyTextXActions(actions, segmentId)
        : undefined;
}

export function getDocumentMutationLayoutImpact(
    actions: JSONXActions,
    snapshot: Pick<IDocumentData, 'body' | 'styles'>
): IDocumentMutationLayoutImpact {
    if (actions == null) {
        return { global: true };
    }

    let global = false;
    let range: IDocumentLayoutRange | undefined;
    let sawComponent = false;
    let unresolvedLocal = false;
    const { body, styles } = snapshot;
    const index = new DocumentMutationLayoutIndex(body, styles);
    try {
        const cursor = JSON1.type.readCursor(actions);
        cursor.traverse(null, (component) => {
            sawComponent = true;
            const impact = getComponentLayoutImpact(cursor.getPath(), component, body, index);
            global ||= impact.global;
            unresolvedLocal ||= impact.unresolvedLocal === true;
            range = mergeLayoutRange(range, impact.range);
        });
    } catch {
        return { global: true };
    }

    return { global: global || !sawComponent, range, unresolvedLocal };
}

function getComponentLayoutImpact(
    path: (string | number)[],
    component: Record<string, unknown>,
    body: IDocumentBody | undefined,
    index: DocumentMutationLayoutIndex
): IDocumentMutationLayoutImpact {
    const root = path[0];
    if (root === 'drawingsOrder') {
        return { global: false };
    }
    if (root === 'body') {
        return getBodyComponentLayoutImpact(path, component, body);
    }
    if (root === 'tableSource') {
        const tableId = path[1];
        const range = typeof tableId === 'string' ? index.getTableRange(tableId) : undefined;
        return { global: false, range, unresolvedLocal: range == null };
    }
    if (root === 'drawings') {
        const drawingId = path[1];
        const range = typeof drawingId === 'string' ? index.getDrawingRange(drawingId) : undefined;
        return { global: false, range, unresolvedLocal: range == null };
    }
    if (root === 'lists') {
        const range = body == null ? undefined : index.getListRange(getChangedRecordKeys(path, component));
        return { global: false, range, unresolvedLocal: range == null };
    }
    if (root === 'styles') {
        const range = body == null ? undefined : index.getStyleRange(getChangedRecordKeys(path, component));
        return { global: false, range, unresolvedLocal: range == null };
    }
    return { global: true };
}

function getBodyComponentLayoutImpact(
    path: (string | number)[],
    component: Record<string, unknown>,
    body: IDocumentBody | undefined
): IDocumentMutationLayoutImpact {
    if (path.length === 1 && component.et === TextX.name && Array.isArray(component.e)) {
        return { global: false };
    }
    const collection = path[1];
    if (typeof collection !== 'string' || !BODY_RANGE_COLLECTIONS.has(collection as keyof IDocumentBody)) {
        return { global: true };
    }
    const range = body == null ? undefined : getBodyCollectionRange(body, path, component);
    return { global: false, range, unresolvedLocal: range == null };
}

export function mergeMutationLayoutInvalidation(
    textInvalidation: IDocumentLayoutInvalidation | undefined,
    structuralRange: IDocumentLayoutRange | undefined
): IDocumentLayoutInvalidation | undefined {
    if (structuralRange == null) {
        return textInvalidation;
    }
    if (textInvalidation == null) {
        return {
            oldStart: structuralRange.start,
            oldEnd: structuralRange.end,
            newEnd: structuralRange.end,
        };
    }

    return {
        oldStart: Math.min(textInvalidation.oldStart, mapCurrentOffsetToPrevious(structuralRange.start, textInvalidation)),
        oldEnd: Math.max(textInvalidation.oldEnd, mapCurrentOffsetToPrevious(structuralRange.end, textInvalidation)),
        newEnd: Math.max(textInvalidation.newEnd, structuralRange.end),
    };
}

export function resolveMutationLayoutRequest(
    textInvalidation: IDocumentLayoutInvalidation | undefined,
    impact: IDocumentMutationLayoutImpact,
    bodyRangeStarts: number[]
): { anchor: number | undefined; invalidation: IDocumentLayoutInvalidation | undefined } {
    if (impact.global) {
        return { anchor: undefined, invalidation: undefined };
    }
    if (impact.unresolvedLocal && textInvalidation == null) {
        return { anchor: undefined, invalidation: undefined };
    }

    const invalidation = mergeMutationLayoutInvalidation(textInvalidation, impact.range);
    return {
        anchor: invalidation?.oldStart ?? (bodyRangeStarts.length > 0 ? Math.min(...bodyRangeStarts) : undefined),
        invalidation,
    };
}

function getBodyCollectionRange(
    body: IDocumentBody,
    path: (string | number)[],
    component: Record<string, unknown>
): IDocumentLayoutRange | undefined {
    const collection = path[1];
    if (typeof collection !== 'string' || !BODY_RANGE_COLLECTIONS.has(collection as keyof IDocumentBody)) {
        return undefined;
    }
    if ('p' in component || 'd' in component) {
        return undefined;
    }

    const index = path[2];
    if (typeof index === 'number') {
        const replacesWholeItem = path.length === 3 && ('r' in component || 'i' in component);
        let range = replacesWholeItem
            ? undefined
            : getIndexedBodyRange(body, collection as keyof IDocumentBody, index);
        range = mergeLayoutRange(range, getBodyItemRange(component.r, collection as keyof IDocumentBody));
        return mergeLayoutRange(range, getBodyItemRange(component.i, collection as keyof IDocumentBody));
    }

    let range: IDocumentLayoutRange | undefined;
    for (const value of [component.r, component.i]) {
        if (!Array.isArray(value)) {
            continue;
        }
        for (const item of value) {
            range = mergeLayoutRange(range, getBodyItemRange(item, collection as keyof IDocumentBody));
        }
    }
    return range;
}

function getIndexedBodyRange(
    body: IDocumentBody,
    collection: keyof IDocumentBody,
    index: number
): IDocumentLayoutRange | undefined {
    const items = body[collection];
    return Array.isArray(items) ? getBodyItemRange(items[index], collection) : undefined;
}

function getBodyItemRange(item: unknown, collection: keyof IDocumentBody): IDocumentLayoutRange | undefined {
    if (collection === 'renderedPageBreaks' && typeof item === 'number') {
        return { start: item, end: item + 1 };
    }
    if (typeof item !== 'object' || item == null) {
        return undefined;
    }
    if ('st' in item && 'ed' in item && typeof item.st === 'number' && typeof item.ed === 'number') {
        return { start: item.st, end: item.ed };
    }
    if (!('startIndex' in item) || typeof item.startIndex !== 'number') {
        return undefined;
    }

    const end = 'endIndex' in item && typeof item.endIndex === 'number'
        ? item.endIndex + (collection === 'tables' ? 0 : 1)
        : item.startIndex + 1;
    return { start: item.startIndex, end };
}

function getChangedRecordKeys(
    path: (string | number)[],
    component: Record<string, unknown>
): Set<string> {
    const keys = new Set<string>();
    if (typeof path[1] === 'string') {
        keys.add(path[1]);
        return keys;
    }
    for (const value of [component.r, component.i]) {
        if (typeof value === 'object' && value != null && !Array.isArray(value)) {
            Object.keys(value).forEach((key) => keys.add(key));
        }
    }
    return keys;
}

function mergeLayoutRange(
    current: IDocumentLayoutRange | undefined,
    next: IDocumentLayoutRange | undefined
): IDocumentLayoutRange | undefined {
    if (next == null) {
        return current;
    }
    return current == null
        ? next
        : {
            start: Math.min(current.start, next.start),
            end: Math.max(current.end, next.end),
        };
}

function mapCurrentOffsetToPrevious(offset: number, invalidation: IDocumentLayoutInvalidation): number {
    if (offset < invalidation.oldStart) {
        return offset;
    }
    if (offset < invalidation.newEnd) {
        return invalidation.oldStart;
    }
    return offset - (invalidation.newEnd - invalidation.oldEnd);
}

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

import type { ICustomRange, IDocumentBody } from '../../../types/interfaces/i-document-data';
import type { IRetainAction, TextXAction } from './action-types';
import { UpdateDocsAttributeType } from '../../../shared/command-enum';
import { Tools } from '../../../shared/tools';
import { CustomRangeType } from '../../../types/interfaces/i-document-data';
import { orderManagedBookmarks } from '../../bookmark-id';
import { DataStreamTreeTokenType } from '../types';
import { TextXActionType } from './action-types';
import { deleteCustomRanges, insertCustomRanges } from './apply-utils/common';
import { updateAttribute } from './apply-utils/update-apply';
import { getBodySliceForSplitTextXAction } from './utils';

type IRangeUpdate = Omit<NonNullable<IRetainAction['rangeUpdates']>[number], 'fallbackOrderIndex'> & { fallbackOrder?: string[] };

export function getChangedPropertyPaths(before: unknown, after: unknown, path: string[] = []): string[][] {
    if (Tools.diffValue(before, after)) {
        return [];
    }
    if (after && typeof after === 'object' && !Array.isArray(after) &&
        (before == null || (typeof before === 'object' && !Array.isArray(before)))) {
        const previous = (before ?? {}) as Record<string, unknown>;
        const next = after as Record<string, unknown>;
        const keys = Array.from(new Set([...Object.keys(previous), ...Object.keys(next)]));
        if (!keys.length && path.length) {
            return [path];
        }
        return keys
            .flatMap((key) => getChangedPropertyPaths(previous[key], next[key], [...path, key]));
    }
    return [path];
}

function validatePropertyPaths(paths: string[][]): void {
    if (!Array.isArray(paths) || paths.some((path) => !Array.isArray(path) || !path.length || path.some((key) =>
        typeof key !== 'string' || ['__proto__', 'prototype', 'constructor'].includes(key)))) {
        throw new Error('Invalid custom range property paths.');
    }
}

function patchRangeProperties(target: ICustomRange, source: ICustomRange, paths: string[][]): ICustomRange {
    validatePropertyPaths(paths);
    const result = Tools.deepClone(target);
    for (const path of paths) {
        let current = (result.properties ??= {}) as Record<string, unknown>;
        let value: unknown = source.properties;
        const parents: Array<{ object: Record<string, unknown>; key: string; value: unknown }> = [];
        for (let index = 0; index < path.length; index++) {
            const key = path[index];
            value = value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined;
            if (index === path.length - 1) {
                if (value === undefined) {
                    delete current[key];
                } else {
                    current[key] = Tools.deepClone(value);
                }
            } else {
                if (!current[key] || typeof current[key] !== 'object' || Array.isArray(current[key])) {
                    current[key] = {};
                }
                parents.push({ object: current, key, value });
                current = current[key] as Record<string, unknown>;
            }
        }
        for (const parent of parents.reverse()) {
            if (parent.value === undefined && Object.keys(parent.object[parent.key] as object).length === 0) {
                delete parent.object[parent.key];
            }
        }
    }
    if (source.properties === undefined && !Object.keys(result.properties ?? {}).length) {
        delete result.properties;
    }
    return result;
}

export function composeRangeUpdate(
    first: IRangeUpdate | undefined,
    second: IRangeUpdate
): IRangeUpdate {
    if (!first || !second.propertyPaths || !second.range) {
        if (first?.bookmarkOrderPosition !== undefined && second.range?.rangeType === CustomRangeType.BOOKMARK &&
            second.bookmarkOrderPosition === undefined && second.nextRangeId === undefined) {
            // The later move changes geometry while keeping the slot assigned by the insert.
            return { ...second, bookmarkOrderPosition: first.bookmarkOrderPosition };
        }
        return second;
    }
    if (!first.range) {
        return first;
    }
    const propertyPaths = first.propertyPaths && [...first.propertyPaths, ...second.propertyPaths.filter((path) => !first.propertyPaths!.some((parent) =>
        parent.length <= path.length && parent.every((key, index) => path[index] === key)))];
    return { ...first, range: patchRangeProperties(first.range, second.range, second.propertyPaths), propertyPaths };
}

export function transformRangeUpdate(
    update: IRangeUpdate,
    concurrent: IRangeUpdate | undefined,
    priority: 'left' | 'right'
): IRangeUpdate[] {
    if (!concurrent || !update.range) {
        return [update];
    }
    if (!concurrent.range) {
        return [];
    }
    if (!update.propertyPaths || !concurrent.propertyPaths) {
        return priority === 'left' ? [{ ...update, propertyPaths: undefined }] : [];
    }
    const propertyPaths = update.propertyPaths.filter((path) => priority === 'left' ||
        !concurrent.propertyPaths!.some((other) => path.slice(0, Math.min(path.length, other.length))
            .every((key, index) => other[index] === key)))
        .map((path) => concurrent.propertyPaths!.find((other) => other.length < path.length &&
            other.every((key, index) => path[index] === key)) ?? path);
    return propertyPaths.length ? [{ ...update, propertyPaths }] : [];
}

export function getRangeUpdates(actions: TextXAction[]): IRangeUpdate[] {
    const updates = new Map<string, IRangeUpdate>();
    let orders: string[][] | undefined;
    for (const action of actions) {
        if (action.t !== TextXActionType.RETAIN) {
            continue;
        }
        if (action.bookmarkOrders !== undefined) {
            orders = action.bookmarkOrders;
            if (!Array.isArray(orders) || orders.some((order) => !Array.isArray(order) || order.some((id) => typeof id !== 'string'))) {
                throw new Error('Invalid bookmark order table.');
            }
        }
        for (const { fallbackOrderIndex, ...update } of action.rangeUpdates ?? []) {
            const fallbackOrder = fallbackOrderIndex === undefined ? undefined : orders?.[fallbackOrderIndex];
            if (fallbackOrderIndex !== undefined && (!Number.isInteger(fallbackOrderIndex) || !fallbackOrder)) {
                throw new Error('Invalid bookmark order reference.');
            }
            updates.set(update.rangeId, composeRangeUpdate(updates.get(update.rangeId), { ...update, fallbackOrder }));
        }
    }
    // The shared orders are immutable during apply and transform.
    return [...updates.values()].map(({ fallbackOrder, ...update }) => ({ ...Tools.deepClone(update), fallbackOrder }));
}

// Identity edits must never enter the positional iterator: an insertion may
// split every character of a retain, or a deletion may consume it altogether.
export function withoutRangeUpdates(actions: TextXAction[]): TextXAction[] {
    return actions.flatMap((action): TextXAction[] => {
        if (action.t === TextXActionType.INSERT && action.len > 1 &&
            Array.from(action.body.dataStream).every((token) => token === DataStreamTreeTokenType.CUSTOM_RANGE_START || token === DataStreamTreeTokenType.CUSTOM_RANGE_END)) {
            return Array.from(action.body.dataStream, (_, index) => ({
                ...action,
                len: 1,
                body: getBodySliceForSplitTextXAction(action.body, index, index + 1, false),
            }));
        }
        if (action.t !== TextXActionType.RETAIN || (!action.rangeUpdates && !action.bookmarkOrders)) {
            return [action];
        }
        const { rangeUpdates, oldRangeUpdates, bookmarkOrders, ...textAction } = action;
        return textAction.len === 0 && !textAction.body ? [] : [textAction];
    });
}

export function appendRangeUpdates(actions: TextXAction[], updates: IRangeUpdate[] | undefined): TextXAction[] {
    if (!updates?.length) {
        return actions;
    }
    const bookmarkOrders: string[][] = [];
    const indices = new Map<string[], number>();
    const rangeUpdates = updates.map(({ fallbackOrder, ...update }) => {
        if (!fallbackOrder) {
            return update;
        }
        let fallbackOrderIndex = indices.get(fallbackOrder);
        if (fallbackOrderIndex === undefined) {
            fallbackOrderIndex = bookmarkOrders.push(fallbackOrder) - 1;
            indices.set(fallbackOrder, fallbackOrderIndex);
        }
        return { ...update, fallbackOrderIndex };
    });
    const action: IRetainAction = { t: TextXActionType.RETAIN, len: 0, rangeUpdates };
    if (bookmarkOrders.length) {
        action.bookmarkOrders = bookmarkOrders;
    }
    return [...actions, action];
}

export function validateRangeUpdates(updates: IRangeUpdate[], resultLength: number): void {
    for (const { rangeId, range, nextRangeId, fallbackNextRangeId, fallbackOrder, propertyPaths, bookmarkOrderPosition } of updates) {
        if (fallbackNextRangeId !== undefined && (range?.rangeType !== CustomRangeType.BOOKMARK || propertyPaths || nextRangeId !== undefined ||
            (fallbackNextRangeId !== null && typeof fallbackNextRangeId !== 'string'))) {
            throw new Error('Invalid bookmark move anchor.');
        }
        if (fallbackOrder !== undefined && typeof fallbackNextRangeId !== 'string') {
            throw new Error('Invalid bookmark move anchors.');
        }
        if (bookmarkOrderPosition !== undefined && (range?.rangeType !== CustomRangeType.BOOKMARK || propertyPaths ||
            nextRangeId !== undefined || !Number.isInteger(bookmarkOrderPosition) || bookmarkOrderPosition < 0 || bookmarkOrderPosition > resultLength)) {
            throw new Error('Invalid bookmark ordering intent.');
        }
        if (propertyPaths !== undefined) {
            validatePropertyPaths(propertyPaths);
            if (!range) {
                throw new Error('Invalid custom range property paths.');
            }
        }
        if (typeof rangeId !== 'string' || !rangeId ||
            (nextRangeId !== undefined && nextRangeId !== null && typeof nextRangeId !== 'string') ||
            (range !== null && (range == null || typeof range !== 'object' || Array.isArray(range) ||
                range.rangeId !== rangeId || !Number.isInteger(range.startIndex) || !Number.isInteger(range.endIndex) ||
                range.startIndex < 0 || range.endIndex < range.startIndex || range.endIndex >= resultLength))) {
            throw new Error('Invalid custom range identity or bounds.');
        }
    }
}

function getRangeUpdateApplyOrder(updates: IRangeUpdate[]): IRangeUpdate[] {
    // Apply an updated anchor before the ranges that are restored in front of it.
    if (!updates.some(({ nextRangeId }) => nextRangeId != null)) {
        return [...updates].reverse();
    }
    const pending = new Map(updates.map((update) => [update.rangeId, update]));
    const ordered: IRangeUpdate[] = [];
    for (let index = updates.length - 1; index >= 0; index--) {
        const chain: IRangeUpdate[] = [];
        let update = pending.get(updates[index].rangeId);
        while (update) {
            chain.push(update);
            pending.delete(update.rangeId);
            update = update.nextRangeId == null ? undefined : pending.get(update.nextRangeId);
        }
        ordered.push(...chain.reverse());
    }
    return ordered;
}

function applyRangeUpdateBatch(ranges: ICustomRange[], updates: IRangeUpdate[]): void {
    for (const { rangeId, range, nextRangeId, fallbackNextRangeId, fallbackOrder, propertyPaths } of getRangeUpdateApplyOrder(updates)) {
        const index = ranges.findIndex((item) => item.rangeId === rangeId);
        if (range && propertyPaths) {
            if (index >= 0) {
                ranges[index] = patchRangeProperties(ranges[index], range, propertyPaths);
            }
            continue;
        }
        if (range) {
            if (nextRangeId !== undefined) {
                if (index >= 0) {
                    ranges.splice(index, 1);
                }
                const nextIndex = ranges.findIndex((item) => item.rangeId === nextRangeId);
                ranges.splice(nextIndex < 0 ? ranges.length : nextIndex, 0, Tools.deepClone(range));
            } else if (index >= 0) {
                ranges[index] = Tools.deepClone(range);
            } else {
                let anchor = fallbackNextRangeId == null ? -1 : ranges.findIndex((item) => item.rangeId === fallbackNextRangeId);
                if (anchor < 0 && fallbackOrder && typeof fallbackNextRangeId === 'string') {
                    const first = fallbackOrder.indexOf(fallbackNextRangeId);
                    if (first >= 0) {
                        const positions = new Map(ranges.map((item, index) => [item.rangeId, index]));
                        for (let offset = first + 1; offset < fallbackOrder.length; offset++) {
                            const position = positions.get(fallbackOrder[offset]);
                            if (position !== undefined) {
                                anchor = position;
                                break;
                            }
                        }
                    }
                }
                ranges.splice(anchor < 0 ? ranges.length : anchor, 0, Tools.deepClone(range));
            }
        } else if (index >= 0) {
            ranges.splice(index, 1);
        }
    }
}

export function applyRangeUpdates(doc: IDocumentBody, updates: IRangeUpdate[]): void {
    if (!updates.length) {
        return;
    }
    const ranges = doc.customRanges ?? [];
    const positioned = updates.filter((update) => update.bookmarkOrderPosition !== undefined);
    if (positioned.length) {
        // Sort at the positions used by the insert before later identity edits retain their slots.
        applyRangeUpdateBatch(ranges, positioned);
        const positions = new Map(positioned.map(({ rangeId, bookmarkOrderPosition }) => [rangeId, bookmarkOrderPosition]));
        ranges.sort((left, right) =>
            (positions.get(left.rangeId) ?? left.startIndex) - (positions.get(right.rangeId) ?? right.startIndex));
        applyRangeUpdateBatch(ranges, updates.filter((update) => update.bookmarkOrderPosition === undefined));
    } else {
        applyRangeUpdateBatch(ranges, updates);
    }
    doc.customRanges = orderManagedBookmarks(ranges);
}

export function moveRangeUpdates(
    updates: IRangeUpdate[],
    actions: TextXAction[],
    preserveProperties = false
): IRangeUpdate[] {
    const insertsRanges = actions.some((action) => action.t === TextXActionType.INSERT && action.body.customRanges?.length);
    return updates.map((update) => {
        const { rangeId, range } = update;
        if (!range && preserveProperties) {
            return update;
        }
        const body: IDocumentBody = { dataStream: '', customRanges: range ? [Tools.deepClone(range)] : [] };
        let orderPosition = update.bookmarkOrderPosition;
        let offset = 0;
        for (const action of actions) {
            if (action.t === TextXActionType.INSERT) {
                if (orderPosition !== undefined && orderPosition >= offset) {
                    orderPosition += action.len;
                }
                insertCustomRanges(body, {
                    dataStream: '',
                    customRanges: Tools.deepClone(action.body.customRanges?.filter((item) => item.rangeId === rangeId)),
                }, action.len, offset);
            } else if (action.t === TextXActionType.DELETE) {
                if (orderPosition !== undefined && orderPosition >= offset) {
                    orderPosition = Math.max(offset, orderPosition - action.len);
                }
                deleteCustomRanges(body, action.len, offset);
                continue;
            } else if (action.body?.customRanges) {
                updateAttribute(body, {
                    dataStream: '',
                    customRanges: Tools.deepClone(action.body.customRanges.filter((item) => item.rangeId === rangeId)),
                }, action.len, offset, action.coverType ?? UpdateDocsAttributeType.COVER);
            }
            offset += action.len;
        }
        const moved = body.customRanges?.find((item) => item.rangeId === rangeId);
        const mapped = { ...update, bookmarkOrderPosition: orderPosition, propertyPaths: moved ? update.propertyPaths : undefined, range: moved && range && preserveProperties
            ? { ...Tools.deepClone(range), startIndex: moved.startIndex, endIndex: moved.endIndex }
            : moved ?? null };
        if (mapped.range?.rangeType !== CustomRangeType.BOOKMARK) {
            delete mapped.fallbackNextRangeId;
            delete mapped.fallbackOrder;
            delete mapped.bookmarkOrderPosition;
        } else if (insertsRanges && (mapped.fallbackNextRangeId !== undefined || orderPosition !== undefined)) {
            mapped.bookmarkOrderPosition = mapped.range.startIndex;
        }
        return mapped;
    });
}

/** A concurrent metadata payload must not resurrect an explicitly removed identity. */
export function reconcileRangeUpdates(actions: TextXAction[], updates: IRangeUpdate[]): TextXAction[] {
    const byId = new Map(updates?.map((update) => [update.rangeId, update]));
    if (!byId.size) {
        return actions;
    }
    return actions.map((action) => {
        if (!action.body?.customRanges) {
            return action;
        }
        return { ...action, body: { ...action.body, customRanges: action.body.customRanges.flatMap((range) => {
            if (!byId.has(range.rangeId)) {
                return [range];
            }
            const updated = byId.get(range.rangeId)!;
            if (!updated.range) {
                return [];
            }
            const replacement = updated.propertyPaths
                ? patchRangeProperties(range, updated.range, updated.propertyPaths)
                : Tools.deepClone(updated.range);
            return [{ ...replacement, startIndex: range.startIndex, endIndex: range.endIndex }];
        }) } };
    });
}

/** Dropping a concurrent restoration also drops its delimiters, not its text. */
export function dropRemovedRangeAnchors(
    actions: TextXAction[],
    suppressed: ICustomRange[],
    updates: IRangeUpdate[]
): TextXAction[] {
    if (!suppressed.length) {
        return appendRangeUpdates(actions, updates);
    }
    const kept: TextXAction[] = [];
    const removed: TextXAction[] = [];
    let offset = 0;
    let deletedEnd = 0;
    for (const action of actions) {
        const token = action.body?.dataStream;
        const isSuppressedAnchor = action.t === TextXActionType.INSERT && action.len === 1 &&
            suppressed.some((range) =>
                (token === DataStreamTreeTokenType.CUSTOM_RANGE_START && offset === range.startIndex) ||
                (token === DataStreamTreeTokenType.CUSTOM_RANGE_END && offset === range.endIndex));
        if (isSuppressedAnchor) {
            if (offset > deletedEnd) {
                removed.push({ t: TextXActionType.RETAIN, len: offset - deletedEnd });
            }
            removed.push({ t: TextXActionType.DELETE, len: 1 });
            deletedEnd = offset + 1;
        } else {
            kept.push(action);
        }
        if (action.t !== TextXActionType.DELETE) {
            offset += action.len;
        }
    }
    return appendRangeUpdates(kept, moveRangeUpdates(updates, removed));
}

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
import type { BookmarkOrder, BookmarkOrderSegment, IRetainAction, TextXAction } from './action-types';
import { UpdateDocsAttributeType } from '../../../shared/command-enum';
import { Tools } from '../../../shared/tools';
import { CustomRangeType } from '../../../types/interfaces/i-document-data';
import { orderManagedBookmarks } from '../../bookmark-id';
import { DataStreamTreeTokenType } from '../types';
import { TextXActionType } from './action-types';
import { deleteCustomRanges, insertCustomRanges } from './apply-utils/common';
import { updateAttribute } from './apply-utils/update-apply';
import { getBodySliceForSplitTextXAction } from './utils';

interface IBookmarkOrderRef {
    table: BookmarkOrder[];
    index: number;
}

type IRangeUpdate = Omit<NonNullable<IRetainAction['rangeUpdates']>[number], 'fallbackOrderIndex'> & {
    fallbackOrder?: IBookmarkOrderRef;
};

// Only the newest materialized order is needed when appending the next edit.
const orderTails = new WeakMap<BookmarkOrder[], { index: number; order: string[] }>();

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

function decodeBookmarkOrders(entries: BookmarkOrder[], expand = true): string[][] {
    if (!Array.isArray(entries)) {
        throw new TypeError('Invalid bookmark order table.');
    }
    const orders: string[][] = [];
    let previousLength: number | undefined;
    for (const entry of entries) {
        const previous = orders[orders.length - 1];
        if (!Array.isArray(entry)) {
            if (previousLength === undefined || !entry || !Array.isArray(entry.segments)) {
                throw new Error('Invalid bookmark order segments.');
            }
            let copied = 0;
            let inserted = 0;
            const order: string[] = [];
            for (const segment of entry.segments) {
                if (typeof segment === 'string') {
                    inserted++;
                    if (expand) {
                        order.push(segment);
                    }
                    continue;
                }
                if (!Array.isArray(segment) || segment.length !== 2) {
                    throw new Error('Invalid bookmark order segment.');
                }
                const [start, count] = segment;
                if (!Number.isInteger(start) || !Number.isInteger(count) || start < 0 || count < 1 ||
                    start + count > previousLength || copied + count > previousLength) {
                    throw new Error('Invalid bookmark order segment bounds.');
                }
                copied += count;
                if (expand) {
                    for (let index = start; index < start + count; index++) {
                        order.push(previous[index]);
                    }
                }
            }
            if (expand) {
                orders.push(order);
            }
            previousLength = copied + inserted;
            continue;
        }
        if (typeof entry[0] !== 'number') {
            if (entry.some((id) => typeof id !== 'string')) {
                throw new Error('Invalid bookmark order table.');
            }
            if (expand) {
                orders.push(entry as string[]);
            }
            previousLength = entry.length;
            continue;
        }
        const [prefixCount, suffixCount, inserted] = entry;
        if (previousLength === undefined || entry.length !== 3 || typeof prefixCount !== 'number' || typeof suffixCount !== 'number' ||
            !Number.isInteger(prefixCount) || !Number.isInteger(suffixCount) ||
            prefixCount < 0 || suffixCount < 0 || prefixCount + suffixCount > previousLength ||
            !Array.isArray(inserted) || inserted.some((id) => typeof id !== 'string')) {
            throw new Error('Invalid bookmark order splice.');
        }
        if (expand) {
            orders.push(previous.slice(0, prefixCount).concat(inserted, previous.slice(previous.length - suffixCount)));
        }
        previousLength = prefixCount + suffixCount + inserted.length;
    }
    return orders;
}

function encodeBookmarkOrder(order: string[], previous: string[] | undefined, fullLength: number): BookmarkOrder {
    if (!previous) {
        return order;
    }
    const common = Math.min(order.length, previous.length);
    let prefix = 0;
    while (prefix < common && order[prefix] === previous[prefix]) {
        prefix++;
    }
    let suffix = 0;
    while (suffix < common - prefix && order[order.length - suffix - 1] === previous[previous.length - suffix - 1]) {
        suffix++;
    }
    const inserted = order.slice(prefix, order.length - suffix);
    const splice: BookmarkOrder = [prefix, suffix, inserted];
    const spliceLength = prefix || suffix ? JSON.stringify(splice).length : fullLength;
    const simpleOrder = spliceLength < fullLength ? splice : order;
    if (inserted.length < 2) {
        return simpleOrder;
    }

    // Common cases need only a few searches. Index the previous order if it is highly fragmented.
    const segments: BookmarkOrderSegment[] = [];
    let lookups = 0;
    let positions: Map<string, number> | undefined;
    let copied = 0;
    for (let index = 0; index < order.length;) {
        if (lookups++ === 8) {
            positions = new Map(previous.map((id, offset) => [id, offset]));
        }
        const start = positions ? positions.get(order[index]) ?? -1 : previous.indexOf(order[index]);
        let end = index + 1;
        if (start >= 0) {
            while (end < order.length && start + end - index < previous.length &&
                order[end] === previous[start + end - index]) {
                end++;
            }
        }
        const count = end - index;
        if (count > 1) {
            copied += count;
            if (copied > previous.length) {
                return simpleOrder;
            }
            segments.push([start, count]);
        } else {
            segments.push(order[index]);
        }
        index = end;
    }

    const reuse = { segments };
    return segments.length < order.length && JSON.stringify(reuse).length < Math.min(spliceLength, fullLength)
        ? reuse
        : simpleOrder;
}

export function getRangeUpdates(actions: TextXAction[]): IRangeUpdate[] {
    const updates = new Map<string, IRangeUpdate>();
    let orderTable: BookmarkOrder[] | undefined;
    for (const action of actions) {
        if (action.t !== TextXActionType.RETAIN) {
            continue;
        }
        if (action.bookmarkOrders !== undefined) {
            orderTable = action.bookmarkOrders;
            decodeBookmarkOrders(orderTable, false);
        }
        for (const { fallbackOrderIndex, ...update } of action.rangeUpdates ?? []) {
            let fallbackOrder: IRangeUpdate['fallbackOrder'];
            if (fallbackOrderIndex !== undefined) {
                if (!orderTable || !Number.isInteger(fallbackOrderIndex) || fallbackOrderIndex < 0 || fallbackOrderIndex >= orderTable.length) {
                    throw new Error('Invalid bookmark order reference.');
                }
                fallbackOrder = { table: orderTable, index: fallbackOrderIndex };
            }
            updates.set(update.rangeId, composeRangeUpdate(updates.get(update.rangeId), { ...update, fallbackOrder }));
        }
    }
    // Order references stay compact until an edit needs to resolve one.
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

function materializeBookmarkOrder(
    source: IBookmarkOrderRef,
    decoded: Map<BookmarkOrder[], string[][]>
): string[] {
    const tail = orderTails.get(source.table);
    if (tail?.index === source.index) {
        return tail.order;
    }
    let orders = decoded.get(source.table);
    if (!orders) {
        orders = decodeBookmarkOrders(source.table);
        decoded.set(source.table, orders);
    }
    return orders[source.index];
}

function getRetainedOrderPrefix(updates: IRangeUpdate[]): IBookmarkOrderRef | undefined {
    const firstOrder = updates.find(({ fallbackOrder }) => fallbackOrder !== undefined)?.fallbackOrder;
    if (!firstOrder) {
        return;
    }
    const { table } = firstOrder;
    const retained = new Set<number>();
    let index = -1;
    for (const { fallbackOrder } of updates) {
        if (fallbackOrder?.table === table) {
            retained.add(fallbackOrder.index);
            index = Math.max(index, fallbackOrder.index);
        }
    }
    // Dependencies can refer to earlier entries. Retain a contiguous prefix only,
    // so superseded orders are reclaimed when a move creates a gap in the table.
    if (retained.size === index + 1) {
        return { table, index };
    }
}

export function appendRangeUpdates(actions: TextXAction[], updates: IRangeUpdate[] | undefined): TextXAction[] {
    if (!updates?.length) {
        return actions;
    }
    const prefix = getRetainedOrderPrefix(updates);
    const bookmarkOrders = prefix ? prefix.table.slice(0, prefix.index + 1) : [];
    let previousOrder: string[] | undefined;
    const decoded = new Map<BookmarkOrder[], string[][]>();
    const indices = new Map<string[], number>();
    const equalOrders = new Map<string, number>();
    const rangeUpdates = updates.map(({ fallbackOrder, ...update }) => {
        if (!fallbackOrder) {
            return update;
        }
        if (prefix && fallbackOrder.table === prefix.table && fallbackOrder.index <= prefix.index) {
            return { ...update, fallbackOrderIndex: fallbackOrder.index };
        }
        const order = materializeBookmarkOrder(fallbackOrder, decoded);
        let fallbackOrderIndex = indices.get(order);
        if (fallbackOrderIndex === undefined) {
            if (previousOrder === undefined && prefix) {
                previousOrder = materializeBookmarkOrder(prefix, decoded);
                equalOrders.set(JSON.stringify(previousOrder), prefix.index);
            }
            const key = JSON.stringify(order);
            fallbackOrderIndex = equalOrders.get(key);
            if (fallbackOrderIndex === undefined) {
                fallbackOrderIndex = bookmarkOrders.push(encodeBookmarkOrder(order, previousOrder, key.length)) - 1;
                previousOrder = order;
                equalOrders.set(key, fallbackOrderIndex);
            }
            indices.set(order, fallbackOrderIndex);
        }
        return { ...update, fallbackOrderIndex };
    });
    const action: IRetainAction = { t: TextXActionType.RETAIN, len: 0, rangeUpdates };
    if (bookmarkOrders.length) {
        action.bookmarkOrders = bookmarkOrders;
        const tail = prefix && orderTails.get(prefix.table);
        if (previousOrder) {
            orderTails.set(bookmarkOrders, { index: bookmarkOrders.length - 1, order: previousOrder });
        } else if (tail && tail.index === prefix?.index) {
            orderTails.set(bookmarkOrders, tail);
        }
    }
    return [...actions, action];
}

export function validateRangeUpdates(updates: IRangeUpdate[], resultLength: number): void {
    for (const { rangeId, range, nextRangeId, fallbackNextRangeId, fallbackOrder, propertyPaths, bookmarkOrderPosition } of updates) {
        if (fallbackNextRangeId !== undefined && (range?.rangeType !== CustomRangeType.BOOKMARK || propertyPaths || nextRangeId !== undefined ||
            (fallbackNextRangeId !== null && typeof fallbackNextRangeId !== 'string'))) {
            throw new Error('Invalid bookmark move anchor.');
        }
        if (fallbackOrder !== undefined && fallbackNextRangeId === undefined) {
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
    const decoded = new Map<BookmarkOrder[], string[][]>();
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
                    const order = materializeBookmarkOrder(fallbackOrder, decoded);
                    const first = order.indexOf(fallbackNextRangeId);
                    if (first >= 0) {
                        const positions = new Map(ranges.map((item, index) => [item.rangeId, index]));
                        for (let offset = first + 1; offset < order.length; offset++) {
                            const position = positions.get(order[offset]);
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

function orderRangesAtInsertion(ranges: ICustomRange[], positioned: IRangeUpdate[]): void {
    const positions = new Map(positioned.map(({ rangeId, bookmarkOrderPosition }) => [rangeId, bookmarkOrderPosition!]));
    const positionOf = (range: ICustomRange) => positions.get(range.rangeId) ?? range.startIndex;
    ranges.sort((left, right) => positionOf(left) - positionOf(right));
    const orders = new Map<number, IBookmarkOrderRef>();
    const decoded = new Map<BookmarkOrder[], string[][]>();
    for (const { bookmarkOrderPosition, fallbackOrder } of positioned) {
        if (fallbackOrder) {
            // Later moves to the same position include the order established by earlier inserts.
            orders.set(bookmarkOrderPosition!, fallbackOrder);
        }
    }
    const ranks = new Map<string[], Map<string, number>>();
    for (let start = 0; start < ranges.length;) {
        const position = positionOf(ranges[start]);
        let end = start + 1;
        while (end < ranges.length && positionOf(ranges[end]) === position) {
            end++;
        }
        const reference = orders.get(position);
        if (reference && end - start > 1) {
            const order = materializeBookmarkOrder(reference, decoded);
            let rank = ranks.get(order);
            if (!rank) {
                rank = new Map(order.map((id, index) => [id, index]));
                ranks.set(order, rank);
            }
            // The paste sorts stably. Restore the prior order of the surviving legacy ranges that tie.
            const slots: number[] = [];
            for (let index = start; index < end; index++) {
                if (rank.has(ranges[index].rangeId)) {
                    slots.push(index);
                }
            }
            const ordered = slots.map((index) => ranges[index])
                .sort((left, right) => rank.get(left.rangeId)! - rank.get(right.rangeId)!);
            for (const [offset, index] of slots.entries()) {
                ranges[index] = ordered[offset];
            }
        }
        start = end;
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
        orderRangesAtInsertion(ranges, positioned);
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

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
import { DataStreamTreeTokenType } from '../types';
import { TextXActionType } from './action-types';
import { deleteCustomRanges, insertCustomRanges } from './apply-utils/common';
import { updateAttribute } from './apply-utils/update-apply';
import { getBodySliceForSplitTextXAction } from './utils';

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
    first: NonNullable<IRetainAction['rangeUpdates']>[number] | undefined,
    second: NonNullable<IRetainAction['rangeUpdates']>[number]
): NonNullable<IRetainAction['rangeUpdates']>[number] {
    if (!first || !second.propertyPaths || !second.range) {
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
    update: NonNullable<IRetainAction['rangeUpdates']>[number],
    concurrent: NonNullable<IRetainAction['rangeUpdates']>[number] | undefined,
    priority: 'left' | 'right'
): NonNullable<IRetainAction['rangeUpdates']> {
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

export function getRangeUpdates(actions: TextXAction[]): NonNullable<IRetainAction['rangeUpdates']> {
    const updates = new Map<string, NonNullable<IRetainAction['rangeUpdates']>[number]>();
    for (const action of actions) {
        if (action.t === TextXActionType.RETAIN) {
            for (const update of action.rangeUpdates ?? []) {
                updates.set(update.rangeId, composeRangeUpdate(updates.get(update.rangeId), update));
            }
        }
    }
    return updates.size ? Tools.deepClone(Array.from(updates.values())) : [];
}

// Identity edits must never enter the positional iterator: an insertion may
// split every character of a retain, or a deletion may consume it altogether.
export function withoutRangeUpdates(actions: TextXAction[]): TextXAction[] {
    return actions.flatMap((action) => {
        if (action.t === TextXActionType.INSERT && action.len > 1 &&
            Array.from(action.body.dataStream).every((token) => token === DataStreamTreeTokenType.CUSTOM_RANGE_START || token === DataStreamTreeTokenType.CUSTOM_RANGE_END)) {
            return Array.from(action.body.dataStream, (_, index) => ({
                ...action,
                len: 1,
                body: getBodySliceForSplitTextXAction(action.body, index, index + 1, false),
            }));
        }
        if (action.t !== TextXActionType.RETAIN || !action.rangeUpdates) {
            return [action];
        }
        const { rangeUpdates, oldRangeUpdates, ...textAction } = action;
        return textAction.len === 0 && !textAction.body ? [] : [textAction];
    });
}

export function appendRangeUpdates(actions: TextXAction[], updates: IRetainAction['rangeUpdates']): TextXAction[] {
    return updates?.length ? [...actions, { t: TextXActionType.RETAIN, len: 0, rangeUpdates: updates }] : actions;
}

export function validateRangeUpdates(updates: IRetainAction['rangeUpdates'], resultLength: number): void {
    for (const { rangeId, range, nextRangeId, propertyPaths } of updates ?? []) {
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

export function applyRangeUpdates(doc: IDocumentBody, updates: IRetainAction['rangeUpdates']): void {
    if (!updates?.length) {
        return;
    }
    const ranges = doc.customRanges ?? [];
    for (const { rangeId, range, nextRangeId, propertyPaths } of [...updates].reverse()) {
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
                ranges.push(Tools.deepClone(range));
            }
        } else if (index >= 0) {
            ranges.splice(index, 1);
        }
    }
    doc.customRanges = ranges;
}

export function moveRangeUpdates(
    updates: NonNullable<IRetainAction['rangeUpdates']>,
    actions: TextXAction[],
    preserveProperties = false
): NonNullable<IRetainAction['rangeUpdates']> {
    return updates.map((update) => {
        const { rangeId, range } = update;
        if (!range && preserveProperties) {
            return update;
        }
        const body: IDocumentBody = { dataStream: '', customRanges: range ? [Tools.deepClone(range)] : [] };
        let offset = 0;
        for (const action of actions) {
            if (action.t === TextXActionType.INSERT) {
                insertCustomRanges(body, {
                    dataStream: '',
                    customRanges: Tools.deepClone(action.body.customRanges?.filter((item) => item.rangeId === rangeId)),
                }, action.len, offset);
            } else if (action.t === TextXActionType.DELETE) {
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
        return { ...update, propertyPaths: moved ? update.propertyPaths : undefined, range: moved && range && preserveProperties
            ? { ...Tools.deepClone(range), startIndex: moved.startIndex, endIndex: moved.endIndex }
            : moved ?? null };
    });
}

/** A concurrent metadata payload must not resurrect an explicitly removed identity. */
export function reconcileRangeUpdates(actions: TextXAction[], updates: IRetainAction['rangeUpdates']): TextXAction[] {
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
    updates: NonNullable<IRetainAction['rangeUpdates']>
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

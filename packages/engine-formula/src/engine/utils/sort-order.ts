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

import type { Nullable } from '@univerjs/core';
import type { ErrorType } from '../../basics/error-type';
import type { BaseValueObject } from '../value-object/base-value-object';
import { ERROR_TYPE_NUMBER } from '../../basics/error-type';

export function compareSortValues(left: Nullable<BaseValueObject>, right: Nullable<BaseValueObject>, order: number, compare: (left: string, right: string) => number): number {
    if (left == null || left.isNull()) return right == null || right.isNull() ? 0 : 1;
    if (right == null || right.isNull()) return -1;
    const rank = (value: BaseValueObject) => {
        if (value.isNumber()) return 0;
        if (value.isString()) return 1;
        if (value.isBoolean()) return 2;
        return 3;
    };
    const typeOrder = rank(left) - rank(right);
    if (typeOrder) return order * typeOrder;
    if (left.isError() && right.isError()) {
        const leftCode = ERROR_TYPE_NUMBER.get(left.getValue() as ErrorType) ?? Number.MAX_SAFE_INTEGER;
        const rightCode = ERROR_TYPE_NUMBER.get(right.getValue() as ErrorType) ?? Number.MAX_SAFE_INTEGER;
        return order * (leftCode - rightCode);
    }
    if (left.isString() && right.isString()) return order * compare(String(left.getValue()), String(right.getValue()));
    return order * (Number(left.getValue()) - Number(right.getValue()));
}

function sortRun(start: number, end: number, compare: (left: number, right: number) => number): number[] {
    const length = end - start;
    let source = Array.from({ length }, (_, index) => start + index);
    let runs = [0];
    for (let index = 1; index < length; index++) {
        if (compare(start + index - 1, start + index) > 0) runs.push(index);
    }
    runs.push(length);
    if (runs.length === 2) return source;
    let target = new Array<number>(length);
    while (runs.length > 2) {
        const merged = [0];
        for (let run = 0; run < runs.length - 1; run += 2) {
            let left = runs[run];
            const middle = runs[run + 1];
            let right = middle;
            const end = runs[run + 2] ?? length;
            let output = left;
            while (left < middle && right < end) target[output++] = compare(source[left], source[right]) <= 0 ? source[left++] : source[right++];
            while (left < middle) target[output++] = source[left++];
            while (right < end) target[output++] = source[right++];
            merged.push(end);
        }
        [source, target] = [target, source];
        runs = merged;
    }
    return source;
}

function mergeBlocks(blocks: number[][], compare: (left: number, right: number) => number): number[] {
    const count = blocks.length + 1;
    const left = new Uint32Array(count);
    const right = new Uint32Array(count);
    const parent = new Uint32Array(count);
    const red = new Uint8Array(count);
    const values = new Uint32Array(count);
    const positions = new Uint32Array(count);
    let root = 0;
    const rotate = (node: number, towardLeft: boolean) => {
        const child = towardLeft ? right[node] : left[node];
        if (towardLeft) {
            right[node] = left[child];
            if (left[child]) parent[left[child]] = node;
        } else {
            left[node] = right[child];
            if (right[child]) parent[right[child]] = node;
        }
        parent[child] = parent[node];
        if (!parent[node]) root = child;
        else if (node === left[parent[node]]) left[parent[node]] = child;
        else right[parent[node]] = child;
        if (towardLeft) left[child] = node;
        else right[child] = node;
        parent[node] = child;
    };
    const insert = (node: number) => {
        let previous = 0;
        let cursor = root;
        while (cursor) {
            previous = cursor;
            cursor = compare(values[node], values[cursor]) < 0 ? left[cursor] : right[cursor];
        }
        parent[node] = previous;
        if (!previous) root = node;
        else if (compare(values[node], values[previous]) < 0) left[previous] = node;
        else right[previous] = node;
        left[node] = right[node] = 0;
        red[node] = 1;
        while (red[parent[node]]) {
            const towardLeft = parent[node] === left[parent[parent[node]]];
            const uncle = towardLeft ? right[parent[parent[node]]] : left[parent[parent[node]]];
            if (red[uncle]) {
                red[parent[node]] = red[uncle] = 0;
                red[parent[parent[node]]] = 1;
                node = parent[parent[node]];
            } else {
                if (node === (towardLeft ? right[parent[node]] : left[parent[node]])) {
                    node = parent[node];
                    rotate(node, towardLeft);
                }
                red[parent[node]] = 0;
                red[parent[parent[node]]] = 1;
                rotate(parent[parent[node]], !towardLeft);
            }
        }
        red[root] = 0;
    };
    const pop = () => {
        let node = root;
        while (left[node]) node = left[node];
        let child = right[node];
        parent[child] = parent[node];
        if (!parent[node]) root = child;
        else if (node === left[parent[node]]) left[parent[node]] = child;
        else right[parent[node]] = child;
        if (!red[node]) {
            while (child !== root && !red[child]) {
                const towardLeft = child === left[parent[child]];
                let sibling = towardLeft ? right[parent[child]] : left[parent[child]];
                if (red[sibling]) {
                    red[sibling] = 0;
                    red[parent[child]] = 1;
                    rotate(parent[child], towardLeft);
                    sibling = towardLeft ? right[parent[child]] : left[parent[child]];
                }
                const near = towardLeft ? left[sibling] : right[sibling];
                let far = towardLeft ? right[sibling] : left[sibling];
                if (!red[near] && !red[far]) {
                    red[sibling] = 1;
                    child = parent[child];
                } else {
                    if (!red[far]) {
                        red[near] = 0;
                        red[sibling] = 1;
                        rotate(sibling, !towardLeft);
                        sibling = towardLeft ? right[parent[child]] : left[parent[child]];
                        far = towardLeft ? right[sibling] : left[sibling];
                    }
                    red[sibling] = red[parent[child]];
                    red[parent[child]] = red[far] = 0;
                    rotate(parent[child], towardLeft);
                    child = root;
                }
            }
            red[child] = 0;
        }
        return node;
    };
    for (let node = 1; node < count; node++) {
        values[node] = blocks[node - 1][0];
        insert(node);
    }
    const result: number[] = [];
    for (;;) {
        if (!root) break;
        const node = pop();
        result.push(values[node]);
        const block = blocks[node - 1];
        if (++positions[node] < block.length) {
            values[node] = block[positions[node]];
            insert(node);
        }
    }
    return result;
}

export function getSortIndices(length: number, compare: (left: number, right: number) => number): number[] {
    const order = (left: number, right: number) => compare(left, right) || left - right;
    if (length <= 256) return sortRun(0, length, order);
    // Excel sorts natural runs in blocks, then merges block heads through a red-black tree.
    const size = length <= 16384 ? 128 : 1024;
    const blocks = Array.from({ length: Math.ceil(length / size) }, (_, block) => sortRun(block * size, Math.min((block + 1) * size, length), order));
    return mergeBlocks(blocks, order);
}

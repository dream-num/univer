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

/*! R-tree implementation adapted from rbush 4.0.1 (MIT). See THIRD-PARTY-NOTICES.txt. */

import { multiSelect } from './rbush-select';

export interface IBoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export type RBushNode<T> = IBoundingBox & { height: number } & (
    | { leaf: true; children: T[] }
    | { leaf: false; children: RBushNode<T>[] }
);

function createNode<T, L extends boolean>(children: T[], height: number, leaf: L) {
    return { children, height, leaf, minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
}

function extend(bounds: IBoundingBox, child: IBoundingBox) {
    bounds.minX = Math.min(bounds.minX, child.minX);
    bounds.minY = Math.min(bounds.minY, child.minY);
    bounds.maxX = Math.max(bounds.maxX, child.maxX);
    bounds.maxY = Math.max(bounds.maxY, child.maxY);
}

function contains(a: IBoundingBox, b: IBoundingBox) {
    return a.minX <= b.minX && a.minY <= b.minY && b.maxX <= a.maxX && b.maxY <= a.maxY;
}

function intersects(a: IBoundingBox, b: IBoundingBox) {
    return b.minX <= a.maxX && b.minY <= a.maxY && b.maxX >= a.minX && b.maxY >= a.minY;
}

function area(a: IBoundingBox) {
    return (a.maxX - a.minX) * (a.maxY - a.minY);
}

function margin(a: IBoundingBox) {
    return (a.maxX - a.minX) + (a.maxY - a.minY);
}

function nodeBounds(node: IBoundingBox) {
    return node;
}

function compareX(a: IBoundingBox, b: IBoundingBox) {
    return a.minX - b.minX;
}

function compareY(a: IBoundingBox, b: IBoundingBox) {
    return a.minY - b.minY;
}

function boundsOf<T>(children: T[], start: number, end: number, toBBox: (child: T) => IBoundingBox) {
    const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (let i = start; i < end; i++) {
        extend(bounds, toBBox(children[i]));
    }
    return bounds;
}

function updateBounds<T>(node: RBushNode<T>, toBBox: (child: T) => IBoundingBox) {
    node.minX = node.minY = Infinity;
    node.maxX = node.maxY = -Infinity;
    if (node.leaf) {
        for (const item of node.children) {
            extend(node, toBBox(item));
        }
    } else {
        for (const child of node.children) {
            extend(node, child);
        }
    }
}

// Sum the margins of every legal split along an axis, leaving the entries sorted along that axis.
function distributionMargin<T>(
    children: T[],
    minEntries: number,
    compare: (a: T, b: T) => number,
    toBBox: (child: T) => IBoundingBox
) {
    children.sort(compare);
    const lastSplit = children.length - minEntries;
    const left = boundsOf(children, 0, minEntries, toBBox);
    const right = boundsOf(children, lastSplit, children.length, toBBox);
    let sum = margin(left) + margin(right);
    for (let i = minEntries; i < lastSplit; i++) {
        extend(left, toBBox(children[i]));
        sum += margin(left);
    }
    for (let i = lastSplit - 1; i >= minEntries; i--) {
        extend(right, toBBox(children[i]));
        sum += margin(right);
    }
    return sum;
}

function splitChildren<T>(
    children: T[],
    minEntries: number,
    toBBox: (child: T) => IBoundingBox,
    compareMinX: (a: T, b: T) => number,
    compareMinY: (a: T, b: T) => number
) {
    const xMargin = distributionMargin(children, minEntries, compareMinX, toBBox);
    const yMargin = distributionMargin(children, minEntries, compareMinY, toBBox);
    if (xMargin < yMargin) {
        children.sort(compareMinX);
    }

    // Minimize overlap, breaking ties by total area.
    let index = children.length - minEntries;
    let minOverlap = Infinity;
    let minArea = Infinity;
    for (let i = minEntries; i <= children.length - minEntries; i++) {
        const left = boundsOf(children, 0, i, toBBox);
        const right = boundsOf(children, i, children.length, toBBox);
        const width = Math.min(left.maxX, right.maxX) - Math.max(left.minX, right.minX);
        const height = Math.min(left.maxY, right.maxY) - Math.max(left.minY, right.minY);
        const overlap = Math.max(0, width) * Math.max(0, height);
        const totalArea = area(left) + area(right);
        if (overlap < minOverlap) {
            minOverlap = overlap;
            minArea = totalArea < minArea ? totalArea : minArea;
            index = i;
        } else if (overlap === minOverlap && totalArea < minArea) {
            minArea = totalArea;
            index = i;
        }
    }
    return children.splice(index);
}

function collect<T>(root: RBushNode<T>, result: T[]) {
    const nodes = [root];
    while (nodes.length) {
        const node = nodes.pop()!;
        if (node.leaf) {
            result.push(...node.children);
        } else {
            nodes.push(...node.children);
        }
    }
    return result;
}

/** A dynamic spatial index for points and rectangles with inclusive edges. */
export class RBush<T = IBoundingBox> {
    private readonly _maxEntries: number;
    private readonly _minEntries: number;
    data: RBushNode<T>;

    constructor(maxEntries = 9) {
        this._maxEntries = Math.max(4, maxEntries);
        this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));
        this.data = createNode([], 1, true);
    }

    all(): T[] {
        return collect(this.data, []);
    }

    search(box: IBoundingBox): T[] {
        const result: T[] = [];
        if (!intersects(box, this.data)) {
            return result;
        }
        const nodes = [this.data];
        while (nodes.length) {
            const node = nodes.pop()!;
            if (node.leaf) {
                for (const item of node.children) {
                    if (intersects(box, this.toBBox(item))) {
                        result.push(item);
                    }
                }
            } else {
                for (const child of node.children) {
                    if (intersects(box, child)) {
                        if (contains(box, child)) {
                            collect(child, result);
                        } else {
                            nodes.push(child);
                        }
                    }
                }
            }
        }
        return result;
    }

    collides(box: IBoundingBox): boolean {
        if (!intersects(box, this.data)) {
            return false;
        }
        const nodes = [this.data];
        while (nodes.length) {
            const node = nodes.pop()!;
            if (node.leaf) {
                for (const item of node.children) {
                    if (intersects(box, this.toBBox(item))) {
                        return true;
                    }
                }
            } else {
                for (const child of node.children) {
                    if (intersects(box, child)) {
                        if (contains(box, child)) {
                            return true;
                        }
                        nodes.push(child);
                    }
                }
            }
        }
        return false;
    }

    load(items: readonly T[]): this {
        if (!items?.length) {
            return this;
        }
        if (items.length < this._minEntries) {
            for (const item of items) {
                this.insert(item);
            }
            return this;
        }

        let subtree = this._build(items.slice(), 0, items.length - 1, 0);
        if (!this.data.children.length) {
            this.data = subtree;
        } else if (this.data.height === subtree.height) {
            this._splitRoot(subtree);
        } else {
            if (this.data.height < subtree.height) {
                const previous = this.data;
                this.data = subtree;
                subtree = previous;
            }
            this._insert(subtree, subtree, this.data.height - subtree.height - 1);
        }
        return this;
    }

    insert(item: T): this {
        if (item) {
            this._insert(item, this.toBBox(item), this.data.height - 1);
        }
        return this;
    }

    clear(): this {
        this.data = createNode([], 1, true);
        return this;
    }

    remove(item: T, equals?: (a: T, b: T) => boolean): this {
        if (item && this._remove(this.data, item, this.toBBox(item), equals) && !this.data.children.length) {
            this.clear();
        }
        return this;
    }

    private _remove(node: RBushNode<T>, item: T, box: IBoundingBox, equals?: (a: T, b: T) => boolean): boolean {
        if (node.leaf) {
            const index = equals ? node.children.findIndex((candidate) => equals(item, candidate)) : node.children.indexOf(item);
            if (index === -1) {
                return false;
            }
            node.children.splice(index, 1);
        } else {
            if (!contains(node, box)) {
                return false;
            }
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                if (this._remove(child, item, box, equals)) {
                    if (!child.children.length) {
                        node.children.splice(i, 1);
                    }
                    updateBounds(node, this.toBBox);
                    return true;
                }
            }
            return false;
        }
        updateBounds(node, this.toBBox);
        return true;
    }

    toBBox(item: T): IBoundingBox {
        return item as IBoundingBox;
    }

    compareMinX(a: T, b: T): number {
        return compareX(a as IBoundingBox, b as IBoundingBox);
    }

    compareMinY(a: T, b: T): number {
        return compareY(a as IBoundingBox, b as IBoundingBox);
    }

    toJSON(): RBushNode<T> {
        return this.data;
    }

    /** Restore a previously exported tree without copying its nodes or rebuilding the index. */
    fromJSON(data: unknown): this {
        this.data = data as RBushNode<T>;
        return this;
    }

    // Pack the items into square tiles at each level using overlap-minimizing top-down bulk loading.
    private _build(items: T[], left: number, right: number, targetHeight: number): RBushNode<T> {
        let height = targetHeight;
        const count = right - left + 1;
        let capacity = this._maxEntries;
        if (count <= capacity) {
            const leaf = createNode(items.slice(left, right + 1), 1, true);
            updateBounds(leaf, this.toBBox);
            return leaf;
        }
        if (!height) {
            height = Math.ceil(Math.log(count) / Math.log(capacity));
            capacity = Math.ceil(count / capacity ** (height - 1));
        }

        const children: RBushNode<T>[] = [];
        const tileHeight = Math.ceil(count / capacity);
        const tileWidth = tileHeight * Math.ceil(Math.sqrt(capacity));
        multiSelect(items, left, right, tileWidth, this.compareMinX);
        for (let x = left; x <= right; x += tileWidth) {
            const endX = Math.min(x + tileWidth - 1, right);
            multiSelect(items, x, endX, tileHeight, this.compareMinY);
            for (let y = x; y <= endX; y += tileHeight) {
                children.push(this._build(items, y, Math.min(y + tileHeight - 1, endX), height - 1));
            }
        }
        const branch = createNode(children, height, false);
        updateBounds(branch, this.toBBox);
        return branch;
    }

    private _splitRoot(sibling: RBushNode<T>) {
        this.data = createNode([this.data, sibling], this.data.height + 1, false);
        updateBounds(this.data, this.toBBox);
    }

    private _insert(item: T | RBushNode<T>, box: IBoundingBox, level: number) {
        const parents: Array<Extract<RBushNode<T>, { leaf: false }>> = [];
        let node = this.data;
        while (!node.leaf && parents.length < level) {
            parents.push(node);
            extend(node, box);
            let best = node.children[0];
            let minArea = Infinity;
            let minEnlargement = Infinity;
            for (const child of node.children) {
                const childArea = area(child);
                const width = Math.max(box.maxX, child.maxX) - Math.min(box.minX, child.minX);
                const height = Math.max(box.maxY, child.maxY) - Math.min(box.minY, child.minY);
                const enlargement = width * height - childArea;
                if (enlargement < minEnlargement) {
                    best = child;
                    minEnlargement = enlargement;
                    minArea = childArea < minArea ? childArea : minArea;
                } else if (enlargement === minEnlargement && childArea < minArea) {
                    best = child;
                    minArea = childArea;
                }
            }
            node = best;
        }
        if (node.leaf) {
            node.children.push(item as T);
        } else {
            node.children.push(item as RBushNode<T>);
        }
        extend(node, box);

        while (node.children.length > this._maxEntries) {
            const current = node;
            const sibling: RBushNode<T> = current.leaf
                ? createNode(splitChildren(current.children, this._minEntries, this.toBBox, this.compareMinX, this.compareMinY), current.height, true)
                : createNode(splitChildren(current.children, this._minEntries, nodeBounds, compareX, compareY), current.height, false);
            updateBounds(current, this.toBBox);
            updateBounds(sibling, this.toBBox);
            const parent = parents.pop();
            if (!parent) {
                this._splitRoot(sibling);
                break;
            }
            parent.children.push(sibling);
            node = parent;
        }
    }
}

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

import { partitionSpatialGroups } from './spatial-partition';

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

function boundsOfNode(box: IBoundingBox) {
    return box;
}

function copyBounds({ minX, minY, maxX, maxY }: IBoundingBox): IBoundingBox {
    return { minX, minY, maxX, maxY };
}

function include(target: IBoundingBox, box: IBoundingBox) {
    target.minX = Math.min(target.minX, box.minX);
    target.minY = Math.min(target.minY, box.minY);
    target.maxX = Math.max(target.maxX, box.maxX);
    target.maxY = Math.max(target.maxY, box.maxY);
}

function fit<C>(target: IBoundingBox, entries: C[], bounds: (entry: C) => IBoundingBox) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const direct = bounds === boundsOfNode || bounds === RBush.prototype.toBBox;
    for (let i = 0; i < entries.length; i++) {
        const box = direct ? entries[i] as IBoundingBox : bounds(entries[i]);
        minX = Math.min(minX, box.minX);
        minY = Math.min(minY, box.minY);
        maxX = Math.max(maxX, box.maxX);
        maxY = Math.max(maxY, box.maxY);
    }
    target.minX = minX;
    target.minY = minY;
    target.maxX = maxX;
    target.maxY = maxY;
}

function makeNode<C, L extends boolean>(children: C[], height: number, leaf: L, bounds: (child: C) => IBoundingBox) {
    const node = { children, height, leaf, minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    fit(node, children, bounds);
    return node;
}

function covers(outer: IBoundingBox, inner: IBoundingBox) {
    return outer.minX <= inner.minX && outer.minY <= inner.minY && outer.maxX >= inner.maxX && outer.maxY >= inner.maxY;
}

function area(box: IBoundingBox) {
    return (box.maxX - box.minX) * (box.maxY - box.minY);
}

function span(box: IBoundingBox) {
    return (box.maxX - box.minX) + (box.maxY - box.minY);
}

function chooseChild<T>(children: RBushNode<T>[], box: IBoundingBox) {
    let best = children[0];
    let leastGrowth = Infinity;
    let leastArea = Infinity;
    const { minX, minY, maxX, maxY } = box;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const width = Math.max(child.maxX, maxX) - Math.min(child.minX, minX);
        const height = Math.max(child.maxY, maxY) - Math.min(child.minY, minY);
        const existingArea = area(child);
        const growth = width * height - existingArea;
        if (growth < leastGrowth || (growth === leastGrowth && existingArea < leastArea)) {
            best = child;
            leastGrowth = growth;
            if (existingArea < leastArea) {
                leastArea = existingArea;
            }
        }
    }
    return best;
}

function groupMargin<C>(entries: C[], minimum: number, bounds: (entry: C) => IBoundingBox) {
    const last = entries.length - 1;
    const left = copyBounds(bounds(entries[0]));
    const right = copyBounds(bounds(entries[last]));
    for (let i = 1; i < minimum; i++) {
        include(left, bounds(entries[i]));
        include(right, bounds(entries[last - i]));
    }
    let total = span(left) + span(right);
    for (let i = minimum; i <= last - minimum; i++) {
        include(left, bounds(entries[i]));
        total += span(left);
    }
    for (let i = last - minimum; i >= minimum; i--) {
        include(right, bounds(entries[i]));
        total += span(right);
    }
    return total;
}

function orderPage<C>(entries: C[], compare: (a: C, b: C) => number, numeric: boolean) {
    if (!numeric || entries.length > 16) {
        entries.sort(compare);
        return;
    }
    // Overflowing pages usually hold ten entries. A stable insertion sort orders them in place.
    for (let i = 1; i < entries.length; i++) {
        const entry = entries[i];
        let j = i;
        while (j > 0 && compare(entries[j - 1], entry) > 0) {
            entries[j] = entries[j - 1];
            j--;
        }
        entries[j] = entry;
    }
}

function splitPage<C>(
    entries: C[],
    minimum: number,
    bounds: (item: C) => IBoundingBox,
    compareX: (a: C, b: C) => number,
    compareY: (a: C, b: C) => number,
    numeric: boolean
) {
    // The second stable sort retains X order for tied Y coordinates and vice versa.
    orderPage(entries, compareX, numeric);
    const xMargin = groupMargin(entries, minimum, bounds);
    orderPage(entries, compareY, numeric);
    if (xMargin < groupMargin(entries, minimum, bounds)) {
        orderPage(entries, compareX, numeric);
    }

    // Cache the right-hand bounds at each cut. The left-hand bounds only grow as the cut moves.
    const end = entries.length - minimum;
    const suffix: IBoundingBox[] = [];
    let right = copyBounds(bounds(entries[entries.length - 1]));
    for (let i = entries.length - 2; i >= minimum; i--) {
        if (i < end) {
            right = copyBounds(right);
        }
        include(right, bounds(entries[i]));
        if (i <= end) {
            suffix[i] = right;
        }
    }
    const left = copyBounds(bounds(entries[0]));
    let best = end;
    let leastOverlap = Infinity;
    let leastArea = Infinity;
    for (let i = 1; i <= end; i++) {
        if (i > 1) {
            include(left, bounds(entries[i - 1]));
        }
        if (i < minimum) {
            continue;
        }
        right = suffix[i];
        const width = Math.min(left.maxX, right.maxX) - Math.max(left.minX, right.minX);
        const height = Math.min(left.maxY, right.maxY) - Math.max(left.minY, right.minY);
        const overlap = Math.max(0, width) * Math.max(0, height);
        const totalArea = area(left) + area(right);
        if (overlap < leastOverlap || (overlap === leastOverlap && totalArea < leastArea)) {
            best = i;
            leastOverlap = overlap;
            if (totalArea < leastArea) {
                leastArea = totalArea;
            }
        }
    }
    return entries.splice(best);
}

/** Rectangle index with inclusive edges. Query results follow the tree's spatial layout. */
export class RBush<T = IBoundingBox> {
    private readonly _capacity: number;
    private readonly _minimum: number;
    data!: RBushNode<T>;

    constructor(maxEntries = 9) {
        this._capacity = Math.max(4, maxEntries);
        this._minimum = Math.max(2, Math.ceil(this._capacity * 0.4));
        this.clear();
    }

    toBBox(item: T): IBoundingBox {
        return item as IBoundingBox;
    }

    compareMinX(a: T, b: T) {
        return (a as IBoundingBox).minX - (b as IBoundingBox).minX;
    }

    compareMinY(a: T, b: T) {
        return (a as IBoundingBox).minY - (b as IBoundingBox).minY;
    }

    private _collect(page: RBushNode<T>, items: T[]) {
        if (page.leaf) {
            for (let i = 0; i < page.children.length; i++) {
                items.push(page.children[i]);
            }
        } else {
            for (let i = page.children.length - 1; i >= 0; i--) {
                this._collect(page.children[i], items);
            }
        }
    }

    private _query(box: IBoundingBox, items?: T[]): boolean {
        const { minX, minY, maxX, maxY } = box;
        const root = this.data;
        if (!(root.minX <= maxX && root.maxX >= minX && root.minY <= maxY && root.maxY >= minY)) {
            return false;
        }
        const pending = [root];
        while (pending.length) {
            const page = pending.pop()!;
            if (page.leaf) {
                const entries = page.children;
                for (let i = 0; i < entries.length; i++) {
                    const entry = entries[i];
                    const bounds = this.toBBox(entry);
                    if (bounds.minX <= maxX && bounds.maxX >= minX && bounds.minY <= maxY && bounds.maxY >= minY) {
                        if (!items) {
                            return true;
                        }
                        items.push(entry);
                    }
                }
            } else {
                const children = page.children;
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    if (child.minX <= maxX && child.maxX >= minX && child.minY <= maxY && child.maxY >= minY) {
                        if (minX <= child.minX && minY <= child.minY && maxX >= child.maxX && maxY >= child.maxY) {
                            if (!items) {
                                return true;
                            }
                            this._collect(child, items);
                        } else {
                            pending.push(child);
                        }
                    }
                }
            }
        }
        return false;
    }

    all(): T[] {
        const items: T[] = [];
        this._collect(this.data, items);
        return items;
    }

    search(box: IBoundingBox): T[] {
        const items: T[] = [];
        this._query(box, items);
        return items;
    }

    collides(box: IBoundingBox): boolean {
        return this._query(box);
    }

    load(items: readonly T[]): this {
        if (!items?.length) {
            return this;
        }
        if (items.length < this._minimum) {
            for (let i = 0; i < items.length; i++) {
                this.insert(items[i]);
            }
            return this;
        }
        const height = Math.ceil(Math.log(items.length) / Math.log(this._capacity));
        const fanout = Math.ceil(items.length / this._capacity ** (height - 1));
        const packed = this._pack(items.slice(), 0, items.length - 1, height, fanout);
        if (!this.data.children.length) {
            this.data = packed;
        } else if (this.data.height === packed.height) {
            this.data = makeNode([this.data, packed], packed.height + 1, false, boundsOfNode);
        } else {
            const [taller, shorter] = this.data.height > packed.height ? [this.data, packed] : [packed, this.data];
            this.data = taller;
            this._append(shorter, shorter, shorter.height + 1);
        }
        return this;
    }

    private _pack(items: T[], begin: number, end: number, height: number, fanout: number): RBushNode<T> {
        const size = end - begin + 1;
        if (size <= this._capacity) {
            return makeNode(items.slice(begin, end + 1), 1, true, this.toBBox);
        }
        const pageSize = Math.ceil(size / fanout);
        const stripSize = pageSize * Math.ceil(Math.sqrt(fanout));
        partitionSpatialGroups(items, begin, end, stripSize, this.compareMinX);
        const pages: RBushNode<T>[] = [];
        for (let strip = begin; strip <= end; strip += stripSize) {
            const last = Math.min(strip + stripSize - 1, end);
            partitionSpatialGroups(items, strip, last, pageSize, this.compareMinY);
            for (let offset = strip; offset <= last; offset += pageSize) {
                pages.push(this._pack(items, offset, Math.min(offset + pageSize - 1, last), height - 1, this._capacity));
            }
        }
        return makeNode(pages, height, false, boundsOfNode);
    }

    insert(item: T): this {
        if (item) {
            this._append(item, this.toBBox(item), 1);
        }
        return this;
    }

    private _append(entry: T | RBushNode<T>, box: IBoundingBox, height: number) {
        const level = this.data.height - height;
        const path = [this.data];
        let page = this.data;
        while (!page.leaf && path.length <= level) {
            page = chooseChild(page.children, box);
            path.push(page);
        }
        if (page.leaf) {
            page.children.push(entry as T);
        } else {
            page.children.push(entry as RBushNode<T>);
        }
        include(page, box);

        // Propagate each new sibling to its parent until it fits.
        for (let depth = level; depth >= 0; depth--) {
            page = path[depth];
            if (page.children.length <= this._capacity) {
                for (let i = Math.min(depth, level - 1); i >= 0; i--) {
                    include(path[i], box);
                }
                return;
            }
            let sibling: RBushNode<T>;
            if (page.leaf) {
                // Unordered coordinates and custom comparators retain native sort semantics.
                const numeric = !Number.isNaN(page.minX) && !Number.isNaN(page.minY);
                const bounds = this.toBBox;
                const defaultOrder = this.compareMinX === RBush.prototype.compareMinX && this.compareMinY === RBush.prototype.compareMinY;
                const rest = splitPage(page.children, this._minimum, bounds, this.compareMinX, this.compareMinY, numeric && defaultOrder);
                sibling = makeNode(rest, 1, true, bounds);
            } else {
                const rest = splitPage(page.children, this._minimum, boundsOfNode, (a, b) => a.minX - b.minX, (a, b) => a.minY - b.minY, false);
                sibling = makeNode(rest, page.height, false, boundsOfNode);
            }
            this._refit(page);
            if (depth === 0) {
                this.data = makeNode([page, sibling], page.height + 1, false, boundsOfNode);
                return;
            }
            const parent = path[depth - 1];
            if (!parent.leaf) {
                parent.children.push(sibling);
            }
        }
    }

    private _refit(page: RBushNode<T>) {
        if (page.leaf) {
            fit(page, page.children, this.toBBox);
        } else {
            fit(page, page.children, boundsOfNode);
        }
    }

    remove(item: T, equals?: (a: T, b: T) => boolean): this {
        if (item && this._erase(this.data, this.toBBox(item), item, equals) && !this.data.children.length) {
            this.clear();
        }
        return this;
    }

    private _erase(page: RBushNode<T>, box: IBoundingBox, item: T, equals?: (a: T, b: T) => boolean): boolean {
        if (page.leaf) {
            const at = equals ? page.children.findIndex((candidate) => equals(item, candidate)) : page.children.indexOf(item);
            if (at < 0) {
                return false;
            }
            page.children.splice(at, 1);
        } else {
            if (!covers(page, box)) {
                return false;
            }
            const children = page.children;
            let i = 0;
            while (i < children.length && !this._erase(children[i], box, item, equals)) {
                i++;
            }
            if (i === children.length) {
                return false;
            }
            if (!children[i].children.length) {
                children.splice(i, 1);
            }
        }
        if (page.children.length) {
            this._refit(page);
        }
        return true;
    }

    clear(): this {
        this.data = makeNode([], 1, true, this.toBBox);
        return this;
    }

    toJSON(): RBushNode<T> {
        return this.data;
    }

    fromJSON(data: unknown): this {
        this.data = data as RBushNode<T>;
        return this;
    }
}

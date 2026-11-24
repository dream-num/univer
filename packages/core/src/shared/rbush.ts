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

function include(target: IBoundingBox, box: IBoundingBox) {
    target.minX = Math.min(target.minX, box.minX);
    target.minY = Math.min(target.minY, box.minY);
    target.maxX = Math.max(target.maxX, box.maxX);
    target.maxY = Math.max(target.maxY, box.maxY);
}

function makeNode<C, L extends boolean>(children: C[], height: number, leaf: L, bounds: (child: C) => IBoundingBox) {
    const node = { children, height, leaf, minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (const child of children) {
        include(node, bounds(child));
    }
    return node;
}

function overlaps(a: IBoundingBox, b: IBoundingBox) {
    return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

function covers(outer: IBoundingBox, inner: IBoundingBox) {
    return outer.minX <= inner.minX && outer.minY <= inner.minY && outer.maxX >= inner.maxX && outer.maxY >= inner.maxY;
}

// Group nearby coordinates in linear time. Entries in the same bin need no further ordering.
function orderByAxis<T>(items: readonly T[], bounds: (item: T) => IBoundingBox, horizontal: boolean): T[] {
    const coordinate = horizontal ? (box: IBoundingBox) => box.minX : (box: IBoundingBox) => box.minY;
    let min = Infinity;
    let max = -Infinity;
    for (const item of items) {
        const value = coordinate(bounds(item));
        if (Number.isFinite(value)) {
            min = Math.min(min, value);
            max = Math.max(max, value);
        }
    }
    if (!(max > min)) {
        return items.slice();
    }
    const last = Math.min(16383, items.length);
    const counts = new Uint32Array(last + 1);
    const bins = new Uint16Array(items.length);
    const scale = last / (max - min);
    for (let i = 0; i < items.length; i++) {
        const value = coordinate(bounds(items[i]));
        const bin = Math.max(0, Math.min(last, (value - min) * scale)) | 0;
        bins[i] = bin;
        counts[bin]++;
    }
    let offset = 0;
    for (let bin = 0; bin < counts.length; bin++) {
        const size = counts[bin];
        counts[bin] = offset;
        offset += size;
    }
    const ordered = new Array<T>(items.length);
    for (let i = 0; i < items.length; i++) {
        ordered[counts[bins[i]]++] = items[i];
    }
    return ordered;
}

function packLevel<C, L extends boolean>(
    items: readonly C[],
    capacity: number,
    height: number,
    leaf: L,
    bounds: (item: C) => IBoundingBox
) {
    if (items.length <= capacity) {
        return [makeNode(items.slice(), height, leaf, bounds)];
    }
    // Each level has vertical strips, each subdivided into pages in row order.
    const width = capacity * Math.ceil(Math.sqrt(items.length / capacity));
    const columns = orderByAxis(items, bounds, true);
    const pages = [];
    for (let x = 0; x < items.length; x += width) {
        const strip = orderByAxis(columns.slice(x, x + width), bounds, false);
        for (let y = 0; y < strip.length; y += capacity) {
            pages.push(makeNode(strip.slice(y, y + capacity), height, leaf, bounds));
        }
    }
    return pages;
}

function chooseChild<T>(children: RBushNode<T>[], box: IBoundingBox) {
    let best = children[0];
    let bestGrowth = Infinity;
    let bestSpan = Infinity;
    for (const child of children) {
        const growth = Math.max(0, child.minX - box.minX) + Math.max(0, box.maxX - child.maxX)
            + Math.max(0, child.minY - box.minY) + Math.max(0, box.maxY - child.maxY);
        const span = child.maxX - child.minX + (child.maxY - child.minY);
        if (growth < bestGrowth || (growth === bestGrowth && span < bestSpan)) {
            best = child;
            bestGrowth = growth;
            bestSpan = span;
        }
    }
    return best;
}

function widestGap<C>(order: C[], bounds: (item: C) => IBoundingBox, horizontal: boolean) {
    const minimum = Math.ceil(order.length / 3);
    let index = Math.floor(order.length / 2);
    let gap = -Infinity;
    let edge = -Infinity;
    for (let i = 1; i <= order.length - minimum; i++) {
        const previous = bounds(order[i - 1]);
        edge = Math.max(edge, horizontal ? previous.maxX : previous.maxY);
        if (i >= minimum) {
            const next = bounds(order[i]);
            const distance = (horizontal ? next.minX : next.minY) - edge;
            if (distance > gap) {
                index = i;
                gap = distance;
            }
        }
    }
    return { index, gap };
}

function splitPage<C>(
    entries: C[],
    bounds: (item: C) => IBoundingBox,
    compareX: (a: C, b: C) => number,
    compareY: (a: C, b: C) => number
) {
    // Pick the widest gap between adjacent groups, keeping both pages at least a third full.
    const xOrder = entries.slice().sort(compareX);
    const x = widestGap(xOrder, bounds, true);
    entries.sort(compareY);
    const y = widestGap(entries, bounds, false);
    if (x.gap > y.gap) {
        entries.length = x.index;
        for (let i = 0; i < x.index; i++) {
            entries[i] = xOrder[i];
        }
        return xOrder.slice(x.index);
    }
    return entries.splice(y.index);
}

/** Rectangle index with inclusive edges. Query results follow the tree's spatial layout. */
export class RBush<T = IBoundingBox> {
    private readonly _capacity: number;
    data: RBushNode<T> = makeNode([], 1, true, this.toBBox);

    constructor(maxEntries = 9) {
        this._capacity = Math.max(4, Math.floor(maxEntries) || 9);
    }

    toBBox(item: T): IBoundingBox {
        return item as IBoundingBox;
    }

    compareMinX(a: T, b: T) {
        return this.toBBox(a).minX - this.toBBox(b).minX;
    }

    compareMinY(a: T, b: T) {
        return this.toBBox(a).minY - this.toBBox(b).minY;
    }

    private _collect(page: RBushNode<T>, items: T[]) {
        if (page.leaf) {
            for (const item of page.children) {
                items.push(item);
            }
        } else {
            for (const child of page.children) {
                this._collect(child, items);
            }
        }
    }

    private _query(box: IBoundingBox, items?: T[]): boolean {
        if (!overlaps(this.data, box)) {
            return false;
        }
        const pending = [this.data];
        while (pending.length) {
            const page = pending.pop()!;
            if (covers(box, page) && page.children.length) {
                if (!items) {
                    return true;
                }
                this._collect(page, items);
            } else if (page.leaf) {
                for (const item of page.children) {
                    if (overlaps(this.toBBox(item), box)) {
                        if (!items) {
                            return true;
                        }
                        items.push(item);
                    }
                }
            } else {
                for (const child of page.children) {
                    if (overlaps(child, box)) {
                        pending.push(child);
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
        if (this.data.children.length && items.length <= this._capacity) {
            for (const item of items) {
                this.insert(item);
            }
            return this;
        }
        const bounds = (item: T) => this.toBBox(item);
        let level: RBushNode<T>[] = packLevel(items, this._capacity, 1, true, bounds);
        while (level.length > 1) {
            level = packLevel(level, this._capacity, level[0].height + 1, false, boundsOfNode);
        }

        const packed = level[0];
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

    insert(item: T): this {
        if (item) {
            this._append(item, this.toBBox(item), 1);
        }
        return this;
    }

    private _append(entry: T | RBushNode<T>, box: IBoundingBox, height: number) {
        const ancestors: Array<Extract<RBushNode<T>, { leaf: false }>> = [];
        let page = this.data;
        while (!page.leaf && page.height > height) {
            ancestors.push(page);
            include(page, box);
            page = chooseChild(page.children, box);
        }
        if (page.leaf) {
            page.children.push(entry as T);
        } else {
            page.children.push(entry as RBushNode<T>);
        }
        include(page, box);

        // Propagate each new sibling to its parent until it fits.
        while (page.children.length > this._capacity) {
            let sibling: RBushNode<T>;
            if (page.leaf) {
                const bounds = (item: T) => this.toBBox(item);
                const rest = splitPage(page.children, bounds, (a, b) => this.compareMinX(a, b), (a, b) => this.compareMinY(a, b));
                sibling = makeNode(rest, 1, true, bounds);
            } else {
                const rest = splitPage(page.children, boundsOfNode, (a, b) => a.minX - b.minX, (a, b) => a.minY - b.minY);
                sibling = makeNode(rest, page.height, false, boundsOfNode);
            }
            this._refit(page);
            const parent = ancestors.pop();
            if (!parent) {
                this.data = makeNode([page, sibling], page.height + 1, false, boundsOfNode);
                return;
            }
            parent.children.push(sibling);
            page = parent;
        }
    }

    private _refit(page: RBushNode<T>) {
        page.minX = page.minY = Infinity;
        page.maxX = page.maxY = -Infinity;
        if (page.leaf) {
            for (const item of page.children) {
                include(page, this.toBBox(item));
            }
        } else {
            for (const child of page.children) {
                include(page, child);
            }
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
            const at = page.children.findIndex((child) => covers(child, box) && this._erase(child, box, item, equals));
            if (at < 0) {
                return false;
            }
            if (!page.children[at].children.length) {
                page.children.splice(at, 1);
            }
        }
        // Removing an interior entry leaves the page bounds intact. A custom equality
        // function can match an entry with different coordinates from the lookup box.
        if (equals || !page.children.length || box.minX === page.minX || box.maxX === page.maxX
            || box.minY === page.minY || box.maxY === page.maxY) {
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

    fromJSON(data: RBushNode<T>): this {
        this.data = data;
        return this;
    }
}

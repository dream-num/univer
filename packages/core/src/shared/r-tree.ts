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

import type { BBox } from 'rbush';
import KDBush from 'kdbush';
import RBush from 'rbush';
import type { IUnitRange } from '../sheets/typedef';

type StringOrNumber = string | number;

export interface IRTreeItem extends IUnitRange {
    id: StringOrNumber;
}

interface IRBushItem extends BBox {
    id: StringOrNumber;
}

interface IRBushNode extends BBox {
    children: (IRBushNode | IRBushItem)[];
    leaf: boolean;
}

interface IRdTreeItem {
    x: number;
    y: number;
    ids: Set<StringOrNumber>;
}

export interface IRTreeData {
    [unitId: string]: {
        [subUnitId: string]: IRTreeItem[];
    };
}

export class RTree {
    private _tree: Map<string, Map<string, RBush<IRBushItem>>> = new Map();

    // unitId -> subUnitId -> row -> column -> ids
    private _oneCellCache = new Map<string, Map<string, Map<number, Map<number, Set<StringOrNumber>>>>>();

    private _kdTree: Map<string, Map<string, { tree: KDBush; items: IRdTreeItem[] } | undefined>> = new Map();

    constructor(private _enableOneCellCache = false) {

    }

    dispose() {
        this.clear();
    }

    getTree(unitId: string, subUnitId: string): RBush<IRBushItem> {
        if (!this._tree.has(unitId)) {
            this._tree.set(unitId, new Map());
        }
        if (!this._tree.get(unitId)!.has(subUnitId)) {
            this._tree.get(unitId)!.set(subUnitId, new RBush());
        }

        return this._tree.get(unitId)!.get(subUnitId)!;
    }

    private _getOneCellCache(unitId: string, subUnitId: string, row: number, column: number): Set<StringOrNumber> {
        if (!this._oneCellCache.has(unitId)) {
            this._oneCellCache.set(unitId, new Map());
        }
        if (!this._oneCellCache.get(unitId)!.has(subUnitId)) {
            this._oneCellCache.get(unitId)!.set(subUnitId, new Map());
        }
        if (!this._oneCellCache.get(unitId)!.get(subUnitId)!.has(row)) {
            this._oneCellCache.get(unitId)!.get(subUnitId)!.set(row, new Map());
        }
        if (!this._oneCellCache.get(unitId)!.get(subUnitId)!.get(row)!.has(column)) {
            this._oneCellCache.get(unitId)!.get(subUnitId)!.get(row)!.set(column, new Set());
        }

        return this._oneCellCache.get(unitId)!.get(subUnitId)!.get(row)!.get(column)!;
    }

    private _removeOneCellCache(unitId: string, subUnitId: string, row: number, column: number, id: StringOrNumber) {
        const unitCache = this._oneCellCache.get(unitId);
        if (!unitCache) return;

        const subUnitCache = unitCache.get(subUnitId);
        if (!subUnitCache) return;

        const rowCache = subUnitCache.get(row);
        if (!rowCache) return;

        const cellCache = rowCache.get(column);
        if (!cellCache) return;

        cellCache.delete(id);
    }

    private _removeCellCacheByRange(search: IRTreeItem) {
        const { unitId, sheetId: subUnitId, range, id } = search;

        const unitCache = this._oneCellCache.get(unitId);
        if (!unitCache) return;

        const subUnitCache = unitCache.get(subUnitId);
        if (!subUnitCache) return;

        const { startRow, startColumn, endRow, endColumn } = range;

        for (let row = startRow; row <= endRow; row++) {
            const rowCache = subUnitCache.get(row);
            if (!rowCache) continue;

            for (let column = startColumn; column <= endColumn; column++) {
                const cellCache = rowCache.get(column);
                if (!cellCache) continue;

                cellCache.delete(id);
            }
        }
    }

    private _insertOneCellCache(unitId: string, subUnitId: string, row: number, column: number, id: StringOrNumber) {
        this._getOneCellCache(unitId, subUnitId, row, column).add(id);
    }

    private _getRdTreeItems(map: Map<number, Map<number, Set<StringOrNumber>>>) {
        const items: IRdTreeItem[] = [];

        for (const [y, innerMap] of map) {
            for (const [x, ids] of innerMap) {
                items.push({
                    x,
                    y,
                    ids,
                });
            }
        }

        return items;
    }

    private _searchByOneCellCache(search: IUnitRange): StringOrNumber[] {
        const { unitId, sheetId: subUnitId, range } = search;
        const { startRow, startColumn, endRow, endColumn } = range;
        const searchObject = this._kdTree.get(unitId)?.get(subUnitId);
        if (!searchObject) {
            return [];
        }

        const { tree, items } = searchObject;

        const indexes = tree.range(startColumn, startRow, endColumn, endRow);

        const result: StringOrNumber[] = [];

        for (const index of indexes) {
            const item = items[index];
            result.push(...Array.from(item.ids));
        }

        return result;
    }

    /**
     * Open the kd-tree search state.
     * The kd-tree is used to search for data in a single cell.
     */
    openKdTree() {
        for (const [unitId, map1] of this._oneCellCache) {
            if (!this._kdTree.has(unitId)) {
                this._kdTree.set(unitId, new Map());
            }
            for (const [subUnitId, map2] of map1) {
                const items = this._getRdTreeItems(map2);
                const tree = new KDBush(items.length);
                this._kdTree.get(unitId)?.set(subUnitId, {
                    tree,
                    items,
                });
                for (const item of items) {
                    tree.add(item.x, item.y);
                }
                tree.finish();
            }
        }
    }

    closeKdTree() {
        for (const [unitId, map1] of this._oneCellCache) {
            for (const [subUnitId, map2] of map1) {
                this._kdTree.get(unitId)?.set(subUnitId, undefined);
            }
        }
    }

    insert(item: IRTreeItem) {
        const { unitId, sheetId: subUnitId, range, id } = item;

        if (!unitId || unitId.length === 0) {
            return;
        }

        let { startRow: rangeStartRow, endRow: rangeEndRow, startColumn: rangeStartColumn, endColumn: rangeEndColumn } = range;

        if (this._enableOneCellCache && rangeStartRow === rangeEndRow && rangeStartColumn === rangeEndColumn) {
            this._insertOneCellCache(unitId, subUnitId, rangeStartRow, rangeStartColumn, id);
            return;
        }

        const tree = this.getTree(unitId, subUnitId);

        if (Number.isNaN(rangeStartRow)) {
            rangeStartRow = 0;
        }
        if (Number.isNaN(rangeStartColumn)) {
            rangeStartColumn = 0;
        }
        if (Number.isNaN(rangeEndRow)) {
            rangeEndRow = Number.POSITIVE_INFINITY;
        }
        if (Number.isNaN(rangeEndColumn)) {
            rangeEndColumn = Number.POSITIVE_INFINITY;
        }

        tree.insert({
            minX: rangeStartColumn,
            minY: rangeStartRow,
            maxX: rangeEndColumn,
            maxY: rangeEndRow,
            id,
        });
    }

    bulkInsert(items: IRTreeItem[]) {
        for (const item of items) {
            this.insert(item);
        }
    }

    * searchGenerator(search: IUnitRange): IterableIterator<StringOrNumber> {
        const { unitId, sheetId: subUnitId, range } = search;

        if (this._enableOneCellCache) {
            const oneCellResults = this._searchByOneCellCache(search);
            for (const result of oneCellResults) {
                yield result;
            }
        }

        const tree = this._tree.get(unitId)?.get(subUnitId);
        if (!tree) {
            return;
        }

        const searchData = tree.search({
            minX: range.startColumn,
            minY: range.startRow,
            maxX: range.endColumn,
            maxY: range.endRow,
        }) as unknown as IRTreeItem[];

        for (const item of searchData) {
            yield item.id;
        }
    }

    bulkSearch(searchList: IUnitRange[], exceptTreeIds?: Set<number>): Set<StringOrNumber> {
        const result = new Set<StringOrNumber>();
        for (const search of searchList) {
            for (const item of this.searchGenerator(search)) {
                if (exceptTreeIds?.has(item as number) === true) {
                    continue;
                }
                result.add(item);
            }
        }
        return result;
    }

    removeById(unitId: string, subUnitId?: string) {
        if (subUnitId) {
            this._tree.get(unitId)?.delete(subUnitId);
            this._oneCellCache.get(unitId)?.delete(subUnitId);
        } else {
            this._tree.delete(unitId);
            this._oneCellCache.delete(unitId);
        }
    }

    private _removeRTreeItem(search: IRTreeItem) {
        const { unitId, sheetId: subUnitId, range, id } = search;
        const tree = this._tree.get(unitId)?.get(subUnitId);
        if (!tree) return;

        const items = tree.search({
            minX: range.startColumn,
            minY: range.startRow,
            maxX: range.endColumn,
            maxY: range.endRow,
        });

        for (let i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                tree.remove(items[i]);
            }
        }
    }

    remove(search: IRTreeItem) {
        const { unitId, sheetId: subUnitId, range, id } = search;
        const { startRow, startColumn, endRow, endColumn } = range;
        if (this._enableOneCellCache) {
            if (startRow === endRow && startColumn === endColumn) {
                this._removeOneCellCache(unitId, subUnitId, range.startRow, range.startColumn, id);
            } else {
                this._removeCellCacheByRange(search);
                this._removeRTreeItem(search);
            }
        } else {
            this._removeRTreeItem(search);
        }
    }

    bulkRemove(searchList: IRTreeItem[]) {
        if (searchList.length < 2) {
            for (const search of searchList) {
                this.remove(search);
            }
            return;
        }
        const groups = new Map<string, Map<string, Map<StringOrNumber, IRTreeItem[]>>>();
        for (const search of searchList) {
            let sheets = groups.get(search.unitId);
            if (!sheets) {
                sheets = new Map();
                groups.set(search.unitId, sheets);
            }
            let ids = sheets.get(search.sheetId);
            if (!ids) {
                ids = new Map();
                sheets.set(search.sheetId, ids);
            }
            const ranges = ids.get(search.id);
            if (ranges) {
                ranges.push(search);
            } else {
                ids.set(search.id, [search]);
            }
        }
        for (const [unitId, sheets] of groups) {
            for (const [sheetId, ids] of sheets) {
                if (!this._removeSparseRanges(unitId, sheetId, ids)) {
                    this._bulkRemoveFromSheet(unitId, sheetId, ids);
                }
            }
        }
    }

    private _bulkRemoveFromSheet(unitId: string, sheetId: string, searches: Map<StringOrNumber, IRTreeItem[]>) {
        if (searches.size === 1) {
            const [ranges] = searches.values();
            if (ranges.length === 1) {
                this.remove(ranges[0]);
                return;
            }
        }
        // With the point cache enabled, remove() treats point searches as point-cache-only removals.
        const matches = (id: StringOrNumber, bounds: BBox, rangedOnly = false) => searches.get(id)?.some(({ range }) =>
            (!rangedOnly || !this._enableOneCellCache || range.startRow !== range.endRow || range.startColumn !== range.endColumn) &&
            range.startColumn <= bounds.maxX && range.endColumn >= bounds.minX &&
            range.startRow <= bounds.maxY && range.endRow >= bounds.minY
        ) ?? false;
        const tree = this._tree.get(unitId)?.get(sheetId);
        if (tree) {
            const entries = tree.all();
            let retained = 0;
            for (const item of entries) {
                if (!matches(item.id, item, true)) {
                    entries[retained++] = item;
                }
            }
            if (retained !== entries.length) {
                entries.length = retained;
                tree.clear();
                tree.load(entries);
            }
        }
        const cells = this._oneCellCache.get(unitId)?.get(sheetId);
        if (cells) {
            for (const [row, columns] of cells) {
                for (const [column, ids] of columns) {
                    const bounds = { minX: column, maxX: column, minY: row, maxY: row };
                    for (const id of ids) {
                        if (matches(id, bounds)) {
                            ids.delete(id);
                        }
                    }
                }
            }
        }
    }

    private _removeSparseRanges(unitId: string, sheetId: string, searches: Map<StringOrNumber, IRTreeItem[]>) {
        // Probe a bounded number of candidates without allocating a full-tree snapshot.
        let remaining = 128;
        if (searches.size > remaining) return false;
        const visit = (node: IRBushNode, range: IUnitRange['range']): boolean => {
            if (--remaining < 0) return false;
            if (!node.leaf && range.startColumn <= node.minX && range.endColumn >= node.maxX &&
                range.startRow <= node.minY && range.endRow >= node.maxY) {
                return false;
            }
            for (const child of node.children) {
                if (range.startColumn <= child.maxX && range.endColumn >= child.minX &&
                    range.startRow <= child.maxY && range.endRow >= child.minY) {
                    if (node.leaf) {
                        if (--remaining < 0) return false;
                    } else if (!visit(child as IRBushNode, range)) {
                        return false;
                    }
                }
            }
            return true;
        };
        const tree = this._tree.get(unitId)?.get(sheetId);
        const root = tree?.toJSON() as IRBushNode | undefined;
        const cells = this._oneCellCache.get(unitId)?.get(sheetId);
        for (const [id, ranges] of searches) {
            if (Number.isNaN(id)) return false;
            for (const { range } of ranges) {
                if (--remaining < 0) return false;
                if (this._enableOneCellCache) {
                    if (range.startRow === range.endRow && range.startColumn === range.endColumn) continue;
                    // Ranged cache removal must visit stored coordinates, including sparse and fractional keys.
                    if (cells) return false;
                }
                if (root && !visit(root, range)) return false;
            }
        }
        for (const ranges of searches.values()) {
            for (const search of ranges) {
                this.remove(search);
            }
        }
        return true;
    }

    clear() {
        this._tree.clear();
        this._oneCellCache.clear();
    }

    toJSON() {
        const result: IRTreeData = {};
        this._tree.forEach((subTree, unitId) => {
            result[unitId] = {};
            subTree.forEach((tree, subUnitId) => {
                result[unitId][subUnitId] = tree.toJSON();
            });
        });

        return result;
    }

    fromJSON(data: IRTreeData) {
        this._tree.clear();
        for (const unitId in data) {
            this._tree.set(unitId, new Map());
            for (const subUnitId in data[unitId]) {
                const tree = new RBush<IRBushItem>();
                tree.fromJSON(data[unitId][subUnitId]);
                this._tree.get(unitId)!.set(subUnitId, tree);
            }
        }
    }
}

export { type BBox, RBush };

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
import type { IUnitRange } from '../sheets/typedef';
import KDBush from 'kdbush';
import RBush from 'rbush';

type StringOrNumber = string | number;

export interface IRTreeItem extends IUnitRange {
    id: StringOrNumber;
}

interface IRBushItem extends BBox {
    id: StringOrNumber;
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
        const tree = this.getTree(unitId, subUnitId);

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
        for (const search of searchList) {
            this.remove(search);
        }
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

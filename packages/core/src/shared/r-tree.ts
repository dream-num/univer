/**
 * Copyright 2023-present DreamNum Inc.
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
import RBush from 'rbush';

export interface IRTreeItem extends IUnitRange {
    id: string;
}

interface IRBushItem extends BBox {
    id: string;
}

export interface IRTreeData {
    [unitId: string]: {
        [subUnitId: string]: IRTreeItem[];
    };
}

export class RTree {
    private _tree: Map<string, Map<string, RBush<IRBushItem>>> = new Map();

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

    insert(item: IRTreeItem) {
        const { unitId, sheetId: subUnitId, range, id } = item;
        const tree = this.getTree(unitId, subUnitId);

        let { startRow: rangeStartRow, endRow: rangeEndRow, startColumn: rangeStartColumn, endColumn: rangeEndColumn } = range;

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

    search(search: IUnitRange): Map<string, IRTreeItem> {
        const { unitId, sheetId: subUnitId, range } = search;
        const tree = this.getTree(unitId, subUnitId);
        const result = new Map<string, IRTreeItem>();
        tree.search({
            minX: range.startColumn,
            minY: range.startRow,
            maxX: range.endColumn,
            maxY: range.endRow,
        }).forEach((item) => {
            result.set(item.id, {
                unitId,
                sheetId: subUnitId,
                id: item.id,
                range: {
                    startColumn: item.minX,
                    startRow: item.minY,
                    endColumn: item.maxX,
                    endRow: item.maxY,
                },
            });
        });
        return result;
    }

    bulkSearch(searchList: IUnitRange[]): Map<string, IRTreeItem> {
        const result = new Map<string, IRTreeItem>();
        for (const search of searchList) {
            const items = this.search(search);
            items.forEach((value, key) => {
                result.set(key, value);
            });
            items.clear();
        }
        return result;
    }

    remove(search: IRTreeItem) {
        const { unitId, sheetId: subUnitId, range, id } = search;
        const tree = this.getTree(unitId, subUnitId);
        tree.remove({
            minX: range.startColumn,
            minY: range.startRow,
            maxX: range.endColumn,
            maxY: range.endRow,
            id,
        });
    }

    bulkRemove(searchList: IRTreeItem[]) {
        for (const search of searchList) {
            this.remove(search);
        }
    }

    clear() {
        this._tree.clear();
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

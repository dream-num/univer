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

import type { ICellBindingNode, IListDataBindingNode, IListSourceData, IListSourceInfo, IObjectSourceInfo } from '../types';
import { DataBindingNodeTypeEnum } from '../types';

export abstract class SourceModelBase {
    protected _data: any;
    readonly id: string;
    private _hasData: boolean = false;
    readonly type: DataBindingNodeTypeEnum;
    constructor(id: string) {
        this.id = id;
    }

    getId() {
        return this.id;
    }

    getType(): DataBindingNodeTypeEnum {
        return this.type;
    }

    hasData(): boolean {
        return this._hasData;
    }

    setSourceData(data: any): void {
        this._data = data;
        this._hasData = true;
    }

    abstract getSourceInfo(): any;

    abstract getData(node: ICellBindingNode, row: number, col: number): string | number | boolean | null;
}

export class ListSourceModel extends SourceModelBase {
    override readonly type = DataBindingNodeTypeEnum.List;
    private _isListObject: boolean;
    private _fieldIndexMap: Map<string, number> = new Map();
    protected override _data: IListSourceData = { fields: [], records: [] };
    constructor(id: string, isListObject?: boolean) {
        super(id);
        this._isListObject = isListObject ?? true;
    }

    /**
     * Toggle the list object mode. The default value is true.
     * In the list object mode, the records is an array of objects. Such as [{name: 'Tom', age: 20}, {name: 'Jerry', age: 18}].
     * In the list array mode, the records is an array of arrays. Such as [['Tom', 20], ['Jerry', 18]].
     */
    toggleListObject(isListObject: boolean) {
        this._isListObject = isListObject;
    }

    getData(node: IListDataBindingNode, row: number): string | number | boolean | null {
        const { path, row: baseRow } = node;
        const colIndex = this._fieldIndexMap.get(path)!;
        const rowIndex = row - baseRow;
        if (rowIndex === 0) {
            return this._data.fields[colIndex];
        }
        if (this._isListObject) {
            return (this._data.records as Record<string | number, any>)[rowIndex - 1][path];
        }
        return this._data.records[rowIndex - 1][colIndex];
    }

    override setSourceData(data: IListSourceData): void {
        super.setSourceData(data);
        const { fields } = data;
        this._fieldIndexMap.clear();
        fields.forEach((field, index) => {
            this._fieldIndexMap.set(field, index);
        });
    }

    override getSourceInfo(): IListSourceInfo {
        return {
            sourceId: this.id,
            sourceType: this.type,
            fields: this._data.fields,
            recordCount: this._data.records.length,
        };
    }
}

export class ObjectSourceModel extends SourceModelBase {
    override readonly type = DataBindingNodeTypeEnum.Object;
    constructor(id: string) {
        super(id);
    }

    getData(node: ICellBindingNode): string | number | boolean | null {
        const path = node.path;
        const paths = path.split('.');
        let data = this._data;
        for (const p of paths) {
            data = data[p];
            if (data === undefined) {
                return null;
            }
        }
        return data;
    }

    override getSourceInfo(): IObjectSourceInfo {
        return {
            sourceId: this.id,
            sourceType: DataBindingNodeTypeEnum.Object,
        };
    }
}

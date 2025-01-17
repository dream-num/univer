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

import type { ICellBindingNode, IListDataBindingNode, IListSourceData, IListSourceInfo, IObjectSourceInfo, ISourceJSON } from '../types';
import { CellValueType, type ICellData } from '@univerjs/core';
import { DataBindingNodeTypeEnum } from '../types';

function isValidDate(date: Date): date is Date {
    return date instanceof Date && !isNaN(date.getTime());
}

function transformDate(dateString: string | number): number | string {
    const date = new Date(dateString);
    if (!isValidDate(date)) {
        return dateString;
    }
    const baseDate = new Date(Date.UTC(1900, 0, 1, 0, 0, 0)); // January 1, 1900, UTC at midnight
    const leapDayDate = new Date(Date.UTC(1900, 1, 28, 0, 0, 0)); // February 28, 1900, UTC at midnight

    // Calculate the difference in milliseconds between the input date and the base date
    const diffMilliseconds = date.getTime() - baseDate.getTime();
    let dayDifference = diffMilliseconds / (1000 * 3600 * 24);

    // Adjusting for the Excel leap year bug
    if (date > leapDayDate) {
        dayDifference += 1;
    }

    return dayDifference + 1; // Excel serial number starts from 1
}

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

    toJSON(): ISourceJSON {
        return {
            id: this.id,
            type: this.type,
        };
    }

    fromJSON(info: ISourceJSON): void {
        // @ts-ignore
        this.id = info.id;
        // @ts-ignore
        this.type = info.type;
    }

    abstract getSourceInfo(): any;

    abstract getData(node: ICellBindingNode, row: number, col: number): ICellData | null;
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

    getData(node: IListDataBindingNode, row: number): ICellData | null {
        const { path, row: baseRow } = node;
        const colIndex = this._fieldIndexMap.get(path)!;
        const rowIndex = row - baseRow;
        if (rowIndex === 0) {
            return {
                v: this._data.fields[colIndex],
            };
        }
        let data;
        if (this._isListObject) {
            data = (this._data.records as Record<string | number, any>)[rowIndex - 1][path];
        } else {
            data = this._data.records[rowIndex - 1][colIndex];
        }

        if (node.isDate === true) {
            return {
                v: transformDate(data),
                s: {
                    n: {
                        pattern: 'yyyy-m-d am/pm h:mm',
                    },
                },
                t: CellValueType.NUMBER,
            };
        } else {
            return {
                t: typeof data === 'number' ? CellValueType.NUMBER : CellValueType.STRING,
                v: data,
            };
        }
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

    getData(node: ICellBindingNode): ICellData | null {
        const path = node.path;
        const paths = path.split('.');
        let data = this._data;
        for (const p of paths) {
            data = data[p];
            if (data === undefined) {
                return null;
            }
        }
        if (node.isDate === true) {
            return {
                v: transformDate(data),
                s: {
                    n: {
                        pattern: 'yyyy-m-d am/pm h:mm',
                    },
                },
                t: CellValueType.NUMBER,
            };
        } else {
            return {
                v: data,
                t: typeof data === 'number' ? CellValueType.NUMBER : CellValueType.STRING,
            };
        }
    }

    override getSourceInfo(): IObjectSourceInfo {
        return {
            sourceId: this.id,
            sourceType: DataBindingNodeTypeEnum.Object,
        };
    }
}

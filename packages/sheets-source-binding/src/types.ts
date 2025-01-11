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

/**
 * Represents the type of data binding node.Which config the array or object like data source or path.
 */
export enum DataBindingNodeTypeEnum {
    /**
     * The array like data source.
     */
    List = 'list',
    // Cell = 'cell',
    /**
     * The object like data source.
     */
    Object = 'object',
}

export enum ListDataBindingNodeDirectionEnum {
    Horizontal = 'horizontal',
    Vertical = 'vertical',
}
/**
 * Represents the type of data binding node.Which config show Binding path or value.
 */
export enum BindModeEnum {
    /**
     * The path mode, show the binding path.
     */
    Path = 'path',
    /**
     * The value mode, show the binding value.
     */
    Value = 'value',
}

export type sourceDataType = string | number | boolean | object | null;

export interface IDataSource {
    id: string;
    getData(row: number, column: number): sourceDataType;

}

export interface IListDataSource extends IDataSource {
    getLength(): number;
    getColumns(): string[];
}
export interface IDataBindingModelMatrix {
    [row: number]: {
        [column: number]: ICellBindingNode;
    };
}

export interface IDataBindingModel {
    themeName?: string;
    matrix: IDataBindingModelMatrix;
    setBindingNode(row: number, column: number, node: ICellBindingNode): void;

}

export interface ICellBindingNode {
    type: DataBindingNodeTypeEnum;
    path: string;
    sourceId: string;
    nodeId: string;
    row: number;
    column: number;
}

export interface IListDataBindingNode extends ICellBindingNode {
    type: DataBindingNodeTypeEnum.List;
    limit?: number;
    direction?: ListDataBindingNodeDirectionEnum;
    range?: { startRow: number; startColumn: number; endRow: number; endColumn: number };
    displayName?: string;
}

export interface IDataBindingService {
    /**
     * A flag to control show path or show value
     */
    isBindingMode: boolean;
    /**
     * Change the binding mode
     * @param {BindModeEnum} mode Update the binding mode
     */
    setBindingMode(mode: BindModeEnum): void;

}

export interface IListSourceInfo {
    sourceId: string;
    sourceType: DataBindingNodeTypeEnum.List;
    fields: string[];
    recordCount: number;

    // range: null|{startRow:number, startColumn:number, endRow:number, endColumn:number};
}

export interface IObjectSourceInfo {
    sourceId: string;
    sourceType: DataBindingNodeTypeEnum.Object;

}

export type ISourceEvent = (IListSourceInfo | IObjectSourceInfo) & {
    unitId: string;
    changeType: BindingSourceChangeTypeEnum;
    oldRecordCount?: number;
};

export interface IListSourceData {
    fields: string[];
    records: any[][];
}

export enum BindingSourceChangeTypeEnum {
    Add = 'add',
    Remove = 'remove',
    Update = 'update',
}


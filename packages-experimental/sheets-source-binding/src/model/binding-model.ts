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

import type { ICellBindingNode, IDataBindingModelMatrix } from '../types';

export class SheetBindingModel {
    private _matrix: IDataBindingModelMatrix = {};

    private _nodeMap: Map<string, ICellBindingNode> = new Map();

    private _sourceIdMap: Map<string, string[]> = new Map();

    constructor(json?: ICellBindingNode[]) {
        if (json) {
            this._init(json);
        }
    }

    _init(json: ICellBindingNode[]): void {
        this.fromJSON(json);
    }

    getBindingNodesBySourceId(sourceId: string): ICellBindingNode[] | undefined {
        const nodeIds = this._sourceIdMap.get(sourceId);
        if (nodeIds) {
            return nodeIds.map((nodeId) => this._nodeMap.get(nodeId)) as ICellBindingNode[];
        }
        return undefined;
    }

    public setBindingNode(row: number, column: number, node: ICellBindingNode): void {
        if (!this._matrix[row]) {
            this._matrix[row] = {};
        }

        if (!this._matrix[row][column]) {
            this._matrix[row][column] = node;
        }
        this._nodeMap.set(node.nodeId, node);
        // update sourceId map, keep the sourceId and nodeId mapping
        const nodeIds = this._sourceIdMap.get(node.sourceId);
        if (nodeIds) {
            nodeIds.push(node.nodeId);
        } else {
            this._sourceIdMap.set(node.sourceId, [node.nodeId]);
        }
    }

    public getBindingNode(row: number, column: number): ICellBindingNode {
        return this._matrix[row]?.[column];
    }

    public removeBindingNode(row: number, column: number): void {
        const node = this._matrix[row]?.[column];
        if (node) {
            // @ts-ignore
            this._matrix[row][column] = undefined;
            this._nodeMap.delete(node.nodeId);
            const nodeIds = this._sourceIdMap.get(node.sourceId);
            if (nodeIds) {
                const index = nodeIds.indexOf(node.nodeId);
                if (index >= 0) {
                    nodeIds.splice(index, 1);
                }
                if (nodeIds.length === 0) {
                    this._sourceIdMap.delete(node.sourceId);
                }
            }
        }
    }

    public getBindingNodeById(nodeId: string): ICellBindingNode | undefined {
        return this._nodeMap.get(nodeId);
    }

    fromJSON(nodes: ICellBindingNode[]): void {
        nodes.forEach((node) => {
            this.setBindingNode(node.row, node.column, node);
        });
    }

    toJSON(): ICellBindingNode[] {
        return Array.from(this._nodeMap.values());
    }
}


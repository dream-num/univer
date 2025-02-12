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

import type { ICellBindingNodeParam, IListDataBindingNode, IListSourceInfo, ISourceBindingInfo } from '../types';
import { Disposable, Inject, InterceptorEffectEnum, RTree } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';

import { SheetsBindingManager } from '../controllers/binding-manager';
import { SheetsSourceManager } from '../controllers/source-manager';
import { BindingSourceChangeTypeEnum, BindModeEnum, DataBindingNodeTypeEnum } from '../types';

export class SheetsSourceBindService extends Disposable {
    private _bindingModel: BindModeEnum = BindModeEnum.Value;
    private _bindModelRTreeCollection = new Map<string, RTree>();
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsBindingManager) private _sheetsBindingManager: SheetsBindingManager,
        @Inject(SheetsSourceManager) private _sheetsSourceManager: SheetsSourceManager
    ) {
        super();
        this._registerInterceptor();
        this._registerSourceChange();
    }

    /**
     * Set the binding model to path mode, in this mode, the binding path will show in the cell.
     */
    usePathMode() {
        this._bindingModel = BindModeEnum.Path;
    }

    /**
     * Set the binding model to value mode, in this mode, the value of source will show in the cell.
     */
    useValueMode() {
        this._bindingModel = BindModeEnum.Value;
    }

    /**
     * Get the current binding model.
     * @returns the current binding model
     */
    getBindingModel() {
        return this._bindingModel;
    }

    createBindModel(unitId: string, subUnitId: string) {
        return this._sheetsBindingManager.createModel(unitId, subUnitId);
    }

    setBindingNode(unitId: string, subUnitId: string, node: ICellBindingNodeParam) {
        this._sheetsBindingManager.setBindingNode(unitId, subUnitId, node);
    }

    removeBindingNode(unitId: string, subUnitId: string, row: number, column: number) {
        this._sheetsBindingManager.removeBindingNode(unitId, subUnitId, row, column);
    }

    getBindingNode(unitId: string, subUnitId: string, row: number, column: number) {
        return this._sheetsBindingManager.getBindingNode(unitId, subUnitId, row, column);
    }

    getSource(unitId: string, id: string) {
        return this._sheetsSourceManager.getSource(unitId, id);
    }

    createSource(unitId: string, type: DataBindingNodeTypeEnum, isListObject?: boolean, id?: string) {
        return this._sheetsSourceManager.createSource(unitId, type, isListObject, id);
    }

    getSourceBindingPathInfo(unitId: string) {
        return {
            source: this._sheetsSourceManager.toJSON(unitId),
            cellBinding: this._sheetsBindingManager.toJSON(unitId),
        };
    }

    loadSourceBindingPathInfo(unitId: string, obj: ISourceBindingInfo) {
        this._sheetsSourceManager.fromJSON(unitId, obj.source);
        this._sheetsBindingManager.fromJSON(unitId, obj.cellBinding);
    }

    private _ensureRTreeCollection(unitId: string) {
        if (!this._bindModelRTreeCollection.has(unitId)) {
            this._bindModelRTreeCollection.set(unitId, new RTree());
        }
        return this._bindModelRTreeCollection.get(unitId) as RTree;
    }

    private _getRTeeCollection(unitId: string) {
        return this._bindModelRTreeCollection.get(unitId);
    }

    // eslint-disable-next-line max-lines-per-function
    private _registerSourceChange() {
        // Update the RTree collection when the source data updated
        // eslint-disable-next-line complexity
        this.disposeWithMe(this._sheetsSourceManager.sourceDataUpdate$.subscribe((sourceInfo) => {
            const { sourceId, sourceType, unitId: sourceUnitId, changeType } = sourceInfo;

            if (sourceType === DataBindingNodeTypeEnum.List) {
                // Remove the old data
                if (changeType === BindingSourceChangeTypeEnum.Remove) {
                    const nodeInfo = this._sheetsBindingManager.getBindingModelBySourceId(sourceId);
                    const recordCount = sourceInfo.recordCount;
                    for (const { unitId, subunitId, nodeId, row, column } of nodeInfo) {
                        const rTreeCollection = this._getRTeeCollection(sourceUnitId);
                        const node = this._sheetsBindingManager.getBindingNodeById(unitId, subunitId, nodeId);
                        if (rTreeCollection && node?.type === DataBindingNodeTypeEnum.List) {
                            const offset = (node as IListDataBindingNode).containHeader ? 0 : 1;
                            const range = { startRow: row, startColumn: column, endRow: row + recordCount - offset, endColumn: column };
                            rTreeCollection.remove({ unitId, sheetId: subunitId, id: nodeId, range });
                        }
                    }
                    return;
                }
                if (changeType === BindingSourceChangeTypeEnum.Update) {
                    const oldRecordCount = sourceInfo.oldRecordCount!;
                    const nodeInfo = this._sheetsBindingManager.getBindingModelBySourceId(sourceId);
                    for (const { unitId, subunitId, nodeId, row, column } of nodeInfo) {
                        const rTreeCollection = this._getRTeeCollection(sourceUnitId);
                        const node = this._sheetsBindingManager.getBindingNodeById(unitId, subunitId, nodeId);
                        if (rTreeCollection && node?.type === DataBindingNodeTypeEnum.List) {
                            const offset = (node as IListDataBindingNode).containHeader ? 0 : 1;
                            const oldRange = { startRow: row, startColumn: column, endRow: row + oldRecordCount - offset, endColumn: column };
                            const range = { startRow: row, startColumn: column, endRow: row + sourceInfo.recordCount - offset, endColumn: column };
                            rTreeCollection.remove({ unitId, sheetId: subunitId, id: nodeId, range: oldRange });
                            rTreeCollection.insert({ unitId, sheetId: subunitId, id: nodeId, range });
                        }
                    }
                    return;
                }

                // Add the new data
                const source = this._sheetsSourceManager.getSource(sourceUnitId, sourceId);
                if (source && source.hasData()) {
                    const sourceInfo = source.getSourceInfo() as IListSourceInfo;
                    const recordCount = sourceInfo.recordCount;
                    const nodeInfo = this._sheetsBindingManager.getBindingModelBySourceId(sourceId);

                    for (const { unitId, subunitId, nodeId, row, column } of nodeInfo) {
                        const rTreeCollection = this._ensureRTreeCollection(unitId);
                        const node = this._sheetsBindingManager.getBindingNodeById(unitId, subunitId, nodeId);
                        if (rTreeCollection && node?.type === DataBindingNodeTypeEnum.List) {
                            const offset = (node as IListDataBindingNode).containHeader ? 0 : 1;
                            const range = { startRow: row, startColumn: column, endRow: row + recordCount - offset, endColumn: column };
                            rTreeCollection.insert({ unitId, sheetId: subunitId, id: nodeId, range });
                        }
                    }
                }
            }
        }));

        // Update the RTree collection when the binding node updated
        this.disposeWithMe(this._sheetsBindingManager.cellBindInfoUpdate$.subscribe((nodeInfo) => {
            const { unitId, subunitId, sourceId, nodeId, row, column, changeType, containHeader } = nodeInfo;
            const rTreeCollection = this._ensureRTreeCollection(unitId);
            const source = this._sheetsSourceManager.getSource(unitId, sourceId);

            if (source && source.hasData()) {
                const sourceInfo = source.getSourceInfo() as IListSourceInfo;
                if (sourceInfo.sourceType === DataBindingNodeTypeEnum.List) {
                    const recordCount = sourceInfo.recordCount;
                    const offset = containHeader ? 0 : 1;
                    const range = { startRow: row, startColumn: column, endRow: row + recordCount - offset, endColumn: column };
                    if (changeType === BindingSourceChangeTypeEnum.Add) {
                        rTreeCollection.insert({ unitId, sheetId: subunitId, id: nodeId, range });
                    } else if (changeType === BindingSourceChangeTypeEnum.Remove) {
                        rTreeCollection.remove({ unitId, sheetId: subunitId, id: nodeId, range });
                    } else if (changeType === BindingSourceChangeTypeEnum.Update) {
                        const oldSourceId = nodeInfo.oldSourceId!;
                        const offset = nodeInfo.oldNodeContainHeader ? 0 : 1;
                        // remove the old range
                        const oldSource = this._sheetsSourceManager.getSource(unitId, oldSourceId);
                        if (oldSource && oldSource.hasData()) {
                            const oldSourceInfo = oldSource.getSourceInfo() as IListSourceInfo;
                            const oldRecordCount = oldSourceInfo.recordCount;
                            const oldRange = { startRow: row, startColumn: column, endRow: row + oldRecordCount - offset, endColumn: column };
                            rTreeCollection.remove({ unitId, sheetId: subunitId, id: nodeId, range: oldRange });
                        }
                        rTreeCollection.insert({ unitId, sheetId: subunitId, id: nodeId, range });
                    }
                }
            }
        }));
    }

    private _getPathModeCellValue(unitId: string, subUnitId: string, row: number, col: number) {
        const model = this._sheetsBindingManager.getModel(unitId, subUnitId);
        const node = model?.getBindingNode(row, col);
        if (node) {
            const nodeType = node.type;
            if (nodeType === DataBindingNodeTypeEnum.List) {
                return {
                    v: `#{${node.path}}`,
                    s: { cl: { rgb: 'blue' } },
                };
            } else if (nodeType === DataBindingNodeTypeEnum.Object) {
                return {
                    v: `[${node.path}]`,
                    s: { cl: { rgb: 'blue' } },
                };
            }
        }
    }

    private _getValueModeCellValue(unitId: string, subUnitId: string, row: number, col: number) {
        const model = this._sheetsBindingManager.getModel(unitId, subUnitId);
        // object mode
        if (model) {
            const node = model.getBindingNode(row, col);
            if (node) {
                const { sourceId } = node;
                const source = this._sheetsSourceManager.getSource(unitId, sourceId);
                if (source && source.hasData()) {
                    return source?.getData(node, row, col) || { v: '' };
                }
            }
        }
        const rTreeCollection = this._getRTeeCollection(unitId);
        if (model && rTreeCollection) {
            const range = { startRow: row, startColumn: col, endRow: row, endColumn: col };
            const nodeIds = Array.from(rTreeCollection.bulkSearch([{ unitId, sheetId: subUnitId, range }]));
            if (nodeIds.length > 0) {
                const node = model.getBindingNodeById(nodeIds[0] as string);
                if (node) {
                    const { sourceId } = node;
                    const source = this._sheetsSourceManager.getSource(unitId, sourceId);
                    if (source && source.hasData()) {
                        return source?.getData(node, row, col) || { v: '' };
                    }
                }
            }
        }
    }

    getBindingModelBySourceId(sourceId: string) {
        return this._sheetsBindingManager.getBindingModelBySourceId(sourceId);
    }

    private _registerInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            effect: InterceptorEffectEnum.Value | InterceptorEffectEnum.Style,
            priority: 102,
            handler: (cell, context, next) => {
                const { row, col, unitId, subUnitId, workbook } = context;
                let value = null;
                if (this._bindingModel === BindModeEnum.Path) {
                    value = this._getPathModeCellValue(unitId, subUnitId, row, col);
                } else {
                    value = this._getValueModeCellValue(unitId, subUnitId, row, col);
                }
                if (value !== null) {
                    const defaultStyle = (typeof cell?.s === 'string' ? workbook.getStyles().get(cell?.s) : cell?.s) || {};
                    const newStyle = { ...defaultStyle };
                    if (value && value.s) {
                        Object.assign(newStyle, value.s);
                    }
                    return next({ ...cell, ...value, s: newStyle });
                }

                return next(cell);
            },
        }));
    }

    override dispose(): void {
        this._bindModelRTreeCollection.clear();
    }
}

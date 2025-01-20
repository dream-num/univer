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

import type { IMutationInfo } from '@univerjs/core';
import type { ICellBindingJSON, ICellBindingNode, ICellBindingNodeParam } from '../types';
import { Disposable, generateRandomId, Inject, IUniverInstanceService, Range } from '@univerjs/core';

import { ClearSelectionAllCommand, ClearSelectionContentCommand, getSheetCommandTarget, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { SheetBindingModel } from '../model/binding-model';
import { BindingSourceChangeTypeEnum } from '../types';

interface IBindingNodeInfo {
    unitId: string;
    subunitId: string;
    sourceId: string;
    nodeId: string;
    row: number;
    column: number;
}

export class SheetsBindingManager extends Disposable {
    modelMap: Map<string, Map<string, SheetBindingModel>> = new Map();

    private _cellBindInfoUpdate$ = new Subject<IBindingNodeInfo & { changeType: BindingSourceChangeTypeEnum; oldSourceId?: string }>();
    cellBindInfoUpdate$ = this._cellBindInfoUpdate$.asObservable();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsSelectionsService) private readonly _sheetsSelectionsService: SheetsSelectionsService
    ) {
        super();
        this._initRemoveCommand();
    }

    private _initRemoveCommand() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (command) => {
                    const redos: IMutationInfo[] = [];
                    const undos: IMutationInfo[] = [];
                    const selections = this._sheetsSelectionsService.getCurrentSelections();
                    const target = getSheetCommandTarget(this._univerInstanceService);
                    if (!target || !selections || selections.length === 0) {
                        return {
                            redos: [],
                            undos: [],
                        };
                    }
                    const { unitId, subUnitId } = target;
                    if (command.id === ClearSelectionContentCommand.id || command.id === ClearSelectionAllCommand.id) {
                        selections.forEach(({ range }) => {
                            Range.foreach(range, (row, column) => {
                                const node = this.getBindingNode(unitId, subUnitId, row, column);
                                if (node) {
                                    this.removeBindingNode(unitId, subUnitId, row, column);
                                }
                            });
                        });
                    }
                    return { redos, undos };
                },
            })
        );
    }

    getBindingModelBySourceId(sourceId: string) {
        const rs: IBindingNodeInfo[] = [];
        this.modelMap.forEach((subMap, unitId) => {
            subMap.forEach((model, subunitId) => {
                const nodes = model.getBindingNodesBySourceId(sourceId);
                if (nodes) {
                    for (const node of nodes) {
                        rs.push({
                            unitId,
                            subunitId,
                            sourceId,
                            nodeId: node.nodeId!,
                            row: node.row,
                            column: node.column,
                        });
                    }
                }
            });
        });
        return rs;
    }

    addModel(unitId: string, subunitId: string, model: SheetBindingModel): void {
        if (!this.modelMap.has(unitId)) {
            this.modelMap.set(unitId, new Map());
        }
        this.modelMap.get(unitId)?.set(subunitId, model);
    }

    getModel(unitId: string, subunitId: string): SheetBindingModel | undefined {
        return this.modelMap.get(unitId)?.get(subunitId);
    }

    setBindingNode(unitId: string, subunitId: string, node: ICellBindingNodeParam): void {
        let model = this.getModel(unitId, subunitId);
        if (!model) {
            model = new SheetBindingModel();
            this.addModel(unitId, subunitId, model);
        }
        if (!node.nodeId) {
            node.nodeId = generateRandomId();
        }
        const { row, column } = node;
        if (row === undefined || column === undefined) {
            throw new Error('row and column is required');
        }
        const oldNode = model.getBindingNode(row, column);
        model.setBindingNode(row, column, { ...node, row, column } as ICellBindingNode);
        this._cellBindInfoUpdate$.next({
            unitId,
            subunitId,
            sourceId: node.sourceId,
            nodeId: node.nodeId,
            row,
            column,
            changeType: oldNode ? BindingSourceChangeTypeEnum.Update : BindingSourceChangeTypeEnum.Add,
            oldSourceId: oldNode?.sourceId,
        });
    }

    removeBindingNode(unitId: string, subunitId: string, row: number, column: number): void {
        const model = this.getModel(unitId, subunitId);
        if (model) {
            const node = model.getBindingNode(row, column);
            if (node) {
                model.removeBindingNode(row, column);
                this._cellBindInfoUpdate$.next({
                    unitId,
                    subunitId,
                    sourceId: node.sourceId,
                    nodeId: node.nodeId!,
                    row,
                    column,
                    changeType: BindingSourceChangeTypeEnum.Remove,
                });
            }
        }
    }

    getBindingNode(unitId: string, subunitId: string, row: number, column: number): ICellBindingNode | undefined {
        const model = this.getModel(unitId, subunitId);
        if (model) {
            return model.getBindingNode(row, column);
        }
        return undefined;
    }

    createModel(unitId: string, subunitId: string, json?: ICellBindingNode[]): SheetBindingModel {
        const model = new SheetBindingModel(json);
        this.addModel(unitId, subunitId, model);
        return model;
    }

    toJSON(unitId: string) {
        const rs: ICellBindingJSON = {};
        const subMap = this.modelMap.get(unitId);
        if (subMap) {
            subMap.forEach((model, subunitId) => {
                rs[subunitId] = model.toJSON();
            });
        }
        return rs;
    }

    fromJSON(unitId: string, json: ICellBindingJSON) {
        Object.entries(json).forEach(([subunitId, nodes]) => {
            this.createModel(unitId, subunitId, nodes);
        });
    }

    override dispose(): void {
        this.modelMap.clear();
        this._cellBindInfoUpdate$.complete();
    }
}

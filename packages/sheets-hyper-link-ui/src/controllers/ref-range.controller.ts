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

import type { IRange } from '@univerjs/core';
import { Disposable, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import { handleDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';
import type { IAddHyperLinkMutationParams, ICellHyperLink, IRemoveHyperLinkMutationParams, IUpdateHyperLinkRefMutationParams } from '@univerjs/sheets-hyper-link';
import { AddHyperLinkMutation, HyperLinkModel, RemoveHyperLinkMutation, UpdateHyperLinkRefMutation } from '@univerjs/sheets-hyper-link';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Starting, SheetsHyperLinkRefRangeController)
export class SheetsHyperLinkRefRangeController extends Disposable {
    private _disposableMap = new Map<string, IDisposable>();

    constructor(
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(HyperLinkModel) private readonly _hyperLinkModel: HyperLinkModel
    ) {
        super();
        this._initData();
        this._initRefRange();
    }

    private _getIdWithUnitId(unitId: string, subUnitId: string, id: string) {
        return `${unitId}-${subUnitId}-${id}`;
    }

    private _register(unitId: string, subUnitId: string, link: ICellHyperLink) {
        const commentId = link.id;
        const oldRange: IRange = {
            startColumn: link.column,
            endColumn: link.column,
            startRow: link.row,
            endRow: link.row,
        };

        const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
            const resultRange = handleDefaultRangeChangeWithEffectRefCommands(oldRange, commandInfo);
            if (resultRange && resultRange.startColumn === oldRange.startColumn && resultRange.startRow === oldRange.startRow) {
                return {
                    undos: [],
                    redos: [],
                };
            }

            if (!resultRange) {
                return {
                    redos: [{
                        id: RemoveHyperLinkMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            id: link.id,
                        } as IRemoveHyperLinkMutationParams,
                    }],
                    undos: [{
                        id: AddHyperLinkMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            link,
                        } as IAddHyperLinkMutationParams,
                    }],
                };
            }

            return {
                redos: [{
                    id: UpdateHyperLinkRefMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        id: link.id,
                        row: resultRange.startRow,
                        column: resultRange.startColumn,
                    } as IUpdateHyperLinkRefMutationParams,
                }],
                undos: [{
                    id: UpdateHyperLinkRefMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        id: link.id,
                        row: oldRange.startRow,
                        column: oldRange.startColumn,
                    } as IUpdateHyperLinkRefMutationParams,
                }],
            };
        };

        this._disposableMap.set(
            this._getIdWithUnitId(unitId, subUnitId, commentId),
            this._refRangeService.registerRefRange(oldRange, handleRangeChange, unitId, subUnitId)
        );
    }

    private _unregister(unitId: string, subUnitId: string, id: string) {
        const disposable = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, id));
        disposable?.dispose();
    }

    private _initData() {
        const data = this._hyperLinkModel.getAll();

        data.forEach((unitData) => {
            unitData.forEach((subUnitData) => {
                const { unitId, subUnitId, links } = subUnitData;

                links.forEach((link) => {
                    this._register(unitId, subUnitId, link);
                });
            });
        });
    }

    private _initRefRange() {
        this.disposeWithMe(
            this._hyperLinkModel.linkUpdate$.subscribe((option) => {
                switch (option.type) {
                    case 'add': {
                        this._register(option.unitId, option.subUnitId, option.payload);
                        break;
                    }
                    case 'remove': {
                        this._unregister(option.unitId, option.subUnitId, option.payload.id);
                        break;
                    }
                    case 'updateRef': {
                        const { unitId, subUnitId, id } = option;
                        const link = this._hyperLinkModel.getHyperLink(unitId, subUnitId, id);
                        if (!link) {
                            return;
                        }

                        this._unregister(unitId, subUnitId, id);
                        this._register(unitId, subUnitId, link);
                        break;
                    }
                    case 'unload': {
                        const { unitLinks } = option;
                        unitLinks.forEach((subUnitData) => {
                            const { unitId, subUnitId, links } = subUnitData;
                            links.forEach((link) => {
                                this._unregister(unitId, subUnitId, link.id);
                            });
                        });
                    }
                }
            })
        );

        this.disposeWithMe(toDisposable(() => {
            this._disposableMap.forEach((item) => {
                item.dispose();
            });
            this._disposableMap.clear();
        }));
    }
}

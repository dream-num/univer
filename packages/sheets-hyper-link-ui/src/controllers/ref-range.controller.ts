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
import { Disposable, isValidRange, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import { handleDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';
import type { IAddHyperLinkMutationParams, ICellHyperLink, IRemoveHyperLinkMutationParams, IUpdateHyperLinkRefMutationParams } from '@univerjs/sheets-hyper-link';
import { AddHyperLinkMutation, HyperLinkModel, RemoveHyperLinkMutation, UpdateHyperLinkRefMutation } from '@univerjs/sheets-hyper-link';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { deserializeRangeWithSheet, serializeRange } from '@univerjs/engine-formula';
import { SheetsHyperLinkResolverService } from '../services/resolver.service';
import { ERROR_RANGE } from '../types/const';

@OnLifecycle(LifecycleStages.Starting, SheetsHyperLinkRefRangeController)
export class SheetsHyperLinkRefRangeController extends Disposable {
    private _disposableMap = new Map<string, IDisposable>();
    private _rangeDisableMap = new Map<string, IDisposable>();

    constructor(
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(HyperLinkModel) private readonly _hyperLinkModel: HyperLinkModel,
        @Inject(SheetsHyperLinkResolverService) private readonly _resolverService: SheetsHyperLinkResolverService
    ) {
        super();
        this._initData();
        this._initRefRange();
    }

    private _register(unitId: string, subUnitId: string, link: ICellHyperLink) {
        const id = link.id;
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
            id,
            this._refRangeService.registerRefRange(oldRange, handleRangeChange, unitId, subUnitId)
        );
    }

    private _unregister(id: string) {
        const disposable = this._disposableMap.get(id);
        disposable?.dispose();
    }

    private _registerRange(unitId: string, id: string, payload: string) {
        const linkInfo = this._resolverService.parseHyperLink(payload);
        if (linkInfo.searchObj && linkInfo.searchObj.range && linkInfo.searchObj.gid) {
            const subUnitId = linkInfo.searchObj.gid;
            const range = deserializeRangeWithSheet(linkInfo.searchObj.range).range;

            if (isValidRange(range)) {
                this._rangeDisableMap.set(
                    id,
                    this._refRangeService.watchRange(unitId, subUnitId, range, (before, aft) => {
                        if (aft && serializeRange(before) === serializeRange(aft)) {
                            return;
                        }
                        this._hyperLinkModel.updateHyperLink(
                            unitId,
                            subUnitId,
                            id,
                            {
                                payload: `#gid=${subUnitId}&range=${!aft ? ERROR_RANGE : serializeRange(aft)}`,
                            },
                            true
                        );
                    })
                );
            }
        }
    }

    private _unregisterRange(id: string) {
        const disposable = this._rangeDisableMap.get(id);
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
                        this._registerRange(option.unitId, option.payload.id, option.payload.payload);
                        break;
                    }
                    case 'remove': {
                        this._unregister(option.payload.id);
                        this._unregisterRange(option.payload.id);
                        break;
                    }
                    case 'updateRef': {
                        const { unitId, subUnitId, id } = option;
                        const link = this._hyperLinkModel.getHyperLink(unitId, subUnitId, id);
                        if (!link) {
                            return;
                        }

                        this._unregister(id);
                        this._register(unitId, subUnitId, link);
                        break;
                    }
                    case 'unload': {
                        const { unitLinks } = option;
                        unitLinks.forEach((subUnitData) => {
                            const { links } = subUnitData;
                            links.forEach((link) => {
                                this._unregister(link.id);
                                this._unregisterRange(link.id);
                            });
                        });
                        break;
                    }
                    case 'update': {
                        this._unregisterRange(option.id);
                        this._registerRange(option.unitId, option.id, option.payload.payload);
                        break;
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

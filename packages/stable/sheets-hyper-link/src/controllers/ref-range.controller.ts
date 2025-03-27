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

import type { IDisposable, IRange, Nullable } from '@univerjs/core';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import type { IAddHyperLinkMutationParams } from '../commands/mutations/add-hyper-link.mutation';
import type { IRemoveHyperLinkMutationParams } from '../commands/mutations/remove-hyper-link.mutation';
import type { IUpdateHyperLinkMutationParams, IUpdateHyperLinkRefMutationParams } from '../commands/mutations/update-hyper-link.mutation';
import type { ISheetHyperLink } from '../types/interfaces/i-hyper-link';
import { Disposable, ICommandService, Inject, isValidRange, sequenceExecuteAsync, toDisposable } from '@univerjs/core';
import { deserializeRangeWithSheet, serializeRange } from '@univerjs/engine-formula';
import { handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests, handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests, RefRangeService, SheetsSelectionsService } from '@univerjs/sheets';
import { AddHyperLinkMutation } from '../commands/mutations/add-hyper-link.mutation';
import { RemoveHyperLinkMutation } from '../commands/mutations/remove-hyper-link.mutation';
import { UpdateHyperLinkMutation, UpdateHyperLinkRefMutation } from '../commands/mutations/update-hyper-link.mutation';
import { HyperLinkModel } from '../models/hyper-link.model';
import { ERROR_RANGE } from '../types/const';

export class SheetsHyperLinkRefRangeController extends Disposable {
    private _disposableMap = new Map<string, IDisposable>();
    private _watchDisposableMap = new Map<string, IDisposable>();
    private _rangeDisableMap = new Map<string, IDisposable>();
    private _rangeWatcherMap = new Map<string, IDisposable>();

    constructor(
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(HyperLinkModel) private readonly _hyperLinkModel: HyperLinkModel,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._initData();
        this._initRefRange();
    }

    private _handlePositionChange = (unitId: string, subUnitId: string, link: ISheetHyperLink, resultRange: Nullable<IRange>, silent: boolean) => {
        const oldRange: IRange = {
            startColumn: link.column,
            endColumn: link.column,
            startRow: link.row,
            endRow: link.row,
        };

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
                    silent,
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
                    silent,
                } as IUpdateHyperLinkRefMutationParams,
            }],
        };
    };

    private _registerPosition(unitId: string, subUnitId: string, link: ISheetHyperLink) {
        const id = link.id;
        const oldRange: IRange = {
            startColumn: link.column,
            endColumn: link.column,
            startRow: link.row,
            endRow: link.row,
        };

        const handleRefRangeChange = (commandInfo: EffectRefRangeParams) => {
            const resultRanges = handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests(oldRange, commandInfo, { selectionManagerService: this._selectionManagerService });
            const resultRange = Array.isArray(resultRanges) ? resultRanges[0] : resultRanges;
            if (resultRange && resultRange.startColumn === oldRange.startColumn && resultRange.startRow === oldRange.startRow) {
                return {
                    undos: [],
                    redos: [],
                };
            }

            const res = this._handlePositionChange(unitId, subUnitId, link, resultRange, false);
            return res;
        };
        this._disposableMap.set(id, this._refRangeService.registerRefRange(oldRange, handleRefRangeChange, unitId, subUnitId));
    }

    private _watchPosition(unitId: string, subUnitId: string, link: ISheetHyperLink) {
        const id = link.id;
        const oldRange: IRange = {
            startColumn: link.column,
            endColumn: link.column,
            startRow: link.row,
            endRow: link.row,
        };
        this._watchDisposableMap.set(id, this._refRangeService.watchRange(unitId, subUnitId, oldRange, (before, after) => {
            const { redos } = this._handlePositionChange(unitId, subUnitId, link, after, true);
            sequenceExecuteAsync(redos, this._commandService, { onlyLocal: true });
        }, true));
    }

    private _unregisterPosition(id: string) {
        const disposable = this._disposableMap.get(id);
        disposable?.dispose();
        this._disposableMap.delete(id);
    }

    private _unwatchPosition(id: string) {
        const disposable = this._watchDisposableMap.get(id);
        disposable?.dispose();
        this._watchDisposableMap.delete(id);
    }

    private _registerRange(unitId: string, id: string, payload: string, silent = false) {
        if (payload.startsWith('#')) {
            const search = new URLSearchParams(payload.slice(1));
            // range, gid, rangeid
            const searchObj = {
                gid: search.get('gid') ?? '',
                range: search.get('range') ?? '',
                rangeid: search.get('rangeid') ?? '',
            };

            if (searchObj.range && searchObj.gid) {
                const subUnitId = searchObj.gid;
                const range = deserializeRangeWithSheet(searchObj.range).range;

                if (isValidRange(range) && searchObj.range !== ERROR_RANGE) {
                    const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
                        const resultRange = handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests(range, commandInfo, { selectionManagerService: this._selectionManagerService });
                        if (resultRange && serializeRange(resultRange) === serializeRange(range)) {
                            return {
                                redos: [],
                                undos: [],
                            };
                        }

                        return {
                            redos: [{
                                id: UpdateHyperLinkMutation.id,
                                params: {
                                    unitId,
                                    subUnitId,
                                    id,
                                    payload: {
                                        payload: `#gid=${subUnitId}&range=${resultRange ? serializeRange(resultRange) : 'err'}`,
                                    },
                                } as IUpdateHyperLinkMutationParams,
                            }],
                            undos: [{
                                id: UpdateHyperLinkMutation.id,
                                params: {
                                    unitId,
                                    subUnitId,
                                    id,
                                    payload: {
                                        payload,
                                    },
                                } as IUpdateHyperLinkMutationParams,
                            }],
                        };
                    };
                    this._rangeDisableMap.set(id, this._refRangeService.registerRefRange(range, handleRangeChange, unitId, subUnitId));

                    if (!silent) {
                        this._rangeWatcherMap.set(id, this._refRangeService.watchRange(unitId, subUnitId, range, (before, after) => {
                            this._hyperLinkModel.updateHyperLink(unitId, subUnitId, id, {
                                payload: `#gid=${subUnitId}&range=${after ? serializeRange(after) : 'err'}`,
                            }, true);
                        }, true));
                    }
                }
            }
        }
    }

    private _unregisterRange(id: string) {
        const disposable = this._rangeDisableMap.get(id);
        disposable?.dispose();
        this._rangeDisableMap.delete(id);
    }

    private _unwatchRange(id: string) {
        const disposable = this._rangeWatcherMap.get(id);
        disposable?.dispose();
        this._rangeWatcherMap.delete(id);
    }

    private _initData() {
        const data = this._hyperLinkModel.getAll();

        data.forEach((unitData) => {
            unitData.forEach((subUnitData) => {
                const { unitId, subUnitId, links } = subUnitData;

                links.forEach((link) => {
                    this._registerPosition(unitId, subUnitId, link);
                    this._watchPosition(unitId, subUnitId, link);
                    this._registerRange(unitId, link.id, link.payload);
                });
            });
        });
    }

    private _initRefRange() {
        this.disposeWithMe(
            this._hyperLinkModel.linkUpdate$.subscribe((option) => {
                switch (option.type) {
                    case 'add': {
                        this._registerPosition(option.unitId, option.subUnitId, option.payload);
                        this._watchPosition(option.unitId, option.subUnitId, option.payload);
                        this._registerRange(option.unitId, option.payload.id, option.payload.payload);
                        break;
                    }
                    case 'remove': {
                        this._unregisterPosition(option.payload.id);
                        this._unwatchPosition(option.payload.id);
                        this._unregisterRange(option.payload.id);
                        this._unwatchRange(option.payload.id);
                        break;
                    }
                    case 'updateRef': {
                        const { unitId, subUnitId, id, silent } = option;
                        const link = this._hyperLinkModel.getHyperLink(unitId, subUnitId, id);
                        if (!link) {
                            return;
                        }
                        this._unregisterPosition(id);
                        this._registerPosition(unitId, subUnitId, link);
                        if (!silent) {
                            this._unwatchPosition(id);
                            this._watchPosition(unitId, subUnitId, link);
                        }
                        break;
                    }
                    case 'unload': {
                        const { unitLinks } = option;
                        unitLinks.forEach((subUnitData) => {
                            const { links } = subUnitData;
                            links.forEach((link) => {
                                this._unregisterPosition(link.id);
                                this._unwatchPosition(link.id);
                                this._unregisterRange(link.id);
                                this._unwatchRange(link.id);
                            });
                        });
                        break;
                    }
                    case 'update': {
                        if (!option.silent) {
                            this._unwatchRange(option.id);
                        }
                        this._unregisterRange(option.id);
                        this._registerRange(option.unitId, option.id, option.payload.payload, option.silent);
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

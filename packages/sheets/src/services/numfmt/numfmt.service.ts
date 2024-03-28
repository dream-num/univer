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

import type { IObjectMatrixPrimitiveType, IRange, Nullable, Workbook } from '@univerjs/core';
import {
    Disposable,
    ILogService,
    IResourceManagerService,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    Range,
    RefAlias,
    toDisposable,
} from '@univerjs/core';
import { Subject } from 'rxjs';

import type { FormatType, INumfmtItem, INumfmtService, IRefItem, ISnapshot } from './type';

const SHEET_NUMFMT_PLUGIN = 'SHEET_NUMFMT_PLUGIN';
@OnLifecycle(LifecycleStages.Starting, NumfmtService)
export class NumfmtService extends Disposable implements INumfmtService {
    /**
     * Map<unitID ,<sheetId ,ObjectMatrix>>
     * @type {Map<string, Map<string, ObjectMatrix<INumfmtItemWithCache>>>}
     * @memberof NumfmtService
     */
    private _numfmtModel: Map<string, Map<string, ObjectMatrix<INumfmtItem>>> = new Map();

    private _refAliasModel: Map<string, RefAlias<IRefItem, 'pattern' | 'i'>> = new Map();

    private _modelReplace$ = new Subject<string>();
    modelReplace$ = this._modelReplace$.asObservable();

    constructor(
        @IResourceManagerService private _resourceManagerService: IResourceManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @ILogService private _logService: ILogService
    ) {
        super();

        this._initModel();
        this.disposeWithMe(
            toDisposable(() => {
                this._numfmtModel.clear();
                this._refAliasModel.clear();
            })
        );
    }

    private _initModel() {
        const handleWorkbookAdd = (workbook: Workbook) => {
            const unitID = workbook.getUnitId();
            this.disposeWithMe(
                this._resourceManagerService.registerPluginResource<ISnapshot>(unitID, SHEET_NUMFMT_PLUGIN, {
                    toJson: (unitID) => this._toJson(unitID),
                    parseJson: (json) => this._parseJson(json),
                    onChange: (unitID, value) => {
                        const { model, refModel } = value;

                        if (model) {
                            const parseModel = Object.keys(model).reduce((result, sheetId) => {
                                result.set(sheetId, new ObjectMatrix<INumfmtItem>(model[sheetId]));
                                return result;
                            }, new Map<string, ObjectMatrix<INumfmtItem>>());
                            this._numfmtModel.set(unitID, parseModel);
                        }
                        if (refModel) {
                            this._refAliasModel.set(
                                unitID,
                                new RefAlias<IRefItem, 'pattern' | 'i'>(refModel, ['pattern', 'i'])
                            );
                        }
                        this._modelReplace$.next(unitID);
                    },
                })
            );
        };

        this.disposeWithMe(this._univerInstanceService.sheetAdded$.subscribe(handleWorkbookAdd));
        this.disposeWithMe(
            this._univerInstanceService.sheetDisposed$.subscribe((workbook) => {
                const unitID = workbook.getUnitId();
                const model = this._numfmtModel.get(unitID);
                if (model) {
                    this._numfmtModel.delete(unitID);
                }
                const refModel = this._refAliasModel.get(unitID);
                if (refModel) {
                    this._refAliasModel.delete(unitID);
                }
                this._resourceManagerService.disposePluginResource(unitID, SHEET_NUMFMT_PLUGIN);
            })
        );

        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        handleWorkbookAdd(workbook);
    }

    private _toJson(unitID: string) {
        const workbookModel = this._numfmtModel.get(unitID);
        const workbookRefModel = this._refAliasModel.get(unitID);
        if (!workbookModel || !workbookRefModel) {
            return '';
        }

        const model = [...workbookModel.keys()].reduce(
            (result, key) => {
                const object = workbookModel.get(key)!;
                result[key] = object.toJSON();
                return result;
            },
            {} as Record<string, IObjectMatrixPrimitiveType<INumfmtItem>>
        );
        // Filter the count equal 0 when snapshot save.
        // It is typically cleaned up once every 100 versions.

        const refModel = workbookRefModel.getValues().filter((item) => item.count > 0);
        const obj: ISnapshot = { model, refModel };
        return JSON.stringify(obj);
    }

    private _parseJson(json: string): ISnapshot {
        try {
            const obj = JSON.parse(json);
            return obj;
        } catch (err) {
            return { model: {}, refModel: [] };
        }
    }

    private _setValue(unitId: string, subUnitId: string, row: number, col: number, value: Nullable<INumfmtItem>) {
        let model = this.getModel(unitId, subUnitId);
        if (!model) {
            const worksheetMap = this._numfmtModel.get(unitId) || new Map<string, ObjectMatrix<INumfmtItem>>();
            const worksheetModel = worksheetMap.get(subUnitId) || new ObjectMatrix<INumfmtItem>();
            worksheetMap.set(subUnitId, worksheetModel);
            this._numfmtModel.set(unitId, worksheetMap);
            model = worksheetModel;
        }
        if (value) {
            model.setValue(row, col, value);
        } else {
            model.realDeleteValue(row, col);
            const size = model.getSizeOf();
            if (!size) {
                const workbookModel = this._numfmtModel.get(unitId);
                workbookModel?.delete(subUnitId);
            }
        }
    }

    private _getUniqueRefId(unitID: string) {
        const refModel = this._refAliasModel.get(unitID);
        if (!refModel) {
            return '0';
        }
        const keyList = refModel.getKeyMap('i') as string[];
        const maxId = Math.max(...keyList.map((item) => Number(item || 0)), 0);
        return `${maxId + 1}`;
    }

    getValue(unitId: string, subUnitId: string, row: number, col: number, model?: ObjectMatrix<INumfmtItem>) {
        const _model: Nullable<ObjectMatrix<INumfmtItem>> = model || this.getModel(unitId, subUnitId);
        if (!_model) {
            return null;
        }
        const refMode = this._refAliasModel.get(unitId);
        const value = _model.getValue(row, col);
        if (value && refMode) {
            const refValue = refMode.getValue(value?.i);
            if (!refValue) {
                this._logService.error('[Numfmt Service]:', 'RefAliasModel is not match model');
                return null;
            }
            return {
                pattern: refValue.pattern,
                type: refValue.type,
            };
        }
        return null;
    }

    deleteValues(unitId: string, subUnitId: string, values: IRange[]) {
        let refModel = this._refAliasModel.get(unitId)!;
        const model = this.getModel(unitId, subUnitId);
        if (!refModel) {
            refModel = new RefAlias<IRefItem, 'i' | 'pattern'>([], ['pattern', 'i']);
            this._refAliasModel.set(unitId, refModel);
        }
        values.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const oldValue = this.getValue(unitId, subUnitId, row, col, model);
                if (oldValue && oldValue.pattern) {
                    const oldRefPattern = refModel.getValue(oldValue.pattern);
                    if (oldRefPattern) {
                        oldRefPattern.count--;
                    }
                }
                this._setValue(unitId, subUnitId, row, col, null);
            });
        });
    }

    setValues(
        unitId: string,
        subUnitId: string,
        values: Array<{ ranges: IRange[]; pattern: string; type: FormatType }>
    ) {
        const model = this.getModel(unitId, subUnitId);
        let refModel = this._refAliasModel.get(unitId)!;
        if (!refModel) {
            refModel = new RefAlias<IRefItem, 'i' | 'pattern'>([], ['pattern', 'i']);
            this._refAliasModel.set(unitId, refModel);
        }
        values.forEach((value) => {
            let refPattern = refModel.getValue(value.pattern);
            if (!refPattern) {
                refPattern = {
                    count: 0,
                    i: this._getUniqueRefId(unitId),
                    pattern: value.pattern,
                    type: values[0].type,
                };
                refModel.addValue(refPattern);
            }

            value.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    if (model) {
                        const oldValue = this.getValue(unitId, subUnitId, row, col, model);
                        if (oldValue && oldValue.pattern) {
                            const oldRefPattern = refModel.getValue(oldValue.pattern);
                            if (oldRefPattern) {
                                oldRefPattern.count--;
                            }
                        }
                    }
                    this._setValue(unitId, subUnitId, row, col, {
                        i: refPattern!.i,
                    });
                    refPattern!.count++;
                });
            });
        });
    }

    getModel(unitId: string, subUnitId: string) {
        const workbookModel = this._numfmtModel.get(unitId);
        const sheetModel = workbookModel?.get(subUnitId);
        return sheetModel;
    }

    getRefModel(unitId: string) {
        const refModel = this._refAliasModel.get(unitId);
        return refModel;
    }
}

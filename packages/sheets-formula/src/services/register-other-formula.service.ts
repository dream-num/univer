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

import type { IRange, Nullable } from '@univerjs/core';
import type { IRemoveOtherFormulaMutationParams, ISetFormulaCalculationResultMutation, ISetOtherFormulaMutationParams } from '@univerjs/engine-formula';
import type { IOtherFormulaMarkDirtyParams } from '../commands/mutations/formula.mutation';
import { Disposable, ICommandService, ObjectMatrix, Tools } from '@univerjs/core';
import { IActiveDirtyManagerService, RemoveOtherFormulaMutation, SetFormulaCalculationResultMutation, SetOtherFormulaMutation } from '@univerjs/engine-formula';
import { Subject } from 'rxjs';
import { OtherFormulaMarkDirty } from '../commands/mutations/formula.mutation';
import { FormulaResultStatus, type IOtherFormulaResult } from './formula-common';

export class RegisterOtherFormulaService extends Disposable {
    private _formulaCacheMap: Map<string, Map<string, Map<string, IOtherFormulaResult>>> = new Map();

    /**
     * @deprecated Use _formulaChangeWithRange$ instead
     */
    private _formulaChange$ = new Subject<{ unitId: string; subUnitId: string; formulaText: string; formulaId: string }>();
    /**
     * @deprecated Use formulaChangeWithRange$ instead
     */
    public formulaChange$ = this._formulaChange$.asObservable();

    private _formulaChangeWithRange$ = new Subject<{ unitId: string; subUnitId: string; formulaText: string; formulaId: string; ranges: IRange[] }>();
    public formulaChangeWithRange$ = this._formulaChangeWithRange$.asObservable();

    // FIXME: this design could be improved.

    private _formulaResult$ = new Subject<Record<string, Record<string, IOtherFormulaResult[]>>>();
    public formulaResult$ = this._formulaResult$.asObservable();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IActiveDirtyManagerService private _activeDirtyManagerService: IActiveDirtyManagerService
    ) {
        super();
        this._initFormulaRegister();
        this._initFormulaCalculationResultChange();
    }

    override dispose(): void {
        super.dispose();

        this._formulaChange$.complete();
        this._formulaChangeWithRange$.complete();
        this._formulaResult$.complete();
    }

    private _ensureCacheMap(unitId: string, subUnitId: string) {
        let unitMap = this._formulaCacheMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._formulaCacheMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);

        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }

        return subUnitMap;
    }

    private _createFormulaId(unitId: string, subUnitId: string) {
        return `formula.${unitId}_${subUnitId}_${Tools.generateRandomId(8)}`;
    }

    private _initFormulaRegister() {
        this._activeDirtyManagerService.register(OtherFormulaMarkDirty.id,
            {
                commandId: OtherFormulaMarkDirty.id,
                getDirtyData(commandInfo) {
                    const params = commandInfo.params as IOtherFormulaMarkDirtyParams;
                    return {
                        dirtyUnitOtherFormulaMap: params,
                    };
                },
            });

        // this.formulaChange$.pipe(bufferTime(16), filter((list) => !!list.length), map((list) => {
        //     return list.reduce((result, cur) => {
        //         const { unitId, subUnitId, formulaId, formulaText } = cur;
        //         if (!result[unitId]) {
        //             result[unitId] = {};
        //         }
        //         if (!result[unitId][subUnitId]) {
        //             result[unitId][subUnitId] = {};
        //         }
        //         result[unitId][subUnitId][formulaId] = { f: formulaText };
        //         return result;
        //     }, {} as { [unitId: string]: { [sunUnitId: string]: { [formulaId: string]: { f: string } } } });
        // })).subscribe((result) => {
        //     for (const unitId in result) {
        //         for (const subUnitId in result[unitId]) {
        //             const value = result[unitId][subUnitId];
        //             const config: ISetOtherFormulaMutationParams = { unitId, subUnitId, formulaMap: value };
        //             this._commandService.executeCommand(SetOtherFormulaMutation.id, config).then(() => {
        //                 this._commandService.executeCommand(OtherFormulaMarkDirty.id,
        //                     { [unitId]: { [subUnitId]: value } } as unknown as IOtherFormulaMarkDirtyParams);
        //             });
        //         }
        //     }
        // });

        // Register formula that need to be marked dirty with formula and range list
        this._formulaChangeWithRange$.subscribe((option) => {
            const { unitId, subUnitId, formulaText, formulaId, ranges } = option;

            const params: ISetOtherFormulaMutationParams = {
                unitId,
                subUnitId,
                formulaMap: {
                    [formulaId]: {
                        f: formulaText,
                        ranges,
                    },
                },
            };

            this._commandService.executeCommand(SetOtherFormulaMutation.id, params).then(() => {
                this._commandService.executeCommand(OtherFormulaMarkDirty.id,
                    { [unitId]: { [subUnitId]: { [formulaId]: true } } });
            });
        });
    }

    private _initFormulaCalculationResultChange() {
        // Gets the result of the formula calculation and caches it
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetFormulaCalculationResultMutation.id) {
                const params = commandInfo.params as ISetFormulaCalculationResultMutation;

                const { unitOtherData } = params;
                const results: Record<string, Record<string, IOtherFormulaResult[]>> = {};
                for (const unitId in unitOtherData) {
                    const unitData = unitOtherData[unitId];
                    const unitResults: Record<string, IOtherFormulaResult[]> = {};
                    results[unitId] = unitResults;
                    for (const subUnitId in unitData) {
                        const cacheMap = this._ensureCacheMap(unitId, subUnitId);
                        const subUnitData = unitData[subUnitId];
                        const subUnitResults: IOtherFormulaResult[] = [];
                        unitResults[subUnitId] = subUnitResults;
                        for (const formulaId in subUnitData) {
                            const current = subUnitData[formulaId];
                            if (cacheMap.has(formulaId)) {
                                const item = cacheMap.get(formulaId);

                                if (!item) {
                                    continue;
                                }

                                if (!item?.result) {
                                    item.result = {};
                                }

                                const resultMatrix = new ObjectMatrix(current);
                                const resultObject = new ObjectMatrix(item?.result);

                                resultMatrix.forValue((row, col, value) => {
                                    resultObject.setValue(row, col, value);
                                });

                                item.status = FormulaResultStatus.SUCCESS;
                                item.callbacks.forEach((callback) => {
                                    callback(current);
                                });
                                item.callbacks.clear();
                                subUnitResults.push(item);
                            }
                        }
                    }
                }
                this._formulaResult$.next(results);
            }
        }));
    }

    /**
     * @deprecated Use registerFormulaWithRange instead
     * @param unitId
     * @param subUnitId
     * @param formulaText
     * @param extra
     * @returns
     */
    registerFormula(unitId: string, subUnitId: string, formulaText: string, extra?: Record<string, any>) {
        const formulaId = this._createFormulaId(unitId, subUnitId);
        const cacheMap = this._ensureCacheMap(unitId, subUnitId);

        cacheMap.set(formulaId, {
            result: undefined,
            status: FormulaResultStatus.WAIT,
            formulaId,
            callbacks: new Set(),
            extra,
        });
        this._formulaChange$.next({
            unitId,
            subUnitId,
            formulaText,
            formulaId,
        });
        return formulaId;
    }

    registerFormulaWithRange(unitId: string, subUnitId: string, formulaText: string, ranges: IRange[] = [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }], extra?: Record<string, any>) {
        const formulaId = this._createFormulaId(unitId, subUnitId);
        const cacheMap = this._ensureCacheMap(unitId, subUnitId);

        cacheMap.set(formulaId, {
            result: undefined,
            status: FormulaResultStatus.WAIT,
            formulaId,
            callbacks: new Set(),
            extra,
        });
        this._formulaChangeWithRange$.next({
            unitId,
            subUnitId,
            formulaText,
            formulaId,
            ranges,
        });
        return formulaId;
    }

    deleteFormula(unitId: string, subUnitId: string, formulaIdList: string[]) {
        const params: IRemoveOtherFormulaMutationParams = {
            unitId,
            subUnitId,
            formulaIdList,
        };
        this._commandService.executeCommand(RemoveOtherFormulaMutation.id, params);
        const cacheMap = this._ensureCacheMap(unitId, subUnitId);
        formulaIdList.forEach((id) => cacheMap.delete(id));
    }

    getFormulaValue(unitId: string, subUnitId: string, formulaId: string): Promise<Nullable<IOtherFormulaResult>> {
        const cacheMap = this._ensureCacheMap(unitId, subUnitId);
        const item = cacheMap.get(formulaId);
        if (!item) {
            return Promise.resolve(null);
        }

        if (item.status === FormulaResultStatus.SUCCESS || item.status === FormulaResultStatus.ERROR) {
            return Promise.resolve(item);
        }

        return new Promise((resolve) => {
            item.callbacks.add(() => {
                resolve(cacheMap.get(formulaId));
            });
        });
    }

    getFormulaValueSync(unitId: string, subUnitId: string, formulaId: string): Nullable<IOtherFormulaResult> {
        const cacheMap = this._ensureCacheMap(unitId, subUnitId);
        return cacheMap.get(formulaId);
    }
}

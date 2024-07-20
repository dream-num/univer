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

import { DataSyncPrimaryController } from '@univerjs/rpc';
import { RegisterOtherFormulaService } from '@univerjs/sheets-formula';
import type { DocumentDataModel, ICellData, IDisposable, IDocumentBody, IMutation, Nullable } from '@univerjs/core';
import {
    CommandType,
    CustomRangeType,
    Disposable,
    ICommandService,
    Inject,
    IResourceManagerService,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    makeCustomRangeStream,
    OnLifecycle,
    Optional,
    RCDisposable,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { makeSelection, replaceSelectionFactory } from '@univerjs/docs';

import { type IDocFormulaCache, type IDocFormulaData, type IDocFormulaReference, toJson } from '../models/doc-formula';
import { DOC_FORMULA_PLUGIN_NAME } from '../const';
import { AddDocUniFormulaMutation, RemoveDocUniFormulaMutation, UpdateDocUniFormulaMutation } from '../commands/mutation';

const DOC_PSEUDO_SUBUNIT = 'DOC_PSEUDO_SUBUNIT';

/**
 * Update calculating result in a batch.
 */
export interface IUpdateDocUniFormulaCacheMutationParams {
    /** The doc in which formula results changed. */
    unitId: string;
    /** Range ids. */
    ids: string[];
    /** Calculation results. */
    cache: IDocFormulaCache[];
}

/** This mutation is internal. It should not be exposed to third-party developers. */
const UpdateDocUniFormulaCacheMutation: IMutation<IUpdateDocUniFormulaCacheMutationParams> = {
    type: CommandType.MUTATION,
    id: 'doc.mutation.update-doc-uni-formula-cache',
    handler(accessor, params: IUpdateDocUniFormulaCacheMutationParams) {
        const { unitId, ids, cache } = params;

        const uniFormulaService = accessor.get(UniFormulaService);
        const instanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const data = instanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);

        /** The document may have not loaded on this client. We are safe to ignore cache updating. */
        if (!data) return true;
        const body = data.getBody();

        function getRange(rangeId: string) {
            return body?.customRanges?.find((r) => r.rangeId === rangeId);
        }

        const saveCacheResult = uniFormulaService.updateFormulaResults(unitId, ids, cache);
        if (!saveCacheResult) return false;

        return ids.every((id, index) => {
            const range = getRange(id);
            if (!range) return true; // If we cannot find that rangeId, we are save to ignore cache.

            const dataStream = makeCustomRangeStream(`${cache[index].v ?? ''}`);
            const body: IDocumentBody = {
                dataStream,
                customRanges: [{
                    startIndex: 0,
                    endIndex: dataStream.length - 1,
                    rangeId: id,
                    rangeType: CustomRangeType.UNI_FORMULA,
                    wholeEntity: true,
                }],
            };

            const redoMutation = replaceSelectionFactory(accessor, {
                unitId,
                body,
                selection: makeSelection(range.startIndex, range.endIndex),
            });

            if (redoMutation) {
                return commandService.syncExecuteCommand(redoMutation.id, redoMutation.params, { onlyLocal: true });
            }

            return false;
        });
    },
};

/**
 * This service provides methods for docs and slides to register a formula into
 * Univer's formula system.
 */
@OnLifecycle(LifecycleStages.Starting, UniFormulaService)
export class UniFormulaService extends Disposable {
    /** This data maps doc formula key to the formula id in the formula system. */
    private readonly _docFormulas = new Map<string, IDocFormulaReference>();
    private readonly _formulaIdToKey = new Map<string, string>();

    constructor(
    @IResourceManagerService resourceManagerService: IResourceManagerService,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService,
        // TODO: wzhudev We may need to register the doc formulas to formula service in later lifecycle stages.
        @ICommandService private readonly _commandSrv: ICommandService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @Inject(RegisterOtherFormulaService) private readonly _registerOtherFormulaSrv: RegisterOtherFormulaService,
        @Optional(DataSyncPrimaryController) private readonly _dataSyncPrimaryController?: DataSyncPrimaryController
    ) {
        super();

        this._initCommands();
        this._initDocFormulaResources(resourceManagerService);
        this._initDocDisposingListener();
        this._debugInitFormula();
    }

    override dispose(): void {
        super.dispose();

        // TODO: wzhudev: concrete disposing methods
    }

    private _initCommands(): void {
        [
            AddDocUniFormulaMutation,
            UpdateDocUniFormulaMutation,
            UpdateDocUniFormulaCacheMutation,
            RemoveDocUniFormulaMutation,
        ].forEach((command) => this._commandSrv.registerCommand(command));
    }

    /**
     * Remove all formulas under a doc.
     */
    private _unregisterDoc(unitId: string): void {
        const existingFormulas = Array.from(this._docFormulas.entries());
        existingFormulas.forEach(([_, value]) => {
            if (value.unitId === unitId) this.unregisterDocFormula(unitId, value.rangeId);
        });
    }

    /**
     * Register a doc formula into the formula system.
     */
    registerDocFormula(unitId: string, rangeId: string, f: string, v: ICellData['v'], t: ICellData['t']): IDisposable {
        const key = getDocFormulaKey(unitId, rangeId);
        if (this._docFormulas.has(key)) {
            throw new Error(`[UniFormulaService]: cannot register formula ${key} when it is already registered!`);
        }

        const pseudoId = getPseudoUnitKey(unitId);
        this._checkResultSubscription();
        this._checkSyncingUnit(pseudoId);

        const id = this._registerOtherFormulaSrv.registerFormula(pseudoId, DOC_PSEUDO_SUBUNIT, f);
        this._docFormulas.set(key, { unitId, rangeId, f, formulaId: id, v, t });
        this._formulaIdToKey.set(id, key);

        return toDisposable(() => this.unregisterDocFormula(unitId, rangeId));
    }

    unregisterDocFormula(unitId: string, rangeId: string): void {
        const key = getDocFormulaKey(unitId, rangeId);
        const item = this._docFormulas.get(key);
        if (!item) {
            return;
        }

        const pseudoId = getPseudoUnitKey(unitId);
        this._checkDisposingResultSubscription();
        this._dataSyncDisposables.get(pseudoId)?.dec();

        this._registerOtherFormulaSrv.deleteFormula(pseudoId, DOC_PSEUDO_SUBUNIT, [item.formulaId]);
        this._docFormulas.delete(key);
        this._formulaIdToKey.delete(item.formulaId);
    }

    hasFocFormula(unitId: string, formulaId: string): boolean {
        return this._docFormulas.has(getDocFormulaKey(unitId, formulaId));
    }

    updateFormulaResults(unitId: string, formulaIds: string[], v: IDocFormulaCache[]): boolean {
        // TODO: @wzhudev: should trigger re-render
        formulaIds.forEach((id, index) => {
            const formulaData = this._docFormulas.get(getDocFormulaKey(unitId, id));
            if (!formulaData) return true;

            formulaData.v = v[index].v;
            formulaData.t = v[index].t;
            return true;
        });

        return true;
    }

    private _dataSyncDisposables = new Map<string, RCDisposable>();
    private _checkSyncingUnit(unitId: string): void {
        if (!this._dataSyncPrimaryController) return;

        if (!this._dataSyncDisposables.has(unitId)) {
            this._dataSyncPrimaryController.syncUnit(unitId);
            this._dataSyncDisposables.set(unitId, new RCDisposable(toDisposable(() => this._dataSyncDisposables.delete(unitId))));
        }

        this._dataSyncDisposables.get(unitId)!.inc();
    }

    private _resultSubscription: Nullable<IDisposable>;
    private _checkResultSubscription(): void {
        if (this._resultSubscription) return;

        this._resultSubscription = toDisposable(this._registerOtherFormulaSrv.formulaResult$.subscribe((resultMap) => {
            for (const resultOfUnit in resultMap) {
                const results = resultMap[resultOfUnit][DOC_PSEUDO_SUBUNIT];
                if (results) {
                    const mutationParam = results.map((result) => {
                        const formulaId = result.formulaId;
                        const key = this._formulaIdToKey.get(formulaId);
                        if (!key) return null;

                        const item = this._docFormulas.get(key);
                        if (!item) return null;

                        const r = result.result?.[0][0];
                        if (item.v === r?.v && item.t === r?.t) return null;

                        return { id: item.rangeId, unitId: item.unitId, cache: r };
                    }).reduce((previous, curr) => {
                        if (!curr || !curr.cache) return previous;

                        if (!previous.unitId) previous.unitId = curr.unitId;
                        previous.ids.push(curr.id);
                        previous.cache.push(curr.cache);

                        return previous;
                    }, {
                        unitId: '',
                        ids: [] as string[],
                        cache: [] as Pick<ICellData, 'v' | 't'>[],
                    });

                    if (mutationParam.ids.length === 0) return;

                    this._commandSrv.executeCommand(UpdateDocUniFormulaCacheMutation.id, mutationParam as IUpdateDocUniFormulaCacheMutationParams);
                }
            }
        }));
    }

    private _checkDisposingResultSubscription(): void {
        if (this._docFormulas.size === 0 && this._resultSubscription) {
            this._resultSubscription.dispose();
            this._resultSubscription = null;
        }
    }

    private _debugInitFormula(): void {
        this.registerDocFormula('test_doc', 'test_formula_id', '=\'[workbook-01]工作表11\'!A13');
    }

    private _initDocFormulaResources(resourceManagerService: IResourceManagerService): void {
        resourceManagerService.registerPluginResource({
            pluginName: DOC_FORMULA_PLUGIN_NAME,
            businesses: [UniverInstanceType.UNIVER_DOC],
            toJson: (unitId: string) => {
                const formulas = this._getAllFormulasOfUnit(unitId);
                return toJson(formulas.map((f) => f[1]));
            },
            parseJson: (json: string) => {
                const formulas = JSON.parse(json) as IDocFormulaData[];
                return formulas;
            },
            onLoad: (unitId, formulas) => {
                // NOTE: Should wait for lifecycle?
                formulas.forEach((f) => this.registerDocFormula(unitId, f.rangeId, f.f, f.v, f.t));
            },
            onUnLoad: (unitId) => {
                this._unregisterDoc(unitId);
            },
        });
    }

    private _initDocDisposingListener(): void {
        this._instanceSrv.getTypeOfUnitDisposed$(UniverInstanceType.UNIVER_DOC).subscribe((doc) => {
            this._unregisterDoc(doc.getUnitId());
        });
    }

    private _getAllFormulasOfUnit(unitId: string) {
        const formulas = Array.from(this._docFormulas.entries()).filter((v) => v[1].unitId === unitId);
        return formulas;
    }
}

function getPseudoUnitKey(unitId: string): string {
    return `pseudo-${unitId}`;
}

function getDocFormulaKey(unitId: string, formulaId: string): string {
    return `pseudo-${unitId}-${formulaId}`;
}


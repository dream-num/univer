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

import type {
    DocumentDataModel,
    ICellData,
    ICommand,
    IDisposable,
    IDocumentBody,
    Nullable,
} from '@univerjs/core';
import {
    CommandType,
    CustomRangeType,
    ICommandService,
    Inject,
    Injector,
    IResourceManagerService,
    IUniverInstanceService,
    makeCustomRangeStream,
    Quantity,
    RCDisposable,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { makeSelection, replaceSelectionFactory } from '@univerjs/docs';
import { DataSyncPrimaryController } from '@univerjs/rpc';
import { RegisterOtherFormulaService } from '@univerjs/sheets-formula';
import type { IDocFormulaCache } from '@univerjs/uni-formula';
import { DumbUniFormulaService, IUniFormulaService } from '@univerjs/uni-formula';
import { take } from 'rxjs';

const DOC_PSEUDO_SUBUNIT = 'DOC_PSEUDO_SUBUNIT';
/**
 * Update calculating result in a batch.
 */
export interface IUpdateDocUniFormulaCacheCommandParams {
    /** The doc in which formula results changed. */
    unitId: string;
    /** Range ids. */
    ids: string[];
    /** Calculation results. */
    cache: IDocFormulaCache[];
}

/**
 * This command is internal. It should not be exposed to third-party developers.
 *
 * @ignore
 */
export const UpdateDocUniFormulaCacheCommand: ICommand<IUpdateDocUniFormulaCacheCommandParams> = {
    type: CommandType.COMMAND,
    id: 'doc.mutation.update-doc-uni-formula-cache',
    handler(accessor, params: IUpdateDocUniFormulaCacheCommandParams) {
        const { unitId, ids, cache } = params;

        const uniFormulaService = accessor.get(IUniFormulaService);
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
                return commandService.syncExecuteCommand(redoMutation.id, redoMutation.params);
            }

            return false;
        });
    },
};

/**
 * This service provides methods for docs and slides to register a formula into Univer's formula system.
 * And it also manages formula resources fields of docs and slides. `SHEETS_FORMULA_REMOTE_PLUGIN`
 * is not required but optional here.
 */
export class UniFormulaService extends DumbUniFormulaService implements IUniFormulaService {
    private readonly _formulaIdToKey = new Map<string, string>();

    private _canPerformFormulaCalculation = false;

    private get _registerOtherFormulaSrv() { return this._injector.get(RegisterOtherFormulaService); }
    private get _dataSyncPrimaryController() { return this._injector.get(DataSyncPrimaryController, Quantity.OPTIONAL); }

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IResourceManagerService resourceManagerService: IResourceManagerService,
        @ICommandService commandSrv: ICommandService,
        @IUniverInstanceService instanceSrv: IUniverInstanceService
    ) {
        super(resourceManagerService, commandSrv, instanceSrv);

        commandSrv.registerCommand(UpdateDocUniFormulaCacheCommand);

        // Only able to perform formula calculation after a sheet is loaded.
        // FIXME: the formula engine is not unit-agnostic.
        if (instanceSrv.getAllUnitsForType(UniverInstanceType.UNIVER_SHEET).length) {
            this._canPerformFormulaCalculation = true;
        } else {
            this.disposeWithMe(this._instanceSrv.getTypeOfUnitAdded$(UniverInstanceType.UNIVER_SHEET).pipe(take(1))
                .subscribe(() => {
                    this._canPerformFormulaCalculation = true;
                    this._initFormulaRegistration();
                }));
        }
    }

    /**
     * Register a doc formula into the formula system.
     */
    override registerDocFormula(unitId: string, rangeId: string, f: string, v: ICellData['v'], t: ICellData['t']): IDisposable {
        const key = getDocFormulaKey(unitId, rangeId);
        if (this._docFormulas.has(key)) {
            throw new Error(`[UniFormulaService]: cannot register formula ${key} when it is already registered!`);
        }

        if (this._canPerformFormulaCalculation) {
            const pseudoId = getPseudoUnitKey(unitId);
            this._checkSyncingUnit(pseudoId);

            const id = this._registerOtherFormulaSrv.registerFormula(pseudoId, DOC_PSEUDO_SUBUNIT, f);
            this._docFormulas.set(key, { unitId, rangeId, f, formulaId: id, v, t });
            this._formulaIdToKey.set(id, key);

            this._checkResultSubscription();
        } else {
            this._docFormulas.set(key, { unitId, rangeId, f, formulaId: '', v, t });
        }

        return toDisposable(() => this.unregisterDocFormula(unitId, rangeId));
    }

    override unregisterDocFormula(unitId: string, rangeId: string): void {
        const key = getDocFormulaKey(unitId, rangeId);
        const item = this._docFormulas.get(key);
        if (!item) return;

        const pseudoId = getPseudoUnitKey(unitId);
        this._checkDisposingResultSubscription();
        this._dataSyncDisposables.get(pseudoId)?.dec();

        if (this._canPerformFormulaCalculation) {
            this._registerOtherFormulaSrv.deleteFormula(pseudoId, DOC_PSEUDO_SUBUNIT, [item.formulaId]);
            this._formulaIdToKey.delete(item.formulaId);
        }

        this._docFormulas.delete(key);
    }

    private _initFormulaRegistration(): void {
        // When the doc bootstraps, there could be no sheets modules loaded. So we need to check if there
        // are registered formulas but not added to the formula system.
        this._docFormulas.forEach((value, key) => {
            if (!value.formulaId) {
                const { unitId, f } = value;
                const pseudoId = getPseudoUnitKey(unitId);
                this._checkSyncingUnit(pseudoId);

                const id = this._registerOtherFormulaSrv.registerFormula(pseudoId, DOC_PSEUDO_SUBUNIT, f);
                value.formulaId = id;
                this._formulaIdToKey.set(id, key);
            }
        });
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
        if (this._resultSubscription || !this._registerOtherFormulaSrv) return;

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

                    this._commandSrv.executeCommand(UpdateDocUniFormulaCacheCommand.id, mutationParam as IUpdateDocUniFormulaCacheCommandParams);
                }
            }
        }));
    }

    private _checkDisposingResultSubscription(): void {
        if (this._docFormulas.size === 0) this._disposeResultSubscription();
    }

    private _disposeResultSubscription(): void {
        if (this._resultSubscription) {
            this._resultSubscription.dispose();
            this._resultSubscription = null;
        }
    }

    private _checkFormulaUsable(): void {
        if (!this._canPerformFormulaCalculation && this._instanceSrv.getAllUnitsForType(UniverInstanceType.UNIVER_SHEET).length) {
            this._canPerformFormulaCalculation = true;
        }
    }
}

function getPseudoUnitKey(unitId: string): string {
    return `pseudo-${unitId}`;
}

function getDocFormulaKey(unitId: string, formulaId: string): string {
    return `pseudo-${unitId}-${formulaId}`;
}

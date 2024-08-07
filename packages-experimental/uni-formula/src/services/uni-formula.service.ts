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

import type { DocumentDataModel, ICellData, IDisposable, IDocumentBody, IMutation, Nullable } from '@univerjs/core';
import {
    CommandType,
    createIdentifier,
    CustomRangeType,
    ICommandService,
    IResourceManagerService,
    IUniverInstanceService,
    makeCustomRangeStream,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { makeSelection, replaceSelectionFactory } from '@univerjs/docs';

import { type IDocFormulaCache, type IDocFormulaData, type IDocFormulaReference, toJson } from '../models/doc-formula';
import { DOC_FORMULA_PLUGIN_NAME } from '../const';
import { AddDocUniFormulaMutation, RemoveDocUniFormulaMutation, UpdateDocUniFormulaMutation } from '../commands/mutation';

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

/**
 * This mutation is internal. It should not be exposed to third-party developers.
 * This mutation should be registered on the server side as well.
 *
 * @ignore
 */
export const UpdateDocUniFormulaCacheMutation: IMutation<IUpdateDocUniFormulaCacheMutationParams> = {
    type: CommandType.MUTATION,
    id: 'doc.mutation.update-doc-uni-formula-cache',
    handler(accessor, params: IUpdateDocUniFormulaCacheMutationParams) {
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
                return commandService.syncExecuteCommand(redoMutation.id, redoMutation.params, { onlyLocal: true });
            }

            return false;
        });
    },
};

export interface IUniFormulaService {
    getFormulaWithRangeId(unitId: string, rangeId: string): Nullable<IDocFormulaReference>;
    registerDocFormula(unitId: string, rangeId: string, f: string, v: ICellData['v'], t: ICellData['t']): IDisposable;

    unregisterDocFormula(unitId: string, rangeId: string): void;
    hasFocFormula(unitId: string, formulaId: string): boolean;
    updateFormulaResults(unitId: string, formulaIds: string[], v: IDocFormulaCache[]): boolean;
}

export const IUniFormulaService = createIdentifier<IUniFormulaService>('uni-formula.uni-formula.service');

export class DumbUniFormulaService {
    /** This data maps doc formula key to the formula id in the formula system. */
    protected readonly _docFormulas = new Map<string, IDocFormulaReference>();

    constructor(
    @IResourceManagerService resourceManagerService: IResourceManagerService,
        @ICommandService protected readonly _commandSrv: ICommandService,
        @IUniverInstanceService protected readonly _instanceSrv: IUniverInstanceService
    ) {
        this._initCommands();
        this._initDocFormulaResources(resourceManagerService);

        this._instanceSrv.getTypeOfUnitDisposed$(UniverInstanceType.UNIVER_DOC).subscribe((doc) => {
            this._unregisterDoc(doc.getUnitId());
        });
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

        this._docFormulas.set(key, { unitId, rangeId, f, formulaId: '', v, t });

        return toDisposable(() => this.unregisterDocFormula(unitId, rangeId));
    }

    unregisterDocFormula(unitId: string, rangeId: string): void {
        const key = getDocFormulaKey(unitId, rangeId);
        const item = this._docFormulas.get(key);
        if (item) {
            this._docFormulas.delete(key);
        }
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
                formulas.forEach((f) => this.registerDocFormula(unitId, f.rangeId, f.f, f.v, f.t));
            },
            onUnLoad: (unitId) => {
                this._unregisterDoc(unitId);
            },
        });
    }

    private _getAllFormulasOfUnit(unitId: string) {
        const formulas = Array.from(this._docFormulas.entries()).filter((v) => v[1].unitId === unitId);
        return formulas;
    }
}

export function getPseudoUnitKey(unitId: string): string {
    return `pseudo-${unitId}`;
}

export function getDocFormulaKey(unitId: string, formulaId: string): string {
    return `pseudo-${unitId}-${formulaId}`;
}

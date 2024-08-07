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

import type { ICellData, IDisposable, Nullable } from '@univerjs/core';
import {
    createIdentifier,
    ICommandService,
    IResourceManagerService,
    IUniverInstanceService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';

import { type IDocFormulaCache, type IDocFormulaData, type IDocFormulaReference, toJson } from '../models/doc-formula';
import { DOC_FORMULA_PLUGIN_NAME } from '../const';
import { AddDocUniFormulaMutation, RemoveDocUniFormulaMutation, UpdateDocUniFormulaMutation } from '../commands/mutation';

export interface IUniFormulaService {
    getFormulaWithRangeId(unitId: string, rangeId: string): Nullable<IDocFormulaReference>;
    registerDocFormula(unitId: string, rangeId: string, f: string, v: ICellData['v'], t: ICellData['t']): IDisposable;

    unregisterDocFormula(unitId: string, rangeId: string): void;
    hasFocFormula(unitId: string, formulaId: string): boolean;
    updateFormulaResults(unitId: string, formulaIds: string[], v: IDocFormulaCache[]): boolean;
}

export const IUniFormulaService = createIdentifier<IUniFormulaService>('uni-formula.uni-formula.service');

export class DumbUniFormulaService implements IUniFormulaService {
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

    hasFocFormula(unitId: string, formulaId: string): boolean {
        return this._docFormulas.has(getDocFormulaKey(unitId, formulaId));
    }

    getFormulaWithRangeId(unitId: string, rangeId: string): Nullable<IDocFormulaReference> {
        return this._docFormulas.get(getDocFormulaKey(unitId, rangeId)) ?? null;
    }

    updateFormulaResults(unitId: string, formulaIds: string[], v: IDocFormulaCache[]): boolean {
        formulaIds.forEach((id, index) => {
            const formulaData = this._docFormulas.get(getDocFormulaKey(unitId, id));
            if (!formulaData) return true;

            formulaData.v = v[index].v;
            formulaData.t = v[index].t;
            return true;
        });

        return true;
    }

    private _initCommands(): void {
        [
            AddDocUniFormulaMutation,
            UpdateDocUniFormulaMutation,
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

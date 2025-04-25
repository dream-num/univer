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

import type { ICellData, IDisposable, Nullable } from '@univerjs/core';
import type { IDocFormulaCache, IDocFormulaData, IDocFormulaReference } from '../models/doc-formula';

import type { ISlideFormulaReference } from '../models/slide-formula';
import {
    createIdentifier,
    Disposable,
    ICommandService,
    IResourceManagerService,
    IUniverInstanceService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { DOC_UNI_FORMULA_RESOURCE_NAME } from '../const';
import { toJson } from '../models/doc-formula';

export interface IUniFormulaService {
    updateDocFormulaResults(unitId: string, formulaIds: string[], v: IDocFormulaCache[]): boolean;
    updateSlideFormulaResults(unitId: string, pageId: string, elementId: string, formulaId: string, v: IDocFormulaCache): boolean;

    // #region doc
    hasDocFormula(unitId: string, formulaId: string): boolean;
    getDocFormula(unitId: string, rangeId: string): Nullable<IDocFormulaReference>;
    registerDocFormula(unitId: string, rangeId: string, f: string, v: ICellData['v'], t: ICellData['t']): IDisposable;
    unregisterDocFormula(unitId: string, rangeId: string): void;
    // #endregion

    // #region slide
    hasSlideFormula(unitId: string, pageId: string, elementId: string, formulaId: string): boolean;
    getSlideFormula(unitId: string, pageId: string, elementId: string, formulaId: string): Nullable<ISlideFormulaReference>;
    registerSlideFormula(unitId: string, pageId: string, elementId: string, f: string, v: ICellData['v'], t: ICellData['t']): IDisposable;
    unregisterSlideFormula(unitId: string, pageId: string, elementId: string, formulaId: string): void;
    // #endregion
}

export const IUniFormulaService = createIdentifier<IUniFormulaService>('uni-formula.uni-formula.service');

// NOTE@wzhudev: we implement formula for doc and slide here for convenience, but we should separate them in the future.

export class DumbUniFormulaService extends Disposable implements IUniFormulaService {
    protected readonly _docFormulas = new Map<string, IDocFormulaReference>();
    protected readonly _slideFormulas = new Map<string, ISlideFormulaReference>();

    constructor(
        @IResourceManagerService resourceManagerSrv: IResourceManagerService,
        @ICommandService protected readonly _commandSrv: ICommandService,
        @IUniverInstanceService protected readonly _instanceSrv: IUniverInstanceService
    ) {
        super();

        this._initDocFormulaResources(resourceManagerSrv);

        this._instanceSrv.getTypeOfUnitDisposed$(UniverInstanceType.UNIVER_DOC).subscribe((doc) => {
            this._unregisterDoc(doc.getUnitId());
        });
    }

    // #region docs

    hasDocFormula(unitId: string, formulaId: string): boolean {
        return this._docFormulas.has(getDocFormulaKey(unitId, formulaId));
    }

    getDocFormula(unitId: string, rangeId: string): Nullable<IDocFormulaReference> {
        return this._docFormulas.get(getDocFormulaKey(unitId, rangeId)) ?? null;
    }

    updateDocFormulaResults(unitId: string, formulaIds: string[], v: IDocFormulaCache[]): boolean {
        formulaIds.forEach((id, index) => {
            const formulaData = this._docFormulas.get(getDocFormulaKey(unitId, id));
            if (!formulaData) return true;

            formulaData.v = v[index].v;
            formulaData.t = v[index].t;
            return true;
        });

        return true;
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

    updateSlideFormulaResults(unitId: string, pageId: string, elementId: string, formulaId: string, v: IDocFormulaCache): boolean {
        const formulaData = this._slideFormulas.get(getSlideFormulaKey(unitId, pageId, elementId, formulaId));
        if (!formulaData) return true;

        formulaData.v = v.v;
        formulaData.t = v.t;
        return true;
    }

    private _initDocFormulaResources(resourceManagerService: IResourceManagerService): void {
        resourceManagerService.registerPluginResource({
            pluginName: DOC_UNI_FORMULA_RESOURCE_NAME,
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

    /**
     * Remove all formulas under a doc.
     */
    private _unregisterDoc(unitId: string): void {
        const existingFormulas = Array.from(this._docFormulas.entries());
        existingFormulas.forEach(([_, value]) => {
            if (value.unitId === unitId) this.unregisterDocFormula(unitId, value.rangeId);
        });
    }

    // #endregion

    // #region slides

    registerSlideFormula(
        unitId: string,
        pageId: string,
        elementId: string,
        rangeId: string,
        f: string,
        v: ICellData['v'],
        t: ICellData['t']
    ): IDisposable {
        const key = getSlideFormulaKey(unitId, pageId, elementId, f);
        if (this._slideFormulas.has(key)) {
            throw new Error(`[UniFormulaService]: cannot register formula ${key} when it is already registered!`);
        }

        this._slideFormulas.set(key, { unitId, pageId, elementId, rangeId, formulaId: '', f, v, t });

        return toDisposable(() => this.unregisterDocFormula(unitId, rangeId));
    }

    hasSlideFormula(unitId: string, pageId: string, elementId: string, formulaId: string): boolean {
        return this._slideFormulas.has(getSlideFormulaKey(unitId, pageId, elementId, formulaId));
    }

    getSlideFormula(unitId: string, pageId: string, elementId: string, formulaId: string): Nullable<ISlideFormulaReference> {
        return this._slideFormulas.get(getSlideFormulaKey(unitId, pageId, elementId, formulaId)) ?? null;
    }

    unregisterSlideFormula(unitId: string, pageId: string, elementId: string, formulaId: string): void {
        const key = getSlideFormulaKey(unitId, pageId, elementId, formulaId);
        const item = this._slideFormulas.get(key);
        if (item) {
            this._slideFormulas.delete(key);
        }
    }

    // #endregion

    private _getAllFormulasOfUnit(unitId: string) {
        const formulas = Array.from(this._docFormulas.entries()).filter((v) => v[1].unitId === unitId);
        return formulas;
    }
}

export function getPseudoDocUnitKey(unitId: string): string {
    return `pseudo-${unitId}`;
}

export function getDocFormulaKey(unitId: string, formulaId: string): string {
    return `pseudo-${unitId}-${formulaId}`;
}

function getSlideFormulaKey(unitId: string, pageId: string, elementId: string, formulaId: string): string {
    return `pseudo-${unitId}-${pageId}-${elementId}-${formulaId}`;
}

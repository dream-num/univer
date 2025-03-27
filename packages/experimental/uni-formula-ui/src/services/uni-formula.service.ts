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

import type {
    DocumentDataModel,
    ICellData,
    ICommand,
    IDisposable,
    IDocumentBody,
    Nullable,
    SlideDataModel,
} from '@univerjs/core';
import type { IDocFormulaCache, ISlideFormulaCache } from '@univerjs/uni-formula';
import type { IDocPopupPosition, ISlidePopupPosition } from '../commands/operations/operation';
import {
    BuildTextUtils,
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
import { replaceSelectionFactory } from '@univerjs/docs';
import { RichText } from '@univerjs/engine-render';
import { DataSyncPrimaryController } from '@univerjs/rpc';
import { RegisterOtherFormulaService } from '@univerjs/sheets-formula';
import { CanvasView } from '@univerjs/slides-ui';
import { DumbUniFormulaService, IUniFormulaService } from '@univerjs/uni-formula';
import { take } from 'rxjs';
import { isSlidePosition } from '../commands/operations/operation';

const PSEUDO_SUBUNIT = 'PSEUDO_SUBUNIT';

export interface IUpdateSlideUniFormulaCacheCommandParams {
    unitId: string;
    positions: ISlidePopupPosition[];
    cache: ISlideFormulaCache[];
}

export interface IUpdateDocUniFormulaCacheCommandParams {
    /** The doc in which formula results changed. */
    unitId: string;
    positions: ISlidePopupPosition[] | IDocPopupPosition[];
    /** Calculation results. */
    cache: IDocFormulaCache[];
}

export const UpdateSlideUniFormulaCacheCommand: ICommand<IUpdateSlideUniFormulaCacheCommandParams> = {
    type: CommandType.COMMAND,
    id: 'uni-formula.mutation.update-slide-uni-formula-cache',
    handler(accessor, params: IUpdateSlideUniFormulaCacheCommandParams) {
        const { unitId, positions, cache } = params;

        const uniFormulaService = accessor.get(IUniFormulaService);
        const instanceService = accessor.get(IUniverInstanceService);
        const slideCanvasView = accessor.get(CanvasView);

        const slide = instanceService.getUnit<SlideDataModel>(unitId, UniverInstanceType.UNIVER_SLIDE);
        if (!slide) return true;

        return positions.every((position, index) => {
            // TODO@wzhudev: we should get the slide's rendering modules to update the formula results.
            // Note that this is very hacky because Univer Slide hasn't provide any mutations to
            // modify its content. This is just for POC of uni formula.
            const scene = slideCanvasView.getRenderUnitByPageId(position.pageId, unitId).scene;
            if (!scene) return false;

            const element = scene.getObject(position.elementId);
            if (!element || !(element instanceof RichText)) return false;

            const documentModel = element.documentModel;
            const originBody = documentModel.getBody()!;
            const range = originBody.customRanges?.find((r) => r.rangeId === position.rangeId);
            if (!range) return false;

            const dataStream = makeCustomRangeStream(`${cache[index].v ?? ''}`);
            const body: IDocumentBody = {
                dataStream,
                customRanges: [{
                    startIndex: 0,
                    endIndex: dataStream.length - 1,
                    rangeId: position.rangeId!,
                    rangeType: CustomRangeType.UNI_FORMULA,
                    wholeEntity: true,
                }],
            };

            const redoMutation = replaceSelectionFactory(accessor, {
                unitId,
                body,
                selection: BuildTextUtils.selection.makeSelection(range.startIndex, range.endIndex),
                doc: documentModel,
            });

            if (!redoMutation) return false;

            // This is pretty annoying...
            element.documentModel.apply(redoMutation.params.actions);
            element.refreshDocumentByDocData(); // trigger re-render

            uniFormulaService.updateSlideFormulaResults(unitId, position.pageId, position.elementId, position.rangeId!, cache[index]);

            return true;
        });
    },
};

/**
 * This command is internal. It should not be exposed to third-party developers.
 *
 * @ignore
 */
export const UpdateDocUniFormulaCacheCommand: ICommand<IUpdateDocUniFormulaCacheCommandParams> = {
    type: CommandType.COMMAND,
    id: 'uni-formula.mutation.update-doc-uni-formula-cache',
    handler(accessor, params: IUpdateDocUniFormulaCacheCommandParams) {
        const { unitId, positions, cache } = params;

        const uniFormulaService = accessor.get(IUniFormulaService);
        const instanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const doc = instanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        // The document may have not loaded on this client. We are safe to ignore cache updating.
        if (!doc) return true;

        const body = doc.getBody();

        function getRange(rangeId: string) {
            return body?.customRanges?.find((r) => r.rangeId === rangeId);
        }

        const ids = positions.map((position) => position.rangeId!);
        const saveCacheResult = uniFormulaService.updateDocFormulaResults(unitId, ids, cache);
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
                selection: BuildTextUtils.selection.makeSelection(range.startIndex, range.endIndex),
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
 * And it also manages formula resources fields of docs and slides. `SHEET_FORMULA_REMOTE_PLUGIN`
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

        [
            UpdateSlideUniFormulaCacheCommand,
            UpdateDocUniFormulaCacheCommand,
        ].forEach((command) => commandSrv.registerCommand(command));

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

            const id = this._registerOtherFormulaSrv.registerFormulaWithRange(pseudoId, PSEUDO_SUBUNIT, f);
            this._docFormulas.set(key, { unitId, rangeId, f, formulaId: id, v, t });
            this._formulaIdToKey.set(id, key);

            this._checkResultSubscription();
        } else {
            this._docFormulas.set(key, { unitId, rangeId, f, formulaId: '', v, t });
        }

        return toDisposable(() => this.unregisterDocFormula(unitId, rangeId));
    }

    override registerSlideFormula(
        unitId: string,
        pageId: string,
        elementId: string,
        rangeId: string,
        f: string,
        v: ICellData['v'],
        t: ICellData['t']
    ): IDisposable {
        const key = getSlideFormulaKey(unitId, pageId, elementId, rangeId);
        if (this._slideFormulas.has(key)) {
            throw new Error(`[UniFormulaService]: cannot register formula ${key} when it is already registered!`);
        }

        if (this._canPerformFormulaCalculation) {
            const pseudoId = getPseudoUnitKey(unitId);
            this._checkSyncingUnit(pseudoId);

            const id = this._registerOtherFormulaSrv.registerFormulaWithRange(pseudoId, PSEUDO_SUBUNIT, f);
            this._slideFormulas.set(key, { unitId, pageId, elementId, rangeId, f, formulaId: id, v, t });
            this._formulaIdToKey.set(id, key);

            this._checkResultSubscription();
        } else {
            this._slideFormulas.set(key, { unitId, pageId, elementId, rangeId, f, formulaId: '', v, t });
        }

        return toDisposable(() => this.unregisterSlideFormula(unitId, pageId, elementId, rangeId));
    }

    override unregisterDocFormula(unitId: string, rangeId: string): void {
        const key = getDocFormulaKey(unitId, rangeId);
        const item = this._docFormulas.get(key);
        if (!item) return;

        const pseudoId = getPseudoUnitKey(unitId);
        this._checkDisposingResultSubscription();
        this._dataSyncDisposables.get(pseudoId)?.dec();

        if (this._canPerformFormulaCalculation) {
            this._registerOtherFormulaSrv.deleteFormula(pseudoId, PSEUDO_SUBUNIT, [item.formulaId]);
            this._formulaIdToKey.delete(item.formulaId);
        }

        this._docFormulas.delete(key);
    }

    override unregisterSlideFormula(unitId: string, pageId: string, elementId: string, formulaId: string): void {
        const key = getSlideFormulaKey(unitId, pageId, elementId, formulaId);
        const item = this._slideFormulas.get(key);
        if (!item) return;

        const pseudoId = getPseudoUnitKey(unitId);
        this._checkDisposingResultSubscription();
        this._dataSyncDisposables.get(pseudoId)?.dec();

        if (this._canPerformFormulaCalculation) {
            this._registerOtherFormulaSrv.deleteFormula(pseudoId, PSEUDO_SUBUNIT, [item.formulaId]);
            this._formulaIdToKey.delete(item.formulaId);
        }

        this._slideFormulas.delete(key);
    }

    private _initFormulaRegistration(): void {
        // When the doc bootstraps, there could be no sheets modules loaded. So we need to check if there
        // are registered formulas but not added to the formula system.
        this._docFormulas.forEach((value, key) => {
            if (!value.formulaId) {
                const { unitId, f } = value;
                const pseudoId = getPseudoUnitKey(unitId);
                this._checkSyncingUnit(pseudoId);

                const id = this._registerOtherFormulaSrv.registerFormulaWithRange(pseudoId, PSEUDO_SUBUNIT, f);
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
                const results = resultMap[resultOfUnit][PSEUDO_SUBUNIT];
                if (results) {
                    const mutationParam = results.map((result) => {
                        const formulaId = result.formulaId;
                        const key = this._formulaIdToKey.get(formulaId);
                        if (!key) return null;

                        const docItem = this._docFormulas.get(key);
                        if (docItem) {
                            const r = result.result?.[0][0][0][0]; // Ranges defaults to one row and one column
                            if (docItem.v === r?.v && docItem.t === r?.t) return null;

                            return { position: { rangeId: docItem.rangeId }, unitId: docItem.unitId, cache: r };
                        };

                        const slideItem = this._slideFormulas.get(key);
                        if (slideItem) {
                            const r = result.result?.[0][0][0][0]; // Ranges defaults to one row and one column
                            if (slideItem.v === r?.v && slideItem.t === r?.t) return null;

                            return {
                                unitId: slideItem.unitId,
                                position: {
                                    elementId: slideItem.elementId,
                                    rangeId: slideItem.rangeId,
                                    pageId: slideItem.pageId,
                                },
                                cache: r,
                            };
                        }

                        return null;
                    }).reduce((previous, curr) => {
                        if (!curr || !curr.cache) return previous;

                        if (!previous.unitId) previous.unitId = curr.unitId;
                        previous.positions.push(curr.position);
                        previous.cache.push(curr.cache);

                        return previous;
                    }, {
                        unitId: '',
                        positions: [] as (ISlidePopupPosition | IDocPopupPosition)[],
                        cache: [] as Pick<ICellData, 'v' | 't'>[],
                    });

                    if (mutationParam.positions.length === 0) return;

                    if (isSlidePosition(mutationParam.positions[0])) {
                        this._commandSrv.executeCommand(UpdateSlideUniFormulaCacheCommand.id, mutationParam as IUpdateSlideUniFormulaCacheCommandParams);
                    } else {
                        this._commandSrv.executeCommand(UpdateDocUniFormulaCacheCommand.id, mutationParam as IUpdateDocUniFormulaCacheCommandParams);
                    }
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
}

function getPseudoUnitKey(unitId: string): string {
    return `pseudo-${unitId}`;
}

function getDocFormulaKey(unitId: string, formulaId: string): string {
    return `pseudo-${unitId}-${formulaId}`;
}

function getSlideFormulaKey(unitId: string, pageId: string, elementId: string, rangeId: string): string {
    return `pseudo-${unitId}-${pageId}-${elementId}-${rangeId}`;
}

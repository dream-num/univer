import {
    OnLifecycle,
    LifecycleStages,
    IResourceManagerService,
    ICommandService,
    IUniverInstanceService,
    Optional,
    Nullable,
    ICellData,
    IDisposable,
    toDisposable,
    RCDisposable,
    Inject
} from "@univerjs/core";
import { DataSyncPrimaryController } from "@univerjs/rpc";
import { RegisterOtherFormulaService } from "@univerjs/sheets-formula";
import {
    IUniFormulaService,
    IUpdateDocUniFormulaCacheMutationParams,
} from "@univerjs/uni-formula";
import { IDocFormulaReference, IDocFormulaCache, toJson, IDocFormulaData } from "@univerjs/uni-formula/models/doc-formula.js";
import { DumbUniFormulaService, UpdateDocUniFormulaCacheMutation } from "@univerjs/uni-formula/services/uni-formula.service.js";

const DOC_PSEUDO_SUBUNIT = 'DOC_PSEUDO_SUBUNIT';

/**
 * This service provides methods for docs and slides to register a formula into Univer's formula system.
 * And it also manages formula resources fields of docs and slides. `SHEETS_FORMULA_REMOTE_PLUGIN`
 * is not required but optional here.
 */
@OnLifecycle(LifecycleStages.Steady, UniFormulaService)
export class UniFormulaService extends DumbUniFormulaService implements IUniFormulaService {
    constructor(
        @IResourceManagerService resourceManagerService: IResourceManagerService,
        @ICommandService _commandSrv: ICommandService,
        @IUniverInstanceService _instanceSrv: IUniverInstanceService,
        @Inject(RegisterOtherFormulaService) private readonly _registerOtherFormulaSrv: RegisterOtherFormulaService,
        @Optional(DataSyncPrimaryController) private readonly _dataSyncPrimaryController?: DataSyncPrimaryController
    ) {
        super(resourceManagerService, _commandSrv, _instanceSrv);
    }

    getFormulaWithRangeId(unitId: string, rangeId: string): Nullable<IDocFormulaReference> {
        return this._docFormulas.get(getDocFormulaKey(unitId, rangeId)) ?? null;
    }

    /**
     * Register a doc formula into the formula system.
     */
    override registerDocFormula(unitId: string, rangeId: string, f: string, v: ICellData['v'], t: ICellData['t']): IDisposable {
        const key = getDocFormulaKey(unitId, rangeId);
        if (this._docFormulas.has(key)) {
            throw new Error(`[UniFormulaService]: cannot register formula ${key} when it is already registered!`);
        }

        const pseudoId = getPseudoUnitKey(unitId);
        this._checkSyncingUnit(pseudoId);
        this._checkResultSubscription();

        const id = this._registerOtherFormulaSrv.registerFormula(pseudoId, DOC_PSEUDO_SUBUNIT, f);
        this._docFormulas.set(key, { unitId, rangeId, f, formulaId: id, v, t });
        this._formulaIdToKey.set(id, key);

        return toDisposable(() => this.unregisterDocFormula(unitId, rangeId));
    }

    override unregisterDocFormula(unitId: string, rangeId: string): void {
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

                    this._commandSrv.executeCommand(UpdateDocUniFormulaCacheMutation.id, mutationParam as IUpdateDocUniFormulaCacheMutationParams);
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

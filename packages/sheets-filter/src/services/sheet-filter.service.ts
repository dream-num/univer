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

import type { Nullable, Workbook } from '@univerjs/core';
import type { Subscription } from 'rxjs';
import {
    CommandType,
    Disposable,
    fromCallback,
    ICommandService,
    IResourceManagerService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { BehaviorSubject, filter, merge, of, Subject, switchMap } from 'rxjs';
import type { IAutoFilter } from '../models/types';
import { FILTER_MUTATIONS, ReCalcSheetsFilterMutationId } from '../common/const';
import { FilterModel } from '../models/filter-model';

type WorksheetID = string;
export interface ISheetsFilterResource {
    [key: WorksheetID]: IAutoFilter;
}

export const SHEET_FILTER_SNAPSHOT_ID = 'SHEET_FILTER_PLUGIN';

/**
 * This service is responsible for managing filter models, especially their lifecycle.
 */
export class SheetsFilterService extends Disposable {
    private readonly _filterModels = new Map<string, Map<string, FilterModel>>();
    private readonly _remoteFilterMutationsSuppressed = new Set<string>();
    private readonly _initialFilterCatchUpUnits = new Set<string>();
    private readonly _sheetDisposalSubscriptions = new Map<string, Subscription>();
    private readonly _pendingFilterRecalc = new Set<string>();
    private readonly _filterHistoryInvalidated$ = new Subject<{ unitId: string; subUnitId: string }>();
    readonly filterHistoryInvalidated$ = this._filterHistoryInvalidated$.asObservable();
    private readonly _localFilterOperationSucceeded$ = new Subject<{ unitId: string; subUnitId: string }>();
    readonly localFilterOperationSucceeded$ = this._localFilterOperationSucceeded$.asObservable();
    private readonly _personalFilterModeUnits = new Map<string, Set<string>>();

    private readonly _loadedUnitId$ = new BehaviorSubject<Nullable<string>>(null);
    readonly loadedUnitId$ = this._loadedUnitId$.asObservable();

    private readonly _errorMsg$ = new BehaviorSubject<Nullable<string>>(null);
    readonly errorMsg$ = this._errorMsg$.asObservable();

    private readonly _activeFilterModel$ = new BehaviorSubject<Nullable<FilterModel>>(null);
    /** An observable value emitting the current Workbook's active Worksheet's filter model (if there is one). */
    readonly activeFilterModel$ = this._activeFilterModel$.asObservable();
    /** The current Workbook's active Worksheet's filter model (if there is one). */
    get activeFilterModel(): Nullable<FilterModel> { return this._activeFilterModel$.getValue(); }

    constructor(
        @IResourceManagerService private readonly _resourcesManagerService: IResourceManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initModel();
        this._initActiveFilterModel();
        this._initSheetDisposal();
    }

    /**
     *
     * @param unitId
     * @param subUnitId
     */
    ensureFilterModel(unitId: string, subUnitId: string): FilterModel {
        const already = this.getFilterModel(unitId, subUnitId);
        if (already) {
            return already;
        }

        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            throw new Error(`[SheetsFilterService]: could not create "FilterModel" on a non-existing workbook ${unitId}!`);
        }

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            throw new Error(`[SheetsFilterService]: could not create "FilterModel" on a non-existing worksheet ${subUnitId}!`);
        }

        const filterModel = new FilterModel(unitId, subUnitId, worksheet);
        this._cacheFilterModel(unitId, subUnitId, filterModel);
        return filterModel;
    }

    getFilterModel(unitId: string, subUnitId: string): Nullable<FilterModel> {
        return this._filterModels.get(unitId)?.get(subUnitId) ?? null;
    }

    /**
     * A viewer keeps a local-only filter model while remote filter mutations are discarded. In
     * that mode structural mutations still have to update the local filter range.
     */
    setRemoteFilterMutationsSuppressed(unitId: string, subUnitId: string, suppressed: boolean): void {
        const key = this._getFilterKey(unitId, subUnitId);
        if (suppressed) {
            this._remoteFilterMutationsSuppressed.add(key);
        } else {
            this._remoteFilterMutationsSuppressed.delete(key);
        }
    }

    isRemoteFilterMutationsSuppressed(unitId: string, subUnitId: string): boolean {
        return this._remoteFilterMutationsSuppressed.has(this._getFilterKey(unitId, subUnitId));
    }

    clearRemoteFilterMutationsSuppressed(unitId: string): void {
        const prefix = `${unitId}\0`;
        this._remoteFilterMutationsSuppressed.forEach((key) => {
            if (key.startsWith(prefix)) {
                this._remoteFilterMutationsSuppressed.delete(key);
            }
        });
    }

    private _getFilterKey(unitId: string, subUnitId: string): string {
        return `${unitId}\0${subUnitId}`;
    }

    /** The unit was restored from a cached revision and still needs the shared filter catch-up. */
    beginInitialFilterCatchUp(unitId: string): void {
        this._initialFilterCatchUpUnits.add(unitId);
    }

    isInitialFilterCatchUp(unitId: string): boolean {
        return this._initialFilterCatchUpUnits.has(unitId);
    }

    completeInitialFilterCatchUp(unitId: string): void {
        this._initialFilterCatchUpUnits.delete(unitId);
    }

    /** Notify collaboration that a local user has successfully taken over a worksheet filter. */
    notifyLocalFilterOperationSucceeded(unitId: string, subUnitId: string): void {
        this._localFilterOperationSucceeded$.next({ unitId, subUnitId });
    }

    enablePersonalFilterMode(unitId: string, subUnitId: string): void {
        let sheets = this._personalFilterModeUnits.get(unitId);
        if (!sheets) {
            sheets = new Set();
            this._personalFilterModeUnits.set(unitId, sheets);
        }
        sheets.add(subUnitId);
    }

    disablePersonalFilterMode(unitId: string, subUnitId?: string): void {
        if (subUnitId) {
            const sheets = this._personalFilterModeUnits.get(unitId);
            sheets?.delete(subUnitId);
            if (sheets?.size === 0) {
                this._personalFilterModeUnits.delete(unitId);
            }
            return;
        }
        this._personalFilterModeUnits.delete(unitId);
    }

    isPersonalFilterMode(unitId: string, subUnitId: string): boolean {
        return this._personalFilterModeUnits.get(unitId)?.has(subUnitId) ?? false;
    }

    /** Defer recalculation until every mutation of the remote changeset has been applied. */
    markRemoteFilterRecalc(unitId: string, subUnitId: string): void {
        this._pendingFilterRecalc.add(`${unitId}\0${subUnitId}`);
    }

    flushRemoteFilterRecalc(): void {
        const pending = [...this._pendingFilterRecalc];
        this._pendingFilterRecalc.clear();
        pending.forEach((key) => {
            const [unitId, subUnitId] = key.split('\0');
            if (!this._filterModels.get(unitId)?.get(subUnitId)) {
                return;
            }
            // Run through the command service so the formula worker receives the same filter
            // recalculation; onlyLocal keeps the generated mutation out of collaboration.
            this._commandService.syncExecuteCommand(
                ReCalcSheetsFilterMutationId,
                { unitId, subUnitId },
                { onlyLocal: true }
            );
        });
    }

    invalidateFilterHistory(unitId: string, subUnitId: string): void {
        this._filterHistoryInvalidated$.next({ unitId, subUnitId });
    }

    removeFilterModel(unitId: string, subUnitId: string): boolean {
        const already = this.getFilterModel(unitId, subUnitId);
        if (already) {
            already.dispose();
            this._filterModels.get(unitId)!.delete(subUnitId);
            return true;
        }

        return false;
    }

    setFilterErrorMsg(content: string): void {
        this._errorMsg$.next(content);
    }

    private _updateActiveFilterModel(): void {
        let workbook: Nullable<Workbook>;
        try {
            workbook = this._univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) {
                this._activeFilterModel$.next(null);
                return;
            }
        } catch (err) {
            console.error('[SheetsFilterService]: could not get active workbook!', err);
            return;
        }

        // Use getActiveSheet to avoid automatically activating the next sheet when deleting the sheet, causing the sheet switching in ActiveWorksheetController to be invalid.
        const activeSheet = workbook.getActiveSheet(true);
        if (!activeSheet) {
            this._activeFilterModel$.next(null);
            return;
        }

        const unitId = activeSheet.getUnitId();
        const subUnitId = activeSheet.getSheetId();
        const filterModel = this.getFilterModel(unitId, subUnitId);
        this._activeFilterModel$.next(filterModel);
    }

    private _initActiveFilterModel(): void {
        this.disposeWithMe(
            merge(
                // source1: executing filter related mutations
                fromCallback(this._commandService.onCommandExecuted.bind(this._commandService))
                    .pipe(filter(([command]) => command.type === CommandType.MUTATION && FILTER_MUTATIONS.has(command.id))),

                // source2: activate sheet changes
                this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET)
                    .pipe(switchMap((workbook) => workbook?.activeSheet$ ?? of(null)))
            ).subscribe(() => this._updateActiveFilterModel())
        );
    }

    private _serializeAutoFiltersForUnit(unitId: string): string {
        const allFilterModels = this._filterModels.get(unitId);
        if (!allFilterModels) {
            return '{}';
        }

        const json: ISheetsFilterResource = {};
        allFilterModels.forEach((model, worksheetId) => {
            json[worksheetId] = model.serialize();
        });

        return JSON.stringify(json);
    }

    private _deserializeAutoFiltersForUnit(unitId: string, json: ISheetsFilterResource): void {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)!;
        Object.keys(json).forEach((worksheetId: WorksheetID) => {
            const autoFilter = json[worksheetId]!;
            const filterModel = FilterModel.deserialize(unitId, worksheetId, workbook.getSheetBySheetId(worksheetId)!, autoFilter);
            this._cacheFilterModel(unitId, worksheetId, filterModel);
        });
    }

    override dispose(): void {
        super.dispose();

        this._loadedUnitId$.complete();
        this._errorMsg$.complete();
        this._activeFilterModel$.complete();
        this._filterModels.forEach((allFilterModels) => {
            allFilterModels.forEach((model) => model.dispose());
            allFilterModels.clear();
        });
        this._filterModels.clear();
        this._remoteFilterMutationsSuppressed.clear();
        this._initialFilterCatchUpUnits.clear();
        this._personalFilterModeUnits.clear();
        this._localFilterOperationSucceeded$.complete();
        this._pendingFilterRecalc.clear();
        this._filterHistoryInvalidated$.complete();
        this._sheetDisposalSubscriptions.forEach((subscription) => subscription.unsubscribe());
        this._sheetDisposalSubscriptions.clear();
    }

    private _initModel(): void {
        this._resourcesManagerService.registerPluginResource<ISheetsFilterResource>({
            pluginName: SHEET_FILTER_SNAPSHOT_ID,
            businesses: [UniverInstanceType.UNIVER_SHEET],
            toJson: (id) => this._serializeAutoFiltersForUnit(id),
            parseJson: (json) => JSON.parse(json),
            onLoad: (unitId, value) => {
                this._deserializeAutoFiltersForUnit(unitId, value);
                this._loadedUnitId$.next(unitId);
                this._updateActiveFilterModel();
            },
            onUnLoad: (unitId: string) => {
                this.clearRemoteFilterMutationsSuppressed(unitId);
                this._initialFilterCatchUpUnits.delete(unitId);
                this._personalFilterModeUnits.delete(unitId);
                this._pendingFilterRecalc.forEach((key) => {
                    if (key.startsWith(`${unitId}\0`)) {
                        this._pendingFilterRecalc.delete(key);
                    }
                });
                const allFilterModels = this._filterModels.get(unitId);
                if (allFilterModels) {
                    allFilterModels.forEach((model) => model.dispose());
                    this._filterModels.delete(unitId);
                }
            },
        });
    }

    private _initSheetDisposal(): void {
        this.disposeWithMe(
            this._univerInstanceService.unitAdded$.subscribe(({ unit }) => {
                if (unit.type === UniverInstanceType.UNIVER_SHEET) {
                    this._subscribeSheetDisposal(unit as Workbook);
                }
            })
        );
        this._univerInstanceService
            .getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .forEach((workbook) => this._subscribeSheetDisposal(workbook));
        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitDisposed$(UniverInstanceType.UNIVER_SHEET).subscribe((unit) => {
                const subscription = this._sheetDisposalSubscriptions.get(unit.getUnitId());
                subscription?.unsubscribe();
                this._sheetDisposalSubscriptions.delete(unit.getUnitId());
            })
        );
    }

    private _subscribeSheetDisposal(workbook: Workbook): void {
        const unitId = workbook.getUnitId();
        if (this._sheetDisposalSubscriptions.has(unitId)) {
            return;
        }
        this._sheetDisposalSubscriptions.set(unitId, workbook.sheetDisposed$.subscribe((sheet) => {
            const subUnitId = sheet.getSheetId();
            this.removeFilterModel(unitId, subUnitId);
            this.disablePersonalFilterMode(unitId, subUnitId);
            this.setRemoteFilterMutationsSuppressed(unitId, subUnitId, false);
            this._updateActiveFilterModel();
        }));
    }

    private _cacheFilterModel(unitId: string, subUnitId: string, filterModel: FilterModel): void {
        if (!this._filterModels.has(unitId)) {
            this._filterModels.set(unitId, new Map());
        }
        this._filterModels.get(unitId)!.set(subUnitId, filterModel);
    }
}

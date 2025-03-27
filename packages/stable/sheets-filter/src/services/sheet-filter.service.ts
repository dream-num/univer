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
import type { IAutoFilter } from '../models/types';
import {
    CommandType,
    Disposable,
    fromCallback,
    ICommandService,
    IResourceManagerService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { BehaviorSubject, filter, merge, of, switchMap } from 'rxjs';
import { FILTER_MUTATIONS } from '../common/const';
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

        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
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
            workbook = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET);
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
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId)!;
        Object.keys(json).forEach((worksheetId: WorksheetID) => {
            const autoFilter = json[worksheetId]!;
            const filterModel = FilterModel.deserialize(unitId, worksheetId, workbook.getSheetBySheetId(worksheetId)!, autoFilter);
            this._cacheFilterModel(unitId, worksheetId, filterModel);
        });
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
                const allFilterModels = this._filterModels.get(unitId);
                if (allFilterModels) {
                    allFilterModels.forEach((model) => model.dispose());
                    this._filterModels.delete(unitId);
                }
            },
        });
    }

    private _cacheFilterModel(unitId: string, subUnitId: string, filterModel: FilterModel): void {
        if (!this._filterModels.has(unitId)) {
            this._filterModels.set(unitId, new Map());
        }
        this._filterModels.get(unitId)!.set(subUnitId, filterModel);
    }
}

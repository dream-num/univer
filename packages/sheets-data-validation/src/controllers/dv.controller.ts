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

import type { CellValue, Nullable } from '@univerjs/core';
import { IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable } from '@univerjs/core';
import type { IDataValidatorProvider, IRulePosition } from '@univerjs/data-validation';
import { DataValidationModel, DataValidatorRegistryService, IDataValidatorService } from '@univerjs/data-validation';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { SheetDataValidationManager } from '../models/sheet-data-validation-manager';

@OnLifecycle(LifecycleStages.Rendered, SheetsDataValidatorProvider)
class SheetsDataValidatorProvider implements IDataValidatorProvider {
    constructor(
        @Inject(DataValidatorRegistryService) private _dataValidatorRegistryService: DataValidatorRegistryService,
        @Inject(DataValidationModel) private _dataValidationModel: DataValidationModel
    ) {}

    // TODO: validator result cache
    validator(text: Nullable<CellValue>, rulePos: IRulePosition): boolean {
        const { unitId, subUnitId, ruleId } = rulePos;
        const rule = this._dataValidationModel.getRuleById(unitId, subUnitId, ruleId);
        if (!rule) {
            throw new Error(`Data validation rule does not exist, ruleId: ${ruleId}.`);
        }

        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
        if (!validator) {
            throw new Error(`Data validator was not found, type: ${rule.type}`);
        }

        return validator.validator(text, rule);
    }
}

@OnLifecycle(LifecycleStages.Rendered, DataValidationController)
export class DataValidationController extends RxDisposable {
    private _currentManager: Nullable<SheetDataValidationManager>;

    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @IDataValidatorService private _dataValidatorService: IDataValidatorService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidationModel) private _dataValidationModel: DataValidationModel,
        @Inject(Injector) private _injector: Injector
    ) {
        super();
        this._init();
    }

    private _init() {
        this._initDataValidationProvider();
        this._initDataValidationDataSource();
        this._initViewModelIntercept();
    }

    private _initDataValidationProvider() {
        const provider = this._injector.createInstance(SheetsDataValidatorProvider);
        this._dataValidatorService.setValidatorProvider(provider);
    }

    private _createSheetDataValidationManager(unitId: string, subUnitId: string) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) {
            throw new Error(`Workbook was not found, id: ${unitId}.`);
        }

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            throw new Error(`Worksheet was not found, id: ${subUnitId}.`);
        }

        const rules = worksheet.getSnapshot().dataValidation;
        return new SheetDataValidationManager(rules);
    }

    private _initDataValidationDataSource() {
        this._dataValidationModel.setManagerCreator(this._createSheetDataValidationManager.bind(this));
    }

    private _initViewModelIntercept() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(
                INTERCEPTOR_POINT.CELL_CONTENT,
                {
                    handler: (cell, pos, next) => {
                        const ruleId = this._currentManager?.getRuleIdByLocation(pos.row, pos.col);
                        const { unitId, subUnitId } = pos;
                        return next({
                            ...cell,
                            dataValidation: ruleId
                                ? {
                                    ruleId,
                                    validStatus: this._dataValidatorService.validator(cell?.v, { ruleId, unitId, subUnitId }),
                                }
                                : undefined,
                        });
                    },
                }
            )
        );
    }
}

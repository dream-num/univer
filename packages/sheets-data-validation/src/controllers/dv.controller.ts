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

import type { Workbook } from '@univerjs/core';
import { Inject, Injector, IUniverInstanceService, RxDisposable, toDisposable, UniverInstanceType } from '@univerjs/core';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { ClearSelectionAllCommand, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { getDataValidationDiffMutations } from '../commands/commands/data-validation.command';
import { SheetDataValidationModel } from '../models/sheet-data-validation-model';
import { CheckboxValidator, DateValidator, DecimalValidator, ListValidator, TextLengthValidator } from '../validators';
import { AnyValidator } from '../validators/any-validator';
import { CustomFormulaValidator } from '../validators/custom-validator';
import { ListMultipleValidator } from '../validators/list-multiple-validator';
import { WholeValidator } from '../validators/whole-validator';

export class DataValidationController extends RxDisposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetsSelectionsService) private _selectionManagerService: SheetsSelectionsService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel
    ) {
        super();
        this._init();
    }

    private _init() {
        this._registerValidators();
        this._initCommandInterceptor();
    }

    private _registerValidators(): void {
        ([
            AnyValidator,
            DecimalValidator,
            WholeValidator,
            TextLengthValidator,
            DateValidator,
            CheckboxValidator,
            ListValidator,
            ListMultipleValidator,
            CustomFormulaValidator,
        ]).forEach((Validator) => {
            const validator = this._injector.createInstance(Validator as typeof ListValidator);
            this.disposeWithMe(this._dataValidatorRegistryService.register(validator));
            this.disposeWithMe(toDisposable(() => this._injector.delete(Validator as typeof ListValidator)));
        });
    }

    private _initCommandInterceptor() {
        this._sheetInterceptorService.interceptCommand({
            getMutations: (commandInfo) => {
                if (commandInfo.id === ClearSelectionAllCommand.id) {
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                    const unitId = workbook.getUnitId();
                    const worksheet = workbook.getActiveSheet();
                    if (!worksheet) {
                        throw new Error('No active sheet found');
                    }

                    const subUnitId = worksheet.getSheetId();
                    const selections = this._selectionManagerService.getCurrentSelections()?.map((s) => s.range);

                    const ruleMatrix = this._sheetDataValidationModel.getRuleObjectMatrix(unitId, subUnitId).clone();

                    if (selections) {
                        ruleMatrix.removeRange(selections);
                    }
                    const diffs = ruleMatrix.diff(this._sheetDataValidationModel.getRules(unitId, subUnitId));
                    const { redoMutations, undoMutations } = getDataValidationDiffMutations(unitId, subUnitId, diffs, this._injector, 'patched');

                    return {
                        undos: undoMutations,
                        redos: redoMutations,
                    };
                }

                return {
                    undos: [],
                    redos: [],
                };
            },
        });
    }
}

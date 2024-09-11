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

import { Inject, Injector, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { DataValidationSingle } from '@univerjs/icons';
import { ClearSelectionAllCommand, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { ComponentManager } from '@univerjs/ui';
import type { Workbook } from '@univerjs/core';
import { getDataValidationDiffMutations } from '../commands/commands/data-validation.command';
import { DATA_VALIDATION_PANEL } from '../commands/operations/data-validation.operation';
import { SheetDataValidationModel } from '../models/sheet-data-validation-model';
import { CheckboxValidator, DateValidator, DecimalValidator, ListValidator, TextLengthValidator } from '../validators';
import { CustomFormulaValidator } from '../validators/custom-validator';
import { ListMultipleValidator } from '../validators/list-multiple-validator';
import { WholeValidator } from '../validators/whole-validator';
import { DataValidationPanel, DATE_DROPDOWN_KEY, DateDropdown, LIST_DROPDOWN_KEY, ListDropDown } from '../views';
import { CellDropdown, DROP_DOWN_KEY } from '../views/drop-down';
import { FORMULA_INPUTS } from '../views/formula-input';
import { ListRenderModeInput } from '../views/render-mode';
import { DateShowTimeOption } from '../views/show-time';
import { DataValidationIcon } from './dv.menu';

@OnLifecycle(LifecycleStages.Rendered, DataValidationController)
export class DataValidationController extends RxDisposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManger: ComponentManager,
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
        this._initComponents();
    }

    private _registerValidators() {
        ([
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
            this.disposeWithMe(
                this._dataValidatorRegistryService.register(validator)
            );
            this.disposeWithMe({
                dispose: () => {
                    this._injector.delete(Validator as typeof ListValidator);
                },
            });
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

    private _initComponents() {
        ([
            [DataValidationIcon, DataValidationSingle],
            [DATA_VALIDATION_PANEL, DataValidationPanel],
            [DROP_DOWN_KEY, CellDropdown],
            [LIST_DROPDOWN_KEY, ListDropDown],
            [DATE_DROPDOWN_KEY, DateDropdown],
            [ListRenderModeInput.componentKey, ListRenderModeInput],
            [DateShowTimeOption.componentKey, DateShowTimeOption],
            ...FORMULA_INPUTS,
        ] as const).forEach(([key, component]) => {
            this.disposeWithMe(this._componentManger.register(
                key,
                component
            ));
        });
    }
}

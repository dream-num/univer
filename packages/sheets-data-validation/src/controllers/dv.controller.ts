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

import type { ISheetDataValidationRule, Workbook } from '@univerjs/core';
import { createInterceptorKey, DisposableCollection, InterceptorManager, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable, toDisposable, UniverInstanceType } from '@univerjs/core';
import { DataValidationModel, DataValidatorRegistryService } from '@univerjs/data-validation';
import { Inject, Injector } from '@wendellhu/redi';
import { DataValidationSingle } from '@univerjs/icons';
import { ComponentManager } from '@univerjs/ui';
import { ClearSelectionAllCommand, SelectionManagerService, SheetInterceptorService } from '@univerjs/sheets';
import { SheetDataValidationService } from '../services/dv.service';
import { CustomFormulaValidator } from '../validators/custom-validator';
import { CheckboxValidator, DateValidator, DecimalValidator, ListValidator, TextLengthValidator } from '../validators';
import { WholeValidator } from '../validators/whole-validator';
import { ListMultipleValidator } from '../validators/list-multiple-validator';
import type { SheetDataValidationManager } from '../models/sheet-data-validation-manager';
import { getDataValidationDiffMutations } from '../commands/commands/data-validation.command';
import { DataValidationIcon } from './dv.menu';

export const DATA_VALIDATION_PERMISSION_CHECK = createInterceptorKey<(ISheetDataValidationRule & { disable?: boolean })[], ISheetDataValidationRule[]>('dataValidationPermissionCheck');

@OnLifecycle(LifecycleStages.Rendered, DataValidationController)
export class DataValidationController extends RxDisposable {
    public interceptor = new InterceptorManager({ DATA_VALIDATION_PERMISSION_CHECK });

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetDataValidationService) private readonly _sheetDataValidationService: SheetDataValidationService,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManger: ComponentManager,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel
    ) {
        super();
        this._init();
    }

    private _init() {
        this._registerValidators();
        this._initInstanceChange();
        this._componentManger.register(DataValidationIcon, DataValidationSingle);
        this._initCommandInterceptor();
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

    private _initInstanceChange() {
        const disposableCollection = new DisposableCollection();
        this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            disposableCollection.dispose();
            if (!workbook) {
                return;
            }
            this._sheetDataValidationService.switchCurrent(workbook.getUnitId(), workbook.getActiveSheet().getSheetId());
            disposableCollection.add(toDisposable(
                workbook.activeSheet$.subscribe((worksheet) => {
                    if (worksheet) {
                        const unitId = workbook.getUnitId();
                        const subUnitId = worksheet.getSheetId();
                        this._sheetDataValidationService.switchCurrent(unitId, subUnitId);
                    }
                })
            ));
        });

        this.disposeWithMe(disposableCollection);
    }

    private _initCommandInterceptor() {
        this._sheetInterceptorService.interceptCommand({
            getMutations: (commandInfo) => {
                if (commandInfo.id === ClearSelectionAllCommand.id) {
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                    const unitId = workbook.getUnitId();
                    const worksheet = workbook.getActiveSheet();
                    const subUnitId = worksheet.getSheetId();
                    const selections = this._selectionManagerService.getSelectionRanges();

                    const manager = this._dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;

                    const ruleMatrix = manager.getRuleObjectMatrix().clone();

                    selections && ruleMatrix.removeRange(selections);
                    const diffs = ruleMatrix.diff(manager.getDataValidations());
                    const { redoMutations, undoMutations } = getDataValidationDiffMutations(unitId, subUnitId, diffs);

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

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

import type { ICellDataForSheetInterceptor } from '@univerjs/core';
import { DataValidationStatus, DataValidationType, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable, WrapStrategy } from '@univerjs/core';
import { DataValidationModel, DataValidationPanelName, DataValidatorRegistryService } from '@univerjs/data-validation';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';
import { DropdownManagerService, IEditorBridgeService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import type { Spreadsheet } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { DataValidationPanel, LIST_DROPDOWN_KEY, ListDropDown } from '../views';
import { FORMULA_INPUTS } from '../views/formula-input';
import { SheetDataValidationService } from '../services/dv.service';
import { getCellValueOrigin } from '../utils/getCellDataOrigin';
import type { CheckboxValidator } from '../validators';
import { DropdownWidget } from '../widgets/dropdown-widget';
import { DataValidationMenu } from './dv.menu';

const INVALID_MARK = {
    tr: {
        size: 8,
        color: 'red',
    },
};

@OnLifecycle(LifecycleStages.Rendered, DataValidationRenderController)
export class DataValidationRenderController extends RxDisposable {
    constructor(
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @IMenuService private _menuService: IMenuService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(DropdownManagerService) private readonly _dropdownManagerService: DropdownManagerService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetDataValidationService) private readonly _sheetDataValidationService: SheetDataValidationService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._initComponents();
        this._initMenu();
        this._initSkeletonChange();
        this._initDropdown();
        this._initViewModelIntercept();
    }

    private _initMenu() {
        [DataValidationMenu].forEach((menu) => {
            this.disposeWithMe(
                this._menuService.addMenuItem(
                    menu
                )
            );
        });
    }

    private _initComponents() {
        ([
            [
                DataValidationPanelName,
                DataValidationPanel,
            ],
            [
                LIST_DROPDOWN_KEY,
                ListDropDown,
            ],
            ...FORMULA_INPUTS,
        ] as const).forEach(([key, component]) => {
            this.disposeWithMe(this._componentManager.register(
                key,
                component
            ));
        });
    }

    private _initDropdown() {
        this.disposeWithMe(this._editorBridgeService.visible$.subscribe((visible) => {
            if (!visible.visible) {
                this._dropdownManagerService.hideDropdown();
                return;
            }

            const state = this._editorBridgeService.getEditCellState();
            if (!state) {
                this._dropdownManagerService.hideDropdown();
            } else {
                const { unitId, sheetId, row, column } = state;
                const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
                if (!workbook) {
                    return;
                }
                const worksheet = workbook.getSheetBySheetId(sheetId);
                if (!worksheet) {
                    return;
                }

                const cell = worksheet.getCell(row, column);
                const rule = cell?.dataValidation?.rule;
                if (!rule) {
                    this._dropdownManagerService.hideDropdown();
                    return;
                }
                const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
                if (!validator || !validator.dropdown) {
                    this._dropdownManagerService.hideDropdown();
                    return;
                }

                this._dropdownManagerService.showDropdown({
                    position: state.position,
                    location: {
                        workbook,
                        worksheet,
                        row,
                        col: column,
                        unitId,
                        subUnitId: sheetId,
                    },
                    componentKey: validator.dropdown,
                    width: 200,
                    height: 200,
                });
            }
        }));
    }

    private _initSkeletonChange() {
        const markSkeletonDirty = () => {
            const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
            const unitId = workbook.getUnitId();
            const subUnitId = workbook.getActiveSheet().getSheetId();
            const skeleton = this._sheetSkeletonManagerService.getOrCreateSkeleton({ unitId, sheetId: subUnitId });
            const currentRender = this._renderManagerService.getRenderById(unitId);

            skeleton?.makeDirty(true);
            skeleton?.calculate();

            if (currentRender) {
                (currentRender.mainComponent as Spreadsheet).makeForceDirty();
            }
        };

        this.disposeWithMe(this._dataValidationModel.ruleChange$.subscribe(() => {
            markSkeletonDirty();
        }));

        this.disposeWithMe(this._dataValidationModel.validStatusChange$.subscribe(() => {
            markSkeletonDirty();
        }));
    }

    private _initViewModelIntercept() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(
                INTERCEPTOR_POINT.CELL_CONTENT,
                {
                    handler: (cell, pos, next) => {
                        const validationManager = this._sheetDataValidationService.currentManager;
                        const { unitId, subUnitId } = validationManager || {};
                        if (unitId !== pos.unitId || subUnitId !== pos.subUnitId) {
                            this._sheetDataValidationService.switchCurrent(pos.unitId, pos.subUnitId);
                        }

                        const manager = this._sheetDataValidationService.currentManager?.manager;
                        if (!manager) {
                            return next(cell);
                        }
                        const { row, col } = pos;
                        const ruleId = manager.getRuleIdByLocation(row, col);
                        if (!ruleId) {
                            return next(cell);
                        }
                        const rule = manager.getRuleById(ruleId);

                        if (!rule) {
                            return next(cell);
                        }

                        const validStatus = this._dataValidationModel.validator(getCellValueOrigin(cell), rule, pos);
                        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
                        const cellValue = getCellValueOrigin(cell);

                        let extra: ICellDataForSheetInterceptor = {};

                        switch (rule.type) {
                            case DataValidationType.CHECKBOX:
                            {
                                const { formula2 } = (validator as CheckboxValidator).parseFormulaSync(rule, pos.unitId, pos.subUnitId);
                                if (!cellValue) {
                                    extra = {
                                        v: formula2,
                                        p: null,
                                        interceptorStyle: {
                                            ...cell?.interceptorStyle,
                                            tb: WrapStrategy.CLIP,
                                        },
                                    };
                                }
                                break;
                            }
                            case DataValidationType.LIST: {
                                extra = {
                                    interceptorStyle: {
                                        ...cell?.interceptorStyle,
                                        pd: DropdownWidget.padding,
                                    },
                                };
                                break;
                            }
                            default:
                                break;
                        }

                        return next({
                            ...cell,
                            ...extra,
                            dataValidation: {
                                ruleId,
                                validStatus,
                                rule,
                                validator,
                            },
                            markers: {
                                ...cell?.markers,
                                ...validStatus === DataValidationStatus.INVALID ? INVALID_MARK : null,
                            },
                            customRender: [
                                ...(cell?.customRender ?? []),
                                ...(validator?.canvasRender ? [validator.canvasRender] : []),
                            ],
                            fontRenderExtension: {
                                ...cell?.fontRenderExtension,
                                isSkip: validator?.skipDefaultFontRender,
                            },

                            // interceptorAutoHeight
                        });
                    },
                }
            )
        );
    }
}

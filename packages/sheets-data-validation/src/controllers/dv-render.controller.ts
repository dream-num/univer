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

import type { ICellDataForSheetInterceptor, ICellRenderContext } from '@univerjs/core';
import { DataValidationStatus, DataValidationType, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable, WrapStrategy } from '@univerjs/core';
import { DataValidationModel, DataValidationPanelName, DataValidatorRegistryService } from '@univerjs/data-validation';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { IEditorBridgeService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import type { Spreadsheet } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { DataValidationRenderMode } from '@univerjs/core/types/enum/data-validation-render-mode.js';
import { DataValidationPanel, DATE_DROPDOWN_KEY, DateDropdown, LIST_DROPDOWN_KEY, ListDropDown } from '../views';
import { FORMULA_INPUTS } from '../views/formula-input';
import { getCellValueOrigin } from '../utils/getCellDataOrigin';
import type { CheckboxValidator, ListValidator } from '../validators';
import type { SheetDataValidationManager } from '../models/sheet-data-validation-manager';
import { CellDropdown, DROP_DOWN_KEY } from '../views/drop-down';
import { DataValidationDropdownManagerService } from '../services/dropdown-manager.service';
import { ListRenderModeInput } from '../views/render-mode';
import { addDataValidationMenuFactory, dataValidationMenuFactory, openDataValidationMenuFactory } from './dv.menu';

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
        @Inject(DataValidationDropdownManagerService) private readonly _dropdownManagerService: DataValidationDropdownManagerService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(Injector) private readonly _injector: Injector
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
        [
            dataValidationMenuFactory,
            openDataValidationMenuFactory,
            addDataValidationMenuFactory,
        ].forEach((menu) => {
            this.disposeWithMe(
                this._menuService.addMenuItem(
                    menu(this._injector)
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
                DROP_DOWN_KEY,
                CellDropdown,
            ],
            [
                LIST_DROPDOWN_KEY,
                ListDropDown,
            ],
            [
                DATE_DROPDOWN_KEY,
                DateDropdown,
            ],
            [
                ListRenderModeInput.componentKey,
                ListRenderModeInput,
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
                return;
            }

            const state = this._editorBridgeService.getEditCellState();
            if (state) {
                const { unitId, sheetId, row, column } = state;
                const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
                if (!workbook) {
                    return;
                }
                const manager = this._dataValidationModel.ensureManager(unitId, sheetId) as SheetDataValidationManager;
                const rule = manager.getRuleByLocation(row, column);

                if (!rule) {
                    return;
                }
                const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);

                if (!validator?.dropdown) {
                    return;
                }

                const worksheet = workbook.getActiveSheet();
                const activeDropdown = this._dropdownManagerService.activeDropdown;
                const currLoc = activeDropdown?.location;
                if (
                    currLoc &&
                    currLoc.unitId === unitId &&
                    currLoc.subUnitId === sheetId &&
                    currLoc.row === row &&
                    currLoc.col === column
                ) {
                    return;
                }

                this._dropdownManagerService.showDropdown({
                    location: {
                        unitId,
                        subUnitId: sheetId,
                        row,
                        col: column,
                        workbook,
                        worksheet,
                    },
                    componentKey: validator.dropdown,
                    onHide: () => { },
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
                        const { row, col, unitId, subUnitId } = pos;
                        const manager = this._dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;
                        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                        if (!manager || !skeleton) {
                            return next(cell);
                        }
                        const styleMap = pos.workbook.getStyles();
                        const defaultStyle = (typeof cell?.s === 'string' ? styleMap.get(cell?.s) : cell?.s) || {};
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
                        if (rule.type === DataValidationType.LIST || rule.type === DataValidationType.LIST_MULTIPLE) {
                            extra = {
                                interceptorStyle: {
                                    ...cell?.interceptorStyle,
                                    tb: (defaultStyle.tb !== WrapStrategy.OVERFLOW ? defaultStyle.tb : undefined) ?? WrapStrategy.WRAP,
                                },
                            };
                        }

                        if (rule.type === DataValidationType.CHECKBOX) {
                            const { formula2 } = (validator as CheckboxValidator).parseFormulaSync(rule, pos.unitId, pos.subUnitId);
                            if (!cellValue) {
                                extra = {
                                    v: formula2,
                                    t: 1,
                                    p: null,
                                    interceptorStyle: {
                                        ...cell?.interceptorStyle,
                                        tb: WrapStrategy.CLIP,
                                    },
                                };
                            }
                        }

                        if (rule.type === DataValidationType.LIST && (rule.renderMode === DataValidationRenderMode.ARROW || rule.renderMode === DataValidationRenderMode.TEXT)) {
                            const colorMap = (validator as ListValidator).getListWithColorMap(rule);
                            const valueStr = `${getCellValueOrigin(cell) ?? ''}`;
                            const color = colorMap[valueStr];
                            if (color) {
                                extra = {
                                    ...extra,
                                    interceptorStyle: {
                                        ...extra.interceptorStyle,
                                        bg: {
                                            rgb: color,
                                        },
                                    },
                                };
                            }
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
                            // @ts-ignore
                            fontRenderExtension: {
                                // @ts-ignore
                                ...cell?.fontRenderExtension,
                                isSkip: validator?.skipDefaultFontRender(rule, cellValue, pos),
                            },
                            interceptorStyle: {
                                ...cell?.interceptorStyle,
                                ...extra.interceptorStyle,
                            },
                            get interceptorAutoHeight() {
                                const mergeCell = skeleton.mergeData.find((range) => {
                                    const { startColumn, startRow, endColumn, endRow } = range;
                                    return row >= startRow && col >= startColumn && row <= endRow && col <= endColumn;
                                });

                                const info: ICellRenderContext = {
                                    data: {
                                        ...cell,
                                        dataValidation: {
                                            ruleId,
                                            validStatus,
                                            rule,
                                            validator,
                                        },
                                    },
                                    style: skeleton.getsStyles().getStyleByCell(cell),
                                    primaryWithCoord: skeleton.getCellByIndex(mergeCell?.startRow ?? row, mergeCell?.startColumn ?? col),
                                    unitId,
                                    subUnitId,
                                    row,
                                    col,
                                };
                                return validator?.canvasRender?.calcCellAutoHeight?.(info);
                            },
                        });
                    },
                }
            )
        );
    }
}

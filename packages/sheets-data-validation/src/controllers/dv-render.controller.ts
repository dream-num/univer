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

import { DisposableCollection, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable } from '@univerjs/core';
import { DataValidationModel, DataValidationPanelName, DataValidatorRegistryService } from '@univerjs/data-validation';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';
import { DropdownManagerService, EditorBridgeService, IEditorBridgeService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import type { Spreadsheet } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { getCellIndexByOffsetWithMerge } from '@univerjs/sheets-ui/common/utils.js';
import { DataValidationPanel, LIST_DROPDOWN_KEY, ListDropDown } from '../views';
import { DATA_VALIDATION_U_KEY, DataValidationExtension } from '../render/data-validation.render';
import { DataValidationMenu } from './dv.menu';

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
        @Inject(DropdownManagerService) private readonly _dropdownManagerService: DropdownManagerService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._initComponents();
        this._initMenu();
        this._initSkeletonChange();
        this._initEventBinding();
        this._initDropdown();
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
        ] as const).forEach(([key, component]) => {
            this.disposeWithMe(this._componentManager.register(
                key,
                component
            ));
        });
    }

    private _initEventBinding() {
        const disposableCollection = new DisposableCollection();

        this._univerInstanceService.currentSheet$.subscribe((workbook) => {
            if (workbook) {
                const currentRender = this._renderManagerService.getRenderById(workbook.getUnitId());
                if (currentRender && currentRender.mainComponent) {
                    disposableCollection.dispose();

                    const spreadsheet = currentRender.mainComponent as Spreadsheet;
                    const disposable = spreadsheet.onPointerDownObserver.add((evt) => {
                        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                        const cellIndex = getCellIndexByOffsetWithMerge(evt.offsetX, evt.offsetY, currentRender.scene, skeleton!);
                        const worksheet = workbook.getActiveSheet();

                        if (!cellIndex || !skeleton) {
                            return;
                        }

                        const cellInfo = worksheet.getCell(cellIndex.actualRow, cellIndex.actualCol);
                        if (!cellInfo) {
                            return;
                        }

                        const rule = cellInfo.dataValidation?.rule;
                        if (!rule) {
                            return;
                        }

                        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
                        if (!validator) {
                            return;
                        }
                        const render = validator.canvasRender;

                        if (!render) {
                            return;
                        }

                        const info = {
                            cellInfo: skeleton.getCellByIndex(cellIndex.actualRow, cellIndex.actualCol),
                            value: cellInfo.v,
                            style: skeleton.getsStyles().getStyleByCell(cellInfo),
                            rule,
                        };

                        const isHit = render.isHit(evt, info);
                        if (isHit) {
                            render.onClick(info);
                        }
                    });

                    disposable && disposableCollection.add(disposable);
                }
            }
        });
    }

    private _initDropdown() {
        this.disposeWithMe(this._editorBridgeService.currentEditCellState$.subscribe((state) => {
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
                    return;
                }
                const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
                if (!validator || !validator.dropdown) {
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
}

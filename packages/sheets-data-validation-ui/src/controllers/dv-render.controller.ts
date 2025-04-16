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

import type { CellValue, ICellRenderContext, IRange, Nullable } from '@univerjs/core';
import { DataValidationStatus, DataValidationType, ICommandService, Inject, InterceptorEffectEnum, IUniverInstanceService, Optional, RxDisposable, sequenceExecute } from '@univerjs/core';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { IRenderManagerService } from '@univerjs/engine-render';
import { InterceptCellContentPriority, INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { DataValidationCacheService, getCellValueOrigin, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { AutoHeightController, IEditorBridgeService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { IMenuManagerService } from '@univerjs/ui';
import { bufferTime, filter } from 'rxjs';
import { DataValidationDropdownManagerService } from '../services/dropdown-manager.service';
import { menuSchema } from './menu.schema';

const INVALID_MARK = {
    tr: {
        size: 6,
        color: '#fe4b4b',
    },
};

export class SheetsDataValidationRenderController extends RxDisposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(AutoHeightController) private readonly _autoHeightController: AutoHeightController,
        @Inject(DataValidationDropdownManagerService) private readonly _dropdownManagerService: DataValidationDropdownManagerService,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(DataValidationCacheService) private readonly _dataValidationCacheService: DataValidationCacheService,
        @Optional(IEditorBridgeService) private readonly _editorBridgeService?: IEditorBridgeService
    ) {
        super();

        this._initMenu();
        this._initDropdown();
        this._initViewModelIntercept();
        this._initAutoHeight();
    }

    private _initMenu() {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initDropdown() {
        if (!this._editorBridgeService) {
            return;
        }

        this.disposeWithMe(this._editorBridgeService.visible$.subscribe((visible) => {
            if (!visible.visible) {
                if (this._dropdownManagerService.activeDropdown?.trigger === 'editor-bridge') {
                    this._dropdownManagerService.hideDropdown();
                }
                return;
            }

            const state = this._editorBridgeService!.getEditCellState();
            if (state) {
                const { unitId, sheetId, row, column } = state;
                const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
                if (!workbook) {
                    return;
                }
                const rule = this._sheetDataValidationModel.getRuleByLocation(unitId, sheetId, row, column);

                if (!rule) {
                    return;
                }
                const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);

                if (!validator?.dropdownType) {
                    return;
                }

                const worksheet = workbook.getActiveSheet();
                if (!worksheet) return;

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

                this._dropdownManagerService.showDropdown(
                    {
                        location: {
                            unitId,
                            subUnitId: sheetId,
                            row,
                            col: column,
                            workbook,
                            worksheet,
                        },
                        trigger: 'editor-bridge',
                        closeOnOutSide: false,
                    }
                );
            }
        }));
    }

    // eslint-disable-next-line max-lines-per-function
    private _initViewModelIntercept() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(
                INTERCEPTOR_POINT.CELL_CONTENT,
                {
                    effect: InterceptorEffectEnum.Style,
                    // must be after numfmt
                    priority: InterceptCellContentPriority.DATA_VALIDATION,
                    // eslint-disable-next-line max-lines-per-function, complexity
                    handler: (cell, pos, next) => {
                        const { row, col, unitId, subUnitId, workbook, worksheet } = pos;

                        const ruleId = this._sheetDataValidationModel.getRuleIdByLocation(unitId, subUnitId, row, col);
                        if (!ruleId) {
                            return next(cell);
                        }
                        const rule = this._sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId);
                        if (!rule) {
                            return next(cell);
                        }
                        const validStatus = this._dataValidationCacheService.getValue(unitId, subUnitId, row, col) ?? DataValidationStatus.VALID;
                        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
                        const cellOrigin = pos.rawData;
                        let cache: Nullable<CellValue>;
                        const cellValue = {
                            get value() {
                                if (cache !== undefined) {
                                    return cache;
                                }
                                cache = getCellValueOrigin(cellOrigin) ?? null;
                                return cache;
                            },
                        };
                        const valueStr = {
                            get value() {
                                return `${cellValue.value ?? ''}`;
                            },
                        };

                        return next({
                            ...cell,
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
                                isSkip: cell?.fontRenderExtension?.isSkip || validator?.skipDefaultFontRender?.(rule, cellValue.value, pos),
                            },
                            interceptorStyle: {
                                ...cell?.interceptorStyle,
                                ...validator?.getExtraStyle(rule, valueStr.value, {
                                    get style() {
                                        const styleMap = workbook.getStyles();
                                        return (typeof cell?.s === 'string' ? styleMap.get(cell?.s) : cell?.s) || {};
                                    },
                                }, row, col),
                            },
                            interceptorAutoHeight: () => {
                                const skeleton = this._renderManagerService.getRenderById(unitId)
                                    ?.with(SheetSkeletonManagerService)
                                    .getSkeletonParam(subUnitId)
                                    ?.skeleton;
                                if (!skeleton) {
                                    return undefined;
                                }
                                const mergeCell = skeleton.worksheet.getMergedCell(row, col);

                                const info: ICellRenderContext = {
                                    data: cell,
                                    style: skeleton.getStyles().getStyleByCell(cell),
                                    primaryWithCoord: skeleton.getCellWithCoordByIndex(mergeCell?.startRow ?? row, mergeCell?.startColumn ?? col),
                                    unitId,
                                    subUnitId,
                                    row,
                                    col,
                                    workbook,
                                    worksheet,
                                };
                                return validator?.canvasRender?.calcCellAutoHeight?.(info);
                            },
                            interceptorAutoWidth: () => {
                                const skeleton = this._renderManagerService.getRenderById(unitId)
                                    ?.with(SheetSkeletonManagerService)
                                    .getSkeletonParam(subUnitId)
                                    ?.skeleton;
                                if (!skeleton) {
                                    return undefined;
                                }
                                const mergeCell = skeleton.worksheet.getMergedCell(row, col);

                                const info: ICellRenderContext = {
                                    data: cell,
                                    style: skeleton.getStyles().getStyleByCell(cell),
                                    primaryWithCoord: skeleton.getCellWithCoordByIndex(mergeCell?.startRow ?? row, mergeCell?.startColumn ?? col),
                                    unitId,
                                    subUnitId,
                                    row,
                                    col,
                                    workbook,
                                    worksheet,
                                };
                                return validator?.canvasRender?.calcCellAutoWidth?.(info);
                            },
                            coverable: (cell?.coverable ?? true) && !(rule.type === DataValidationType.LIST || rule.type === DataValidationType.LIST_MULTIPLE),
                        });
                    },
                }
            )
        );
    }

    private _initAutoHeight() {
        this._sheetDataValidationModel.ruleChange$
            .pipe(
                // patched data-validation change don't need to re-calc row height
                // re-calc of row height will be triggered precisely by the origin command
                filter((change) => change.source === 'command'),
                bufferTime(100)
            )
            .subscribe((infos) => {
                if (infos.length === 0) {
                    return;
                }

                const ranges: IRange[] = [];
                infos.forEach((info) => {
                    if (info.rule.type === DataValidationType.LIST_MULTIPLE || info.rule.type === DataValidationType.LIST) {
                        if (info.rule?.ranges) {
                            ranges.push(...info.rule.ranges);
                        }
                    }
                });

                if (ranges.length) {
                    const mutations = this._autoHeightController.getUndoRedoParamsOfAutoHeight(ranges);
                    sequenceExecute(mutations.redos, this._commandService);
                }
            });
    }
}

// The mobile version does not provide the ability to change data validation model.
export class SheetsDataValidationMobileRenderController extends RxDisposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(AutoHeightController) private readonly _autoHeightController: AutoHeightController,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel,
        @Inject(DataValidationCacheService) private readonly _dataValidationCacheService: DataValidationCacheService
    ) {
        super();

        this._initViewModelIntercept();
        this._initAutoHeight();
    }

    private _initViewModelIntercept() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(
                INTERCEPTOR_POINT.CELL_CONTENT,
                {
                    effect: InterceptorEffectEnum.Style,
                    // must be after numfmt
                    priority: InterceptCellContentPriority.DATA_VALIDATION,
                    // eslint-disable-next-line complexity
                    handler: (cell, pos, next) => {
                        const { row, col, unitId, subUnitId, workbook, worksheet } = pos;

                        const ruleId = this._sheetDataValidationModel.getRuleIdByLocation(unitId, subUnitId, row, col);
                        if (!ruleId) {
                            return next(cell);
                        }
                        const rule = this._sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId);
                        if (!rule) {
                            return next(cell);
                        }
                        const validStatus = this._dataValidationCacheService.getValue(unitId, subUnitId, row, col) ?? DataValidationStatus.VALID;
                        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
                        const cellOrigin = worksheet.getCellRaw(row, col);
                        const cellValue = getCellValueOrigin(cellOrigin);
                        const valueStr = `${cellValue ?? ''}`;

                        return next({
                            ...cell,
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
                                isSkip: cell?.fontRenderExtension?.isSkip || validator?.skipDefaultFontRender?.(rule, cellValue, pos),
                            },
                            interceptorStyle: {
                                ...cell?.interceptorStyle,
                                ...validator?.getExtraStyle(rule, valueStr, {
                                    get style() {
                                        const styleMap = workbook.getStyles();
                                        return (typeof cell?.s === 'string' ? styleMap.get(cell?.s) : cell?.s) || {};
                                    },
                                }, row, col),
                            },
                            interceptorAutoHeight: () => {
                                const skeleton = this._renderManagerService.getRenderById(unitId)
                                    ?.with(SheetSkeletonManagerService)
                                    .getSkeletonParam(subUnitId)
                                    ?.skeleton;
                                if (!skeleton) {
                                    return undefined;
                                }
                                const mergeCell = skeleton.worksheet.getMergedCell(row, col);

                                const info: ICellRenderContext = {
                                    data: cell,
                                    style: skeleton.getStyles().getStyleByCell(cell),
                                    primaryWithCoord: skeleton.getCellWithCoordByIndex(mergeCell?.startRow ?? row, mergeCell?.startColumn ?? col),
                                    unitId,
                                    subUnitId,
                                    row,
                                    col,
                                    workbook,
                                    worksheet,
                                };
                                return validator?.canvasRender?.calcCellAutoHeight?.(info);
                            },
                            coverable: (cell?.coverable ?? true) && !(rule.type === DataValidationType.LIST || rule.type === DataValidationType.LIST_MULTIPLE),
                        });
                    },
                }
            )
        );
    }

    private _initAutoHeight() {
        this._sheetDataValidationModel.ruleChange$
            .pipe(
                filter((change) => change.source === 'command'),
                bufferTime(16)
            )
            .subscribe((infos) => {
                const ranges: IRange[] = [];
                infos.forEach((info) => {
                    if (info.rule?.ranges) {
                        ranges.push(...info.rule.ranges);
                    }
                });

                if (ranges.length) {
                    const mutations = this._autoHeightController.getUndoRedoParamsOfAutoHeight(ranges);
                    sequenceExecute(mutations.redos, this._commandService);
                }
            });
    }
}

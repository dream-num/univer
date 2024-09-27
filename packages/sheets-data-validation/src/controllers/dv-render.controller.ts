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

import { DataValidationRenderMode, DataValidationStatus, DataValidationType, ICommandService, Inject, InterceptorEffectEnum, IUniverInstanceService, LifecycleStages, OnLifecycle, Optional, RxDisposable, sequenceExecute, UniverInstanceType, WrapStrategy } from '@univerjs/core';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { IRenderManagerService } from '@univerjs/engine-render';
import { InterceptCellContentPriority, INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { AutoHeightController, IEditorBridgeService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { IMenuManagerService } from '@univerjs/ui';
import { bufferTime, debounceTime, filter } from 'rxjs';
import type { ICellDataForSheetInterceptor, ICellRenderContext, IRange, Workbook } from '@univerjs/core';
import type { Spreadsheet } from '@univerjs/engine-render';
import { SheetDataValidationModel } from '../models/sheet-data-validation-model';
import { DataValidationDropdownManagerService } from '../services/dropdown-manager.service';
import { getCellValueOrigin } from '../utils/get-cell-data-origin';
import { menuSchema } from './menu.schema';
import type { ListValidator } from '../validators';

const INVALID_MARK = {
    tr: {
        size: 6,
        color: '#fe4b4b',
    },
};

@OnLifecycle(LifecycleStages.Rendered, SheetsDataValidationRenderController)
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
        @Optional(IEditorBridgeService) private readonly _editorBridgeService?: IEditorBridgeService
    ) {
        super();

        this._initMenu();
        this._initSkeletonChange();
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

                if (!validator?.dropdown) {
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
                        componentKey: validator.dropdown,
                        onHide: () => { /* empty */ },
                        trigger: 'editor-bridge',
                    },
                    false
                );
            }
        }));
    }

    private _initSkeletonChange() {
        const markSkeletonDirty = () => {
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) return;

            const unitId = workbook.getUnitId();
            const subUnitId = workbook.getActiveSheet()?.getSheetId();
            if (!subUnitId) return;

            const skeleton = this._renderManagerService.getRenderById(unitId)
                ?.with(SheetSkeletonManagerService)
                .getWorksheetSkeleton(subUnitId)
                ?.skeleton;
            const currentRender = this._renderManagerService.getRenderById(unitId);

            skeleton?.makeDirty(true);
            skeleton?.calculate();

            if (currentRender) {
                (currentRender.mainComponent as Spreadsheet).makeForceDirty();
            }
        };

        this.disposeWithMe(this._sheetDataValidationModel.ruleChange$.pipe(debounceTime(16)).subscribe(() => markSkeletonDirty()));
        this.disposeWithMe(this._sheetDataValidationModel.validStatusChange$.pipe(debounceTime(16)).subscribe(() => markSkeletonDirty()));
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
                    // eslint-disable-next-line complexity
                    handler: (cell, pos, next) => {
                        const { row, col, unitId, subUnitId, workbook, worksheet } = pos;
                        const styleMap = workbook.getStyles();
                        const defaultStyle = (typeof cell?.s === 'string' ? styleMap.get(cell?.s) : cell?.s) || {};
                        const ruleId = this._sheetDataValidationModel.getRuleIdByLocation(unitId, subUnitId, row, col);
                        if (!ruleId) {
                            return next(cell);
                        }
                        const rule = this._sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId);
                        if (!rule) {
                            return next(cell);
                        }
                        const validStatus = this._sheetDataValidationModel.validator(cell, rule, pos);
                        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
                        const cellOrigin = worksheet.getCellRaw(row, col);
                        const cellValue = getCellValueOrigin(cellOrigin);
                        const valueStr = `${getCellValueOrigin(cellOrigin) ?? ''}`;

                        return next({
                            ...cell,
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
                                isSkip: cell?.fontRenderExtension?.isSkip || validator?.skipDefaultFontRender(rule, cellValue, pos),
                            },
                            interceptorStyle: {
                                ...cell?.interceptorStyle,
                                ...validator?.getExtraStyle(rule, valueStr, { style: defaultStyle }),
                            },
                            interceptorAutoHeight: () => {
                                const skeleton = this._renderManagerService.getRenderById(unitId)
                                    ?.with(SheetSkeletonManagerService)
                                    .getWorksheetSkeleton(subUnitId)
                                    ?.skeleton;
                                if (!skeleton) {
                                    return undefined;
                                }
                                const mergeCell = skeleton.worksheet.getMergedCell(row, col);

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
                // patched data-validation change don't need to re-calc row height
                // re-calc of row height will be triggered precisely by the origin command
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

// The mobile version does not provide the ability to change data validation model.
@OnLifecycle(LifecycleStages.Rendered, SheetsDataValidationMobileRenderController)
export class SheetsDataValidationMobileRenderController extends RxDisposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(AutoHeightController) private readonly _autoHeightController: AutoHeightController,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel
    ) {
        super();

        this._initSkeletonChange();
        this._initViewModelIntercept();
        this._initAutoHeight();
    }

    private _initSkeletonChange() {
        const markSkeletonDirty = () => {
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) return;

            const unitId = workbook.getUnitId();
            const subUnitId = workbook.getActiveSheet()?.getSheetId();
            if (!subUnitId) return;

            const skeleton = this._renderManagerService.getRenderById(unitId)
                ?.with(SheetSkeletonManagerService)
                .getWorksheetSkeleton(subUnitId)
                ?.skeleton;
            const currentRender = this._renderManagerService.getRenderById(unitId);

            skeleton?.makeDirty(true);
            skeleton?.calculate();

            if (currentRender) {
                (currentRender.mainComponent as Spreadsheet).makeForceDirty();
            }
        };

        this.disposeWithMe(this._sheetDataValidationModel.ruleChange$.pipe(debounceTime(16)).subscribe(() => markSkeletonDirty()));
        this.disposeWithMe(this._sheetDataValidationModel.validStatusChange$.pipe(debounceTime(16)).subscribe(() => markSkeletonDirty()));
    }

    // eslint-disable-next-line max-lines-per-function
    private _initViewModelIntercept() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(
                INTERCEPTOR_POINT.CELL_CONTENT,
                {
                    effect: InterceptorEffectEnum.Style,
                    priority: InterceptCellContentPriority.DATA_VALIDATION,
                    // eslint-disable-next-line max-lines-per-function, complexity
                    handler: (cell, pos, next) => {
                        const { row, col, unitId, subUnitId, workbook, worksheet } = pos;

                        const skeleton = this._renderManagerService.getRenderById(unitId)
                            ?.with(SheetSkeletonManagerService)
                            .getWorksheetSkeleton(subUnitId)
                            ?.skeleton;
                        if (!skeleton) {
                            return next(cell);
                        }

                        const styleMap = pos.workbook.getStyles();
                        const defaultStyle = (typeof cell?.s === 'string' ? styleMap.get(cell?.s) : cell?.s) || {};
                        const ruleId = this._sheetDataValidationModel.getRuleIdByLocation(unitId, subUnitId, row, col);
                        if (!ruleId) {
                            return next(cell);
                        }
                        const rule = this._sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId);

                        if (!rule) {
                            return next(cell);
                        }
                        const validStatus = this._sheetDataValidationModel.validator(cell, rule, pos);
                        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
                        const cellOrigin = worksheet.getCellRaw(row, col);
                        const cellValue = getCellValueOrigin(cellOrigin);

                        let extra: ICellDataForSheetInterceptor = {};
                        if (rule.type === DataValidationType.LIST || rule.type === DataValidationType.LIST_MULTIPLE) {
                            extra = {
                                interceptorStyle: {
                                    ...cell?.interceptorStyle,
                                    tb: (defaultStyle.tb !== WrapStrategy.OVERFLOW ? defaultStyle.tb : WrapStrategy.CLIP) ?? WrapStrategy.WRAP,
                                },
                            };
                        }

                        if (rule.type === DataValidationType.CHECKBOX) {
                            extra = {

                                interceptorStyle: {
                                    ...cell?.interceptorStyle,
                                    tb: WrapStrategy.CLIP,
                                },
                            };
                        }

                        if (rule.type === DataValidationType.LIST && (rule.renderMode === DataValidationRenderMode.ARROW || rule.renderMode === DataValidationRenderMode.TEXT)) {
                            const colorMap = (validator as ListValidator).getListWithColorMap(rule);
                            const valueStr = `${getCellValueOrigin(cellOrigin) ?? ''}`;
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
                            interceptorAutoHeight: () => {
                                // const mergeCell = skeleton.mergeData.find((range) => {
                                //     const { startColumn, startRow, endColumn, endRow } = range;
                                //     return row >= startRow && col >= startColumn && row <= endRow && col <= endColumn;
                                // });
                                const mergeCell = skeleton.worksheet.getMergedCell(row, col);

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
                                    worksheet,
                                    workbook,
                                };
                                return validator?.canvasRender?.calcCellAutoHeight?.(info);
                            },
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


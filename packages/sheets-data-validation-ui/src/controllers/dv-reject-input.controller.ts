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

import { DataValidationErrorStyle, Disposable, Inject, LocaleService } from '@univerjs/core';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { Button } from '@univerjs/design';
import { AFTER_CELL_EDIT_ASYNC, SheetInterceptorService } from '@univerjs/sheets';
import { getCellValueOrigin, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { IDialogService } from '@univerjs/ui';
import React from 'react';

export class DataValidationRejectInputController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetDataValidationModel) private readonly _dataValidationModel: SheetDataValidationModel,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @IDialogService private readonly _dialogService: IDialogService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
        this._initEditorBridgeInterceptor();
    }

    private _initEditorBridgeInterceptor() {
        this._sheetInterceptorService.writeCellInterceptor.intercept(
            AFTER_CELL_EDIT_ASYNC,
            {
                handler: async (cellPromise, context, next) => {
                    const cell = await cellPromise;
                    const { worksheet, row, col, unitId, subUnitId, workbook } = context;
                    const ruleId = this._dataValidationModel.getRuleIdByLocation(unitId, subUnitId, row, col);
                    const rule = ruleId ? this._dataValidationModel.getRuleById(unitId, subUnitId, ruleId) : undefined;
                    if (!rule || rule.errorStyle !== DataValidationErrorStyle.STOP) {
                        return next(Promise.resolve(cell));
                    }

                    const validator = await this._dataValidatorRegistryService.getValidatorItem(rule.type);
                    if (!validator) {
                        return next(Promise.resolve(cell));
                    }

                    const success = await validator.validator(
                        {
                            value: getCellValueOrigin(cell),
                            interceptValue: getCellValueOrigin(context?.origin ?? cell),
                            row,
                            column: col,
                            unitId,
                            subUnitId,
                            worksheet,
                            workbook,
                            t: cell?.t,
                        }, rule
                    );

                    if (success) {
                        return next(Promise.resolve(cell));
                    }

                    const oldCell = worksheet.getCellRaw(row, col);
                    this._dialogService.open({
                        width: 368,
                        title: {
                            title: this._localeService.t('dataValidation.alert.title'),
                        },
                        id: 'reject-input-dialog',
                        children: {
                            title: validator.getRuleFinalError(rule, { row, col, unitId, subUnitId }),
                        },
                        footer: {
                            title: React.createElement(
                                Button,
                                {
                                    type: 'primary',
                                    onClick: () => this._dialogService.close('reject-input-dialog'),
                                },
                                this._localeService.t('dataValidation.alert.ok')
                            ),
                        },
                        onClose: () => {
                            this._dialogService.close('reject-input-dialog');
                        },
                    });
                    return next(Promise.resolve(oldCell));
                },
            }
        );
    }

    showReject(title: string) {
        this._dialogService.open({
            width: 368,
            title: {
                title: this._localeService.t('dataValidation.alert.title'),
            },
            id: 'reject-input-dialog',
            children: {
                title,
            },
            footer: {
                title: React.createElement(
                    Button,
                    {
                        type: 'primary',
                        onClick: () => this._dialogService.close('reject-input-dialog'),
                    },
                    this._localeService.t('dataValidation.alert.ok')
                ),
            },
            onClose: () => {
                this._dialogService.close('reject-input-dialog');
            },
        });
    }
}

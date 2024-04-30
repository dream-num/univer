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

import { DataValidationErrorStyle, Disposable, LifecycleStages, LocaleService, OnLifecycle } from '@univerjs/core';
import { DataValidationModel, DataValidatorRegistryService } from '@univerjs/data-validation';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';
import { IDialogService } from '@univerjs/ui';
import React from 'react';
import { Button } from '@univerjs/design';
import type { SheetDataValidationManager } from '../models/sheet-data-validation-manager';
import { getCellValueOrigin } from '../utils/get-cell-data-origin';

@OnLifecycle(LifecycleStages.Ready, DataValidationRejectInputController)
export class DataValidationRejectInputController extends Disposable {
    constructor(
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @IDialogService private readonly _dialogService: IDialogService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
        this._initEditorBridgeInterceptor();
    }

    private _initEditorBridgeInterceptor() {
        this._editorBridgeService.interceptor.intercept(
            this._editorBridgeService.interceptor.getInterceptPoints().AFTER_CELL_EDIT_ASYNC,
            {
                handler: async (cellPromise, context, next) => {
                    const cell = await cellPromise;
                    const { worksheet, row, col, unitId, subUnitId } = context;
                    const manager = this._dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;
                    const ruleId = manager.getRuleIdByLocation(row, col);
                    const rule = ruleId ? manager.getRuleById(ruleId) : undefined;
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
                            row,
                            column: col,
                            unitId,
                            subUnitId,
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
                            title: validator.getRuleFinalError(rule),
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

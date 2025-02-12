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

import { LocaleService, useDependency } from '@univerjs/core';
import React from 'react';
import { Button } from '@univerjs/design';
import { IDialogService } from '@univerjs/ui';
import styles from './index.module.less';
import { UNIVER_SHEET_PERMISSION_ALERT_DIALOG_ID } from './interface';

export const AlertDialog = ({ errorMsg }: { errorMsg: string }) => {
    const localeService = useDependency(LocaleService);
    const dialogService = useDependency(IDialogService);
    return (
        <div className={styles.sheetPermissionAlertDialog}>
            <h1 className={styles.sheetPermissionAlertDialogTitle}>{localeService.t('permission.dialog.alert')}</h1>
            <p>{errorMsg || localeService.t('permission.dialog.alertContent')}</p>
            <div className={styles.sheetPermissionAlertDialogButton}>
                <Button
                    type="primary"
                    onClick={() => {
                        dialogService.close(UNIVER_SHEET_PERMISSION_ALERT_DIALOG_ID);
                    }}
                >
                    {localeService.t('permission.button.confirm')}
                </Button>
            </div>
        </div>
    );
};

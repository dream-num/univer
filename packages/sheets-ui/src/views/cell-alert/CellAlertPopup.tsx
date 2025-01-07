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

import type { ICanvasPopup } from '../../services/canvas-pop-manager.service';
import type { ICellAlert } from '../../services/cell-alert-manager.service';
import { ErrorSingle, WarningSingle } from '@univerjs/icons';
import cs from 'clsx';
import React from 'react';
import { CellAlertType } from '../../services/cell-alert-manager.service';
import styles from './index.module.less';

/**
 *
 * @param root0
 * @param root0.popup
 */
export function CellAlert({ popup }: { popup: ICanvasPopup }) {
    const alert = popup.extraProps?.alert;

    if (!alert) {
        return null;
    }
    const { type, title, message } = alert as ICellAlert;

    const iconMap = {
        [CellAlertType.ERROR]: <ErrorSingle className={cs(styles.cellAlertIcon, styles.cellAlertIconError)} />,
        [CellAlertType.INFO]: <WarningSingle className={cs(styles.cellAlertIcon, styles.cellAlertIconInfo)} />,
        [CellAlertType.WARNING]: <WarningSingle className={cs(styles.cellAlertIcon, styles.cellAlertIconWarning)} />,
    };

    return (
        <div className={styles.cellAlert}>
            <div className={styles.cellAlertTitle}>
                {type ? iconMap[type] : null}
                {title}
            </div>
            <div className={styles.cellAlertContent}>{message}</div>
        </div>
    );
}

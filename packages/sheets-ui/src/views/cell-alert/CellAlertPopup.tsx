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

import type { ICanvasPopup } from '../../services/canvas-pop-manager.service';
import type { ICellAlert } from '../../services/cell-alert-manager.service';
import { ErrorSingle, InfoSingle, WarningSingle } from '@univerjs/icons';
import { CellAlertType } from '../../services/cell-alert-manager.service';

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
        [CellAlertType.ERROR]: <ErrorSingle className="univer-mr-1.5 univer-text-red-500" />,
        [CellAlertType.INFO]: <InfoSingle className="univer-mr-1.5 univer-text-blue-500" />,
        [CellAlertType.WARNING]: <WarningSingle className="univer-mr-1.5 univer-text-yellow-500" />,
    };

    return (
        <div
            className={`
              univer-z-[100] univer-box-border univer-w-[156px] univer-rounded-lg univer-bg-white univer-px-2
              univer-py-1 univer-text-gray-900 univer-shadow
              dark:univer-bg-black dark:univer-text-white
            `}
        >
            <div
                className={`
                  univer-mb-1.5 univer-flex univer-h-5 univer-flex-row univer-items-center univer-text-sm
                  univer-font-medium
                `}
            >
                {type ? iconMap[type] : null}
                {title}
            </div>
            <div className="univer-text-sm">{message}</div>
        </div>
    );
}

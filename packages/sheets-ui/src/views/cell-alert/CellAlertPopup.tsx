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
import { DropdownMenu } from '@univerjs/design';
import { ErrorIcon, InfoIcon, MoreDownIcon, WarningIcon } from '@univerjs/icons';
import { useState } from 'react';
import { CellAlertType } from '../../services/cell-alert-manager.service';

/**
 *
 * @param root0
 * @param root0.popup
 */
export function CellAlert({ popup }: { popup: ICanvasPopup }) {
    const [visible, setVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const alert = popup.extraProps?.alert;

    if (!alert) {
        return null;
    }
    const { type, title, message, menu } = alert as ICellAlert;

    if (menu?.length) {
        const accessibleLabel = [title, message]
            .filter((value): value is string => typeof value === 'string')
            .join(': ');
        const showMore = visible || isHovered;

        return (
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <DropdownMenu
                    align="start"
                    open={visible}
                    onOpenChange={setVisible}
                    items={[
                        {
                            type: 'custom',
                            className: `
                              univer-px-2 univer-py-1.5 univer-font-medium univer-text-gray-900
                              dark:!univer-text-gray-0
                            `,
                            children: message,
                        },
                        {
                            type: 'separator',
                        },
                        ...menu.map((item) => ({
                            type: 'item' as const,
                            children: item.label,
                            disabled: item.disabled,
                            onSelect: item.onSelect,
                        })),
                    ]}
                >
                    <button
                        type="button"
                        aria-label={accessibleLabel || undefined}
                        className={`
                          univer-flex univer-items-center univer-gap-1 univer-rounded univer-border univer-border-solid
                          univer-border-gray-200 univer-bg-gray-0 univer-p-1 univer-shadow
                          hover:univer-bg-gray-100
                          dark:!univer-border-gray-600 dark:!univer-bg-gray-900
                          dark:hover:!univer-bg-gray-800
                        `}
                    >
                        <WarningIcon className="univer-text-yellow-500" />
                        {showMore && (
                            <MoreDownIcon
                                className={`
                                  univer-text-gray-600
                                  dark:!univer-text-gray-300
                                `}
                            />
                        )}
                    </button>
                </DropdownMenu>
            </div>
        );
    }

    const iconMap = {
        [CellAlertType.ERROR]: <ErrorIcon className="univer-text-red-500" />,
        [CellAlertType.INFO]: <InfoIcon className="univer-text-blue-500" />,
        [CellAlertType.WARNING]: <WarningIcon className="univer-text-yellow-500" />,
    };

    return (
        <div
            className={`
              univer-z-[100] univer-box-border univer-w-[156px] univer-rounded-lg univer-bg-gray-0 univer-px-2
              univer-py-1 univer-text-gray-900 univer-shadow
              dark:!univer-bg-gray-1000 dark:!univer-text-gray-0
            `}
        >
            <div
                className={`
                  univer-mb-1.5 univer-flex univer-h-5 univer-flex-row univer-items-center univer-gap-x-1.5
                  univer-text-sm univer-font-medium
                `}
            >
                {type ? iconMap[type] : null}
                {title}
            </div>
            <div className="univer-text-sm">{message}</div>
        </div>
    );
}

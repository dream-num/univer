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

import type { BooleanNumber } from '@univerjs/core';
import type { CSSProperties, ReactNode } from 'react';
import { ColorKit, ThemeService } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';

export interface IBaseSheetBarProps {
    label?: ReactNode;
    children?: any[];
    index?: number;
    color?: string;
    sheetId?: string;
    style?: CSSProperties;
    hidden?: BooleanNumber;
    selected?: boolean;
    menuOverlay?: ReactNode;
}

export function SheetBarItem(props: IBaseSheetBarProps) {
    const { sheetId, label, color, selected, menuOverlay } = props;

    const [currentSelected, setCurrentSelected] = useState(selected);

    const themeService = useDependency(ThemeService);

    useEffect(() => {
        // TODO: update too many times?
        setCurrentSelected(selected);
    }, [selected]);

    const getTextColor = (color: string) => {
        const darkTextColor = themeService.getColorFromTheme('gray.900');
        const lightTextColor = themeService.getColorFromTheme('white');
        return new ColorKit(color).isDark() ? lightTextColor : darkTextColor;
    };

    return (
        <div
            data-u-comp="slide-tab-item"
            key={sheetId}
            data-id={sheetId}
            className={clsx(`
              univer-mx-1 univer-box-border univer-flex univer-flex-grow univer-cursor-pointer univer-select-none
              univer-flex-row univer-items-center univer-rounded univer-text-xs univer-transition-[colors,box-shadow]
            `, {
                'dark:!univer-text-white': !color || (color && !getTextColor(color)),
                'univer-justify-center univer-bg-white univer-font-bold univer-text-primary-700 univer-shadow': currentSelected,
                'dark:!univer-bg-gray-900': currentSelected && !color,
                'univer-font-medium univer-text-gray-900 hover:univer-bg-gray-100': !currentSelected,
                'dark:hover:!univer-bg-gray-700': !currentSelected && !color,
            })}
            style={{
                backgroundColor: !currentSelected && color ? color : '',
                color: !currentSelected && color ? getTextColor(color) : '',
                boxShadow:
                    currentSelected && color ? `0px 0px 8px rgba(0, 0, 0, 0.08), inset 0px -2px 0px 0px ${color}` : '',
            }}
        >
            <div
                className={`
                  univer-box-border univer-flex univer-items-center univer-gap-1 univer-whitespace-nowrap univer-rounded
                  univer-border-2 univer-border-solid univer-border-transparent univer-px-1.5 univer-py-1
                `}
            >
                {label}
            </div>
        </div>
    );
}

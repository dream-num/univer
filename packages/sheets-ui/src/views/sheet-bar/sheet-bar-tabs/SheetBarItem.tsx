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

import type { BooleanNumber } from '@univerjs/core';
import { ColorKit, ThemeService, useDependency } from '@univerjs/core';
import React, { useEffect, useState } from 'react';

import styles from './index.module.less';

export interface IBaseSheetBarProps {
    label?: React.ReactNode;
    children?: any[];
    index?: number;
    color?: string;
    sheetId?: string;
    style?: React.CSSProperties;
    hidden?: BooleanNumber;
    selected?: boolean;
}

export function SheetBarItem(props: IBaseSheetBarProps) {
    const { sheetId, label, color, selected } = props;

    const [currentSelected, setCurrentSelected] = useState(selected);

    const themeService = useDependency(ThemeService);

    useEffect(() => {
        // TODO: update too many times?
        setCurrentSelected(selected);
    }, [selected]);

    const getTextColor = (color: string) => {
        const theme = themeService.getCurrentTheme();
        const darkTextColor = theme.textColor;
        const lightTextColor = theme.colorWhite;
        return new ColorKit(color).isDark() ? lightTextColor : darkTextColor;
    };

    return (
        <div
            key={sheetId}
            data-id={sheetId}
            className={currentSelected
                ? `
                  ${styles.slideTabActive}
                  ${styles.slideTabItem}
                `
                : styles.slideTabItem}
            style={{
                backgroundColor: !currentSelected && color ? color : '',
                color: !currentSelected && color ? getTextColor(color) : '',
                boxShadow:
                    currentSelected && color ? `0px 0px 8px rgba(0, 0, 0, 0.08), inset 0px -2px 0px 0px ${color}` : '',
            }}
        >
            <div className={styles.slideTabDiv}>{label}</div>
        </div>
    );
}

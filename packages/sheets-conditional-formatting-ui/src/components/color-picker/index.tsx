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

import { ColorKit, useDependency } from '@univerjs/core';
import { DropdownLegacy, ColorPicker as OriginColorPicker } from '@univerjs/design';
import { MoreDownSingle } from '@univerjs/icons';
import { ComponentManager } from '@univerjs/ui';
import React, { useMemo } from 'react';

import styles from './index.module.less';

interface IColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    disable?: boolean;
    iconId?: string;
    className?: string;
    isNeedDropdownIcon?: boolean;
};

export const ColorPicker = (props: IColorPickerProps) => {
    const { color, onChange, disable = false, iconId = 'PaintBucket', className, isNeedDropdownIcon = true } = props;
    const componentManager = useDependency(ComponentManager);

    const colorKit = useMemo(() => new ColorKit(color), [color]);
    const Icon = componentManager.get(iconId);

    return Icon && (!disable
        ? (
            <DropdownLegacy
                overlay={(
                    <div className={`
                      ${styles.cfColorPicker}
                    `}
                    >
                        <OriginColorPicker value={color} onChange={onChange} />
                    </div>
                )}
            >
                <span className={`
                  ${styles.cfColorPickerIcon}
                  ${className}
                `}
                >
                    <Icon extend={{ colorChannel1: colorKit.isValid ? color : 'rgb(var(--primary-color))' }} />
                    {isNeedDropdownIcon && <MoreDownSingle className={styles.iconDropdown} />}
                </span>

            </DropdownLegacy>
        )
        : <Icon className={className} extend={{ colorChannel1: colorKit.isValid ? color : 'rgb(var(--primary-color))' }} />);
};

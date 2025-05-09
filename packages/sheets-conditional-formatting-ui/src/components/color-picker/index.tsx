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

import { ColorKit } from '@univerjs/core';
import { clsx, Dropdown, ColorPicker as OriginColorPicker } from '@univerjs/design';
import { MoreDownSingle } from '@univerjs/icons';
import { ComponentManager, useDependency } from '@univerjs/ui';
import { useMemo } from 'react';

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

    if (!Icon) return null;

    return !disable
        ? (
            <Dropdown
                overlay={(
                    <div className="univer-rounded-lg univer-p-4">
                        <OriginColorPicker value={color} onChange={onChange} />
                    </div>
                )}
            >
                <span
                    className={clsx(`
                      univer-flex univer-cursor-pointer univer-items-center univer-rounded univer-p-1
                      hover:univer-bg-gray-100
                    `, className)}
                >
                    <Icon className="univer-fill-primary-600" extend={{ colorChannel1: colorKit.isValid ? color : '' }} />
                    {isNeedDropdownIcon && (
                        <MoreDownSingle
                            className="univer-ml-1.5 univer-text-gray-400"
                        />
                    )}
                </span>
            </Dropdown>
        )
        : <Icon className={clsx('univer-fill-primary-600', className)} extend={{ colorChannel1: colorKit.isValid ? color : '' }} />;
};

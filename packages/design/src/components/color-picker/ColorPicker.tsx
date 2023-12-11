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

import type { Color } from '@rc-component/color-picker';
import RcColorPicker, { ColorBlock } from '@rc-component/color-picker';
import React from 'react';

import styles from './index.module.less';
import { colorPresets } from './presets';

export interface IColorPickerProps {
    color?: string;

    onClick?: (color: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;

    onChange?: (value: string) => void;
}

export function ColorPicker(props: IColorPickerProps) {
    const { onChange } = props;

    function handleStopPropagation(e: React.MouseEvent) {
        e.stopPropagation();
    }

    function handleChange(color: Color | string) {
        const value = (typeof color === 'string' ? color : color.toHexString()) ?? '';

        onChange?.(value);
    }

    return (
        <section>
            <div>
                <div className={styles.colorPickerColorBlocks}>
                    {colorPresets.map((color) => (
                        <ColorBlock
                            key={color}
                            prefixCls={styles.colorPicker}
                            color={color}
                            onClick={() => handleChange(color)}
                        />
                    ))}
                </div>
            </div>
            <section onClick={handleStopPropagation}>
                <RcColorPicker prefixCls={styles.colorPicker} disabledAlpha onChangeComplete={handleChange} />
            </section>
        </section>
    );
}

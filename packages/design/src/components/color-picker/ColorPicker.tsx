import RcColorPicker, { Color, ColorBlock } from '@rc-component/color-picker';
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

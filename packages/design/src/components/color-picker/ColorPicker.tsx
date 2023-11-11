import RcColorPicker, { Color, ColorBlock } from '@rc-component/color-picker';
import { useContext, useState } from 'react';

import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';
import { colorPresets } from './presets';

export interface IColorPickerProps {
    color?: string;

    onClick?: (color: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;

    onChange?: (value: string) => void;
}

enum ColorPickerMode {
    PRESET,
    CUSTOM,
}

export function ColorPicker(props: IColorPickerProps) {
    const { onChange } = props;

    const [mode, setMode] = useState<ColorPickerMode>(ColorPickerMode.PRESET);

    const { locale } = useContext(ConfigContext);

    function handleStopPropagation(e: React.MouseEvent) {
        e.stopPropagation();
    }

    function handleChange(color: Color | string) {
        const value = (typeof color === 'string' ? color : color.toHexString()) ?? '';

        onChange?.(value);
    }

    function handleToggleMode(e: React.MouseEvent) {
        e.stopPropagation();
        setMode(mode === ColorPickerMode.PRESET ? ColorPickerMode.CUSTOM : ColorPickerMode.PRESET);
    }

    return (
        <section>
            {mode === ColorPickerMode.PRESET && (
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
                    <a className={styles.colorPickerCustomBtn} onClick={handleToggleMode}>
                        {locale.design.ColorPicker.custom}
                    </a>
                </div>
            )}
            {mode === ColorPickerMode.CUSTOM && (
                <section onClick={handleStopPropagation}>
                    <RcColorPicker prefixCls={styles.colorPicker} disabledAlpha onChangeComplete={handleChange} />
                    <a className={styles.colorPickerCancelBtn} onClick={handleToggleMode}>
                        {locale.design.ColorPicker.cancel}
                    </a>
                </section>
            )}
        </section>
    );
}

import RcColorPicker, { Color, ColorBlock } from '@rc-component/color-picker';
import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useState } from 'react';

import styles from './index.module.less';

export interface IColorPickerProps {
    /**
     * init color
     */
    color?: string;

    onClick?: (color: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; // 返回所选颜色

    onValueChange?: (value: string) => void; // 返回所选颜色
}

const colorPresets = [
    '#35322B',
    '#505050',
    '#606060',
    '#6F6F6F',
    '#8B8B8B',
    '#B2B2B2',
    '#CCCCCC',
    '#E5E5E5',
    '#F5F5F5',
    '#FFFFFF',
    '#9D0000',
    '#B20000',
    '#CD0F0F',
    '#E30909',
    '#F30B0B',
    '#FE4B4B',
    '#FA7979',
    '#FB9D9D',
    '#FDCECE',
    '#FEE7E7',
    '#B24000',
    '#CC4F10',
    '#DF5D00',
    '#F96800',
    '#FB8937',
    '#FF8C51',
    '#FCA669',
    '#FDC49B',
    '#FEE1CD',
    '#FEF0E6',
    '#B19401',
    '#C5A300',
    '#D8B300',
    '#EBC301',
    '#F9D700',
    '#FBE137',
    '#FCE869',
    '#FDF09B',
    '#FEF7CD',
    '#FEFBE6',
    '#58770A',
    '#688C0D',
    '#7AA017',
    '#8BBB11',
    '#A4DC16',
    '#BEEE44',
    '#CEF273',
    '#DEF6A2',
    '#EFFBD0',
    '#F7FDE8',
    '#007676',
    '#008A8A',
    '#009E9E',
    '#00BBBB',
    '#1CD8D8',
    '#2AEAEA',
    '#76EFEF',
    '#A3F5F5',
    '#D1FAFA',
    '#E8FCFC',
    '#001F9C',
    '#0025B7',
    '#012BD2',
    '#133DE3',
    '#2F55EB',
    '#4567ED',
    '#738DF2',
    '#A2B3F6',
    '#D0D9FB',
    '#E8ECFD',
    '#3F0198',
    '#510EB0',
    '#6721CB',
    '#7735D4',
    '#894EDE',
    '#9E6DE3',
    '#AA82E3',
    '#C7ABED',
    '#E3D5F6',
    '#F1EAFA',
    '#8F0550',
    '#A1095C',
    '#C1026B',
    '#D4157E',
    '#E7258F',
    '#F248A6',
    '#F273B9',
    '#F6A2D0',
    '#FBD0E8',
    '#FDE8F3',
];

enum ColorPickerMode {
    PRESET,
    CUSTOM,
}

export function ColorPicker(props: IColorPickerProps) {
    const { onValueChange } = props;
    const localeService = useDependency(LocaleService);

    const [mode, setMode] = useState<ColorPickerMode>(ColorPickerMode.PRESET);

    function handleStopPropagation(e: React.MouseEvent) {
        e.stopPropagation();
    }

    function handleChange(color: Color | string) {
        const value = (typeof color === 'string' ? color : color.toHexString()) ?? '';

        onValueChange && onValueChange(value);
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
                        {localeService.t('colorPicker.customColor')}
                    </a>
                </div>
            )}
            {mode === ColorPickerMode.CUSTOM && (
                <section onClick={handleStopPropagation}>
                    <RcColorPicker prefixCls={styles.colorPicker} disabledAlpha onChangeComplete={handleChange} />
                    <a className={styles.colorPickerCancelBtn} onClick={handleToggleMode}>
                        {localeService.t('colorPicker.cancelColor')}
                    </a>
                </section>
            )}
        </section>
    );
}

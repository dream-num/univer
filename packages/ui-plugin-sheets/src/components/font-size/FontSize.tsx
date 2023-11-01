import { InputNumber } from '@univerjs/design';
import { useMemo, useState } from 'react';

import styles from './index.module.less';
import { IFontSizeProps } from './interface';

export const FontSize = (props: IFontSizeProps) => {
    const { value, min, max, onChange } = props;
    const [realValue, setRealValue] = useState<number>(Number(value ?? 0));

    const _value = useMemo(() => Number(value ?? realValue), [value]);

    function handleChange(value: number | null) {
        if (value === null) return;

        setRealValue(value);
    }

    function handleStopPropagation(e: React.KeyboardEvent<HTMLInputElement>) {
        e.stopPropagation();

        if (e.code === 'Enter') {
            onChange(realValue.toString());
        }
    }

    return (
        <div className={styles.uiPluginSheetsFontSize}>
            <InputNumber
                value={_value}
                controls={false}
                min={min}
                max={max}
                onKeyDown={handleStopPropagation}
                onChange={handleChange}
            />
        </div>
    );
};

import { LocaleService } from '@univerjs/core';
import { InputNumber } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import styles from './index.module.less';
import { IMenuItemInputProps } from './interface';

export const MenuItemInput = (props: IMenuItemInputProps) => {
    const { prefix, suffix, value, onChange } = props;

    const localeService = useDependency(LocaleService);

    const [inputValue, setInputValue] = useState<string>(); // Initialized to an empty string

    const handleChange = (value: number | null) => {
        setInputValue(value?.toString());
        onChange(value?.toString() ?? '');
    };

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Backspace') {
            e.stopPropagation();
        }
    }

    return (
        <div className={styles.uiPluginSheetsContextMenuInput}>
            {localeService.t(prefix)}
            <span className={styles.uiPluginSheetsContextMenuInputContainer} onClick={(e) => e.stopPropagation()}>
                <InputNumber
                    value={Number(inputValue)}
                    precision={0}
                    onKeyDown={handleKeyDown}
                    onChange={handleChange}
                />
            </span>
            {localeService.t(suffix)}
        </div>
    );
};

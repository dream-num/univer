import { CustomLabel, ICustomComponentProps } from '@univerjs/base-ui';
import { InputNumber } from '@univerjs/design';
import React, { useEffect, useState } from 'react';

import styles from './index.module.less';

interface IProps extends ICustomComponentProps<string> {
    prefix: string;
    suffix: string;

    /**
     * After ENTER, execute Command, close the right-click menu
     */
    onValueChange?: (value: string) => void;
}

export const ContextMenuInput: React.FC<IProps> = ({ prefix, suffix, value, onChange, onValueChange }) => {
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
            <CustomLabel label={prefix} />
            <span onClick={(e) => e.stopPropagation()}>
                <InputNumber value={Number(inputValue)} onKeyDown={handleKeyDown} onChange={handleChange} />
            </span>
            <CustomLabel label={suffix} />
        </div>
    );
};

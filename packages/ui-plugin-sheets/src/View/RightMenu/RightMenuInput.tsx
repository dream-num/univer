import { CustomLabel, ICustomComponentProps, Input } from '@univerjs/base-ui';
import React, { useEffect, useState } from 'react';

interface IProps extends ICustomComponentProps<string> {
    prefix: string;
    suffix: string;

    /**
     * After ENTER, execute Command, close the right-click menu
     */
    onValueChange?: (value: string) => void;
}

export const RightMenuInput: React.FC<IProps> = ({ prefix, suffix, value, onChange, onValueChange }) => {
    const [inputValue, setInputValue] = useState<string>(); // Initialized to an empty string

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
    };

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    return (
        <div>
            <CustomLabel label={prefix} />
            <Input
                type="number"
                placeholder="1"
                value={inputValue}
                onClick={(e) => e.stopPropagation()}
                onChange={handleChange}
                onValueChange={onValueChange}
            ></Input>
            <CustomLabel label={suffix} />
        </div>
    );
};

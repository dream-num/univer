import { CustomLabel, ICustomComponentProps, Input } from '@univerjs/base-ui';
import React, { useState } from 'react';

interface IProps extends ICustomComponentProps<string> {
    prefix: string;
    suffix: string;
    onKeyUp?: (e: Event) => void;
}

export const RightMenuInput: React.FC<IProps> = ({ prefix, suffix, onChange }) => {
    const [inputValue, setInputValue] = useState<string>(''); // Initialized to an empty string

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
    };

    return (
        <div>
            <CustomLabel label={prefix} />
            <Input
                type="number"
                placeholder="1"
                value={inputValue}
                onClick={(e) => e.stopPropagation()}
                onChange={handleChange}
            ></Input>
            <CustomLabel label={suffix} />
        </div>
    );
};

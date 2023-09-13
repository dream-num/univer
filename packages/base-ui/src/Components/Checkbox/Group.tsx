import { useRef } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { Checkbox } from './Checkbox';
import styles from './index.module.less';

export type BaseCheckboxGroupOptions = {
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    label?: React.ReactNode;
    value?: string;
};

export interface BaseCheckboxGroupProps extends BaseComponentProps {
    disabled?: boolean;
    name?: string;
    options: BaseCheckboxGroupOptions[];
    onChange?: (value: string[]) => void;
}

export function CheckboxGroup(props: BaseCheckboxGroupProps) {
    const { options, onChange, disabled, name } = props;
    const ref = useRef<HTMLDivElement>(null);

    if (disabled) {
        options.forEach((item) => {
            item.disabled = true;
        });
    }
    if (name) {
        options.forEach((item) => {
            item.name = name;
        });
    }

    const handelChange = () => {
        if (!onChange) return;
        const input = ref.current?.querySelectorAll('label input');
        const value: string[] = [];
        input?.forEach((item) => {
            const element = item as HTMLInputElement;
            if (element.checked) {
                value.push(element.value);
            }
        });
        onChange(value);
    };

    return (
        <div className={styles.checkboxGroup} ref={ref}>
            {options.map((item) => (
                <Checkbox key={item.name} name={item.name} disabled={item.disabled} checked={item.checked} onChange={handelChange} value={item.value}>
                    {item.label}
                </Checkbox>
            ))}
        </div>
    );
}

import { useRef } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { Checkbox } from './Checkbox';
import styles from './index.module.less';

export type BaseCheckboxGroupOptions = {
    label?: React.ReactNode;

    checked?: boolean;

    disabled?: boolean;

    name?: string;

    value?: string;
};

// TODO: where is the `value`?

export interface BaseCheckboxGroupProps extends BaseComponentProps {
    /** The `name` property of all `input[type="checkbox"]` children */
    name?: string;

    /**
     * Specifies options
     * @default []
     */
    options: BaseCheckboxGroupOptions[];

    /**
     * If disable all checkboxes
     * @default false
     */
    disabled?: boolean;

    onChange?: (value: string[]) => void;
}

/**
 * CheckboxGroup Component
 */
export function CheckboxGroup(props: BaseCheckboxGroupProps) {
    const { name, options = [], disabled = false, onChange } = props;
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
                <Checkbox
                    key={item.name}
                    name={item.name}
                    disabled={item.disabled}
                    checked={item.checked}
                    onChange={handelChange}
                    value={item.value}
                >
                    {item.label}
                </Checkbox>
            ))}
        </div>
    );
}

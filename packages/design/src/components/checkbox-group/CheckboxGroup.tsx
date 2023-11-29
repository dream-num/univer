import React from 'react';

import type { ICheckboxProps } from '../checkbox/Checkbox';
import styles from './index.module.less';

export interface ICheckboxGroupProps {
    children: React.ReactNode[];

    /**
     * Define which checkbox is selected
     */
    value: Array<string | number | boolean>;

    /**
     * Whether the checkbox is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * The callback function triggered when switching options
     */
    onChange: (value: Array<string | number | boolean>) => void;
}

/**
 * CheckboxGroup Component
 */
export function CheckboxGroup(props: ICheckboxGroupProps) {
    const { children, value, disabled = false, onChange } = props;

    const handleChange = (item: string | number | boolean) => {
        if (value.includes(item)) {
            onChange(value.filter((i) => i !== item));
        } else {
            onChange([...value, item]);
        }
    };

    return (
        <div className={styles.checkboxGroup}>
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement<ICheckboxProps>(child)) {
                    return React.cloneElement(child, {
                        key: index,
                        children: child.props.children,
                        value: child.props.value,
                        checked: value.includes(child.props.value),
                        disabled: disabled ?? child.props.disabled,
                        onChange: handleChange,
                    });
                }
                return child;
            })}
        </div>
    );
}

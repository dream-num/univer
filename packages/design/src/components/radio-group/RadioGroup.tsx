import React from 'react';

import { IRadioProps } from '../radio/Radio';
import styles from './index.module.less';

export interface IRadioGroupProps {
    children: React.ReactNode[];

    /**
     * Define which radio is selected
     */
    value: string;

    /**
     * Whether the radio is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * The callback function triggered when switching options
     */
    onChange: (value: string | number | boolean) => void;
}

/**
 * RadioGroup Component
 */
export function RadioGroup(props: IRadioGroupProps) {
    const { children, value, disabled = false, onChange } = props;

    const handleChange = (value: string | number | boolean) => {
        onChange(value);
    };

    return (
        <div className={styles.radioGroup}>
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement<IRadioProps>(child)) {
                    return React.cloneElement(child, {
                        key: index,
                        children: child.props.children,
                        value: child.props.value,
                        checked: value === child.props.value,
                        disabled: disabled ?? child.props.disabled,
                        onChange: handleChange,
                    });
                }
                return child;
            })}
        </div>
    );
}

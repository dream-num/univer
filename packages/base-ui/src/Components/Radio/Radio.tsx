import React from 'react';

import styles from './index.module.less';

export interface BaseRadioIProps {
    value: string;
    active?: boolean;
    onClick?: (value: string) => void;
    label?: string;
    children?: React.ReactNode[];
}

export interface BaseRadioGroupProps {
    className?: string;
    active?: string | number;
    vertical?: boolean;
    onChange: (value: string) => void;
    children: React.ReactNode[];
}

export function RadioGroup(props: BaseRadioGroupProps) {
    const { vertical, className = '', active, onChange } = props;

    const handleActiveChange = (value: string) => {
        onChange(value);
    };

    return (
        <div className={`${vertical ? styles.radioGroup : ''} ${className || ''}`}>
            {React.Children.map(props.children, (child, index) => {
                if (React.isValidElement<BaseRadioIProps>(child)) {
                    const isActive = active === child.props.value;
                    return React.cloneElement(child, {
                        key: index,
                        label: child.props.label,
                        children: child.props.children,
                        value: child.props.value,
                        active: isActive,
                        onClick: handleActiveChange,
                    });
                }
                return child;
            })}
        </div>
    );
}

export function Radio({ value, active, onClick, label, children }: BaseRadioIProps) {
    return (
        <div className={styles.radioWrap}>
            <div className={styles.radioLeft}>
                <div onClick={onClick && (() => onClick(value))}>
                    <div className={`${styles.circle} ${active && styles.active}`}>
                        <div className={styles.fork}></div>
                    </div>
                    <div className={styles.label}>{label}</div>
                </div>
                {children}
            </div>
        </div>
    );
}

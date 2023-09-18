import React from 'react';

import styles from './index.module.less';

export interface BaseRadioIProps {
    children?: React.ReactNode[];

    /** Semantic DOM style */
    style?: React.CSSProperties;

    /**
     * Used for setting the currently selected value
     */
    value: string;

    /**
     * Specifies whether the radio is selected
     * @default false
     */
    active?: boolean;

    /**
     * Set the handler to handle `click` event
     */
    onClick?: (value: string) => void;

    /**
     * The label content displayed
     * @default ''
     */
    label?: string;
}

export interface BaseRadioGroupProps {
    children: React.ReactNode[];

    /**
     * Semantic DOM class
     * @default ''
     */
    className?: string;

    /**
     * Define which radio is selected
     */
    active: string;

    /**
     * Whether to arrange vertically
     * @default false
     */
    vertical?: boolean;

    /**
     * The callback function triggered when switching options
     */
    onChange: (value: string) => void;
}

/**
 * RadioGroup Component
 */
export function RadioGroup(props: BaseRadioGroupProps) {
    const { vertical = false, className = '', active, onChange } = props;

    const handleActiveChange = (value: string) => {
        onChange(value);
    };

    return (
        <div className={`${vertical ? styles.radioGroup : ''} ${className}`}>
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
                        style: child.props.style,
                    });
                }
                return child;
            })}
        </div>
    );
}

/**
 * Radio Component
 */
export function Radio({ value, active, onClick, label = 'Radio', children, style }: BaseRadioIProps) {
    return (
        <div className={styles.radioWrap} style={style}>
            <div>
                <div className={styles.radioLeft} onClick={onClick && (() => onClick(value))}>
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

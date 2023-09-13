import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { joinClassNames } from '../../Utils/util';
import styles from './Style/index.module.less';

export interface BaseInputNumberProps extends BaseComponentProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    bordered?: boolean;
    disabled?: boolean;
    onFocus?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
    onClick?: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
    onValueChange?: (value: string) => void;
    className?: string;
    readonly?: boolean;
    id?: string;
    ref?: RefObject<HTMLInputElement>;
}

export function InputNumber(props: BaseInputNumberProps) {
    const ref = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(props.value);
    const [focused, setFocused] = useState(false);

    const realValue = useMemo(() => value ?? props.value ?? '', [value, props.value]);

    useEffect(() => {
        if (props.value && props.value !== value) {
            setValue(props.value);
        }
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { onChange } = props;
        const target = e.target;

        setValue(target.value);
        if (!onChange) return;
        onChange(e);
    };

    const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { onPressEnter, onValueChange } = props;
        const v = getValue();
        setValue(v);
        if (e.key === 'Enter') {
            onPressEnter?.(e);
            ref.current?.blur();
            v && onValueChange?.(v);
        }
    };

    const onFocus = (e: React.FocusEvent<HTMLInputElement, Element>) => {
        const { onFocus } = props;
        onFocus?.(e);
        setFocused(true);
    };

    const onClick = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        e.stopPropagation();
        const { onClick } = props;
        onClick?.(e);
    };

    const onBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
        const { onBlur, onValueChange } = props;
        onBlur?.(e);
        const v = getValue();
        v && onValueChange?.(v);
        setFocused(false);
    };

    const getValue = () => ref.current?.value;

    const { id, disabled, bordered = true, className = '', readonly } = props;

    const classes = joinClassNames(
        styles.input,
        {
            [`${styles.input}-disable`]: disabled,
            [`${styles.input}-borderless`]: !bordered,
        },
        className
    );

    return (
        <input
            onBlur={onBlur}
            onFocus={onFocus}
            className={classes}
            disabled={disabled}
            ref={ref}
            onChange={handleChange}
            value={realValue}
            onClick={onClick}
            readOnly={readonly}
            id={id}
            onKeyUp={handlePressEnter}
        />
    );
}

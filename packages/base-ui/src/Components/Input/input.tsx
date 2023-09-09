import { Component, createRef } from 'react';
import { JSXComponent } from '../../BaseComponent';
import { BaseInputProps, InputComponent } from '../../Interfaces';
import { joinClassNames } from '../../Utils';
import styles from './Style/index.module.less';

// interface InputProps {
//     type?: 'text' | 'button' | 'checkbox' | 'file' | 'hidden' | 'image' | 'password' | 'radio' | 'rest' | 'submit' | 'number';
//     value?: string;
//     placeholder?: string;
//     onChange?: (e: Event) => void;
//     bordered?: boolean;
//     disabled?: boolean;
//     // maxLength?: number;
//     // onPressEnter?: KeyboardEvent;
//     onFocus?: (e: Event) => void;
//     onBlur?: (e: Event) => void;
//     onClick?: (e: MouseEvent) => void;
//     className?: string;
//     readonly?: boolean;
//     id?: string;
// }

type IState = {
    value?: string;
    focused: boolean;
    prevValue?: string;
};

export class Input extends Component<BaseInputProps, IState> {
    ref = createRef();

    constructor(props: BaseInputProps) {
        super();
        this.initialize(props);
    }

    initialize(props: BaseInputProps) {
        // super(props);
        this.state = {
            value: props.value,
            focused: false,
        };
    }

    setValue = (value: string, callback?: () => void) => {
        this.setState(
            (prevState) => ({
                value,
            }),
            callback
        );
    };

    handleChange = (e: Event) => {
        const { onChange } = this.props;
        if (!onChange) return;
        const target = e.target as HTMLInputElement;
        this.setValue(target.value);
        onChange(e);
    };

    handlePressEnter = (e: KeyboardEvent) => {
        const { onPressEnter, onValueChange } = this.props;
        if (e.key === 'Enter') {
            onPressEnter?.(e);
            this.ref.current.blur();
            onValueChange?.(this.getValue());
        }
    };

    onFocus = (e: Event) => {
        const { onFocus } = this.props;
        onFocus?.(e);
    };

    onClick = (e: MouseEvent) => {
        const { onClick } = this.props;
        onClick?.(e);
        e.stopPropagation();
    };

    onBlur = (e: FocusEvent) => {
        const { onBlur, onValueChange } = this.props;
        onBlur?.(e);
        onValueChange?.(this.getValue());
    };

    // get input value
    getValue = () => this.ref.current.value;

    UNSAFE_componentWillMount() {
        if (this.props.value) {
            this.setValue(this.props.value);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps: Readonly<BaseInputProps>) {
        if (nextProps.value && nextProps.value !== this.state.value) {
            this.setValue(nextProps.value);
        }
    }

    render() {
        const { id, disabled, type, placeholder, bordered = true, className = '', readonly } = this.props;
        const { value } = this.state;

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
                type={type}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
                className={classes}
                placeholder={placeholder}
                disabled={disabled}
                ref={this.ref}
                onChange={this.handleChange}
                value={value}
                onClick={this.onClick}
                readOnly={readonly}
                id={id}
                onKeyUp={this.handlePressEnter}
            ></input>
        );
    }
}

export class UniverInput implements InputComponent {
    render(): JSXComponent<BaseInputProps> {
        return Input;
    }
}

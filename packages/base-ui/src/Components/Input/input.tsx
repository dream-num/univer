import React, { useRef, useState } from 'react';

import { BaseInputProps } from '../../Interfaces';
import { joinClassNames } from '../../Utils/util';
import styles from './Style/index.module.less';

// type IState = {
//     value?: string;
//     focused: boolean;
//     prevValue?: string;
// };
// export class Input extends Component<BaseInputProps, IState> {
//     ref = createRef();

//     constructor(props: BaseInputProps) {
//         super();
//         this.initialize(props);
//     }

//     initialize(props: BaseInputProps) {
//         // super(props);
//         this.state = {
//             value: props.value,
//             focused: false,
//         };
//     }

//     setValue = (value: string, callback?: () => void) => {
//         this.setState(
//             (prevState) => ({
//                 value,
//             }),
//             callback
//         );
//     };

//     handleChange = (e: Event) => {
//         const { onChange } = this.props;
//         if (!onChange) return;
//         const target = e.target as HTMLInputElement;
//         this.setValue(target.value);
//         onChange(e);
//     };

//     handlePressEnter = (e: KeyboardEvent) => {
//         const { onPressEnter, onValueChange } = this.props;
//         if (e.key === 'Enter') {
//             onPressEnter?.(e);
//             this.ref.current.blur();
//             onValueChange?.(this.getValue());
//         }
//     };

//     onFocus = (e: Event) => {
//         const { onFocus } = this.props;
//         onFocus?.(e);
//     };

//     onClick = (e: MouseEvent) => {
//         const { onClick } = this.props;
//         onClick?.(e);
//         e.stopPropagation();
//     };

//     onBlur = (e: FocusEvent) => {
//         const { onBlur, onValueChange } = this.props;
//         onBlur?.(e);
//         onValueChange?.(this.getValue());
//     };

//     // get input value
//     getValue = () => this.ref.current.value;

//     UNSAFE_componentWillMount() {
//         if (this.props.value) {
//             this.setValue(this.props.value);
//         }
//     }

//     UNSAFE_componentWillReceiveProps(nextProps: Readonly<BaseInputProps>) {
//         if (nextProps.value && nextProps.value !== this.state.value) {
//             this.setValue(nextProps.value);
//         }
//     }

//     render() {
//         const { id, disabled, type, placeholder, bordered = true, className = '', readonly } = this.props;
//         const { value } = this.state;
//         const classes = joinClassNames(
//             styles.input,
//             {
//                 [`${styles.input}-disable`]: disabled,
//                 [`${styles.input}-borderless`]: !bordered,
//             },
//             className
//         );
//         return (
//             <input
//                 type={type}
//                 onBlur={this.onBlur}
//                 onFocus={this.onFocus}
//                 className={classes}
//                 placeholder={placeholder}
//                 disabled={disabled}
//                 ref={this.ref}
//                 onChange={this.handleChange}
//                 value={value}
//                 onClick={this.onClick}
//                 readOnly={readonly}
//                 id={id}
//                 onKeyUp={this.handlePressEnter}
//             ></input>
//         );
//     }
// }

export function Input(props: BaseInputProps) {
    const ref = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(props.value);
    const [focused, setFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { onChange } = props;
        if (!onChange) return;
        const target = e.target;
        setValue(target.value);
        onChange(e);
    };

    const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { onPressEnter, onValueChange } = props;
        if (e.key === 'Enter') {
            onPressEnter?.(e);
            ref.current?.blur();
            const v = getValue();
            v && onValueChange?.(v);
        }
    };

    const onFocus = (e: React.FocusEvent<HTMLInputElement, Element>) => {
        const { onFocus } = props;
        onFocus?.(e);
        setFocused(true);
    };

    const onClick = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        const { onClick } = props;
        onClick?.(e);
        e.stopPropagation();
    };

    const onBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
        const { onBlur, onValueChange } = props;
        onBlur?.(e);
        const v = getValue();
        v && onValueChange?.(v);
        setFocused(false);
    };

    const getValue = () => ref.current?.value;

    if (props.value && props.value !== value) {
        setValue(props.value);
    }

    const { id, disabled, type, placeholder, bordered = true, className = '', readonly } = props;

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
            onBlur={(e) => onBlur(e)}
            onFocus={(e) => onFocus(e)}
            className={classes}
            placeholder={placeholder}
            disabled={disabled}
            ref={ref}
            onChange={(e) => handleChange(e)}
            value={value}
            onClick={(e) => onClick(e)}
            readOnly={readonly}
            id={id}
            onKeyUp={(e) => handlePressEnter(e)}
        ></input>
    );
}

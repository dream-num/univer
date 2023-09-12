import { useEffect, useState } from 'react';


import { joinClassNames } from '../../Utils/util';
import { LoadingIcon } from '../Icon';
import styles from './Style/index.module.less';


import { BaseComponent, BaseComponentProps, JSXComponent } from '../../BaseComponent';

// Components interface
const ButtonTypes: string[] = ['default', 'primary'];
export type ButtonType = 'default' | 'primary';
const ButtonShapes: string[] = ['circle', 'round'];
export type ButtonShape = 'circle' | 'round';
const SizeTypes: string[] = ['small', 'middle', 'large'];
export type SizeType = 'small' | 'middle' | 'large';
const ButtonHTMLTypes: string[] = ['submit', 'reset', 'button'];
export type ButtonHTMLType = 'submit' | 'reset' | 'button';

export interface BaseButtonProps extends BaseComponentProps {
    type?: ButtonType;
    shape?: ButtonShape;
    size?: SizeType;
    danger?: boolean;
    disabled?: boolean;
    block?: boolean;
    loading?: boolean;
    active?: boolean;
    htmlType?: ButtonHTMLType;
    onClick?: Function;
    children?: any;
    className?: string;
    style?: React.CSSProperties;
    unActive?: boolean;
}

// component class
export interface ButtonComponent extends BaseComponent<BaseButtonProps> {
    render(): JSXComponent<BaseButtonProps>;
}


// interface IState {
//     isActive: boolean;
// }

// class Button extends Component<BaseButtonProps, IState> {
//     constructor(props: BaseButtonProps) {
//         super();
//         this.state = {
//             isActive: props.active ?? false,
//         };
//     }

//     getSizeCls() {
//         const { size } = this.props;
//         let sizeCls = '';
//         switch (size) {
//             case 'large':
//                 sizeCls = 'lg';
//                 break;
//             case 'small':
//                 sizeCls = 'sm';
//                 break;
//             default:
//                 break;
//         }
//         return sizeCls;
//     }

//     getClass() {
//         const { isActive } = this.state;
//         const { type, shape, danger, block, loading, size, className } = this.props;
//         return joinClassNames(
//             styles.btn,
//             {
//                 [`${styles.btn}-${type}`]: type,
//                 [`${styles.btn}-${shape}`]: shape,
//                 [`${styles.btn}-${this.getSizeCls()}`]: size,
//                 [`${styles.btn}-danger`]: !!danger,
//                 [`${styles.btn}-block`]: block,
//                 [`${styles.btn}-loading`]: loading,
//                 [`${styles.btn}-active`]: isActive,
//             },
//             className
//         );
//     }

//     handleClick = (e: MouseEvent) => {
//         const { disabled, onClick, unActive = true } = this.props;

//         if (disabled) {
//             e.preventDefault();
//             return;
//         }

//         if (unActive) {
//             onClick?.(e);
//             return;
//         }

//         this.setState(
//             {
//                 isActive: !this.state.isActive,
//             },
//             () => {
//                 if (onClick) {
//                     onClick.call(null, e, this.state.isActive);
//                 }
//             }
//         );
//     };

//     override UNSAFE_componentWillReceiveProps(props: BaseButtonProps) {
//         this.setState({
//             isActive: props.active,
//         });
//     }

//     render() {
//         const { htmlType, disabled, style, loading, children } = this.props;
//         return (
//             <button type={htmlType} onClick={this.handleClick} className={this.getClass()} disabled={disabled} style={style}>
//                 {loading ? <LoadingIcon /> : ''}
//                 {children}
//             </button>
//         );
//     }
// }

export function Button(props: BaseButtonProps) {
    const [isActive, setIsActive] = useState(props.active ?? false);

    useEffect(() => {
        setIsActive(props.active ?? false);
    }, [props.active]);

    const getSizeCls = () => {
        const { size } = props;
        let sizeCls = '';
        switch (size) {
            case 'large':
                sizeCls = 'lg';
                break;
            case 'small':
                sizeCls = 'sm';
                break;
            default:
                break;
        }
        return sizeCls;
    };

    const getClass = () => {
        const { type, shape, danger, block, loading, size, className } = props;
        return joinClassNames(
            styles.btn,
            {
                [`${styles.btn}-${type}`]: type,
                [`${styles.btn}-${shape}`]: shape,
                [`${styles.btn}-${getSizeCls()}`]: size,
                [`${styles.btn}-danger`]: !!danger,
                [`${styles.btn}-block`]: block,
                [`${styles.btn}-loading`]: loading,
                [`${styles.btn}-active`]: isActive,
            },
            className
        );
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { disabled, onClick, unActive = true } = props;

        if (disabled) {
            e.preventDefault();
            return;
        }

        if (unActive) {
            onClick?.(e);
            return;
        }

        setIsActive(!isActive);

        if (onClick) {
            onClick.call(e, isActive);
        }
    };

    const { htmlType, disabled, style, loading, children } = props;
    return (
        <button type={htmlType} onClick={handleClick} className={getClass()} disabled={disabled} style={style}>
            {loading ? <LoadingIcon /> : ''}
            {children}
        </button>
    );
}

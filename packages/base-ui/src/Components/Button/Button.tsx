import { Component } from 'react';
import { BaseButtonProps } from '../../BaseComponent';
import { joinClassNames } from '../../Utils';
import { LoadingIcon } from '../Icon';

import styles from './Style/index.module.less';

// const ButtonTypes: string[] = ['default', 'primary'];
// export type ButtonType = typeof ButtonTypes[number];
// const ButtonShapes: string[] = ['circle', 'round'];
// export type ButtonShape = typeof ButtonShapes[number];
// const SizeTypes: string[] = ['small', 'middle', 'large'];
// export type SizeType = typeof SizeTypes[number];
// const ButtonHTMLTypes: string[] = ['submit', 'rest', 'button'];
// export type ButtonHTMLType = typeof ButtonHTMLTypes[number];

// export interface BaseButtonProps extends BaseComponentProps {
//     type?: ButtonType;
//     shape?: ButtonShape;
//     size?: SizeType;
//     danger?: boolean;
//     disabled?: boolean;
//     block?: boolean;
//     loading?: boolean;
//     htmlType?: ButtonHTMLType;
//     onClick?: Function;
//     children?: any;
//     className?: string;
//     style?: JSX.CSSProperties;
//     isActive?: true;
// }

interface IState {
    isActive: boolean;
}

class Button extends Component<BaseButtonProps, IState> {
    constructor(props: BaseButtonProps) {
        super();
        this.state = {
            isActive: props.active ?? false,
        };
    }

    getSizeCls() {
        const { size } = this.props;
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
    }

    getClass() {
        const { isActive } = this.state;
        const { type, shape, danger, block, loading, size, className } = this.props;
        return joinClassNames(
            styles.btn,
            {
                [`${styles.btn}-${type}`]: type,
                [`${styles.btn}-${shape}`]: shape,
                [`${styles.btn}-${this.getSizeCls()}`]: size,
                [`${styles.btn}-danger`]: !!danger,
                [`${styles.btn}-block`]: block,
                [`${styles.btn}-loading`]: loading,
                [`${styles.btn}-active`]: isActive,
            },
            className
        );
    }

    handleClick = (e: MouseEvent) => {
        const { disabled, onClick, unActive = true } = this.props;

        if (disabled) {
            e.preventDefault();
            return;
        }

        if (unActive) {
            onClick?.(e);
            return;
        }

        this.setState(
            {
                isActive: !this.state.isActive,
            },
            () => {
                if (onClick) {
                    onClick.call(null, e, this.state.isActive);
                }
            }
        );
    };

    override UNSAFE_componentWillReceiveProps(props: BaseButtonProps) {
        this.setState({
            isActive: props.active,
        });
    }

    render() {
        const { htmlType, disabled, style, loading, children } = this.props;
        return (
            <button type={htmlType} onClick={this.handleClick} className={this.getClass()} disabled={disabled} style={style}>
                {loading ? <LoadingIcon /> : ''}
                {children}
            </button>
        );
    }
}

export default Button;

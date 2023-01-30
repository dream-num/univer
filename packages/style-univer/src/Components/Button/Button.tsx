import { BaseButtonProps, ButtonComponent, joinClassNames, JSXComponent } from '@univerjs/base-component';
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

const Button = (props: BaseButtonProps) => {
    const { type, shape, size, htmlType = 'button', danger = false, disabled, block = false, loading = false, active = false, onClick, children, className = '', style } = props;

    const handleClick = (e: MouseEvent) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        if (onClick) {
            onClick(e);
        }
    };
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

    const classes = joinClassNames(
        styles.btn,
        {
            [`${styles.btn}-${type}`]: type,
            [`${styles.btn}-${shape}`]: shape,
            [`${styles.btn}-${sizeCls}`]: size,
            [`${styles.btn}-danger`]: !!danger,
            [`${styles.btn}-block`]: block,
            [`${styles.btn}-loading`]: loading,
        },
        className
    );

    let customStyle = style;
    // set active status
    if (active) {
        customStyle = Object.assign((style as object) || {}, { background: '#eee' });
    }

    const buttonNode = (
        <button type={htmlType} onClick={handleClick} className={classes} disabled={disabled} style={{ ...customStyle }}>
            {loading ? <LoadingIcon /> : ''}
            {children}
        </button>
    );

    return buttonNode;
};

export class UniverButton implements ButtonComponent {
    render(): JSXComponent<BaseButtonProps> {
        return Button;
    }
}

export default Button;

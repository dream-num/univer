import { BaseComponentProps } from '../../BaseComponent';
import { joinClassNames } from '../../Utils/util';
import { LoadingIcon } from '../Icon';
import styles from './Style/index.module.less';

// Components interface
export type ButtonType = 'default' | 'primary';
export type ButtonShape = 'circle' | 'round';
export type SizeType = 'small' | 'middle' | 'large';
export type ButtonHTMLType = 'submit' | 'reset' | 'button';

export interface IBaseButtonProps extends BaseComponentProps {
    children?: React.ReactNode;

    /** Semantic DOM class */
    className?: string;

    /** Semantic DOM style */
    style?: React.CSSProperties;

    /**
     * Set button type
     * @default 'default'
     */
    type?: ButtonType;

    /** Can be set button shape */
    shape?: ButtonShape;

    /**
     * Set the size of button
     * @default 'middle'
     */
    size?: SizeType;

    /** Set the original html `type` of button, see: [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type) */
    htmlType?: ButtonHTMLType;

    /**
     * Set the danger status of button
     * @default false
     */
    danger?: boolean;

    /**
     * Disabled state of button
     * @default false
     */
    disabled?: boolean;

    /**
     * Option to fit button width to its parent width
     * @default false
     */
    block?: boolean;

    /**
     * Set the loading status of button
     * @default false
     */
    loading?: boolean;

    /** Set the handler to handle `click` event */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

    /**
     * Set the button is activated
     * @default false
     */
    active?: boolean;
}

const getSizeClass = (size?: SizeType) => {
    switch (size) {
        case 'large':
            return 'lg';
        case 'small':
            return 'sm';
        default:
            return '';
    }
};

/**
 * Button Component
 */
export function Button(props: IBaseButtonProps) {
    const {
        children,
        className,
        style,
        type = 'default',
        shape,
        size,
        htmlType,
        danger = false,
        disabled = false,
        block = false,
        loading = false,
        active = false,
        onClick,
    } = props;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
            e.preventDefault();
            return;
        }

        onClick && onClick(e);
    };

    const _className = joinClassNames(
        styles.btn,
        {
            [`${styles.btn}-${type}`]: type,
            [`${styles.btn}-${shape}`]: shape,
            [`${styles.btn}-${getSizeClass(size)}`]: size,
            [`${styles.btn}-danger`]: !!danger,
            [`${styles.btn}-block`]: block,
            [`${styles.btn}-loading`]: loading,
            [`${styles.btn}-${type}-active`]: active,
        },
        className
    );

    return (
        <button className={_className} style={style} disabled={disabled} type={htmlType} onClick={handleClick}>
            {loading ? <LoadingIcon /> : ''}
            {children}
        </button>
    );
}

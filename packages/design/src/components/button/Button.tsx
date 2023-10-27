import clsx from 'clsx';

import styles from './index.module.less';

export type ButtonType = 'primary' | 'default' | 'text' | 'link';
export type ButtonSize = 'small' | 'middle' | 'large';

export interface IButtonProps {
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

    /**
     * Set the size of button
     * @default 'middle'
     */
    size?: ButtonSize;

    /**
     * Option to fit button width to its parent width
     * @default false
     */
    block?: boolean;

    /** Set the original html `type` of button, see: [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type) */
    htmlType?: 'submit' | 'reset' | 'button';

    /**
     * Disabled state of button
     * @default false
     */
    disabled?: boolean;

    /** Set the handler to handle `click` event */
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function Button(props: IButtonProps) {
    const {
        children,
        className,
        style,
        type = 'default',
        size = 'middle',
        block,
        htmlType,
        disabled = false,
        onClick,

        ...restProps
    } = props;

    const _className = clsx(
        styles.button,
        {
            [styles.buttonPrimary]: type === 'primary',
            [styles.buttonDefault]: type === 'default',
            [styles.buttonText]: type === 'text',
            [styles.buttonLink]: type === 'link',
            [styles.buttonSmall]: size === 'small',
            [styles.buttonMiddle]: size === 'middle',
            [styles.buttonLarge]: size === 'large',
            [styles.buttonBlock]: block,
        },
        className
    );

    return (
        <button
            className={_className}
            style={style}
            type={htmlType}
            onClick={onClick}
            disabled={disabled}
            {...restProps}
        >
            {children}
        </button>
    );
}

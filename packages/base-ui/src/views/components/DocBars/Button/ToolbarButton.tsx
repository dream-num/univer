import { joinClassNames } from '../../../../Utils/util';
import styles from './index.module.less';

export interface IBaseToolbarButtonProps {
    children?: React.ReactNode;

    /** Semantic DOM class */
    className?: string;

    /** Semantic DOM style */
    style?: React.CSSProperties;

    /**
     * Disabled state of button
     * @default false
     */
    disabled?: boolean;

    /** Set the handler to handle `click` event */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

    onDoubleClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

    /**
     * Set the button is activated
     * @default false
     */
    active?: boolean;

    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
}

/**
 * Button Component
 */
export function ToolbarButton(props: IBaseToolbarButtonProps) {
    const {
        children,
        className,
        style,
        disabled = false,
        active = false,
        onClick,
        onDoubleClick,
        ...restProps
    } = props;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
            e.preventDefault();
            return;
        }

        onClick && onClick(e);
    };
    const handleDoubleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        onDoubleClick && onDoubleClick(e);
    };

    const _className = joinClassNames(
        styles.toolbarBtn,
        `${styles.toolbarBtn}-text`,
        {
            [`${styles.toolbarBtn}-text-active`]: active,
        },
        className
    );

    return (
        <button
            className={_className}
            style={style}
            disabled={disabled}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            {...restProps}
        >
            {children}
        </button>
    );
}

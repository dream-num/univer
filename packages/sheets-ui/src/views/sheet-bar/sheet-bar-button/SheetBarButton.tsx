import React from 'react';

import styles from './index.module.less';

export interface IBaseSheetBarButtonProps {
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
}

/**
 * Button Component
 */
export function SheetBarButton(props: IBaseSheetBarButtonProps) {
    const { children, className, style, disabled = false, onClick, ...restProps } = props;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
            e.preventDefault();
            return;
        }

        onClick && onClick(e);
    };

    return (
        <button className={styles.sheetBarBtn} style={style} disabled={disabled} onClick={handleClick} {...restProps}>
            {children}
        </button>
    );
}

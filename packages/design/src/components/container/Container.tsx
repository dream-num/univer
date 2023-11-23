import React, { forwardRef, Ref } from 'react';

export interface IContainerProps {
    children?: React.ReactNode;

    /** Semantic DOM class */
    className?: string;

    /** Semantic DOM style */
    style?: React.CSSProperties;

    /** Set the handler to handle `click` event */
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;

    /** Set the handler to handle `onContextMenu` event */
    onContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

/**
 * Container Component
 */
export const Container = forwardRef((props: IContainerProps, ref: Ref<HTMLDivElement>) => {
    const { children, className, style, onClick, onContextMenu } = props;

    return (
        <section ref={ref} className={className} style={style} onClick={onClick} onContextMenu={onContextMenu}>
            {children}
        </section>
    );
});

import { forwardRef, Ref } from 'react';

import { BaseComponentProps } from '../../BaseComponent';

interface BaseContainerProps extends BaseComponentProps {
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
export const Container = forwardRef((props: BaseContainerProps, ref: Ref<HTMLDivElement>) => {
    const { children, className, style, onClick, onContextMenu } = props;

    return (
        <div ref={ref} style={style} className={className} onClick={onClick} onContextMenu={onContextMenu}>
            {children}
        </div>
    );
});

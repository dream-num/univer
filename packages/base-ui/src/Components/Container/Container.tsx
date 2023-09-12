import { forwardRef, Ref } from 'react';
import { BaseComponentProps } from '../../BaseComponent';

interface BaseContainerProps extends BaseComponentProps {
    children?: React.ReactNode;
    style?: {};
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export const Container = forwardRef((props: BaseContainerProps, ref: Ref<HTMLDivElement>) => {
    const { children, style = {}, className = '', onClick, onContextMenu } = props;

    return (
        <div onContextMenu={onContextMenu} ref={ref} style={style} className={className} onClick={onClick}>
            {children}
        </div>
    );
});

import { forwardRef, PropsWithChildren, Ref } from 'react';

type IContainerProps = {
    style?: {};
    className?: string;
    onClick?: (e: MouseEvent) => void;
    onContextMenu?: (e: MouseEvent) => void;
};

export const Container = forwardRef((props: PropsWithChildren<IContainerProps>, ref: Ref<HTMLDivElement>) => {
    const { children, style, className, onClick, onContextMenu } = props;

    return (
        <div onContextMenu={onContextMenu} ref={ref} style={style} className={className} onClick={onClick}>
            {children}
        </div>
    );
});

import { ComponentChildren, Ref } from 'preact';
import { forwardRef } from 'preact/compat';

type IProps = {
    children?: ComponentChildren;
    style?: {};
    className?: string;
    onClick?: (e: MouseEvent) => void;
    onContextMenu?: (e: MouseEvent) => void;
};

export const Container = forwardRef((props: IProps, ref: Ref<HTMLDivElement>) => {
    const { children, style, className, onClick, onContextMenu } = props;

    return (
        <div onContextMenu={onContextMenu} ref={ref} style={style} className={className} onClick={onClick}>
            {children}
        </div>
    );
});

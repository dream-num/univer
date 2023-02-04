import { ComponentChildren, forwardRef, Ref } from '../../Framework';

type IProps = {
    children?: ComponentChildren;
    style?: {};
    className?: string;
    onClick?: (e: MouseEvent) => void;
};

export const Container = forwardRef((props: IProps, ref: Ref<HTMLDivElement>) => {
    const { children, style, className, onClick } = props;

    return (
        <div ref={ref} style={style} className={className} onClick={onClick}>
            {children}
        </div>
    );
});

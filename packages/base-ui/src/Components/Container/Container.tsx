import { JSXComponent } from '../../BaseComponent';
import { ComponentChildren, forwardRef, Ref } from '../../Framework';
import { ContainerComponent, BaseContainerProps } from '../../Interfaces';

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

export class UniverContainer implements ContainerComponent {
    render(): JSXComponent<BaseContainerProps> {
        return Container;
    }
}

import { BaseComponentRender, BaseComponentSheet } from '../../BaseComponent';
import { Component } from '../../Framework';

interface IProps {
    label: string;
    children: IPropsChildren[];
}

interface IPropsChildren {
    label: string;
}

export class RightMenuButton extends Component<IProps> {
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();
    }

    render() {
        const { label, children } = this.props;
        const Button = this._render.renderFunction('Button');

        return (
            <div>
                {label}
                {children.map((item: IPropsChildren) => (
                    <Button type="primary">{item.label}</Button>
                ))}
            </div>
        );
    }
}

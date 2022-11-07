import { BaseComponentRender, BaseComponentSheet, Component } from '@univer/base-component';

interface IProps {
    prefix: string;
    buttons: string[];
}

export class RightMenuButton extends Component<IProps> {
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();
    }

    render() {
        const { prefix, buttons } = this.props;
        const Button = this._render.renderFunction('Button');

        return (
            <div>
                {prefix}
                {buttons.map((item) => (
                    <Button type="primary">{item}</Button>
                ))}
            </div>
        );
    }
}

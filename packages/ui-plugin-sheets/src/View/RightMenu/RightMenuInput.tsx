import { BaseComponentRender, Component } from "@univerjs/base-ui";


interface IProps {
    prefix: string[];
    suffix: string;
    onKeyUp?: (e: Event) => void;
}

export class RightMenuInput extends Component<IProps> {
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();
    }

    handleClick(e: Event) {
        e.stopPropagation();
    }

    handleKeyUp(e: Event) {
        const { onKeyUp } = this.props;
        onKeyUp?.(e);
    }

    render() {
        const { prefix, suffix } = this.props;
        const Input = this._render.renderFunction('Input');

        return (
            <div>
                {prefix}
                <Input onKeyUp={this.handleKeyUp.bind(this)} type="number" placeholder="1" onClick={this.handleClick}></Input>
                {suffix}
            </div>
        );
    }
}

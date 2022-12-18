import { BaseComponentRender, BaseComponentSheet, Component } from '@univer/base-component';

interface IState {
    color: string;
}

interface IProps {
    color: string;
    label?: string;
}

export class LineColor extends Component<IProps, IState> {
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        this.state = {
            color: 'rgb(217,217,217)',
        };
    }

    componentDidMount() {
        this._context.getObserverManager().getObserver<LineColor>('onLineColorDidMountObservable')?.notifyObservers(this);
    }

    setColor(color: string) {
        this.setState({
            color,
        });
    }

    render() {
        const RightIcon = this._render.renderFunction('RightIcon');
        const { color } = this.state;
        const { label } = this.props;

        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-block', borderBottom: `3px solid ${color}` }}>{label}</span>
                <RightIcon />
            </div>
        );
    }
}

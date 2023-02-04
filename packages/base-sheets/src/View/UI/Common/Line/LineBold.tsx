import { BaseComponentRender, BaseComponentSheet, Component } from '@univerjs/base-ui';

interface IState {
    img: string;
}

interface IProps {
    label: string;
}

export class LineBold extends Component<IProps, IState> {
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        this.state = {
            img: '',
        };
    }

    componentDidMount(): void {
        this._context.getObserverManager().getObserver<LineBold>('onLineBoldDidMountObservable')?.notifyObservers(this);
    }

    setLineType(img: string) {
        this.setState({
            img,
        });
    }

    getImg(img: string) {
        const span = document.querySelector('.base-sheets-line-bold') as HTMLDivElement;
        const props = { width: span.offsetWidth };
        const Img = this._render.renderFunction(img as any);
        return <Img {...(props as any)} />;
    }

    render() {
        const RightIcon = this._render.renderFunction('RightIcon');
        const { img } = this.state;
        const { label } = this.props;
        return (
            <div style={{ paddingBottom: '3px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={'base-sheets-line-bold'} style={{ position: 'relative' }}>
                    {label}
                    <div style={{ width: '100%', height: 0, position: 'absolute', left: 0, bottom: '10px' }}>{img.length ? this.getImg(img) : ''}</div>
                </span>
                <RightIcon />
            </div>
        );
    }
}

import { BaseComponentRender, BaseComponentSheet, Component } from '@univer/base-component';
import { Nullable, Observer, Workbook } from '@univer/core';

interface IState {
    locale: string;
    color: string;
}

interface IProps {
    color: string;
}

export class LineColor extends Component<IProps, IState> {
    private _localeObserver: Nullable<Observer<Workbook>>;

    Render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();

        this.state = {
            locale: '',
            color: this.props.color ?? '#000',
        };
    }

    componentWillMount() {
        this.setLocale();
        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    componentWillUnmount() {
        this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    componentDidMount() {
        this._context.getObserverManager().getObserver<LineColor>('onLineColorDidMountObservable')?.notifyObservers(this);
    }

    setLocale() {
        const locale = this.context.locale;

        this.setState({
            locale: locale.get('borderLine.borderColor'),
        });
    }

    setColor(color: string) {
        this.setState({
            color,
        });
    }

    render() {
        const RightIcon = this.Render.renderFunction('RightIcon');
        const { locale, color } = this.state;

        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-block', borderBottom: `3px solid ${color}` }}>{locale}</span>
                <RightIcon />
            </div>
        );
    }
}

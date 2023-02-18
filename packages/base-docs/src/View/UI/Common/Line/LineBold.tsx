import { Component } from '@univerjs/base-ui';
import { Nullable, Observer, Workbook } from '@univerjs/core';

interface IState {
    locale: string;
    img: string;
}

export class LineBold extends Component<null, IState> {
    private _localeObserver: Nullable<Observer<Workbook>>;

    initialize() {
        this.state = {
            locale: '',
            img: '#000',
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
        // this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    setLocale() {
        const locale = this.context.locale;

        this.setState({
            locale: locale.get('colorPicker'),
        });
    }

    setImg(img: string) {
        this.setState({
            img,
        });
    }

    render() {
        const { locale, img } = this.state;
        return (
            <>
                <span>{locale}</span>
                <img src={img} />
            </>
        );
    }
}

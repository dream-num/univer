import { AppContext, BaseComponentProps, Component, ComponentManager, ZIndexManager } from '@univerjs/base-ui';
import { LocaleService, LocaleType, ObserverManager } from '@univerjs/core';
import { BaseSheetContainerProps, SheetContainer } from './SheetContainer';

export interface BaseUIProps extends BaseComponentProps {
    locale: LocaleType;
    UIConfig: BaseSheetContainerProps;
    componentManager: ComponentManager;
    zIndexManager: ZIndexManager;
    changeLocale: (locale: string) => void;
}

interface IState {
    locale: LocaleType;
}

export class App extends Component<BaseUIProps, IState> {
    constructor(props: BaseUIProps) {
        super(props);
        this.state = {
            locale: this.props.locale,
        };
    }

    setLocale(e: Event) {
        const value = (e.target as HTMLSelectElement).value as LocaleType;
        this.props.changeLocale(value);
        this.setState({
            locale: value,
        });
    }

    render() {
        const { injector, UIConfig, componentManager, zIndexManager } = this.props;
        const { locale } = this.state;
        const localeService = injector.get(LocaleService);
        const observerManager = injector.get(ObserverManager);

        return (
            <AppContext.Provider
                value={{
                    injector,
                    localeService,
                    locale,
                    componentManager,
                    zIndexManager,
                    observerManager,
                }}
            >
                <div
                    style={{
                        position: 'fixed',
                        right: '250px',
                        top: '14px',
                        fontSize: '14px',
                        zIndex: 100,
                    }}
                    className="univer-dev-operation"
                >
                    <span
                        style={{
                            display: 'inline-block',
                            width: 70,
                            margin: '5px 0 0 5px',
                        }}
                    >
                        Language
                    </span>
                    <select value={locale} onChange={this.setLocale.bind(this)} style={{ width: 70 }}>
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                    </select>
                </div>
                <SheetContainer {...UIConfig} />
            </AppContext.Provider>
        );
    }
}

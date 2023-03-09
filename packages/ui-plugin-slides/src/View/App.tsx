import { AppContext, BaseComponentProps, Component } from '@univerjs/base-ui';
import { LocaleType } from '@univerjs/core';
import { BaseSlideContainerProps, SlideContainer } from './SlideContainer';

export interface BaseUIProps extends BaseComponentProps {
    locale: LocaleType;
    UIConfig: BaseSlideContainerProps;
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
        const { context, UIConfig } = this.props;
        const { locale } = this.state;

        return (
            <AppContext.Provider
                value={{
                    context,
                    locale,
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
                <SlideContainer {...UIConfig} />
            </AppContext.Provider>
        );
    }
}

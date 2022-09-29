import { BaseComponentRender, BaseComponentSheet, Component } from '@univer/base-component';
import { Nullable, Observer, WorkBook } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
// import { Button, CheckboxGroup, Input, Tab, TabPane } from '@univer/style-universheet';
import styles from './index.module.less';
import { FindPlugin } from '../FindPlugin';

interface SearchProps {
    config: any;
    activeKey?: string;
}
interface ContentProps extends SearchProps {
    keys?: string;
}
type SearchState = {
    tab: LabelProps[];
};
type ContentState = {
    content: LabelProps[];
    match: LabelProps[];
    buttons: LabelProps[];
};
type LabelProps = {
    name: string;
    label?: string;
    value?: string;
    key?: string;
    onClick?: () => void;
};

export class SearchContent extends Component<SearchProps, SearchState> {
    private _localeObserver: Nullable<Observer<WorkBook>>;

    Render: BaseComponentRender;

    initialize() {
        const component = new SpreadsheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();
        this.state = {
            tab: [
                {
                    name: 'find.find',
                    key: 'find',
                },
                {
                    name: 'find.replace',
                    key: 'replace',
                },
            ],
        };
    }

    setLocale() {
        const locale = this._context.getLocale();
        this.setState((prevState) => {
            let { tab } = prevState;

            tab.forEach((item) => {
                item.label = locale.get(item.name);
            });

            return {
                tab,
            };
        });
    }

    componentWillMount() {
        this.setLocale();

        // subscribe Locale change event
        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<WorkBook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    componentWillUnmount() {
        this._context.getObserverManager().getObserver<WorkBook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    setValue = (value: object, fn?: () => void) => {
        this.setState(
            (prevState) => ({
                ...value,
            }),
            fn
        );
    };

    render(props: SearchProps, state: SearchState) {
        const Tab = this.Render.renderFunction('Tab');
        const TabPane = this.Render.renderFunction('TabPane');
        const { tab } = state;
        const { config, activeKey } = props;
        return (
            <Tab activeKey={activeKey} type="card">
                {tab.map((item, index) => (
                    <TabPane tab={item.label} keys={item.key} key={index}>
                        <Content config={config} keys={item.key}></Content>
                    </TabPane>
                ))}
            </Tab>
        );
    }
}

// tab content
class Content extends Component<ContentProps, ContentState> {
    Render: BaseComponentRender;

    private _localeObserver: Nullable<Observer<WorkBook>>;

    private _searchText: string | RegExp;

    private _matchList: string[] = []; // match condition list

    initialize(props: ContentProps) {
        const component = new SpreadsheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();

        // super(props);
        this._context = props.config.context;
        this.state = {
            content: [
                {
                    name: 'find.findTextbox',
                },
                {
                    name: 'find.replaceTextbox',
                },
            ],
            buttons: [
                {
                    name: 'find.allFindBtn',
                    key: 'find',
                    onClick: () => this.findText(true),
                },
                {
                    name: 'find.findBtn',
                    key: 'find',
                    onClick: () => this.findText(),
                },
                {
                    name: 'find.allReplaceBtn',
                    key: 'replace',
                },
                {
                    name: 'find.replaceBtn',
                    key: 'replace',
                },
            ],
            match: [
                {
                    name: 'find.regexTextbox',
                    value: 'regex',
                },
                {
                    name: 'find.wholeTextbox',
                    value: 'whole',
                },
                {
                    name: 'find.distinguishTextbox',
                    value: 'capslock',
                },
            ],
        };
    }

    private setLocale() {
        const locale = this._context.getLocale();
        this.setState((prevState) => {
            let { content, buttons, match } = prevState;

            content.forEach((item) => {
                item.label = locale.get(item.name);
            });
            buttons.forEach((item) => {
                item.label = locale.get(item.name);
            });
            match.forEach((item) => {
                item.label = locale.get(item.name);
            });

            return {
                content,
                buttons,
                match,
            };
        });
    }

    componentWillMount() {
        this.setLocale();

        // subscribe Locale change event
        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<WorkBook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    componentWillUnmount() {
        this._context.getObserverManager().getObserver<WorkBook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    // get search text
    private changeSearchText = (e: Event) => {
        const target = e.target as HTMLInputElement;
        this._searchText = target.value;
    };

    // get match condition
    private getMatch = (value: string[]) => {
        this._matchList = value;
    };

    private findText = (isFull?: boolean) => {
        // @ts-ignore
        // TODO ...
        // BUG
        let textFinder = this._context.getPluginManager().getPluginByName<FindPlugin>('pluginFind')!.createTextFinder('A1:B10', this._searchText);
        if (this._matchList.includes('capslock')) textFinder = textFinder.matchCase(true);
        if (this._matchList.includes('whole')) textFinder = textFinder.matchEntireCell(true);
        if (isFull) {
            textFinder.findAll();
        } else {
            textFinder.findNext();
        }
    };

    render(props: ContentProps, state: ContentState) {
        const Button = this.Render.renderFunction('Button');
        const CheckboxGroup = this.Render.renderFunction('CheckboxGroup');
        const Input = this.Render.renderFunction('Input');
        const { keys } = props;
        const { content, buttons, match } = state;
        return (
            <div className={styles.tabBox}>
                <div className={styles.inputBox}>
                    <div className={styles.textBox}>
                        <div>
                            <span>{content[0].label}: </span>
                            <Input onChange={(e: Event) => this.changeSearchText(e)} />
                        </div>
                        {keys === 'replace' ? (
                            <div>
                                <span>{content[1].label}: </span>
                                <Input />
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>
                    <div>
                        <CheckboxGroup options={match} onChange={this.getMatch}></CheckboxGroup>
                    </div>
                </div>
                <div className={styles.btnBox}>
                    {buttons.map((item, index) => {
                        if (keys === 'replace') {
                            return (
                                <Button key={index} onClick={item.onClick}>
                                    {item.label}
                                </Button>
                            );
                        }
                        return (
                            <Button key={index} onClick={item.onClick}>
                                {item.label}
                            </Button>
                        );
                    })}
                </div>
            </div>
        );
    }
}

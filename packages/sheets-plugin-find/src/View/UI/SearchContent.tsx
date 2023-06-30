import { Component } from '@univerjs/base-ui';
import { Nullable } from '@univerjs/core';

interface SearchProps {
    config: any;
    activeKey?: string;
    keys?: string;
}

type SearchState = {
    tab: LabelProps[];
    content: LabelProps[];
    match: LabelProps[];
    buttons: LabelProps[];
    changeSearchText: Nullable<(e: Event) => void>;
    getMatch: Nullable<(value: string[]) => void>;
};

type LabelProps = {
    locale?: string;
    label?: string;
    value?: string;
    key?: string;
    onClick?: () => void;
};

export class SearchContent extends Component<SearchProps, SearchState> {
    // Render: BaseComponentRender;

    // initialize() {
    //     const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
    //     this.Render = component.getComponentRender();
    //     this.state = {
    //         tab: [],
    //         content: [],
    //         buttons: [],
    //         match: [],
    //         changeSearchText: null,
    //         getMatch: null,
    //     };
    // }

    // componentDidMount() {
    //     const plugin = this._context.getPluginManager().getPluginByName<FindPlugin>(FIND_PLUGIN_NAME)!;
    //     plugin.getObserver('onSearchContentDidMountObservable')!.notifyObservers(this);
    // }

    // setSearchData(data: any) {
    //     this.setState({
    //         ...data,
    //     });
    // }

    render(props: SearchProps, state: SearchState) {
        // const Tab = this.Render.renderFunction('Tab');
        // const TabPane = this.Render.renderFunction('TabPane');
        // const Button = this.Render.renderFunction('Button');
        // const CheckboxGroup = this.Render.renderFunction('CheckboxGroup');
        // const Input = this.Render.renderFunction('Input');
        // const { tab, content, match, buttons, changeSearchText, getMatch } = state;
        // const { activeKey } = props;

        // if (!changeSearchText || !getMatch) return;

        return (
            <div></div>
            // <Tab activeKey={activeKey} type="card">
            //     {tab.map((item, index) => (
            //         <TabPane tab={item.label} keys={item.key} key={index}>
            //             <div className={styles.tabBox}>
            //                 <div className={styles.inputBox}>
            //                     <div className={styles.textBox}>
            //                         <div>
            //                             <span>{content[0].label}: </span>
            //                             <Input onChange={(e: Event) => changeSearchText(e)} />
            //                         </div>
            //                         {item.key === 'replace' ? (
            //                             <div>
            //                                 <span>{content[1].label}: </span>
            //                                 <Input />
            //                             </div>
            //                         ) : (
            //                             <></>
            //                         )}
            //                     </div>
            //                     <div>
            //                         <CheckboxGroup options={match} onChange={getMatch}></CheckboxGroup>
            //                     </div>
            //                 </div>
            //                 <div className={styles.btnBox}>
            //                     {buttons.map((item, index) => {
            //                         if (item.key === 'replace') {
            //                             return (
            //                                 <Button key={index} onClick={item.onClick}>
            //                                     {item.label}
            //                                 </Button>
            //                             );
            //                         }
            //                         return (
            //                             <Button key={index} onClick={item.onClick}>
            //                                 {item.label}
            //                             </Button>
            //                         );
            //                     })}
            //                 </div>
            //             </div>
            //         </TabPane>
            //     ))}
            // </Tab>
        );
    }
}

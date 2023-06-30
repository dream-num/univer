import { Component } from '@univerjs/base-ui';

import { ComponentChild } from 'preact';
import { IProps } from '../IData/ISort';

// interface config extends IToolbarItemProps {
//     config?: { [index: string]: any };
// }
// Types for state
// interface IState {
//     sort: config;
//     isSortCustom: boolean;
// }

const sort = {};
export class SortButton extends Component<IProps> {
    // Select: FunctionComponent<BaseSelectProps>;
    //
    // OrderASCIcon: FunctionComponent<BaseIconProps>;
    //
    // OrderDESCIcon: FunctionComponent<BaseIconProps>;
    //
    // OrderIcon: FunctionComponent<BaseIconProps>;
    //
    // NextIcon: FunctionComponent<BaseIconProps>;
    //
    // private _localeObserver: Nullable<Observer<Workbook>>;
    //
    // sortCustom = createRef();

    // initialize(props: IProps) {
    //     // super(props);
    //
    //     const component = this.props.config.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
    //     const render = component.getComponentRender();
    //     this.Select = render.renderFunction('Select');
    //     this.OrderASCIcon = render.renderFunction('OrderASCIcon');
    //     this.OrderDESCIcon = render.renderFunction('OrderDESCIcon');
    //     this.OrderIcon = render.renderFunction('OrderIcon');
    //     this.NextIcon = render.renderFunction('NextIcon');
    //
    //     this.state = {
    //         sort: {
    //             locale: 'sort',
    //             type: ISlotElement.SELECT,
    //             label: <this.OrderASCIcon />,
    //             icon: <this.NextIcon />,
    //             show: true,
    //             border: false,
    //             selectType: ISelectButton.DOUBLE,
    //             needChange: true,
    //             children: [
    //                 {
    //                     locale: 'sort.asc',
    //                     icon: <this.OrderASCIcon />,
    //                     selected: true,
    //                 },
    //                 {
    //                     locale: 'sort.desc',
    //                     icon: <this.OrderDESCIcon />,
    //                     selected: false,
    //                 },
    //                 {
    //                     locale: 'sort.custom',
    //                     icon: <this.OrderIcon />,
    //                     selected: false,
    //                     onClick: this.SortCustomShow.bind(this),
    //                 },
    //             ],
    //         },
    //         isSortCustom: false,
    //     };
    // }

    /**
     * init
     */
    // componentWillMount() {
    //     this.setLocale();
    //
    //     // subscribe Locale change event
    //
    //     this._localeObserver = this._context
    //         .getObserverManager()
    //         .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
    //         ?.add(() => {
    //             this.setLocale();
    //         });
    // }

    // remove to SortCustomShow
    // componentDidMount() {
    //     document.addEventListener('click', this.SortCustomHide.bind(this), true);
    // }
    /**
     * destory
     */
    componentWillUnmount() {
        // this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
        // document.removeEventListener('click', this.SortCustomHide.bind(this), true);
    }

    /**
     * set text by config setting and Locale message
     */
    // setLocale() {
    //     const locale = this._context.getLocale();
    //
    //     this.setState((prevState: IState) => {
    //         let item = prevState.sort;
    //         // set current Locale string for tooltip
    //         item.tooltip = locale.get(`${item.locale}Label`);
    //         item.tooltipRight = locale.get(`${item.locale}RightLabel`);
    //
    //         // set current Locale string for select
    //         item.children?.forEach((ele: IToolbarItemProps) => {
    //             if (ele.locale) {
    //                 ele.label = locale.get(`${ele.locale}`);
    //             }
    //         });
    //         item.label = typeof item.label === 'object' ? item.label : item.children![0].label;
    //         item.config = JSON.parse(locale.get(`${item.locale}`));
    //         return {
    //             sort: item,
    //         };
    //     });
    // }

    SortCustomShow() {
        this.setState({
            isSortCustom: true,
        });

        document.addEventListener('click', this.SortCustomHide.bind(this), true);
    }

    SortCustomHide(e: Event) {
        // const div = document.createElement('div');
        // const container = document.querySelector('.univer-modal-mask') || div;
        // const close = document.querySelector('.univer-modal-close') || div;
        //
        // if (this.state.isSortCustom && (container.contains(e.target as Element) || close.contains(e.target as Element))) {
        //     this.setState({
        //         isSortCustom: false,
        //     });
        // }
        //
        // document.removeEventListener('click', this.SortCustomHide.bind(this), true);
    }

    click() {
        console.log(this);

        // this.state.sort.onClick();
    }

    render(): ComponentChild {
        return null;
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    // render(props: IProps, state: IState) {
    //     // eslint-disable-next-line @typescript-eslint/no-shadow
    //     const { sort, isSortCustom } = state;
    //     const { Select } = this;
    //     // Set Provider for entire Container
    //     return (
    //         <>
    //             <Select
    //                 tooltip={sort.tooltip}
    //                 tooltipRight={sort.tooltipRight}
    //                 label={sort.label}
    //                 icon={sort.icon}
    //                 selectType={sort.selectType}
    //                 border={sort.border}
    //                 needChange={sort.needChange}
    //                 onClick={sort.onClick}
    //                 key={sort.locale}
    //                 children={sort.children as BaseSelectProps[]}
    //             />
    //             <SortCustom
    //                 ref={this.sortCustom}
    //                 config={{ context: this.props.config.context, locale: sort.config }}
    //                 visible={isSortCustom}
    //                 onOk={this.SortCustomShow.bind(this)}
    //                 onCancel={this.SortCustomHide.bind(this)}
    //             />
    //         </>
    //     );
    // }
}

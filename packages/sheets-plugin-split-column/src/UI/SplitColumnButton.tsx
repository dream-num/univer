// import { BaseComponentRender, BaseComponentSheet, Component, IToolbarItemProps, ModalProps } from '@univerjs/base-ui';
// import { Nullable, Observer, Workbook } from '@univerjs/core';
// import { SheetPlugin } from '@univerjs/base-sheets';
// import { IProps } from '../IData/ISplitColumn';
// import styles from './index.module.less';
// import { SplitColumnContent } from './SplitColumnContent';

// // Types for state
// interface IState {
//     splitColumn: IToolbarItemProps;
//     modalData: ModalProps[];
//     notice: Notice[];
// }

// type Notice = {
//     locale: string;
//     label?: string;
// };

// export class SplitColumnButton extends Component<IProps, IState> {
//     private _localeObserver: Nullable<Observer<Workbook>>;

//     Render: BaseComponentRender;

//     initialize(props: IProps) {
//         // super(props);
//         const component = new SheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
//         this.Render = component.getComponentRender();
//         const DivideIcon = this.Render.renderFunction('DivideIcon');

//         const splitColumn: IToolbarItemProps = {
//             locale: 'splitColumn.splitColumnLabel',
//             type: 'single',
//             label: <DivideIcon />,
//             show: true,
//         };

//         this.state = {
//             splitColumn,
//             notice: [
//                 {
//                     locale: 'splitColumn.tipNoMulti',
//                 },
//                 {
//                     locale: 'splitColumn.tipNoMultiColumn',
//                 },
//             ],
//             modalData: [
//                 {
//                     locale: 'splitColumn.splitTextTitle',
//                     show: false,
//                     group: [
//                         {
//                             locale: 'button.confirm',
//                             type: 'primary',
//                         },
//                         {
//                             locale: 'button.cancel',
//                         },
//                     ],
//                     children: <SplitColumnContent config={this.props.config} />,
//                     onCancel: () => {
//                         this.showModal(0, false);
//                     },
//                 },
//                 {
//                     show: false,
//                     group: [
//                         {
//                             locale: 'button.close',
//                         },
//                     ],
//                 },
//                 {
//                     show: false,
//                     group: [
//                         {
//                             locale: 'button.close',
//                         },
//                     ],
//                 },
//             ],
//         };
//     }

//     /**
//      * init
//      */
//     componentWillMount() {
//         this.setLocale();

//         // subscribe Locale change event

//         this._localeObserver = this._context
//             .getObserverManager()
//             .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
//             ?.add(() => {
//                 this.setLocale();
//             });
//     }

//     /**
//      * destory
//      */
//     componentWillUnmount() {
//         // this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
//     }

//     /**
//      * set text by config setting and Locale message
//      */
//     setLocale() {
//         const locale = this._context.getLocale();
//         this.setState((prevState: IState) => {
//             let item = prevState.splitColumn;
//             // set current Locale string for tooltip
//             item.tooltip = locale.get(`${item.locale}`);

//             let notice = prevState.notice;
//             notice.forEach((ele) => {
//                 ele.label = locale.get(ele.locale);
//             });

//             let modalData = prevState.modalData;
//             modalData.forEach((ele, index) => {
//                 ele.title = locale.get(ele.locale!);
//                 if (ele.group && ele.group.length) {
//                     ele.group.forEach((node) => {
//                         node.label = locale.get(node.locale!);
//                     });
//                 }
//                 if (index === 1) {
//                     ele.children = <p>{notice[0].label}</p>;
//                 }
//                 if (index === 2) {
//                     ele.children = <p>{notice[1].label}</p>;
//                 }
//             });

//             return {
//                 splitColumn: item,
//                 modalData,
//                 notice,
//             };
//         });
//     }

//     showModal = (index: number, isShow: boolean) => {
//         let { modalData } = this.state;
//         modalData[index].show = isShow;
//         this.setState((prevState) => ({
//             modalData,
//         }));
//     };

//     /**
//      * Render the component's HTML
//      *
//      * @returns {void}
//      */
//     render(props: IProps, state: IState) {
//         const Button = this.Render.renderFunction('Button');
//         const Modal = this.Render.renderFunction('Modal');
//         const { splitColumn, modalData } = state;
//         // Set Provider for entire Container
//         return (
//             <div className={styles.singleButton}>
//                 <Button type="text" onClick={() => this.showModal(0, true)}>
//                     {splitColumn.label}
//                 </Button>
//                 {modalData.map((item) => {
//                     if (!item.show) return;
//                     return <Modal visible={item.show} onCancel={item.onCancel} title={item.title} group={item.group} children={item.children}></Modal>;
//                 })}
//             </div>
//         );
//     }
// }

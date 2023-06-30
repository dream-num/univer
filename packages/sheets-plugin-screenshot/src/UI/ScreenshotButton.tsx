// import { BaseComponentRender, BaseComponentSheet, Component, createRef, IToolbarItemProps, ModalProps } from '@univerjs/base-ui';
// import { Nullable, Observer, Workbook } from '@univerjs/core';
// import { IProps } from '../IData/IScreenshot';
// import styles from './index.module.less';

// // Types for state
// interface IState {
//     screenshot: IToolbarItemProps;
//     modalData: ModalProps[];
// }
// // const screenshot: IToolbarItemProps = {
// //     name: 'screenshot.screenshotLabel',
// //     type: 'single',
// //     icon: <Icon.View.ScreenshotIcon />,
// //     show: true,
// // };

// export class ScreenshotButton extends Component<IProps, IState> {
//     private _localeObserver: Nullable<Observer<Workbook>>;

//     ref = createRef();

//     Render: BaseComponentRender;

//     initialize(props: IProps) {
//         // super(props);

//         const component = this.props.config.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
//         this.Render = component.getComponentRender();

//         const ScreenshotIcon = this.Render.renderFunction('ScreenshotIcon');

//         this.state = {
//             screenshot: {
//                 locale: 'screenshot.screenshotLabel',
//                 type: 'single',
//                 icon: <ScreenshotIcon />,
//                 show: true,
//             },
//             modalData: [
//                 {
//                     locale: 'screenshot.screenshotTipSuccess',
//                     show: false,
//                     group: [
//                         {
//                             locale: 'screenshot.downLoadBtn',
//                             type: 'primary',
//                         },
//                         {
//                             locale: 'screenshot.downLoadCopy',
//                             type: 'primary',
//                         },
//                         {
//                             locale: 'screenshot.downLoadClose',
//                         },
//                     ],
//                     onCancel: () => this.showModal(0, false),
//                 },
//                 {
//                     locale: 'screenshot.screenshotTipTitle',
//                     show: false,
//                     children: 'screenshot.screenshotTipHasMulti',
//                     group: [
//                         {
//                             locale: 'screenshot.downLoadClose',
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
//             let item = prevState.screenshot;
//             // set current Locale string for tooltip
//             item.tooltip = locale.get(`${item.locale}`);

//             let modal = prevState.modalData;
//             if (modal.length) {
//                 modal.forEach((ele) => {
//                     ele.title = locale.get(ele.locale!);
//                     if (ele.group && ele.group.length) {
//                         ele.group.forEach((node) => {
//                             node.label = locale.get(node.locale!);
//                         });
//                     }
//                 });
//             }

//             return {
//                 screenshot: item,
//                 modalData: modal,
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
//         const { screenshot, modalData } = state;
//         // Set Provider for entire Container
//         return (
//             <div className={styles.singleButton}>
//                 <Button type="text" onClick={() => this.showModal(0, true)}>
//                     {screenshot.icon}
//                 </Button>
//                 {modalData.map((item) => {
//                     if (!item.show) return;
//                     return <Modal visible={item.show} title={item.title} group={item.group} onCancel={item.onCancel}></Modal>;
//                 })}
//             </div>
//         );
//     }
// }

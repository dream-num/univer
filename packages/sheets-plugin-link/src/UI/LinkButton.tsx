// import { BaseComponentRender, BaseComponentSheet, Component, IToolbarItemProps, ModalProps } from '@univerjs/base-ui';
// import { Nullable, Observer, Workbook } from '@univerjs/core';
// import { Icon } from '@univerjs/style-univer';
// import { IProps } from '../IData/ILink';
// import styles from './index.module.less';
// import { LinkContent } from './LinkContent';

// // Types for state
// interface IState {
//     insertLink: IToolbarItemProps;
//     modalData: ModalProps[];
// }

// const insertLink: IToolbarItemProps = {
//     locale: 'toolbar.insertLink',
//     type: 'single',
//     label: <Icon.Insert.LinkIcon />,
//     show: true,
// };

// export class LinkButton extends Component<IProps, IState> {
//     private _localeObserver: Nullable<Observer<Workbook>>;

//     Render: BaseComponentRender;

//     initialize(props: IProps) {
//         // super(props);
//         const component = this.props.config.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
//         this.Render = component.getComponentRender();

//         this.state = {
//             insertLink,
//             modalData: [
//                 {
//                     locale: 'insertLink.insertLinkLabel',
//                     group: [
//                         {
//                             locale: 'button.confirm',
//                             type: 'primary',
//                         },
//                         {
//                             locale: 'button.cancel',
//                         },
//                     ],
//                     show: false,
//                     children: <LinkContent config={this.props} />,
//                     onCancel: () => this.showModal(0, false),
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
//             let item = prevState.insertLink;
//             // set current Locale string for tooltip
//             item.tooltip = locale.get(`${item.locale}`);

//             let modalData = prevState.modalData;
//             modalData.forEach((ele) => {
//                 ele.title = locale.get(ele.locale!);
//                 if (ele.group && ele.group.length) {
//                     ele.group.forEach((node) => {
//                         node.label = locale.get(node.locale!);
//                     });
//                 }
//             });

//             return {
//                 insertLink: item,
//                 modalData,
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

//         // eslint-disable-next-line @typescript-eslint/no-shadow
//         const { insertLink, modalData } = state;
//         // Set Provider for entire Container
//         return (
//             <div className={styles.singleButton}>
//                 <Button type="text" onClick={() => this.showModal(0, true)}>
//                     {insertLink.label}
//                 </Button>
//                 {modalData.map((item) => {
//                     if (!item.show) return;
//                     return <Modal title={item.title} visible={item.show} group={item.group} children={item.children} onCancel={item.onCancel}></Modal>;
//                 })}
//             </div>
//         );
//     }
// }

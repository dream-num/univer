// import { BaseComponentSheet, Component, IToolbarItemProps, ModalProps } from '@univerjs/base-ui';
// import { Nullable, Observer, Workbook } from '@univerjs/core';
// import { SheetPlugin } from '@univerjs/base-sheets';
// import { IProps } from '../IData/IDataValidation';
// import { DataValidationContent } from './DataValidationContent';
// import styles from './index.module.less';

// // Types for state
// interface IState {
//     dataValidation: IToolbarItemProps;
//     modalData: ModalProps[];
//     tip: LabelProps[];
// }

// type LabelProps = {
//     locale?: string;
//     label?: string;
// };

// export class DataValidationButton extends Component<IProps, IState> {
//     private _localeObserver: Nullable<Observer<Workbook>>;

//     initialize(props: IProps) {
//         // super(props);
//         const component = new SheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
//         this.Render = component.getComponentRender();

//         const CheckIcon = this.Render.renderFunction('CheckIcon');

//         const dataValidationState: IToolbarItemProps = {
//             locale: 'dataValidation',
//             type: 'single',
//             label: <CheckIcon />,
//             show: true,
//         };

//         this.state = {
//             dataValidation: dataValidationState,
//             tip: [
//                 {
//                     locale: 'dataValidation.tooltipInfo1',
//                 },
//             ],
//             modalData: [
//                 {
//                     locale: 'dataValidation.dataValidationLabel',
//                     show: false,
//                     group: [
//                         {
//                             locale: 'button.confirm',
//                             type: 'primary',
//                         },
//                         {
//                             locale: 'dataValidation.deleteValidation',
//                         },
//                         {
//                             locale: 'button.cancel',
//                         },
//                     ],
//                     children: <DataValidationContent config={props.config} />,
//                     onCancel: () => {
//                         this.showModal(0, false);
//                     },
//                 },
//                 {
//                     show: false,
//                     // children: <p>{this.state.tip[0].label}</p>,
//                     group: [
//                         {
//                             locale: 'button.close',
//                         },
//                     ],
//                     onCancel: () => {
//                         this.showModal(1, false);
//                     },
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
//             let item = prevState.dataValidation;
//             // set current Locale string for tooltip
//             item.tooltip = locale.get(`${item.locale}`);

//             let { modalData, tip } = prevState;
//             modalData.forEach((ele) => {
//                 ele.title = ele.locale ? locale.get(ele.locale) : '';
//                 if (ele.group && ele.group.length) {
//                     ele.group.forEach((node) => {
//                         node.label = locale.get(node.locale!);
//                     });
//                 }
//             });

//             // tip.forEach((ele) => {
//             //     ele.label = Locale.get(ele.locale!);
//             // });
//             return {
//                 dataValidation: item,
//                 modalData,
//                 // tip,
//             };
//         });
//     }

//     showModal = (index: number, isShow: boolean) => {
//         this.setState((prevState) => {
//             let { modalData } = prevState;

//             modalData[index].show = isShow;
//             return {
//                 modalData,
//             };
//         });
//     };

//     /**
//      * Render the component's HTML
//      *
//      * @returns {void}
//      */
//     render(props: IProps, state: IState) {
//         const Button = this.Render.renderFunction('Button');
//         const Modal = this.Render.renderFunction('Modal');
//         const { dataValidation, modalData } = state;
//         // Set Provider for entire Container
//         return (
//             <div className={styles.singleButton}>
//                 <Button type="text" onClick={() => this.showModal(0, true)}>
//                     {dataValidation.label}
//                 </Button>
//                 {modalData.map((item, index) => {
//                     if (!item.show) return;
//                     return <Modal title={item.title} visible={item.show} group={item.group} children={item.children} onCancel={item.onCancel}></Modal>;
//                 })}
//             </div>
//         );
//     }
// }

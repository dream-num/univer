// import { BaseComponentRender, BaseComponentSheet, BaseSelectProps, Component, ModalProps } from '@univerjs/base-ui';
// import { Nullable, Observer, Workbook } from '@univerjs/core';
// import { SheetPlugin } from '@univerjs/base-sheets';

// import { IProps } from '../IData/IConditionalFormat';
// import { ConditionContent } from './ConditionContent';
// import { IconContent } from './IconContent';
// import { ImageList } from './ImageList';
// import { RuleContent } from './RuleContent';
// import { RuleManage } from './RuleManage';

// // Types for state
// interface IState {
//     conditionalFormat: ConditionButtonProps;
//     modalData: ModalProps[];
// }

// type ConditionButtonProps = {
//     locale?: string;
//     iconName?: string;
//     label?: string | JSX.Element;
//     value?: string;
//     icon?: JSX.Element | string | null | undefined;
//     type?: string;
//     tooltip?: string;
//     border?: boolean;
//     show?: boolean;
//     children?: ConditionButtonProps[];
//     className?: string;
//     onClick?: (...arg: any[]) => void;
//     style?: JSX.CSSProperties;
//     genre?: string;
// };

// export class ConditionalFormatButton extends Component<IProps, IState> {
//     private _localeObserver: Nullable<Observer<Workbook>>;

//     Render: BaseComponentRender;

//     initialize(props: IProps) {
//         const component = new SheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
//         this.Render = component.getComponentRender();
//         const ConditionalFormatIcon = this.Render.renderFunction('ConditionalFormatIcon');
//         const NextIcon = this.Render.renderFunction('NextIcon');
//         const RightIcon = this.Render.renderFunction('RightIcon');

//         // super(props);

//         this.state = {
//             conditionalFormat: {
//                 locale: 'conditionalformat.conditionalFormatLabel',
//                 type: 'select',
//                 label: <ConditionalFormatIcon />,
//                 icon: <NextIcon />,
//                 show: true,
//                 children: [
//                     {
//                         locale: 'conditionalformat.highlightCellRules',
//                         icon: <RightIcon />,
//                         onClick: this.showContentModal,
//                         children: [
//                             {
//                                 locale: 'conditionalformat.greaterThan.text',
//                                 iconName: 'conditionalformat.greaterThan.example',
//                                 type: 'text',
//                                 genre: 'greater',
//                             },
//                             {
//                                 locale: 'conditionalformat.lessThan.text',
//                                 iconName: 'conditionalformat.lessThan.example',
//                                 type: 'text',
//                                 genre: 'less',
//                             },
//                             {
//                                 locale: 'conditionalformat.between.text',
//                                 iconName: 'conditionalformat.between.example',
//                                 type: 'between',
//                                 genre: 'between',
//                             },
//                             {
//                                 locale: 'conditionalformat.equal.text',
//                                 iconName: 'conditionalformat.equal.example',
//                                 type: 'text',
//                                 genre: 'equal',
//                             },
//                             {
//                                 locale: 'conditionalformat.textContains.text',
//                                 iconName: 'conditionalformat.textContains.example',
//                                 type: 'text',
//                                 genre: 'text',
//                             },
//                             {
//                                 locale: 'conditionalformat.occurrence.text',
//                                 iconName: 'conditionalformat.occurrence.example',
//                                 type: 'date',
//                                 genre: 'date',
//                             },
//                             {
//                                 locale: 'conditionalformat.duplicateValue.text',
//                                 iconName: 'conditionalformat.duplicateValue.example',
//                                 type: 'select',
//                                 genre: 'duplicate',
//                             },
//                         ],
//                     },
//                     {
//                         locale: 'conditionalformat.itemSelectionRules',
//                         icon: <RightIcon />,
//                         onClick: this.showContentModal,
//                         children: [
//                             {
//                                 locale: 'conditionalformat.top10.text',
//                                 iconName: 'conditionalformat.top10.example',
//                                 type: 'input',
//                                 genre: 'top10',
//                             },
//                             {
//                                 locale: 'conditionalformat.top10_percent.text',
//                                 iconName: 'conditionalformat.top10_percent.example',
//                                 type: 'input',
//                                 genre: 'top10_percent',
//                             },
//                             {
//                                 locale: 'conditionalformat.last10.text',
//                                 iconName: 'conditionalformat.last10.example',
//                                 type: 'input',
//                                 genre: 'last10',
//                             },
//                             {
//                                 locale: 'conditionalformat.last10_percent.text',
//                                 iconName: 'conditionalformat.last10_percent.example',
//                                 type: 'input',
//                                 genre: 'last10_percent',
//                             },
//                             {
//                                 locale: 'conditionalformat.aboveAverage.text',
//                                 iconName: 'conditionalformat.aboveAverage.example',
//                                 type: 'none',
//                                 genre: 'above',
//                             },
//                             {
//                                 locale: 'conditionalformat.belowAverage.text',
//                                 iconName: 'conditionalformat.belowAverage.example',
//                                 type: 'none',
//                                 genre: 'below',
//                             },
//                         ],
//                     },
//                     {
//                         locale: 'conditionalformat.dataBar',
//                         icon: <RightIcon />,
//                         children: [
//                             {
//                                 label: <ImageList config={this.props.config} type="data"></ImageList>,
//                                 className: 'univer-image-li',
//                             },
//                         ],
//                     },
//                     {
//                         locale: 'conditionalformat.colorGradation',
//                         icon: <RightIcon />,
//                         children: [
//                             {
//                                 label: <ImageList config={this.props.config} type="color"></ImageList>,
//                                 className: 'univer-image-li',
//                             },
//                         ],
//                     },
//                     {
//                         locale: 'conditionalformat.icons',
//                         onClick: this.showIconModal,
//                     },
//                     {
//                         locale: 'conditionalformat.newRule',
//                         onClick: this.showRuleModal,
//                         border: true,
//                     },
//                     {
//                         locale: 'conditionalformat.deleteRule',
//                         icon: <RightIcon />,
//                         children: [
//                             {
//                                 locale: 'conditionalformat.deleteSheetRule',
//                             },
//                         ],
//                     },
//                     {
//                         locale: 'conditionalformat.manageRules',
//                         onClick: this.showManageModal,
//                     },
//                 ],
//             },
//             modalData: [
//                 {
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
//                     children: <ConditionContent config={this.props.config} type="text" genre="greater" />,
//                     onCancel: () => {
//                         this.showModal(0, false);
//                     },
//                 },
//                 {
//                     locale: 'conditionalformat.icons',
//                     show: false,
//                     group: [
//                         {
//                             locale: 'button.cancel',
//                         },
//                     ],
//                     children: <IconContent config={this.props.config} />,
//                     onCancel: () => {
//                         this.showModal(1, false);
//                     },
//                 },
//                 {
//                     locale: 'conditionalformat.newFormatRule',
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
//                     children: <RuleContent config={this.props.config} />,
//                     onCancel: () => {
//                         this.showModal(2, false);
//                     },
//                 },
//                 {
//                     locale: 'conditionalformat.conditionalformatManageRules',
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
//                     children: <RuleManage config={this.props.config} />,
//                     onCancel: () => {
//                         this.showModal(3, false);
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
//             let item = prevState.conditionalFormat;
//             // set current Locale string for tooltip
//             item.tooltip = locale.get(`${item.locale}`);

//             // set current Locale string for select
//             item.children?.forEach((ele: any) => {
//                 if (ele.locale) {
//                     ele.label = locale.get(`${ele.locale}`);
//                 }
//                 if (ele.children) {
//                     ele.children.forEach((node: any) => {
//                         if (node.locale) {
//                             node.label = locale.get(node.locale);
//                         }
//                         if (node.iconName) {
//                             node.icon = locale.get(node.iconName);
//                         }
//                     });
//                 }
//             });
//             item.label = typeof item.label === 'object' ? item.label : item.children![0].label;
//             // set current Locale for modal
//             let { modalData } = prevState;
//             modalData.forEach((ele) => {
//                 ele.title = ele.locale ? locale.get(ele.locale) : '';
//                 if (ele.group && ele.group.length) {
//                     ele.group.forEach((node) => {
//                         node.label = locale.get(node.locale!);
//                     });
//                 }
//             });

//             return {
//                 conditionalFormat: item,
//                 modalData,
//             };
//         });
//     }

//     // showmodal
//     showModal = (index: number, isShow: boolean) => {
//         this.setState((prevState) => {
//             let { modalData } = prevState;

//             modalData[index].show = isShow;
//             return {
//                 modalData,
//             };
//         });
//     };

//     // show different type of modal
//     showContentModal = (...a: any[]) => {
//         const item = a[2].item;
//         this.setState((prevState) => {
//             let { modalData } = prevState;
//             modalData[0].children = <ConditionContent config={this.props.config} type={item.type} genre={item.genre} />;
//             modalData[0].show = true;

//             return {
//                 modalData,
//             };
//         });
//     };

//     showRuleModal = () => {
//         this.showModal(2, true);
//     };

//     showManageModal = () => {
//         this.showModal(3, true);
//     };

//     showIconModal = () => {
//         this.showModal(1, true);
//     };

//     /**
//      * Render the component's HTML
//      *
//      * @returns {void}
//      */
//     render(props: IProps, state: IState) {
//         const Select = this.Render.renderFunction('Select');
//         const Modal = this.Render.renderFunction('Modal');
//         const { conditionalFormat, modalData } = state;
//         // Set Provider for entire Container
//         return (
//             <>
//                 <Select
//                     tooltip={conditionalFormat.tooltip}
//                     key={conditionalFormat.locale}
//                     children={conditionalFormat.children as BaseSelectProps[]}
//                     label={conditionalFormat.label}
//                     icon={conditionalFormat.icon}
//                 />
//                 {modalData.map((item) => {
//                     if (!item.show) return;
//                     return (
//                         <Modal title={item.title} visible={item.show} group={item.group} onCancel={item.onCancel}>
//                             {item.children}
//                         </Modal>
//                     );
//                 })}
//             </>
//         );
//     }
// }

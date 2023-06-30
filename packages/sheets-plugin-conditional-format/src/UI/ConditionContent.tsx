// import { BaseComponentRender, BaseComponentSheet, Component } from '@univerjs/base-ui';
// import { IKeyValue, Nullable, Observer, Workbook } from '@univerjs/core';
// import { SheetPlugin } from '@univerjs/base-sheets';

// import styles from './index.module.less';

// type ConditionContentProps = {
//     config?: any;
//     type: string;
//     genre: string;
// };

// // TODO: remove IKeyValue
// type ConditionContentState = {
//     condition: ConditionProps;
//     setting: Record<string, LabelProps>;
//     duplicateOption: LabelProps[];
// } & IKeyValue;

// type LabelProps = {
//     locale?: string;
//     label?: string;
//     value?: string;
// };
// type ConditionProps = {
//     title: string;
//     subtitle: string;
//     to?: string;
//     prefix?: string;
//     suffix?: string;
// };

// export class ConditionContent extends Component<ConditionContentProps, ConditionContentState> {
//     private _localeObserver: Nullable<Observer<Workbook>>;

//     Render: BaseComponentRender;

//     initialize() {
//         const component = new SheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
//         this.Render = component.getComponentRender();

//         this.state = {
//             greater: {
//                 title: {
//                     locale: 'conditionalformat.conditionalformat_greaterThan',
//                 },
//                 subtitle: {
//                     locale: 'conditionalformat.conditionalformat_greaterThan_title',
//                 },
//             },
//             less: {
//                 title: {
//                     locale: 'conditionalformat.conditionalformat_lessThan',
//                 },
//                 subtitle: {
//                     locale: 'conditionalformat.conditionalformat_lessThan_title',
//                 },
//             },
//             between: {
//                 title: {
//                     locale: 'conditionalformat.conditionalformat_betweenness',
//                 },
//                 subtitle: {
//                     locale: 'conditionalformat.conditionalformat_betweenness_title',
//                 },
//                 to: {
//                     locale: 'conditionalformat.to',
//                 },
//             },
//             equal: {
//                 title: {
//                     locale: 'conditionalformat.conditionalformat_equal',
//                 },
//                 subtitle: {
//                     locale: 'conditionalformat.conditionalformat_equal_title',
//                 },
//             },
//             text: {
//                 title: {
//                     locale: 'conditionalformat.conditionalformat_textContains',
//                 },
//                 subtitle: {
//                     locale: 'conditionalformat.conditionalformat_textContains_title',
//                 },
//             },
//             date: {
//                 title: {
//                     locale: 'conditionalformat.conditionalformat_occurrenceDate',
//                 },
//                 subtitle: {
//                     locale: 'conditionalformat.conditionalformat_occurrenceDate_title',
//                 },
//             },
//             duplicate: {
//                 title: {
//                     locale: 'conditionalformat.conditionalformat_duplicateValue',
//                 },
//                 subtitle: {
//                     locale: 'conditionalformat.conditionalformat_duplicateValue_title',
//                 },
//             },
//             top10: {
//                 title: {
//                     locale: 'conditionalformat.conditionalformat_top10',
//                 },
//                 subtitle: {
//                     locale: 'conditionalformat.conditionalformat_top10_title',
//                 },
//                 prefix: {
//                     locale: 'conditionalformat.top',
//                 },
//                 suffix: {
//                     locale: 'conditionalformat.oneself',
//                 },
//             },
//             top10_percent: {
//                 title: {
//                     locale: 'conditionalformat.conditionalformat_top10_percent',
//                 },
//                 subtitle: {
//                     locale: 'conditionalformat.conditionalformat_top10_title',
//                 },
//                 prefix: {
//                     locale: 'conditionalformat.top',
//                 },
//             },
//             last10: {
//                 title: {
//                     locale: 'conditionalformat.conditionalformat_last10',
//                 },
//                 subtitle: {
//                     locale: 'conditionalformat.conditionalformat_last10_title',
//                 },
//                 prefix: {
//                     locale: 'conditionalformat.last',
//                 },
//                 suffix: {
//                     locale: 'conditionalformat.oneself',
//                 },
//             },
//             last10_percent: {
//                 title: {
//                     locale: 'conditionalformat.conditionalformat_last10_percent',
//                 },
//                 subtitle: {
//                     locale: 'conditionalformat.conditionalformat_last10_title',
//                 },
//                 prefix: {
//                     locale: 'conditionalformat.last',
//                 },
//             },
//             above: {
//                 title: {
//                     locale: 'conditionalformat.conditionalformat_AboveAverage',
//                 },
//                 subtitle: {
//                     locale: 'conditionalformat.conditionalformat_AboveAverage_title',
//                 },
//             },
//             below: {
//                 title: {
//                     locale: 'conditionalformat.conditionalformat_SubAverage',
//                 },
//                 subtitle: {
//                     locale: 'conditionalformat.conditionalformat_SubAverage_title',
//                 },
//             },
//             setting: {
//                 setAs: {
//                     locale: 'conditionalformat.setAs',
//                     label: '',
//                 },
//                 setAreaAs: {
//                     locale: 'conditionalformat.setAsByArea',
//                     label: '',
//                 },
//                 textColor: { locale: 'conditionalformat.textColor' },
//                 cellColor: { locale: 'conditionalformat.cellColor' },
//             },
//             condition: {
//                 title: '',
//                 subtitle: '',
//                 to: '',
//                 prefix: '',
//                 suffix: '',
//             },
//             duplicateOption: [
//                 {
//                     locale: 'conditionalformat.duplicateValue.text',
//                     value: '',
//                     label: '',
//                 },
//                 {
//                     locale: 'conditionalformat.uniqueValue',
//                     value: '',
//                     label: '',
//                 },
//             ],
//         };
//     }

//     setLocale() {
//         // setLocale for diffrent type of modal
//         const locale = this._context.getLocale();
//         const genre = this.props.genre;

//         function getLabel(obj: object) {
//             Object.keys(obj).forEach((item) => {
//                 obj[item].label = locale.get(obj[item].locale);
//             });
//         }

//         this.setState((prevState) => {
//             let { setting, condition, duplicateOption } = prevState;
//             // set for condition
//             let obj = prevState[genre];
//             getLabel(obj);
//             getLabel(setting);
//             condition.title = obj.title.label;
//             condition.subtitle = obj.subtitle.label;
//             if (obj.to) condition.to = obj.to.label;
//             if (obj.prefix) condition.prefix = obj.prefix.label;
//             if (obj.suffix) condition.suffix = obj.suffix.label;

//             // set for duplicateOption
//             duplicateOption.forEach((item) => {
//                 if (item) {
//                     item.label = locale.get(item.locale || '');
//                 }
//             });

//             return {
//                 // render modal's Locale
//                 condition,
//                 duplicateOption,
//             };
//         });
//     }

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

//     componentWillUnmount() {
//         // this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
//     }

//     setValue = (value: object, fn?: () => void) => {
//         this.setState(
//             (prevState) => ({
//                 ...value,
//             }),
//             fn
//         );
//     };

//     pickTextColor = () => {};

//     pickCellColor = () => {};

//     cancelColor = () => {};

//     // render different type of modal's rangepicker
//     getCellRange = () => {
//         const CellRangeModal = this.Render.renderFunction('CellRangeModal');
//         const { type } = this.props;
//         const { condition, duplicateOption, setting } = this.state;
//         if (type === 'text') {
//             return (
//                 <>
//                     <CellRangeModal></CellRangeModal>
//                     <p className={styles.setAs}>{setting.setAs.label}</p>
//                 </>
//             );
//         }
//         if (type === 'between') {
//             return (
//                 <>
//                     <div className={styles.conditionBetween}>
//                         <CellRangeModal></CellRangeModal>
//                         <span>{condition.to}</span>
//                         <CellRangeModal></CellRangeModal>
//                     </div>
//                     <p className={styles.setAs}>{setting.setAs.label}</p>
//                 </>
//             );
//         }
//         if (type === 'select') {
//             return (
//                 <>
//                     <select>
//                         {duplicateOption.map((item) => (
//                             <option value={item.value}>{item.label}</option>
//                         ))}
//                     </select>
//                     <p className={styles.setAs}>{setting.setAs.label}</p>
//                 </>
//             );
//         }
//         if (type === 'input') {
//             const Input = this.Render.renderFunction('Input');
//             return (
//                 <>
//                     <div className={styles.conditionInput}>
//                         <span>{condition.prefix}</span>
//                         <Input placeholder="10" />
//                         <span>{condition.suffix ? condition.suffix : '%'}</span>
//                     </div>
//                     <p className={styles.setAs}>{setting.setAs.label}</p>
//                 </>
//             );
//         }
//         if (type === 'none') {
//             return <p>{setting.setAreaAs.label}:</p>;
//         }
//     };

//     render(props: ConditionContentProps, state: ConditionContentState) {
//         const Checkbox = this.Render.renderFunction('Checkbox');
//         const ColorPicker = this.Render.renderFunction('ColorPicker');
//         const { condition, setting } = state;
//         return (
//             <div className={styles.conditionContent}>
//                 <p className={styles.conditionTitle}>{condition.title}</p>
//                 <div className={styles.conditionSubtitle}>
//                     <p className={styles.setBold}>{condition.subtitle}:</p>
//                     {this.getCellRange()}
//                 </div>
//                 <div className={styles.colorBox}>
//                     <div className={styles.colorItem}>
//                         <Checkbox>{setting.textColor.label}</Checkbox>
//                         <ColorPicker color="#9c0006" onClick={this.pickTextColor} onCancel={this.cancelColor}></ColorPicker>
//                     </div>
//                     <div className={styles.colorItem}>
//                         <Checkbox>{setting.cellColor.label}</Checkbox>
//                         <ColorPicker color="#ffc7ce" onClick={this.pickCellColor} onCancel={this.cancelColor}></ColorPicker>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }

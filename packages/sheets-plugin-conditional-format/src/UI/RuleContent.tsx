// import { BaseComponentRender, BaseComponentSheet, Component, joinClassNames } from '@univerjs/base-ui';
// import { Nullable, Observer, Workbook } from '@univerjs/core';
// import { SheetPlugin } from '@univerjs/base-sheets';
// import styles from './index.module.less';

// type RuleContentProps = {
//     config?: any;
// };
// type RuleContentState = {
//     ruleOption: LabelProps[];
//     title: Record<string, LabelProps>;
//     type: string;
// };
// type LabelProps = {
//     name?: string;
//     label?: string;
//     value?: string;
//     active?: boolean;
//     type?: string;
// };

// export class RuleContent extends Component<RuleContentProps, RuleContentState> {
//     private _localeObserver: Nullable<Observer<Workbook>>;

//     Render: BaseComponentRender;

//     initialize() {
//         const component = new SheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
//         this.Render = component.getComponentRender();

//         this.state = {
//             title: {
//                 chooseTitle: {
//                     name: 'conditionalformat.chooseRuleType',
//                 },
//                 editTitle: {
//                     name: 'conditionalformat.editRuleDescription',
//                 },
//             },
//             ruleOption: [
//                 {
//                     name: 'conditionalformat.ruleTypeItem1',
//                     type: 'all',
//                     active: true,
//                 },
//                 {
//                     name: 'conditionalformat.ruleTypeItem2',
//                     type: 'contain',
//                 },
//                 {
//                     name: 'conditionalformat.ruleTypeItem3',
//                     type: 'rank',
//                 },
//                 {
//                     name: 'conditionalformat.ruleTypeItem4',
//                     type: 'average',
//                 },
//                 {
//                     name: 'conditionalformat.ruleTypeItem5',
//                     type: 'duplicate',
//                 },
//                 {
//                     name: 'conditionalformat.ruleTypeItem6',
//                     type: 'formula',
//                 },
//             ],
//             type: 'all',
//         };
//     }

//     setLocale() {
//         // setLocale for diffrent type of modal
//         const locale = this._context.getLocale();

//         function getLabel(obj: object) {
//             Object.keys(obj).forEach((item) => {
//                 obj[item].label = locale.get(obj[item].name);
//             });
//         }

//         this.setState((prevState) => {
//             const { ruleOption, title } = prevState;
//             ruleOption.forEach((item) => {
//                 item.label = locale.get(item.name || '');
//             });

//             getLabel(title);

//             return { ruleOption, title };
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

//     // choose selected rule
//     handleActive = (index: number) => {
//         let { ruleOption, type } = this.state;
//         ruleOption.forEach((item) => {
//             item.active = false;
//         });
//         ruleOption[index].active = true;
//         type = ruleOption[index].type!;

//         this.setValue({
//             ruleOption,
//             type,
//         });
//     };

//     render(props: RuleContentProps, state: RuleContentState) {
//         const RightIcon = this.Render.renderFunction('RightIcon');
//         const { ruleOption, title, type } = state;
//         const { config } = props;
//         return (
//             <div className={styles.ruleContent}>
//                 <div>
//                     <p className={styles.ruleTitle}>{title.chooseTitle.label}:</p>
//                     <div className={styles.ruleBox}>
//                         {ruleOption.map((item, index) => (
//                             <div className={joinClassNames(styles.ruleItem, { [`${styles.ruleItem}-active`]: item.active })} onClick={() => this.handleActive(index)}>
//                                 <RightIcon /> <span>{item.label}</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//                 <div>
//                     <p className={styles.ruleTitle}>{title.editTitle.label}:</p>
//                     <div className={styles.ruleBox}>
//                         <RuleEditContent type={type} config={config}></RuleEditContent>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }

// type RuleEditProps = {
//     type: string;
//     config: any;
// };
// type RuleEditState = {
//     all: Record<string, LabelProps>;
//     formatStyle: LabelProps[];
//     formatType: string;
//     containType: string;
//     fillType: LabelProps[];
//     fillType1: LabelProps[];
//     setting: Record<string, LabelProps>;
//     contain: Record<string, LabelProps>;
//     rank: Record<string, LabelProps>;
//     cellOption: LabelProps[];
//     mathOption: LabelProps[];
//     textOptions: LabelProps[];
//     rankOption: LabelProps[];
//     average: Record<string, LabelProps>;
//     averageOption: LabelProps[];
//     duplicate: Record<string, LabelProps>;
//     duplicateOption: LabelProps[];
//     formula: Record<string, LabelProps>;
// };

// // edit rule content
// class RuleEditContent extends Component<RuleEditProps, RuleEditState> {
//     private _localeObserver: Nullable<Observer<Workbook>>;

//     Render: BaseComponentRender;

//     initialize() {
//         const component = new SheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
//         this.Render = component.getComponentRender();

//         this.state = {
//             all: {
//                 title: {
//                     name: 'conditionalformat.ruleTypeItem1',
//                 },
//                 formatStyle: {
//                     name: 'conditionalformat.formatStyle',
//                 },
//                 fillType: {
//                     name: 'conditionalformat.fillType',
//                     label: '',
//                 },
//                 color: {
//                     name: 'conditionalformat.color',
//                     label: '',
//                 },
//                 max: {
//                     name: 'conditionalformat.maxValue',
//                     label: '',
//                 },
//                 min: {
//                     name: 'conditionalformat.minValue',
//                     label: '',
//                 },
//             },
//             formatStyle: [
//                 {
//                     name: 'conditionalformat.dataBar',
//                 },
//                 {
//                     name: 'conditionalformat.colorGradation',
//                 },
//                 {
//                     name: 'conditionalformat.icons',
//                 },
//             ],
//             formatType: 'dataBar',
//             fillType: [
//                 {
//                     name: 'conditionalformat.gradient',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'conditionalformat.solid',
//                 },
//             ],
//             fillType1: [
//                 {
//                     name: 'conditionalformat.twocolor',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'conditionalformat.tricolor',
//                 },
//             ],
//             setting: {
//                 setAs: {
//                     name: 'conditionalformat.setFormat',
//                 },
//                 textColor: {
//                     name: 'conditionalformat.textColor',
//                 },
//                 cellColor: {
//                     name: 'conditionalformat.cellColor',
//                 },
//             },
//             contain: {
//                 title: {
//                     name: 'conditionalformat.ruleTypeItem2_title',
//                     label: '',
//                 },
//             },
//             containType: 'cellValue',
//             cellOption: [
//                 {
//                     name: 'conditionalformat.cellValue',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'conditionalformat.specificText',
//                 },
//                 {
//                     name: 'conditionalformat.occurrence.text',
//                 },
//             ],
//             mathOption: [
//                 {
//                     name: 'conditionalformat.greaterThan.text',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'conditionalformat.lessThan.text',
//                 },
//                 {
//                     name: 'conditionalformat.between.text',
//                 },
//                 {
//                     name: 'conditionalformat.equal.text',
//                 },
//             ],
//             textOptions: [
//                 {
//                     name: 'conditionalformat.contain',
//                     label: '',
//                     value: '',
//                 },
//             ],
//             rank: {
//                 title: { name: 'conditionalformat.ruleTypeItem3_title', label: '' },
//                 subtitle: {
//                     name: 'conditionalformat.selectRange_percent',
//                     label: '',
//                 },
//             },
//             rankOption: [
//                 {
//                     name: 'conditionalformat.top',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'conditionalformat.last',
//                 },
//             ],
//             average: {
//                 title: {
//                     name: 'conditionalformat.ruleTypeItem4_title',
//                     label: '',
//                 },
//                 subtitle: {
//                     name: 'conditionalformat.selectRange_average',
//                     label: '',
//                 },
//             },
//             averageOption: [
//                 {
//                     name: 'conditionalformat.above',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'conditionalformat.below',
//                 },
//             ],
//             duplicate: {
//                 title: {
//                     name: 'conditionalformat.all',
//                     label: '',
//                 },
//                 subtitle: {
//                     name: 'conditionalformat.selectRange_value',
//                     label: '',
//                 },
//             },
//             duplicateOption: [
//                 {
//                     name: 'conditionalformat.duplicateValue.text',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'conditionalformat.uniqueValue',
//                 },
//             ],
//             formula: {
//                 title: {
//                     name: 'conditionalformat.ruleTypeItem2_title',
//                     label: '',
//                 },
//             },
//         };
//     }

//     setLocale() {
//         // setLocale for diffrent type of modal
//         const locale = this._context.getLocale();
//         const { type } = this.props;
//         // set Locale for object
//         function getLabel(obj: object) {
//             Object.keys(obj).forEach((item) => {
//                 obj[item].label = locale.get(obj[item].name);
//             });
//         }
//         // set Locale for array
//         function getArrayLabel(arr: LabelProps[]) {
//             return arr.map((item) => {
//                 item.label = locale.get(item.name || '');
//                 return item;
//             });
//         }
//         this.setState((prevState) => {
//             let {
//                 all,
//                 formatStyle,
//                 fillType,
//                 fillType1,
//                 setting,
//                 cellOption,
//                 mathOption,
//                 textOptions,
//                 rankOption,
//                 rank,
//                 contain,
//                 average,
//                 averageOption,
//                 duplicate,
//                 duplicateOption,
//                 formula,
//             } = prevState;
//             getLabel(all);
//             getLabel(setting);
//             getLabel(rank);
//             getLabel(contain);
//             getLabel(average);
//             getLabel(duplicate);
//             getLabel(formula);
//             formatStyle = getArrayLabel(formatStyle);
//             fillType = getArrayLabel(fillType);
//             fillType1 = getArrayLabel(fillType1);
//             cellOption = getArrayLabel(cellOption);
//             mathOption = getArrayLabel(mathOption);
//             textOptions = getArrayLabel(textOptions);
//             rankOption = getArrayLabel(rankOption);
//             averageOption = getArrayLabel(averageOption);
//             duplicateOption = getArrayLabel(duplicateOption);

//             return {
//                 all,
//                 formatStyle,
//                 fillType,
//                 fillType1,
//                 setting,
//                 cellOption,
//                 mathOption,
//                 textOptions,
//                 rank,
//                 contain,
//                 rankOption,
//                 average,
//                 averageOption,
//                 duplicate,
//                 duplicateOption,
//                 formula,
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

//     // render content for type of all
//     getAllTypeContent = () => {
//         const { formatType, fillType, all, fillType1 } = this.state;

//         if (formatType === 'dataBar') {
//             return (
//                 <>
//                     <div className={styles.ruleEditItem}>
//                         <span>{all.fillType.label}:</span>
//                         <select>
//                             {fillType.map((item) => (
//                                 <option value={item.value}>{item.label}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div className={styles.ruleEditItem}>
//                         <span>{all.color.label}:</span>
//                     </div>
//                 </>
//             );
//         }
//         if (formatType === 'colorGradation') {
//             return (
//                 <>
//                     <div>
//                         <span>{all.fillType.label}</span>
//                         <select>
//                             {fillType1.map((item) => (
//                                 <option value={item.value}>{item.label}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div className={styles.ruleEditItem}>
//                         <span>{all.color.label}:</span>
//                     </div>
//                     <div className={styles.ruleEditItem}>
//                         <span>{all.color.label}:</span>
//                     </div>
//                 </>
//             );
//         }
//         if (formatType === 'icons') {
//             return (
//                 <>
//                     <div>
//                         <span>{all.fillType.label}</span>
//                     </div>
//                 </>
//             );
//         }
//     };

//     // render content for different type
//     getEditContent = () => {
//         const { type } = this.props;
//         if (type === 'contain') {
//             const CellRangeModal = this.Render.renderFunction('CellRangeModal');

//             const { cellOption, mathOption, textOptions, contain, containType } = this.state;
//             return (
//                 <>
//                     <p className={styles.ruleEditTitle}>{contain.title.label}</p>
//                     <div className={styles.ruleEditContent}>
//                         <select>
//                             {cellOption.map((item) => (
//                                 <option value={item.value}>{item.label}</option>
//                             ))}
//                         </select>
//                         {containType === 'cellValue' ? (
//                             <>
//                                 <select>
//                                     {mathOption.map((item) => (
//                                         <option value={item.value}>{item.label}</option>
//                                     ))}
//                                 </select>
//                                 <CellRangeModal></CellRangeModal>
//                             </>
//                         ) : (
//                             ''
//                         )}
//                         {containType === 'specificText' ? (
//                             <>
//                                 <select>
//                                     {textOptions.map((item) => (
//                                         <option value={item.value}>{item.label}</option>
//                                     ))}
//                                 </select>
//                                 <CellRangeModal></CellRangeModal>
//                             </>
//                         ) : (
//                             ''
//                         )}
//                         {containType === 'occurrence' ? (
//                             <>
//                                 <input type="date" />
//                             </>
//                         ) : (
//                             ''
//                         )}
//                     </div>
//                 </>
//             );
//         }
//         if (type === 'rank') {
//             const { rankOption, rank } = this.state;
//             const Checkbox = this.Render.renderFunction('Checkbox');

//             const Input = this.Render.renderFunction('Input');
//             return (
//                 <>
//                     <p className={styles.ruleEditTitle}>{rank.title.label}</p>
//                     <div className={styles.ruleEditContent}>
//                         <select>
//                             {rankOption.map((item) => (
//                                 <option value={item.value}>{item.label}</option>
//                             ))}
//                         </select>
//                         <Input />
//                         <Checkbox>{rank.subtitle.label}</Checkbox>
//                     </div>
//                 </>
//             );
//         }
//         if (type === 'average') {
//             const { averageOption, average } = this.state;
//             return (
//                 <>
//                     <p className={styles.ruleEditTitle}>{average.title.label}</p>
//                     <div className={styles.ruleEditContent}>
//                         <select>
//                             {averageOption.map((item) => (
//                                 <option value={item.value}>{item.label}</option>
//                             ))}
//                         </select>
//                         <span>{average.subtitle.label}</span>
//                     </div>
//                 </>
//             );
//         }
//         if (type === 'duplicate') {
//             const { duplicateOption, duplicate } = this.state;
//             return (
//                 <>
//                     <p className={styles.ruleEditTitle}>{duplicate.title.label}</p>
//                     <div className={styles.ruleEditContent}>
//                         <select>
//                             {duplicateOption.map((item) => (
//                                 <option value={item.value}>{item.label}</option>
//                             ))}
//                         </select>
//                         <span>{duplicate.subtitle.label}</span>
//                     </div>
//                 </>
//             );
//         }
//         if (type === 'formula') {
//             const { formula } = this.state;
//             const CellRangeModal = this.Render.renderFunction('CellRangeModal');

//             return (
//                 <>
//                     <p className={styles.ruleEditTitle}>{formula.title.label}</p>
//                     <div className={styles.ruleEditContent}>
//                         <CellRangeModal></CellRangeModal>
//                     </div>
//                 </>
//             );
//         }
//     };

//     pickTextColor = () => {};

//     pickCellColor = () => {};

//     cancelColor = () => {};

//     render(props: RuleEditProps, state: RuleEditState) {
//         const ColorPicker = this.Render.renderFunction('ColorPicker');
//         const Checkbox = this.Render.renderFunction('Checkbox');
//         const { type } = props;
//         const { all, formatStyle, setting } = state;

//         if (type === 'all') {
//             return (
//                 <div className={styles.ruleEdit}>
//                     <p className={styles.ruleEditTitle}>{all.title.label}</p>
//                     <div className={styles.ruleEditItem}>
//                         <span>{all.formatStyle.label}:</span>
//                         <select>
//                             {formatStyle.map((item) => (
//                                 <option value={item.value}>{item.label}</option>
//                             ))}
//                         </select>
//                     </div>
//                     {this.getAllTypeContent()}
//                 </div>
//             );
//         }

//         return (
//             <div className={styles.ruleEdit}>
//                 <div>{this.getEditContent()}</div>
//                 <p className={styles.ruleEditTitle}>{setting.setAs.label}</p>
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

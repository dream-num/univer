// import { BaseComponentRender, BaseComponentSheet, Component } from '@univerjs/base-ui';
// import { Nullable, Observer, Workbook } from '@univerjs/core';
// import { SheetPlugin } from '@univerjs/base-sheets';
// import styles from './index.module.less';

// type DataValidationProps = {
//     config?: any;
// };
// type DataValidationState = {
//     range: LabelProps;
//     validation: LabelProps;
//     options: LabelProps[];
//     checkGroups: LabelProps[];
//     placeholder: LabelProps[];
//     checkValue: string[];
//     selected: LabelProps;
//     notSelected: LabelProps;
//     betweenOptions: LabelProps[];
//     textOptions: LabelProps[];
//     validityOptions: LabelProps[];
//     dateOptions: LabelProps[];
// };
// type LabelProps = {
//     name?: string;
//     label?: string;
//     value?: string;
//     checked?: boolean;
// };

// export class DataValidationContent extends Component<DataValidationProps, DataValidationState> {
//     private _localeObserver: Nullable<Observer<Workbook>>;

//     Render: BaseComponentRender;

//     initialize() {
//         const component = new SheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
//         this.Render = component.getComponentRender();

//         this.state = {
//             range: {
//                 name: 'dataValidation.cellRange',
//             },
//             validation: {
//                 name: 'dataValidation.validationCondition',
//             },
//             options: [
//                 {
//                     name: 'dataValidation.dropdown',
//                     value: '1',
//                 },
//                 {
//                     name: 'dataValidation.checkbox',
//                     value: '2',
//                 },
//                 {
//                     name: 'dataValidation.number',
//                     value: '3',
//                 },
//                 {
//                     name: 'dataValidation.number_integer',
//                     value: '3',
//                 },
//                 {
//                     name: 'dataValidation.number_decimal',
//                     value: '3',
//                 },
//                 {
//                     name: 'dataValidation.text_content',
//                     value: '4',
//                 },
//                 {
//                     name: 'dataValidation.text_length',
//                     value: '3',
//                 },
//                 {
//                     name: 'dataValidation.date',
//                     value: '5',
//                 },
//                 {
//                     name: 'dataValidation.validity',
//                     value: '6',
//                 },
//             ],
//             checkGroups: [
//                 {
//                     name: 'dataValidation.remote',
//                     value: '1',
//                     checked: false,
//                 },
//                 {
//                     name: 'dataValidation.prohibitInput',
//                     value: '2',
//                 },
//                 {
//                     name: 'dataValidation.hintShow',
//                     value: '3',
//                 },
//             ],
//             placeholder: [
//                 {
//                     name: 'dataValidation.placeholder5',
//                     label: '',
//                 },
//                 {
//                     name: 'dataValidation.placeholder1',
//                     label: '',
//                 },
//                 {
//                     name: 'dataValidation.placeholder2',
//                     label: '',
//                 },
//                 {
//                     name: 'dataValidation.placeholder4',
//                     label: '',
//                 },
//             ],
//             selected: {
//                 name: 'dataValidation.selected',
//                 label: '',
//             },
//             notSelected: {
//                 name: 'dataValidation.notSelected',
//                 label: '',
//             },
//             betweenOptions: [
//                 {
//                     name: 'dataValidation.between',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.notBetween',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.equal',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.notEqualTo',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.moreThanThe',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.lessThan',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.greaterOrEqualTo',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.lessThanOrEqualTo',
//                     label: '',
//                     value: '',
//                 },
//             ],
//             textOptions: [
//                 {
//                     name: 'dataValidation.include',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.exclude',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.equal',
//                     label: '',
//                     value: '',
//                 },
//             ],
//             dateOptions: [
//                 {
//                     name: 'dataValidation.between',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.notBetween',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.equal',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.notEqualTo',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.earlierThan',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.noEarlierThan',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.laterThan',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.noLaterThan',
//                     label: '',
//                     value: '',
//                 },
//             ],
//             validityOptions: [
//                 {
//                     name: 'dataValidation.identificationNumber',
//                     label: '',
//                     value: '',
//                 },
//                 {
//                     name: 'dataValidation.phoneNumber',
//                     label: '',
//                     value: '',
//                 },
//             ],
//             selectValue: '1',
//             checkValue: [''],
//         };
//     }

//     setLocale() {
//         const locale = this._context.getLocale();
//         this.setState((prevState) => {
//             let { range, validation, options, checkGroups, placeholder, selected, notSelected, betweenOptions, textOptions, validityOptions, dateOptions } = prevState;
//             range.label = locale.get(range.name);
//             validation.label = locale.get(validation.name);
//             options.forEach((item) => {
//                 item.label = locale.get(item.name || '');
//             });
//             checkGroups.forEach((item) => {
//                 item.label = locale.get(item.name);
//             });
//             placeholder.forEach((item) => {
//                 item.label = locale.get(item.name);
//             });
//             selected.label = locale.get(selected.name);
//             notSelected.label = locale.get(notSelected.name);
//             betweenOptions.forEach((item) => {
//                 item.label = locale.get(item.name);
//             });
//             textOptions.forEach((item) => {
//                 item.label = locale.get(item.name);
//             });
//             validityOptions.forEach((item) => {
//                 item.label = locale.get(item.name);
//             });
//             dateOptions.forEach((item) => {
//                 item.label = locale.get(item.name);
//             });

//             return {
//                 range,
//                 validation,
//                 options,
//                 checkGroups,
//                 betweenOptions,
//                 textOptions,
//                 validityOptions,
//                 dateOptions,
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

//     handleSelect = (e: Event) => {
//         const target = e.target as HTMLSelectElement;
//         this.setValue({ selectValue: target.value });
//     };

//     // 不同验证条件显示样式
//     getSelectInfo() {
//         const CellRangeModal = this.Render.renderFunction('CellRangeModal');
//         const Input = this.Render.renderFunction('Input');
//         const { selectValue, placeholder, selected, notSelected, betweenOptions, textOptions, validityOptions, dateOptions } = this.state;
//         if (selectValue === '1') {
//             return <CellRangeModal placeholderProps={placeholder[1].label}></CellRangeModal>;
//         }
//         if (selectValue === '2') {
//             return (
//                 <div className={styles.dataCheckbox}>
//                     <div>
//                         <span>{selected.label} ——</span>
//                         <Input placeholder={placeholder[2].label} />
//                     </div>
//                     <div>
//                         <span>{notSelected.label} ——</span>
//                         <Input placeholder={placeholder[2].label} />
//                     </div>
//                 </div>
//             );
//         }
//         if (selectValue === '3') {
//             return (
//                 <div className={styles.dataBetween}>
//                     <select>
//                         {betweenOptions.map((item) => (
//                             <option value={item.value}>{item.label}</option>
//                         ))}
//                     </select>
//                     <div>
//                         <Input placeholder="1" />
//                         <span> -- </span>
//                         <Input placeholder="100" />
//                     </div>
//                 </div>
//             );
//         }
//         if (selectValue === '4') {
//             return (
//                 <div className={styles.dataText}>
//                     <select>
//                         {textOptions.map((item) => (
//                             <option value={item.value}>{item.label}</option>
//                         ))}
//                     </select>
//                     <Input placeholder={placeholder[3].label} />
//                 </div>
//             );
//         }
//         if (selectValue === '5') {
//             return (
//                 <div className={styles.dataDate}>
//                     <select>
//                         {dateOptions.map((item) => (
//                             <option value={item.value}>{item.label}</option>
//                         ))}
//                     </select>
//                     <div>
//                         <input type="date" />
//                         <span> - </span>
//                         <input type="date" />
//                     </div>
//                 </div>
//             );
//         }
//         if (selectValue === '6') {
//             return (
//                 <div className={styles.dataValidity}>
//                     <select>
//                         {validityOptions.map((item) => (
//                             <option value={item.value}>{item.label}</option>
//                         ))}
//                     </select>
//                 </div>
//             );
//         }
//     }

//     checkboxHandle = (value: string[]) => {
//         let { checkGroups } = this.state;
//         checkGroups.forEach((item) => {
//             item.checked = false;
//             if (value.includes(item.value)) {
//                 item.checked = true;
//             }
//         });
//         this.setValue({ checkValue: value, checkGroups });
//     };

//     // 选中时显示input
//     getCheckInfo() {
//         const Input = this.Render.renderFunction('Input');
//         const { checkValue, placeholder } = this.state;
//         if (checkValue.includes('3')) {
//             return <Input placeholder={placeholder[0].label} />;
//         }
//     }

//     render(props: DataValidationProps, state: DataValidationState) {
//         const CellRangeModal = this.Render.renderFunction('CellRangeModal');
//         const CheckboxGroup = this.Render.renderFunction('CheckboxGroup');
//         const { range, validation, options, checkGroups, placeholder } = state;
//         return (
//             <div className={styles.dataValidation}>
//                 <div className={styles.boxItem}>
//                     <p className={styles.title}>{range.label}</p>
//                     <CellRangeModal></CellRangeModal>
//                 </div>
//                 <div className={styles.boxItem}>
//                     <p className={styles.title}>{validation.label}</p>
//                     <select onChange={this.handleSelect}>
//                         {options.map((item) => (
//                             <option value={item.value}>{item.label}</option>
//                         ))}
//                     </select>
//                     {this.getSelectInfo()}
//                 </div>
//                 <div className={styles.boxItem}>
//                     <CheckboxGroup options={checkGroups} onChange={this.checkboxHandle}></CheckboxGroup>
//                     {this.getCheckInfo()}
//                 </div>
//             </div>
//         );
//     }
// }

// import { BaseComponentRender, BaseComponentSheet, Component } from '@univerjs/base-ui';
// import { Nullable, Observer, Workbook } from '@univerjs/core';
// import { SheetPlugin } from '@univerjs/base-sheets';
// import styles from './index.module.less';

// type SplitContextProps = {
//     config?: any;
// };
// type SplitContextState = {
//     SplitGroup: SplitGroup[];
//     symbol: SplitGroup;
//     divide: SplitGroup;
//     preview: SplitGroup;
// };
// type SplitGroup = {
//     name: string;
//     label?: string;
//     value?: string;
//     content?: string;
// };

// export class SplitColumnContent extends Component<SplitContextProps, SplitContextState> {
//     private _localeObserver: Nullable<Observer<Workbook>>;

//     Render: BaseComponentRender;

//     initialize() {
//         const component = new SheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
//         this.Render = component.getComponentRender();
//         this.state = {
//             SplitGroup: [
//                 {
//                     name: 'punctuation.tab',
//                 },
//                 {
//                     name: 'punctuation.semicolon',
//                 },
//                 {
//                     name: 'punctuation.comma',
//                 },
//                 {
//                     name: 'punctuation.space',
//                 },
//                 {
//                     name: 'splitColumn.splitOther',
//                 },
//             ],
//             symbol: {
//                 name: 'splitColumn.splitDelimiters',
//             },
//             divide: {
//                 name: 'splitColumn.splitContinueSymbol',
//             },
//             preview: {
//                 name: 'splitColumn.splitDataPreview',
//                 content: '',
//             },
//         };
//     }

//     setLocale() {
//         const locale = this._context.getLocale();
//         this.setState((prevState) => {
//             let { SplitGroup, symbol, divide, preview } = prevState;
//             SplitGroup.forEach((item) => {
//                 item.label = locale.get(item.name);
//             });
//             symbol.label = locale.get(symbol.name);
//             divide.label = locale.get(divide.name);
//             preview.label = locale.get(preview.name);

//             return {
//                 SplitGroup,
//                 symbol,
//                 divide,
//                 preview,
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

//     render(props: SplitContextProps, state: SplitContextState) {
//         const CheckboxGroup = this.Render.renderFunction('CheckboxGroup');
//         const Checkbox = this.Render.renderFunction('Checkbox');
//         const Input = this.Render.renderFunction('Input');
//         const { SplitGroup, symbol, divide, preview } = state;
//         return (
//             <div className={styles.splitContent}>
//                 <p>{symbol.label}</p>
//                 <div className={styles.splitBox}>
//                     <CheckboxGroup options={SplitGroup}></CheckboxGroup>
//                     <Input />
//                 </div>
//                 <div className={styles.splitDivid}>
//                     <Checkbox value={divide.value}>{divide.label}</Checkbox>
//                 </div>
//                 <p>{preview.label}</p>
//                 <div className={styles.splitPreview}>{preview.content}</div>
//             </div>
//         );
//     }
// }

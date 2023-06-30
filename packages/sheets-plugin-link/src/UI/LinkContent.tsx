// import { BaseComponentRender, BaseComponentSheet, Component } from '@univerjs/base-ui';
// import { Nullable, Observer, Workbook } from '@univerjs/core';
// import { IProps } from '../IData';
// import styles from './index.module.less';

// type LinkContentProps = {
//     config: IProps;
// };
// type LinkContentBaseProps = {
//     name: string;
//     show: boolean;
//     label?: string;
//     type: string;
//     id: string;
//     placeholder?: {
//         name?: string;
//         label?: string;
//     };
//     children?: Array<Record<string, string>>;
//     onChange?: (e: Event) => void;
// };
// type LinkContentState = {
//     data: LinkContentBaseProps[];
//     type: string;
// };
// export class LinkContent extends Component<LinkContentProps, LinkContentState> {
//     private _localeObserver: Nullable<Observer<Workbook>>;

//     Render: BaseComponentRender;

//     initialize(props: LinkContentProps) {
//         // super(props);
//         const component = this.props.config.config.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
//         this.Render = component.getComponentRender();

//         this.state = {
//             data: [
//                 {
//                     name: 'insertLink.linkText',
//                     show: true,
//                     type: 'single',
//                     id: 'linkText',
//                 },
//                 {
//                     name: 'insertLink.linkType',
//                     show: true,
//                     type: 'select',
//                     id: 'linkType',
//                     onChange: (e: Event) => this.changeLinkType(e),
//                     children: [
//                         {
//                             name: 'insertLink.external',
//                             value: 'external',
//                         },
//                         {
//                             name: 'insertLink.internal',
//                             value: 'internal',
//                         },
//                     ],
//                 },
//                 {
//                     name: 'insertLink.linkAddress',
//                     show: true,
//                     type: 'single',
//                     id: 'linkAddress',
//                     placeholder: { name: 'insertLink.placeholder1' },
//                 },
//                 {
//                     name: 'insertLink.linkSheet',
//                     id: 'linkSheet',
//                     show: false,
//                     type: 'select',
//                 },
//                 {
//                     name: 'insertLink.linkCell',
//                     show: false,
//                     id: 'linkCell',
//                     type: 'single',
//                     placeholder: { name: 'insertLink.placeholder2' },
//                 },
//                 {
//                     name: 'insertLink.linkTooltip',
//                     show: true,
//                     id: 'linkTooltip',
//                     type: 'single',
//                     placeholder: { name: 'insertLink.placeholder3' },
//                 },
//             ],
//             type: 'single',
//         };
//     }

//     setValue = (value: object, fn?: () => void) => {
//         this.setState(
//             (prevState) => ({
//                 ...value,
//             }),
//             fn
//         );
//     };

//     setLocale() {
//         const locale = this._context.getLocale();
//         this.setState((prevState) => {
//             let { data } = prevState;
//             data.forEach((item) => {
//                 item.label = locale.get(item.name);
//                 if (item.children && item.children.length) {
//                     item.children.forEach((ele) => {
//                         ele.label = locale.get(ele.name);
//                     });
//                 }
//                 if (item.placeholder) {
//                     item.placeholder.label = locale.get(item.placeholder.name);
//                 }
//             });

//             return {
//                 data,
//             };
//         });
//     }

//     changeLinkType = (e: Event) => {
//         const target = e.target as HTMLSelectElement;
//         let { data } = this.state;
//         const addressIndex = data.findIndex((item) => item.id === 'linkAddress');
//         const sheetIndex = data.findIndex((item) => item.id === 'linkSheet');
//         const cellIndex = data.findIndex((item) => item.id === 'linkCell');
//         if (target.value === 'external') {
//             data[addressIndex].show = true;
//             data[sheetIndex].show = false;
//             data[cellIndex].show = false;
//         } else {
//             data[addressIndex].show = false;
//             data[sheetIndex].show = true;
//             data[cellIndex].show = true;
//         }
//         this.setValue({ data });
//     };

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

//     render(props: LinkContentProps, state: LinkContentState) {
//         const Input = this.Render.renderFunction('Input');
//         const { data } = state;
//         return (
//             <div className={styles.insertContent}>
//                 {data.map((item) => {
//                     if (!item.show) return <></>;
//                     if (item.type === 'single') {
//                         return (
//                             <div>
//                                 <label for={item.id}>{item.label}:</label>
//                                 <Input id={item.id} type="text" placeholder={item.placeholder?.label}></Input>
//                             </div>
//                         );
//                     }
//                     return (
//                         <div>
//                             <label for={item.id}>{item.label}:</label>
//                             <select
//                                 id={item.id}
//                                 onChange={(e) => {
//                                     item.onChange?.(e);
//                                 }}
//                             >
//                                 {item.children?.map((ele) => (
//                                     <option value={ele.value}>{ele.label}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     );
//                 })}
//             </div>
//         );
//     }
// }

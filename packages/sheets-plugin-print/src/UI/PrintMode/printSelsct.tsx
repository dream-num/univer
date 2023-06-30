// import { BaseComponentSheet, BaseIconProps, BaseUlProps, Component, createRef, FunctionComponent } from '@univerjs/base-ui';
// import { IConfig } from '../../IData';
// import styles from './index.module.less';

// interface IProps {
//     title: string;
//     isInput?: boolean;
//     children: any;
//     onChange: (value: any) => void;
//     config: IConfig;
// }
// interface IState {
//     active: any;
//     inputShow: boolean;
// }

// let time = 100;
// let timeOut: ReturnType<typeof setTimeout> | null = null;
// class PrintSelect extends Component<IProps, IState> {
//     NextIcon: FunctionComponent<BaseIconProps>;

//     Ul: FunctionComponent<BaseUlProps>;

//     initialize(props: IProps) {
//         // super();
//         const component = this.props.config.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
//         const render = component.getComponentRender();
//         this.NextIcon = render.renderFunction('NextIcon');
//         this.Ul = render.renderFunction('Ul');
//         this.state = {
//             active: {},
//             inputShow: false,
//         };
//     }

//     ref = createRef();

//     inputRef = createRef();

//     onDblClick() {
//         clearTimeout(timeOut!);
//         if (!this.props.isInput) return;
//         this.setState({
//             inputShow: true,
//         });
//     }

//     /**
//      * Listen for click events
//      * @eventProperty
//      */
//     handleClick(...args: any[]) {
//         this.hideSelect(args[0]);
//         const { item } = args[1];
//         this.props.onChange(item);
//         this.setState({
//             active: item,
//         });
//     }

//     // 显示子组件
//     showSelect = (e: MouseEvent) => {
//         if (this.state.inputShow) return;
//         clearTimeout(timeOut!);
//         timeOut = setTimeout(() => {
//             e.stopImmediatePropagation();
//             const current = this.ref.current;
//             if (current) current.showSelect();
//         }, time);

//         // 点击外部隐藏子组件
//         document.addEventListener('click', this.hideSelect, true);
//     };

//     // 隐藏子组件
//     hideSelect = (e: MouseEvent) => {
//         if (this.state.inputShow && this.inputRef.current.contains(e.target)) return;
//         const current = this.ref.current;

//         if (current) {
//             current.hideSelect(e);
//             this.setState({
//                 inputShow: false,
//             });
//         }

//         document.removeEventListener('click', this.hideSelect, true);
//     };

//     componentWillMount() {
//         this.setState({
//             active: this.props.children[0],
//         });
//     }

//     render() {
//         const { NextIcon, Ul } = this;
//         return (
//             <div className={styles.printSelect}>
//                 <div className={styles.printSelectTitle}>{this.props.title}</div>
//                 <div className={styles.printSelector} onClick={this.showSelect.bind(this)} onDblClick={this.onDblClick.bind(this)}>
//                     <span className={styles.printSelectorLabel}>
//                         {this.state.inputShow ? <input type="text" className={styles.printSelectInput} ref={this.inputRef} /> : <span>{this.state.active.label}</span>}
//                     </span>
//                     <NextIcon />
//                     <Ul children={this.props.children} onClick={this.handleClick.bind(this)} ref={this.ref}></Ul>
//                 </div>
//             </div>
//         );
//     }
// }

// export { PrintSelect };

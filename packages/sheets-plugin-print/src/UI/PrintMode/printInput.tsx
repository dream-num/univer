// import { Component, createRef } from '@univerjs/base-ui';
// import styles from './index.module.less';

// interface IProps {
//     title: string;
//     onInput: (value: string) => void;
// }
// interface IState {
//     inputFocus: boolean;
// }

// class PrintInput extends Component<IProps, IState> {
//     initialize(props: IProps) {
//         // super();
//         this.state = {
//             inputFocus: false,
//         };
//     }

//     inputRef = createRef();

//     onInput() {
//         const value = this.inputRef.current.value;

//         this.props.onInput(value);
//     }

//     render() {
//         return (
//             <div className={styles.printInput}>
//                 <span>{this.props.title}：</span>
//                 <input ref={this.inputRef} onInput={this.onInput.bind(this)} type="text" />
//             </div>
//         );
//     }
// }

// export { PrintInput };

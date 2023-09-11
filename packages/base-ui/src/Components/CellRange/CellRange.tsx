// import { Component, createRef } from 'react';

// import { BaseComponentProps } from '../../BaseComponent';
// import { ModalButtonGroup } from '../../Interfaces';
// import { Icon, Modal } from '..';
// import { Input } from '../Input';
// import styles from './index.module.less';

// export interface BaseCellRangeModalProps extends BaseComponentProps {
//     value?: string;
//     placeholder?: string;
//     title?: string;
//     contentPlaceholder?: string;
//     onClick?: (e: Event) => void;
//     onChange?: (e: Event) => void;
// }

// type IState = {
//     value: string;
//     show: boolean;
// };

// export class CellRange extends Component<BaseCellRangeModalProps, IState> {
//     ref = createRef();

//     group: ModalButtonGroup[];

//     constructor(props: BaseCellRangeModalProps) {
//         super();

//         this.state = {
//             value: props.value ?? '',
//             show: false,
//         };

//         this.group = [
//             {
//                 label: 'button.confirm',
//                 type: 'primary',
//                 onClick: props.onClick,
//             },
//         ];
//     }

//     showModal(show: boolean) {
//         this.setState({
//             show,
//         });
//     }

//     /**
//      * modify input value when success
//      */
//     handleOk = (e: Event) => {
//         const { onClick } = this.props;
//         const value = this.ref.current.getValue();
//         onClick?.(e);
//         this.showModal(false);
//     };

//     handleChange = (e: Event) => {
//         const { onChange } = this.props;
//         onChange?.(e);
//     };

//     override UNSAFE_componentWillReceiveProps(props: BaseCellRangeModalProps) {
//         if (props.value !== this.state.value) {
//             this.setState({
//                 value: props.value,
//             });
//         }
//     }

//     render() {
//         const { placeholder, title, contentPlaceholder } = this.props;
//         const { value, show } = this.state;

//         return (
//             <div className={styles.cellRangeModal}>
//                 <Input placeholder={placeholder} value={value} onChange={this.handleChange}></Input>
//                 <span className={styles.cellModalIcon} onClick={() => this.showModal(true)}>
//                     <Icon.Sheet.TableIcon />
//                 </span>
//                 <Modal title={title} visible={show} group={this.group}>
//                     <Input readOnly={true} placeholder={contentPlaceholder} value={value} ref={this.ref}></Input>
//                 </Modal>
//             </div>
//         );
//     }
// }

import React, { useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { ModalButtonGroup } from '../../Interfaces';
import { Icon, Modal } from '..';
import { Input } from '../Input';
import styles from './index.module.less';

export interface BaseCellRangeModalProps extends BaseComponentProps {
    value?: string;
    placeholder?: string;
    title?: string;
    contentPlaceholder?: string;
    onClick?: (e: Event) => void;
    onChange?: (e: Event) => void;
}

export function CellRange(props: BaseCellRangeModalProps) {
    const [value, setValue] = useState(props.value ?? '');
    const [show, setShow] = useState(false);

    const group: ModalButtonGroup[] = [
        {
            label: 'button.confirm',
            type: 'primary',
            onClick: props.onClick,
        },
    ];

    // const handleOk = (e: Event) => {
    //     const { onClick } = props;
    //     onClick?.(e);
    //     setShow(false);
    // };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { onChange } = props;
        setValue(e.target.value);
        onChange?.(e.nativeEvent);
    };

    return (
        <div className={styles.cellRangeModal}>
            <Input placeholder={props.placeholder} value={value} onChange={(e) => handleChange(e)}></Input>
            <span className={styles.cellModalIcon} onClick={() => setShow(true)}>
                <Icon.Sheet.TableIcon />
            </span>
            <Modal title={props.title} visible={show} group={group}>
                <Input readonly={true} placeholder={props.contentPlaceholder} value={value}></Input>
            </Modal>
        </div>
    );
}

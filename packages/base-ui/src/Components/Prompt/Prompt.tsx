import React, { useEffect, useState } from 'react';

import { CustomLabel } from '../CustomLabel';
import { Modal, ModalButtonGroup } from '../Modal';
import styles from './index.module.less';

// interface BaseConfirmProps {
//     title: string;
//     content: string;
//     onClick?: () => void;
//     show?: boolean;
// }

// interface IState {
//     show: boolean;
// }

// export class Prompt extends Component<BaseConfirmProps, IState> {
//     constructor(props: BaseConfirmProps) {
//         super();
//         this.state = {
//             show: props.show ?? false,
//         };
//     }

//     showModal(show: boolean) {
//         this.setState({
//             show,
//         });
//     }

//     handleClick() {
//         const { onClick } = this.props;
//         onClick?.();
//         this.showModal(false);
//     }

//     getGroup() {
//         const group = [
//             {
//                 label: 'button.confirm',
//                 type: 'primary',
//                 onClick: () => this.handleClick(),
//             },
//             {
//                 label: 'button.cancel',
//                 onClick: () => this.showModal(false),
//             },
//         ];
//         return group;
//     }

//     UNSAFE_componentWillReceiveProps(props: BaseConfirmProps): void {
//         if (props.show !== this.props.show) {
//             this.setState({
//                 show: props.show,
//             });
//         }
//     }

//     render() {
//         const { title, content } = this.props;
//         const { show } = this.state;
//         return (
//             <div className={styles.confirmModal}>
//                 <Modal visible={show} isDrag={true} title={<CustomLabel label={title} />} group={this.getGroup()}>
//                     <CustomLabel label={content} />
//                 </Modal>
//             </div>
//         );
//     }
// }

interface BaseConfirmProps {
    title: string;
    content: string;
    onClick?: () => void;
    show?: boolean;
}

export function Prompt(props: BaseConfirmProps) {
    const [show, setShow] = useState<boolean>(props.show ?? false);

    const showModal = (show: boolean) => {
        setShow(show);
    };

    const handleClick = () => {
        const { onClick } = props;
        onClick?.();
        setShow(false);
    };

    const getGroup: ModalButtonGroup[] = [
        {
            label: 'button.confirm',
            type: 'primary',
            onClick: () => handleClick(),
        },
        {
            type: 'default',
            label: 'button.cancel',
            onClick: () => showModal(false),
        },
    ];

    useEffect(() => {
        if (props.show !== show) {
            setShow(props.show ?? false);
        }
    }, [props.show]);

    const { title, content } = props;

    return (
        <div className={styles.confirmModal}>
            <Modal visible={show} isDrag={true} title={<CustomLabel label={title} />} group={getGroup}>
                <CustomLabel label={content} />
            </Modal>
        </div>
    );
}

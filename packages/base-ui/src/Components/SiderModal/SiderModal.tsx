import { RefObject, useContext, useEffect, useState } from 'react';

import { AppContext } from '../../Common/AppContext';
// import { Icon } from '../index';

// class SiderModal extends Component<BaseSiderModalProps, IState> {
//     static override contextType = AppContext;

//     constructor(props: BaseSiderModalProps) {
//         super();
//         this.initialize(props);
//     }

//     initialize(props: BaseSiderModalProps) {
//         this.state = {
//             zIndex: props.zIndex ?? 0,
//             show: props.show ?? true,
//         };
//     }

//     close() {
//         this.setState({
//             show: false,
//         });
//     }

//     handleClick() {
//         const zIndex = this.context.zIndexManager.getMaxIndex() + 1;
//         this.setState({
//             zIndex,
//         });
//     }

//     UNSAFE_componentWillReceiveProps(props: BaseSiderModalProps): void {
//         this.setState({
//             show: props.show ?? true,
//         });
//     }

//     render() {
//         const { className = '', style } = this.props;
//         const { zIndex, show } = this.state;
//         this.context.zIndexManager.setIndex(this.props.name, zIndex);

//         return show ? (
//             <div className={`${Style.siderModal} ${className}`} style={{ ...style, zIndex }} onClick={() => this.handleClick()}>
//                 <div className={Style.siderModalHeader}>
//                     <h3 className={Style.siderModalTitle}>{this.props.title}</h3>
//                     <span className={Style.siderModalClose} onClick={() => this.close()}>
//                         <Icon.Other.Close></Icon.Other.Close>
//                     </span>
//                 </div>
//                 <div className={Style.siderModalBody}>
//                     <div className={Style.siderModalBodyInner}>{this.props.children}</div>
//                 </div>
//                 <div className={Style.siderModalFooter}>{this.props.footer}</div>
//             </div>
//         ) : null;
//     }
// }

// export { SiderModal };

export interface BaseSiderModalProps {
    name: string;
    title: string | any;
    show?: boolean;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    ref?: RefObject<HTMLElement>;
    className?: string;
    zIndex?: number;
    style?: React.CSSProperties;
}

export function SiderModal(props: BaseSiderModalProps) {
    const context = useContext(AppContext);
    const { className = '', style } = props;
    const [zIndex, setZIndex] = useState<number>(props.zIndex ?? 0);
    const [show, setShow] = useState<boolean>(props.show ?? true);

    useEffect(() => {
        // Assuming you have a function getMaxIndex() and setIndex() in your context
        const contextZIndexManager = context.zIndexManager;
        if (contextZIndexManager) {
            const newZIndex = contextZIndexManager.getMaxIndex() + 1;
            setZIndex(newZIndex);
            contextZIndexManager.setIndex(props.name, newZIndex);
        }
    }, [props.name]);

    useEffect(() => {
        if (props.show !== show) {
            setShow(props.show ?? true);
        }
    }, [props.show]);

    const close = () => {
        setShow(false);
    };

    const handleClick = () => {
        const contextZIndexManager = context.zIndexManager;
        if (contextZIndexManager) {
            const newZIndex = contextZIndexManager.getMaxIndex() + 1;
            setZIndex(newZIndex);
            contextZIndexManager.setIndex(props.name, newZIndex);
        }
    };

    return show ? (
        <div className={`siderModal ${className}`} style={{ ...style, zIndex }} onClick={handleClick}>
            <div className="siderModalHeader">
                <h3 className="siderModalTitle">{props.title}</h3>
                <span className="siderModalClose" onClick={close}>
                    {/* <Icon.Other.Close></Icon.Other.Close> */}
                </span>
            </div>
            <div className="siderModalBody">
                <div className="siderModalBodyInner">{props.children}</div>
            </div>
            <div className="siderModalFooter">{props.footer}</div>
        </div>
    ) : null;
}

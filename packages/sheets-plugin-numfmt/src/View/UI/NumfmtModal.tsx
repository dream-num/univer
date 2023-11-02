import { BaseComponentProps, ComponentManager } from '@univerjs/base-ui';
import { Component } from 'react';

import { ModalDataProps } from '../../Controller/NumfmtModalController';

interface IProps extends BaseComponentProps {}

interface IState {
    modalData: ModalDataProps[];
}

export class NumfmtModal extends Component<IProps, IState> {
    // static override contextType = AppContext;

    constructor(props: IProps) {
        super(props);
        this.initialize(props);
    }

    initialize(props: IProps): void {
        this.state = {
            modalData: [],
        };
    }

    override componentDidMount(): void {}

    setModal(modalData: ModalDataProps[]): void {
        const componentManager: ComponentManager = (this.context as any).injector.get(ComponentManager);
        modalData.forEach((item): void => {
            const Label = componentManager.get(item.children.name) as JSX.ElementType;
            if (Label) {
                const props = item.children.props ?? {};
                item.modal = <Label {...props} />;
            }
        });
        this.setState({ modalData });
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    override render() {
        // const Modal = this._render.renderFunction('Modal');
        // const { modalData } = this.state;
        // // Set Provider for entire Container
        // return (
        //     <>
        //         {modalData.map((item) => {
        //             if (!item.show) return;
        //             return (
        //                 <Modal title={item.title} visible={item.show} group={item.group} onCancel={item.onCancel}>
        //                     {item.modal}
        //                 </Modal>
        //             );
        //         })}
        //     </>
        // );
        return <></>;
    }
}

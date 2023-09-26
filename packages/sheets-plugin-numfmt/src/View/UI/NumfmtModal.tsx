import { SheetPlugin } from '@univerjs/base-sheets';
import { BaseComponentProps } from '@univerjs/base-ui';
import { PLUGIN_NAMES } from '@univerjs/core';
import { Component } from 'react';

import { NUMFMT_PLUGIN_NAME } from '../../Basics/Const';
import { ModalDataProps } from '../../Controller/NumfmtModalController';
import { NumfmtPlugin } from '../../NumfmtPlugin';

interface IProps extends BaseComponentProps {}

interface IState {
    modalData: ModalDataProps[];
}

export class NumfmtModal extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.initialize(props);
    }

    initialize(props: IProps): void {
        this.state = {
            modalData: [],
        };
    }

    override componentDidMount(): void {
        const plugin = this.getContext().getPluginManager().getPluginByName<NumfmtPlugin>(NUMFMT_PLUGIN_NAME)!;
        plugin.getObserver('onNumfmtModalDidMountObservable')!.notifyObservers(this);
    }

    setModal(modalData: ModalDataProps[]): void {
        const SheetPlugin: SheetPlugin = this.getContext()
            .getPluginManager()
            .getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;
        modalData.forEach((item): void => {
            const Label = this.context.componentManager.get(item.children.name);
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
    render() {
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

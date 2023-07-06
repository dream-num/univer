import { BaseComponentProps, BaseComponentRender, BaseComponentSheet, Component } from '@univerjs/base-ui';
import { SheetPlugin } from '@univerjs/base-sheets';
import { PLUGIN_NAMES } from '@univerjs/core';
import { NUMFMT_PLUGIN_NAME } from '../../Basics/Const';
import { ModalDataProps } from '../../Controller/NumfmtModalController';
import { NumfmtPlugin } from '../../NumfmtPlugin';

interface IProps extends BaseComponentProps {}

interface IState {
    modalData: ModalDataProps[];
}

export class NumfmtModal extends Component<IProps, IState> {
    private _render: BaseComponentRender;

    initialize(props: IProps): void {
        const component = this.getContext().getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        this.state = {
            modalData: [],
        };
    }

    componentDidMount(): void {
        const plugin = this.getContext().getPluginManager().getPluginByName<NumfmtPlugin>(NUMFMT_PLUGIN_NAME)!;
        plugin.getObserver('onNumfmtModalDidMountObservable')!.notifyObservers(this);
    }

    setModal(modalData: ModalDataProps[]): void {
        const SheetPlugin: SheetPlugin = this.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;
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

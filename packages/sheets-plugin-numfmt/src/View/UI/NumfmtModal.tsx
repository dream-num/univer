import { BaseComponentProps, BaseComponentRender, BaseComponentSheet, Component } from '@univer/base-component';
import { SheetPlugin } from '@univer/base-sheets';
import { PLUGIN_NAMES } from '@univer/core';
import { NUMFMT_PLUGIN_NAME } from '../../Basic/Const';
import { ModalDataProps } from '../../Controller/NumfmtModalController';
import { NumfmtPlugin } from '../../NumfmtPlugin';

interface IProps extends BaseComponentProps {}

interface IState {
    modalData: ModalDataProps[];
}

export class NumfmtModal extends Component<IProps, IState> {
    private _render: BaseComponentRender;

    initialize(props: IProps) {
        // super(props);
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        this.state = {
            modalData: [],
        };
    }

    componentDidMount() {
        const plugin = this._context.getPluginManager().getPluginByName<NumfmtPlugin>(NUMFMT_PLUGIN_NAME)!;
        plugin.getObserver('onNumfmtModalDidMountObservable')!.notifyObservers(this);
    }

    setModal(modalData: ModalDataProps[]) {
        const SheetPlugin = this._context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        modalData.forEach((item) => {
            const Label = SheetPlugin.getRegisterComponent(item.children.name);
            if (Label) {
                const props = item.children.props ?? {};
                item.modal = <Label {...props} />;
            }
        });

        this.setState({
            modalData,
        });
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render() {
        const Modal = this._render.renderFunction('Modal');
        const { modalData } = this.state;
        // Set Provider for entire Container
        return (
            <>
                {modalData.map((item) => {
                    if (!item.show) return;
                    return (
                        <Modal title={item.title} visible={item.show} group={item.group} onCancel={item.onCancel}>
                            {item.modal}
                        </Modal>
                    );
                })}
            </>
        );
    }
}

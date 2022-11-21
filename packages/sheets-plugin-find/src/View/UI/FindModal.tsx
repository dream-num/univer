import { BaseComponentRender, BaseComponentSheet, Component, ModalProps } from '@univer/base-component';
import { PLUGIN_NAMES } from '@univer/core';
import { SheetPlugin } from '@univer/base-sheets';
import { IProps } from '../../IData/IFind';
import { FindPlugin } from '../../FindPlugin';
import { FIND_PLUGIN_NAME } from '../../Const/PLUGIN_NAME';
import { ModalDataProps } from '../../Controller/FindModalController';

// Types for state
interface IState {
    modalData: ModalProps[];
}

export class FindModal extends Component<IProps, IState> {
    Render: BaseComponentRender;

    active = 'find';

    initialize(props: IProps) {
        // super(props);
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();

        this.state = {
            modalData: [],
        };
    }

    componentDidMount() {
        const plugin = this._context.getPluginManager().getPluginByName<FindPlugin>(FIND_PLUGIN_NAME)!;
        plugin.getObserver('onFindModalDidMountObservable')!.notifyObservers(this);
    }

    setModal(modalData: ModalDataProps[]) {
        const SheetPlugin = this._context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        modalData.forEach((item) => {
            const component = SheetPlugin.getRegisterComponent(item.children as string);
            if (component) {
                const Label = component.component;
                const props = component.props ?? {};
                item.children = <Label {...props} />;
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
        const Modal = this.Render.renderFunction('Modal');
        const { modalData } = this.state;
        // Set Provider for entire Container
        return (
            <>
                {modalData.map((item) => {
                    if (!item.show) return;
                    return (
                        <Modal title={item.title} visible={item.show} group={item.group} onCancel={item.onCancel}>
                            {item.children}
                        </Modal>
                    );
                })}
            </>
        );
    }
}

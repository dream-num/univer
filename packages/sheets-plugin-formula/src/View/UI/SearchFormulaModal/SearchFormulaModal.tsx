import { BaseComponentRender, BaseComponentSheet, Component } from '@univerjs/base-ui';
import { PLUGIN_NAMES } from '@univerjs/core';
import { SheetPlugin } from '@univerjs/base-sheets';
import { FORMULA_PLUGIN_NAME } from '../../../Basic';
import { SearchFormulaModalData } from '../../../Controller/SearchFormulaModalController';
import { FormulaPlugin } from '../../../FormulaPlugin';

interface IProps {}

interface IState {
    modalData: SearchFormulaModalData[];
}

export class SearchFormulaModal extends Component<IProps, IState> {
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        this.state = {
            modalData: [],
        };
    }

    componentDidMount() {
        const plugin = this._context.getPluginManager().getPluginByName<FormulaPlugin>(FORMULA_PLUGIN_NAME)!;
        plugin.getObserver('onSearchFormulaModalDidMountObservable')!.notifyObservers(this);
    }

    setModal(modalData: SearchFormulaModalData[]) {
        const SheetPlugin = this._context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        modalData.forEach((item) => {
            const Label = SheetPlugin.getRegisterComponent(item.children.name!);
            if (Label) {
                const props = item.children.props ?? {};
                item.modal = <Label {...props} />;
            }
        });

        this.setState({
            modalData,
        });
    }

    render() {
        const Modal = this._render.renderFunction('Modal');
        const { modalData } = this.state;
        // Set Provider for entire Container
        return (
            <>
                {modalData.map((item) => {
                    if (!item.show) return;
                    return (
                        <Modal isDrag={true} mask={item.mask} title={item.label?.funParams.n} visible={item.show} group={item.group} onCancel={item.onCancel}>
                            {item.modal}
                        </Modal>
                    );
                })}
            </>
        );
    }
}

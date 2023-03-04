import { BaseComponentProps, Component, Modal } from '@univerjs/base-ui';
import { SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '@univerjs/ui-plugin-sheets';
import { SearchFormulaModalData } from '../../../Controller/SearchFormulaModalController';

interface IProps extends BaseComponentProps {}

interface IState {
    modalData: SearchFormulaModalData[];
}

export class SearchFormulaModal extends Component<IProps, IState> {
    initialize() {
        this.state = {
            modalData: [],
        };
    }

    componentDidMount() {
        this.props.getComponent?.(this);
    }

    setModal(modalData: SearchFormulaModalData[]) {
        const componentManager = this.getContext().getPluginManager().getPluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)?.getComponentManager();

        modalData.forEach((item) => {
            const Label = componentManager?.get(item.children.name!);
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

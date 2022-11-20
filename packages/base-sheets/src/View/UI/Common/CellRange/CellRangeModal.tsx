import { BaseComponentRender, BaseComponentSheet, Component, createRef, ModalButtonGroup } from '@univer/base-component';

interface CellRangeModalProps {
    placeholder?: string;
    value?: string;
    title?: string;
    confirmText?: string;
    onClick?: () => void;
}

interface CellRangeModalState {
    show: boolean;
}

export class CellRangeModal extends Component<CellRangeModalProps, CellRangeModalState> {
    private _render: BaseComponentRender;

    private _group: ModalButtonGroup[];

    inputRef = createRef<HTMLInputElement>();

    modalRef = createRef();

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        this._group = [
            {
                label: this.props.confirmText,
                type: 'primary',
                onClick: this.confirmRange,
            },
        ];

        this.state = {
            show: false,
        };
    }

    componentDidMount() {}

    showModal(show: boolean) {
        this.setState({
            show,
        });
    }

    confirmRange() {
        const value = this.inputRef.current?.value;
    }

    render() {
        const { value, title, placeholder } = this.props;
        const { show } = this.state;
        const Input = this._render.renderFunction('Input');
        const Modal = this._render.renderFunction('Modal');

        return (
            <Modal title={title} visible={show} group={this._group} ref={this.modalRef} mask={false}>
                <Input ref={this.inputRef} readonly={true} placeholder={placeholder} value={value}></Input>
            </Modal>
        );
    }
}

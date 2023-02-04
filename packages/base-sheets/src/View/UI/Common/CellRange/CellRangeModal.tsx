import { BaseComponentRender, BaseComponentSheet, Component, createRef } from '@univerjs/base-ui';
import { PLUGIN_NAMES } from '@univerjs/core';

interface childrenProps {
    placeholder?: string;
}

export interface CellRangeModalProps {
    value?: string;
    title?: string;
    confirmText?: string;
    onClick?: () => void;
    group?: any[];
    children?: childrenProps;
    show?: boolean;
}

interface IProps {}

interface CellRangeModalState {
    modalData: CellRangeModalProps;
}

export class CellRangeModal extends Component<IProps, CellRangeModalState> {
    private _render: BaseComponentRender;

    inputRef = createRef<HTMLInputElement>();

    modalRef = createRef();

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        this.state = {
            modalData: {},
        };
    }

    componentDidMount() {
        this._context.getObserverManager().getObserver<CellRangeModal>('onCellRangeModalDidMountObservable', PLUGIN_NAMES.SPREADSHEET)?.notifyObservers(this);
    }

    confirmRange() {
        const value = this.inputRef.current?.value;
    }

    setModal(modalData: CellRangeModalProps) {
        this.setState({
            modalData,
        });
    }

    render() {
        const { value, title, children, group, show } = this.state.modalData;
        const Input = this._render.renderFunction('Input');
        const Modal = this._render.renderFunction('Modal');
        if (!show) return;
        return (
            <Modal isDrag={true} visible={show} title={title} group={group} mask={false}>
                <Input ref={this.inputRef} readonly={true} placeholder={children?.placeholder} value={value}></Input>
            </Modal>
        );
    }
}

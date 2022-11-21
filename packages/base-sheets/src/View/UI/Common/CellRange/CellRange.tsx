import { BaseComponentRender, BaseComponentSheet, Component, createRef, ModalButtonGroup } from '@univer/base-component';
import { PLUGIN_NAMES } from '@univer/core';
import { SheetPlugin } from '../../../..';
import { CellRangeModal } from './CellRangeModal';
import styles from './index.module.less';

interface CellRangeProps {
    placeholder?: string;
    value?: string;
    title?: string;
    modalPlaceholder?: string;
    confirmText?: string;
    onClick?: () => void;
    onTableClick?: () => void;
}

interface CellRangeState {
    show: boolean;
    value?: string;
}

export class CellRange extends Component<CellRangeProps, CellRangeState> {
    private _render: BaseComponentRender;

    private _group: ModalButtonGroup[];

    inputRef = createRef<HTMLInputElement>();

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
            value: this.props.value,
        };
    }

    changeInput(e: Event) {
        const value = (e.target as HTMLInputElement).value;
        this.setState({
            value,
        });
    }

    showModal() {
        const { onTableClick } = this.props;
        const sheetPlugin = this._context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;
        const cellRangeModal = sheetPlugin.getRegisterComponent(CellRangeModal.name);
        console.dir(cellRangeModal);

        onTableClick?.();
    }

    confirmRange() {
        const value = this.inputRef.current?.value;

        this.setState({
            value,
        });
    }

    handleClick() {
        const { onClick } = this.props;
        onClick?.();
    }

    render() {
        const { placeholder, value } = this.props;
        const Input = this._render.renderFunction('Input');
        const TableIcon = this._render.renderFunction('TableIcon');

        return (
            <div className={styles.cellRangeModal}>
                <Input onClick={this.handleClick.bind(this)} placeholder={placeholder} value={value} onChange={this.changeInput}></Input>
                <span className={styles.cellModalIcon} onClick={this.showModal.bind(this)}>
                    <TableIcon />
                </span>
            </div>
        );
    }
}

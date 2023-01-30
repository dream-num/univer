import { BaseComponentRender, BaseComponentSheet, Component, createRef, ModalButtonGroup } from '@univerjs/base-component';
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
        const { placeholder, value, onTableClick } = this.props;
        const Input = this._render.renderFunction('Input');
        const TableIcon = this._render.renderFunction('TableIcon');

        return (
            <div className={styles.cellRange}>
                <Input onClick={this.handleClick.bind(this)} placeholder={placeholder} value={value} onChange={this.changeInput}></Input>
                <span className={styles.cellModalIcon} onClick={onTableClick}>
                    <TableIcon />
                </span>
            </div>
        );
    }
}

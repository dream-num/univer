import { BaseComponentRender, BaseComponentSheet, Component, createRef } from '@univerjs/base-ui';
import styles from './index.module.less';

interface IProps {
    data: any[];
    input?: string;
    onClick: (value: string) => void;
    onChange?: (value: string) => void;
}

interface IState {}

export class FormatContent extends Component<IProps, IState> {
    private _render: BaseComponentRender;

    private _ref = createRef();

    initialize(props: IProps) {
        const component = this.getContext().getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();
    }

    getInput() {
        const { input } = this.props;
        const Input = this._render.renderFunction('Input');

        if (input) {
            return (
                <div className={styles.formatInput}>
                    <span>{input}:</span>
                    <Input type="number" value="2" onChange={this.handleChange.bind(this)}></Input>
                </div>
            );
        }
    }

    handleClick(value: string, index: number) {
        const lis = this._ref.current.querySelectorAll('li');
        for (let i = 0; i < lis.length; i++) {
            lis[i].classList.remove(styles.formatSelected);
        }

        lis[index].classList.add(styles.formatSelected);

        this.props.onClick(value);
    }

    handleChange(e: Event) {
        const value = (e.target as HTMLInputElement).value;
        this.props.onChange?.(value);
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render() {
        const { data } = this.props;

        return (
            <div className={styles.formatContent} ref={this._ref}>
                {this.getInput()}
                <ul>
                    {data.map((item, index) => (
                        <li onClick={() => this.handleClick(item.value, index)}>
                            <span>{item.label}</span>
                            <span>{item.suffix}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

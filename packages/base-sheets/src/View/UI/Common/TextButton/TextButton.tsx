import { BaseComponentRender, BaseComponentSheet, Component, ComponentChildren } from '@univer/base-component';
import styles from './index.module.less';

export interface BaseTextButtonProps {
    active?: boolean;
    label?: ComponentChildren;
    onClick?: (...arg: any) => void;
}

interface IState {
    active?: boolean;
}

export class TextButton extends Component<BaseTextButtonProps, IState> {
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();
        this.state = {
            active: this.props.active,
        };
    }

    handleClick = () => {
        const active = !this.state.active;
        this.props.onClick?.(active);

        this.setState({
            active,
        });
    };

    componentWillReceiveProps(nextProps: Readonly<BaseTextButtonProps>, nextContext: any) {
        if (nextProps.active !== this.props.active) {
            this.setState({
                active: nextProps.active,
            });
        }
    }

    render() {
        const { label } = this.props;
        const { active } = this.state;
        const Button = this._render.renderFunction('Button');

        return (
            <div className={styles.textButton}>
                <Button type="text" active={active} onClick={this.handleClick}>
                    {label}
                </Button>
            </div>
        );
    }
}

import { ComponentChildren, Component } from '../../Framework';
import { BaseComponentRender } from '../../BaseComponent';
import styles from './index.module.less';
import { Button } from '../Button';

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

        return (
            <div className={styles.textButton}>
                <Button type="text" active={active} onClick={this.handleClick}>
                    {label}
                </Button>
            </div>
        );
    }
}

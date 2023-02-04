import { BaseSingleButtonProps, Component, JSXComponent, SingleButtonComponent } from '@univerjs/base-component';
import { Button, Tooltip } from '@univerjs/style-univer';

import styles from './index.module.less';

export interface SingleButtonProps {
    label?: string | JSX.Element;
    icon?: JSX.Element | string | null | undefined;
    tooltip?: string;
    name?: string;
    key?: string;
    onClick?: (...arg: any[]) => void;
    active?: boolean;
    triggerUpdate?: (func: Function) => void;
}
export interface IState {
    active: boolean;
}

class SingleButton extends Component<SingleButtonProps, IState> {
    initialize(props: SingleButtonProps): void {
        // Mount update function, when updating the selection range, the cell formats corresponding to different ranges are different, and the toolbar status and values need to be updated in real time
        const { triggerUpdate, active } = props;
        triggerUpdate && triggerUpdate(this.update.bind(this));

        this.state = {
            active: active || false,
        };
    }

    update(active: boolean) {
        this.setState({ active });
    }

    onClick() {
        this.setState(
            (prevState: IState) => ({
                active: !prevState.active,
            }),
            () => {
                this.props.onClick && this.props.onClick(this.state.active);
            }
        );
    }

    render() {
        const { name, tooltip, label, icon, onClick, key } = this.props;
        const { active } = this.state;
        return (
            <div className={styles.singleButton} key={key}>
                <Tooltip title={tooltip!} placement={'bottom'}>
                    <Button type="text" onClick={() => this.onClick()} active={active}>
                        {label}
                        {icon}
                    </Button>
                </Tooltip>
            </div>
        );
    }
}

export class UniverSingleButton implements SingleButtonComponent {
    render(): JSXComponent<BaseSingleButtonProps> {
        return SingleButton;
    }
}

export { SingleButton };

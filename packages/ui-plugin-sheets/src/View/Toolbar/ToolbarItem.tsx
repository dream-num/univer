import { ComponentChild, Component } from 'preact';
import { Subscription } from 'rxjs';

import { AppContext, IMenuItem, Button, Tooltip, CustomLabel } from '@univerjs/base-ui';
import { ICommandService } from '@univerjs/core';

import styles from './index.module.less';

export interface IToolbarItemStatus {
    disabled: boolean;
}

export class ToolbarItem extends Component<IMenuItem, IToolbarItemStatus> {
    static override contextType = AppContext;
    private disabledSubscription: Subscription | undefined;

    constructor() {
        super();

        this.state = {
            disabled: true,
        };
    }

    override componentDidMount() {
        this.disabledSubscription = this.props.disabled$?.subscribe((disabled) => {
            this.setState({ disabled });
        });
    }

    override componentWillMount() {
        this.disabledSubscription?.unsubscribe();
    }

    render(): ComponentChild {
        const { props, context } = this;
        const commandService: ICommandService = context.injector.get(ICommandService);
        const { disabled } = this.state;

        return (
            <Tooltip title={props.title} placement="bottom">
                <Button className={styles.textButton} type="text" disabled={disabled} onClick={() => commandService.executeCommand(props.id)}>
                    <CustomLabel label={{ name: props.icon }} />
                </Button>
            </Tooltip>
        );
    }
}

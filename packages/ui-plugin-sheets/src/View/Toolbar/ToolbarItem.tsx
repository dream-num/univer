import { ComponentChild, Component } from 'preact';
import { Subscription } from 'rxjs';

import { AppContext, Button, Tooltip, CustomLabel } from '@univerjs/base-ui';
import { ICommandService } from '@univerjs/core';

import styles from './index.module.less';

export interface IToolbarItemStatus {
    disabled: boolean;
    activated: boolean;
}

export class ToolbarItem extends Component<IDisplayMenuItem, IToolbarItemStatus> {
    static override contextType = AppContext;

    private disabledSubscription: Subscription | undefined;

    private activatedSubscription: Subscription | undefined;

    constructor() {
        super();

        this.state = {
            disabled: false,
            activated: false,
        };
    }

    override componentDidMount() {
        this.disabledSubscription = this.props.disabled$?.subscribe((disabled) => {
            this.setState({ disabled });
        });

        this.activatedSubscription = this.props.activated$?.subscribe((activated) => {
            this.setState({ activated });
        });
    }

    override componentWillMount() {
        this.disabledSubscription?.unsubscribe();
    }

    render(): ComponentChild {
        const { props, context } = this;
        const commandService: ICommandService = context.injector.get(ICommandService);
        const { disabled, activated } = this.state;

        return (
            <Tooltip title={props.title + (props.shortcut ? ` (${props.shortcut})` : '')} placement="bottom">
                <Button active={activated} className={styles.textButton} type="text" disabled={disabled} onClick={() => commandService.executeCommand(props.id)}>
                    <CustomLabel label={{ name: props.icon }} />
                </Button>
            </Tooltip>
        );
    }
}

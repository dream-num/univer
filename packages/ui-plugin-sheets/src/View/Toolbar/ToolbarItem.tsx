import { ComponentChild, ComponentChildren, isValidElement } from 'preact';
import { Subscription } from 'rxjs';

import { Button, Tooltip, Component, CustomComponent, IDisplayMenuItem } from '@univerjs/base-ui';
import { ICommandService } from '@univerjs/core';

import styles from './index.module.less';

export interface IToolbarItemStatus {
    disabled: boolean;
}

export class ToolbarItem extends Component<IDisplayMenuItem, IToolbarItemStatus> {
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
            <Tooltip title={props.title + (props.shortcut ? ` (${props.shortcut})` : '')} placement="bottom">
                <Button className={styles.textButton} type="text" disabled={disabled} onClick={() => commandService.executeCommand(props.id)}>
                    {this.getLabel({ name: props.icon })}
                </Button>
            </Tooltip>
        );
    }

    override getLabel(label: string | CustomComponent | ComponentChildren) {
        if (typeof label === 'string') {
            return this.getLocale(label);
        }
        if (isValidElement(label)) {
            return label;
        }
        if (label) {
            const Label = this.context.componentManager.get((label as CustomComponent).name);
            if (Label) {
                const props = (label as CustomComponent).props ?? {};
                return <Label {...props}></Label>;
            }
        }
        return null;
    }
}

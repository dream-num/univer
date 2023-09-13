import { AppContext, Button, CustomLabel, IDisplayMenuItem, IMenuButtonItem, IMenuItem, IMenuSelectorItem, IValueOption, MenuItemType, Select, Tooltip } from '@univerjs/base-ui';
import { ICommandService, IKeyValue } from '@univerjs/core';
import { Component } from 'react';
import { Subscription } from 'rxjs';

import styles from './index.module.less';

export interface IToolbarItemStatus {
    disabled: boolean;
    activated: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
}

/** The component to render toolbar item. */
export class ToolbarItem extends Component<IDisplayMenuItem<IMenuItem>, IToolbarItemStatus> {
    static override contextType = AppContext;

    private disabledSubscription: Subscription | undefined;

    private activatedSubscription: Subscription | undefined;

    private currentValueSubscription: Subscription | undefined;

    constructor(props: IDisplayMenuItem<IMenuItem>) {
        super(props);

        this.state = {
            disabled: false,
            activated: false,
            value: undefined,
        };
    }

    override componentDidMount() {
        this.disabledSubscription = this.props.disabled$?.subscribe((disabled) => {
            this.setState({ disabled });
        });

        if (this.props.type === MenuItemType.BUTTON) {
            const props = this.props as IDisplayMenuItem<IMenuButtonItem>;
            this.activatedSubscription = props.activated$?.subscribe((activated) => {
                this.setState({ activated });
            });
        }

        if (this.props.type === MenuItemType.SELECTOR) {
            const props = this.props as IDisplayMenuItem<IMenuSelectorItem<unknown>>;
            this.currentValueSubscription = props.value$?.subscribe((value) => {
                this.setState({ value });
            });
        }
    }

    override UNSAFE_componentWillMount() {
        this.disabledSubscription?.unsubscribe();
        this.activatedSubscription?.unsubscribe();
        this.currentValueSubscription?.unsubscribe();
    }

    override render() {
        switch (this.props.type) {
            case MenuItemType.SUBITEMS:
            case MenuItemType.SELECTOR:
                return this.renderSelectorType();
            default:
                return this.renderButtonType();
        }
    }

    private renderSelectorType() {
        const { context, state } = this;
        const commandService: ICommandService = (context as IKeyValue).injector.get(ICommandService);
        const { disabled, value } = state;

        const props = this.props as IDisplayMenuItem<IMenuSelectorItem<unknown>>;
        const { icon, title, label, display, selectType, selections, id } = props;

        return (
            <Tooltip title={this.getTooltip()} placement="bottom">
                <Select
                    id={id}
                    title={title}
                    children={selections! as IValueOption[]}
                    options={selections as IValueOption[]}
                    display={display}
                    icon={icon}
                    value={value}
                    label={value ?? label} // TODO: this line is strange
                    onClick={(value) => commandService.executeCommand(id, { value })} // TODO@wzhudev: should be merged to a single API on value change
                    onPressEnter={(value) => commandService.executeCommand(id, { value })}
                    type={selectType!}
                ></Select>
            </Tooltip>
        );
    }

    private renderButtonType() {
        const { props, context, state } = this;
        const { disabled, activated } = state;
        const { icon, title } = props;
        const commandService: ICommandService = (context as IKeyValue).injector.get(ICommandService);

        return (
            <Tooltip title={this.getTooltip()} placement="bottom">
                <Button active={activated} className={styles.textButton} type="text" disabled={disabled} onClick={() => commandService.executeCommand(props.id)}>
                    <CustomLabel label={icon ? { name: icon } : title} />
                </Button>
            </Tooltip>
        );
    }

    private getTooltip(): string {
        return (this.context as IKeyValue).localeService?.t(this.props.tooltip) + (this.props.shortcut ? ` (${this.props.shortcut})` : '');
    }
}

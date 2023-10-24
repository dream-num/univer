import { ICommandService } from '@univerjs/core';
import { Component } from 'react';
import { Subscription } from 'rxjs';

import { AppContext } from '../../../Common/AppContext';
import { CustomLabel } from '../../../Components/CustomLabel/CustomLabel';
import { Select } from '../../../Components/Select/Select';
import { Tooltip } from '../../../Components/Tooltip/Tooltip';
import {
    IDisplayMenuItem,
    IMenuButtonItem,
    IMenuItem,
    IMenuSelectorItem,
    IValueOption,
    MenuItemType,
} from '../../../services/menu/menu';
import { ToolbarButton } from './Button/ToolbarButton';
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

    declare context: React.ContextType<typeof AppContext>;

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
            const props = this.props as IDisplayMenuItem<IMenuSelectorItem>;
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
        const commandService: ICommandService = context.injector.get(ICommandService);
        const { disabled, value } = state;

        const props = this.props as IDisplayMenuItem<IMenuSelectorItem>;
        const { icon, title, label, display, selections, id, onClose, max, min } = props;

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
                    max={max}
                    min={min}
                    onClick={(value) => {
                        // commandService.executeCommand(id, { value })
                        // 子元素commandId会被现在的id覆盖，暂时这么写以区分
                        let commandId = id;
                        if (value instanceof Object && value.id) {
                            commandId = value.id;
                        }

                        if (typeof value === 'string') {
                            value = { value };
                        }
                        commandService.executeCommand(commandId, value);
                    }}
                    onClose={onClose}
                ></Select>
            </Tooltip>
        );
    }

    private renderButtonType() {
        const { props, context, state } = this;
        const { disabled, activated } = state;
        const { icon, title } = props;
        const commandService: ICommandService = context.injector.get(ICommandService);

        return (
            <Tooltip title={this.getTooltip()} placement="bottom">
                <ToolbarButton
                    active={activated}
                    className={styles.textButton}
                    disabled={disabled}
                    onClick={() => commandService.executeCommand(props.id)}
                    onDoubleClick={() => props.subId && commandService.executeCommand(props.subId)}
                >
                    <CustomLabel label={icon ? { name: icon } : title} />
                </ToolbarButton>
            </Tooltip>
        );
    }

    private getTooltip(): string {
        return (
            this.context.localeService?.t(this.props.tooltip) + (this.props.shortcut ? ` (${this.props.shortcut})` : '')
        );
    }
}

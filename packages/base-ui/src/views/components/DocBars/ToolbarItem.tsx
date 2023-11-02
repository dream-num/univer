import { ICommandService, LocaleService } from '@univerjs/core';
import { Tooltip } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';

import { ComponentManager } from '../../../Common';
import {
    IDisplayMenuItem,
    IMenuItem,
    IMenuSelectorItem,
    IValueOption,
    MenuItemType,
} from '../../../services/menu/menu';
import { ToolbarButton } from './Button/ToolbarButton';
import styles from './index.module.less';
import { Select } from './Select/Select';

export function ToolbarItem(props: IDisplayMenuItem<IMenuItem>) {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const componentManager = useDependency(ComponentManager);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [value, setValue] = useState<any>();
    const [disabled, setDisabled] = useState(false);
    const [activated, setActivated] = useState(false);

    useEffect(() => {
        const subscriptions: Subscription[] = [];

        props.disabled$ &&
            subscriptions.push(
                props.disabled$.subscribe((disabled) => {
                    setDisabled(disabled);
                })
            );

        if (props.type === MenuItemType.BUTTON) {
            props.activated$ &&
                subscriptions.push(
                    props.activated$.subscribe((activated) => {
                        setActivated(activated);
                    })
                );
        }

        if (props.type === MenuItemType.SELECTOR) {
            props.value$ &&
                subscriptions.push(
                    props.value$.subscribe((value) => {
                        setValue(value);
                    })
                );
        }

        return () => {
            subscriptions.forEach((subscription) => {
                subscription.unsubscribe();
            });
        };
    }, []);

    const { tooltip, shortcut, icon, title, label, id } = props;

    const tooltipTitle = localeService?.t(tooltip) + (shortcut ? ` (${shortcut})` : '');

    function renderSelectorType() {
        const { selections } = props as IDisplayMenuItem<IMenuSelectorItem>;

        return (
            <Tooltip title={tooltipTitle} placement="bottom">
                <Select
                    id={id}
                    title={title}
                    options={selections as IValueOption[]}
                    icon={icon}
                    value={value}
                    label={label}
                    onClick={(option) => {
                        // commandService.executeCommand(id, { value })
                        // 子元素commandId会被现在的id覆盖，暂时这么写以区分
                        // TODO: @jikkai should be refactored

                        let commandId = id;
                        let value;
                        if (option instanceof Object) {
                            value = option;

                            if (option.id) {
                                commandId = option.id;
                            }
                        } else if (typeof option === 'string' || typeof option === 'number') {
                            value = { value: option };
                        }

                        commandService.executeCommand(commandId, value);
                    }}
                />
            </Tooltip>
        );
    }

    function renderButtonType() {
        function renderIconOrLabel() {
            if (icon) {
                const IconComponent = componentManager.get(icon) as React.ComponentType;

                if (IconComponent) return <IconComponent />;
            }
            return title;
        }

        return (
            <Tooltip title={tooltipTitle} placement="bottom">
                <ToolbarButton
                    className={styles.toolbarItemTextButton}
                    active={activated}
                    disabled={disabled}
                    onClick={() => commandService.executeCommand(props.id)}
                    onDoubleClick={() => props.subId && commandService.executeCommand(props.subId)}
                >
                    {renderIconOrLabel()}
                </ToolbarButton>
            </Tooltip>
        );
    }

    switch (props.type) {
        case MenuItemType.SUBITEMS:
        case MenuItemType.SELECTOR:
            return renderSelectorType();
        case MenuItemType.BUTTON:
        default:
            return renderButtonType();
    }
}

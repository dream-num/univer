/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ICommandService, LocaleService } from '@univerjs/core';
import { Dropdown, Tooltip } from '@univerjs/design';
import { MoreDownSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';
import { isObservable } from 'rxjs';

import { ComponentManager } from '../../../common/component-manager';
import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { useObservable } from '../../../components/hooks/observable';
import { Menu } from '../../../components/menu/Menu';
import type { IDisplayMenuItem, IMenuItem, IMenuSelectorItem, IValueOption } from '../../../services/menu/menu';
import { MenuItemType } from '../../../services/menu/menu';
import { ToolbarButton } from './Button/ToolbarButton';
import styles from './index.module.less';

export function ToolbarItem(props: IDisplayMenuItem<IMenuItem>) {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);

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

        props.value$ &&
            subscriptions.push(
                props.value$.subscribe((value) => {
                    setValue(value);
                })
            );

        return () => {
            subscriptions.forEach((subscription) => {
                subscription.unsubscribe();
            });
        };
    }, []);

    const { tooltip, shortcut, icon, title, label, id } = props;

    const tooltipTitle = localeService.t(tooltip ?? '') + (shortcut ? ` (${shortcut})` : '');

    function renderSelectorType(menuType: MenuItemType) {
        const { selections } = props as IDisplayMenuItem<IMenuSelectorItem>;

        const options = selections as IValueOption[];
        let iconToDisplay = icon;
        if (isObservable(icon)) {
            iconToDisplay = useObservable(icon, undefined, true);
        } else {
            iconToDisplay = options?.find((o) => o.value === value)?.icon ?? icon;
        }

        function handleSelect(option: IValueOption) {
            let commandId = id;
            const value = option;

            if (option.id) {
                commandId = option.id;
            }

            commandService.executeCommand(commandId, value);
        }

        function handleChange(value: string | number) {
            const commandId = id;
            commandService.executeCommand(commandId, { value });
        }

        function handleClick() {
            if (menuType === MenuItemType.BUTTON_SELECTOR) {
                const commandId = id;
                commandService.executeCommand(commandId, { value });
            }
        }

        return menuType === MenuItemType.BUTTON_SELECTOR ? (
            <div className={styles.toolbarItemSelectButton}>
                <div className={styles.toolbarItemSelectButtonLabel} onClick={handleClick}>
                    <CustomLabel
                        icon={iconToDisplay}
                        title={title!}
                        value={value}
                        label={label}
                        onChange={handleChange}
                    />
                </div>
                <Dropdown
                    overlay={<Menu menuType={id} options={options} onOptionSelect={handleSelect} value={value} />}
                >
                    <div className={styles.toolbarItemSelectButtonArrow}>
                        <MoreDownSingle />
                    </div>
                </Dropdown>
            </div>
        ) : (
            <Dropdown overlay={<Menu menuType={id} options={options} onOptionSelect={handleSelect} value={value} />}>
                <div className={styles.toolbarItemSelect}>
                    <CustomLabel
                        icon={iconToDisplay}
                        title={title!}
                        value={value}
                        label={label}
                        onChange={handleChange}
                    />
                    <div className={styles.toolbarItemSelectArrow}>
                        <MoreDownSingle />
                    </div>
                </div>
            </Dropdown>
        );
    }

    function renderButtonType() {
        const componentManager = useDependency(ComponentManager);
        const isCustomComponent = componentManager.get(typeof label === 'string' ? label : label?.name ?? '');

        return (
            <ToolbarButton
                className={styles.toolbarItemTextButton}
                active={activated}
                disabled={disabled}
                onClick={() => commandService.executeCommand(props.id)}
                onDoubleClick={() => props.subId && commandService.executeCommand(props.subId)}
            >
                {isCustomComponent ? (
                    <CustomLabel title={title!} value={value} label={label} />
                ) : (
                    <CustomLabel icon={icon} />
                )}
            </ToolbarButton>
        );
    }

    function renderItem() {
        switch (props.type) {
            case MenuItemType.BUTTON_SELECTOR:
            case MenuItemType.SELECTOR:
            case MenuItemType.SUBITEMS:
                return renderSelectorType(props.type);
            case MenuItemType.BUTTON:
            default:
                return renderButtonType();
        }
    }

    return (
        <Tooltip title={tooltipTitle} placement="bottom">
            {renderItem()}
        </Tooltip>
    );
}

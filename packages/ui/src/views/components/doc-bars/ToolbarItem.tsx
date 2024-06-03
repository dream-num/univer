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
import { ITextSelectionRenderManager } from '@univerjs/engine-render';
import { MoreDownSingle } from '@univerjs/icons';
import { useDependency, useInjector } from '@wendellhu/redi/react-bindings';
import type { Ref } from 'react';
import React, { forwardRef, useMemo, useState } from 'react';
import { isObservable, Observable } from 'rxjs';

import clsx from 'clsx';
import { ComponentManager } from '../../../common/component-manager';
import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { useObservable } from '../../../components/hooks/observable';
import { Menu } from '../../../components/menu/Menu';
import type { IDisplayMenuItem, IMenuItem, IMenuSelectorItem, IValueOption } from '../../../services/menu/menu';
import { MenuItemType } from '../../../services/menu/menu';
import { ToolbarButton } from './Button/ToolbarButton';
import styles from './index.module.less';
import { useToolbarItemStatus } from './hook';

export const ToolbarItem = forwardRef((props: IDisplayMenuItem<IMenuItem>, ref: Ref<any>) => {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const injector = useInjector();
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const { value, hidden, disabled, activated } = useToolbarItemStatus(props);

    const handleCommandExecuted = (commandId: string, params?: Record<string, any>) => {
        commandService.executeCommand(commandId, params);
        const textSelectionRenderManager = injector.get(ITextSelectionRenderManager);
        textSelectionRenderManager.focus();
    };

    function handleVisibleChange(visible: boolean) {
        setTooltipVisible(visible);
    }

    function handleDropdownVisibleChange(visible: boolean) {
        setDropdownVisible(visible);

        if (!visible) {
            setTooltipVisible(false);
        }
    }

    const { tooltip, shortcut, icon, title, label, id } = props;

    const tooltipTitle = localeService.t(tooltip ?? '') + (shortcut ? ` (${shortcut})` : '');

    const { selections } = props as IDisplayMenuItem<IMenuSelectorItem>;
    const selections$ = useMemo(() => {
        if (isObservable(selections)) {
            return selections;
        } else {
            return new Observable<typeof selections>((subscribe) => {
                subscribe.next(selections);
            });
        }
    }, [selections]);
    const options = useObservable(selections$) as IValueOption[];

    const icon$ = useMemo(() => {
        if (isObservable(icon)) {
            return icon;
        } else {
            return new Observable<typeof icon>((subscribe) => {
                const v = options?.find((o) => o.value === value)?.icon ?? icon;
                subscribe.next(v);
            });
        }
    }, [icon, options, value]);

    const iconToDisplay = useObservable(icon$, undefined, true);

    function renderSelectorType(menuType: MenuItemType) {
        function handleSelect(option: IValueOption) {
            if (disabled) {
                return;
            }

            let commandId = id;
            const value = option;

            if (option.id) {
                commandId = option.id;
            }

            handleCommandExecuted(commandId, value);
        }

        function handleChange(value: string | number) {
            if (disabled) {
                return;
            }

            const commandId = id;
            handleCommandExecuted(commandId, { value });
        }

        function handleClick() {
            if (disabled) {
                return;
            }
            if (menuType === MenuItemType.BUTTON_SELECTOR) {
                const commandId = id;
                handleCommandExecuted(commandId, { value });
            }
        }

        return menuType === MenuItemType.BUTTON_SELECTOR
            ? (
                // Button Selector
                <div
                    className={clsx(styles.toolbarItemSelectButton, {
                        [styles.toolbarItemSelectButtonDisabled]: disabled,
                        [styles.toolbarItemSelectButtonActivated]: activated,
                    })}
                    data-disabled={disabled}
                >
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
                        overlay={(
                            <Menu overViewport="scroll" menuType={id} options={options} onOptionSelect={handleSelect} value={value} />
                        )}
                        onVisibleChange={handleDropdownVisibleChange}
                        disabled={disabled}
                    >
                        <div
                            className={clsx(styles.toolbarItemSelectButtonArrow, {
                                [styles.toolbarItemSelectButtonArrowDisabled]: disabled,
                                [styles.toolbarItemSelectButtonArrowActivated]: activated,
                            })}
                            data-disabled={disabled}
                        >
                            <MoreDownSingle />
                        </div>
                    </Dropdown>

                </div>
            )
            : (
                // Selector
                <Dropdown
                    overlay={(
                        <Menu overViewport="scroll" menuType={id} options={options} onOptionSelect={handleSelect} value={value} />
                    )}
                    onVisibleChange={handleDropdownVisibleChange}
                    disabled={disabled}
                >
                    <div
                        className={clsx(styles.toolbarItemSelect, {
                            [styles.toolbarItemSelectDisabled]: disabled,
                            [styles.toolbarItemSelectActivated]: activated,
                        })}
                    >
                        <CustomLabel
                            icon={iconToDisplay}
                            title={title!}
                            value={value}
                            label={label}
                            onChange={handleChange}
                        />
                        <div
                            className={clsx(styles.toolbarItemSelectArrow, {
                                [styles.toolbarItemSelectArrowDisabled]: disabled,
                            })}
                        >
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
                onClick={() => handleCommandExecuted(props.id)}
                onDoubleClick={() => props.subId && handleCommandExecuted(props.subId)}
            >
                {isCustomComponent
                    ? (
                        <CustomLabel title={title!} value={value} label={label} />
                    )
                    : (
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

    // ref component
    return hidden
        ? null
        : (
            <Tooltip
                ref={ref}
                visible={dropdownVisible ? false : tooltipVisible}
                title={tooltipTitle}
                placement="bottom"
                onVisibleChange={handleVisibleChange}
            >
                <div>
                    {renderItem()}
                </div>
            </Tooltip>
        );
});

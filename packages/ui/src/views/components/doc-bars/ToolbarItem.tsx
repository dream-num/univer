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
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import type { Subscription } from 'rxjs';
import { isObservable, Observable } from 'rxjs';

import { ComponentManager } from '../../../common/component-manager';
import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { useObservable } from '../../../components/hooks/observable';
import { Menu } from '../../../components/menu/Menu';
import type { IDisplayMenuItem, IMenuItem, IMenuSelectorItem, IValueOption } from '../../../services/menu/menu';
import { MenuItemType } from '../../../services/menu/menu';
import { ToolbarButton } from './Button/ToolbarButton';
import styles from './index.module.less';

export const ToolbarItem = forwardRef((props: IDisplayMenuItem<IMenuItem>, ref: Ref<any>) => {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const injector = useInjector();
    const [value, setValue] = useState<any>();
    const [disabled, setDisabled] = useState(false);
    const [activated, setActivated] = useState(false);
    const [hidden, setHidden] = useState(false);

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);

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

    useEffect(() => {
        const subscriptions: Subscription[] = [];

        props.disabled$ &&
        subscriptions.push(
            props.disabled$.subscribe((disabled) => {
                setDisabled(disabled);
            })
        );

        props.hidden$ &&
        subscriptions.push(
            props.hidden$.subscribe((hidden) => {
                setHidden(hidden);
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

    const { selections } = props as IDisplayMenuItem<IMenuSelectorItem>;
    const selections$ = useMemo(() => {
        if (isObservable(selections)) {
            return selections;
        } else {
            return new Observable< typeof selections>((subscribe) => {
                subscribe.next(selections);
            });
        }
    }, [selections]);
    const options = useObservable(selections$) as IValueOption[];

    const icon$ = useMemo(() => {
        if (isObservable(icon)) {
            return icon;
        } else {
            return new Observable< typeof icon>((subscribe) => {
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
                <div
                    className={`${styles.toolbarItemSelectButton} ${
                        disabled ? styles.toolbarItemSelectButtonDisabled : ''
                    }`}
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
                    {!disabled && (
                        <Dropdown
                            overlay={<Menu menuType={id} options={options} onOptionSelect={handleSelect} value={value} />}
                            onVisibleChange={handleDropdownVisibleChange}
                        >
                            <div
                                className={`${styles.toolbarItemSelectButtonArrow} ${
                                    disabled ? styles.toolbarItemSelectButtonArrowDisabled : ''
                                }`}
                                data-disabled={disabled}
                            >
                                <MoreDownSingle />
                            </div>
                        </Dropdown>
                    )}
                </div>
            )
            : !disabled
                ? (
                    <Dropdown
                        overlay={<Menu menuType={id} options={options} onOptionSelect={handleSelect} value={value} />}
                        onVisibleChange={handleDropdownVisibleChange}
                    >
                        <div className={`${styles.toolbarItemSelect} ${disabled ? styles.toolbarItemSelectDisabled : ''}`}>
                            <CustomLabel
                                icon={iconToDisplay}
                                title={title!}
                                value={value}
                                label={label}
                                onChange={handleChange}
                            />
                            <div
                                className={`${styles.toolbarItemSelectArrow} ${
                                    disabled ? styles.toolbarItemSelectArrowDisabled : ''
                                }`}
                            >
                                <MoreDownSingle />
                            </div>
                        </div>
                    </Dropdown>
                )
                : (
                    <div className={`${styles.toolbarItemSelect} ${disabled ? styles.toolbarItemSelectDisabled : ''}`}>
                        <CustomLabel
                            icon={iconToDisplay}
                            title={title!}
                            value={value}
                            label={label}
                            onChange={handleChange}
                        />
                        <div
                            className={`${styles.toolbarItemSelectArrow} ${
                                disabled ? styles.toolbarItemSelectArrowDisabled : ''
                            }`}
                        >
                            <MoreDownSingle />
                        </div>
                    </div>
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
                {renderItem()}
            </Tooltip>
        );
});

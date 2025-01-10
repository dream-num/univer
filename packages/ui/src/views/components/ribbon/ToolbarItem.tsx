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

import type { IDropdownLegacyProps } from '@univerjs/design';
import type { IDisplayMenuItem, IMenuItem, IMenuSelectorItem, IValueOption } from '../../../services/menu/menu';
import type { ITooltipWrapperRef } from './TooltipButtonWrapper';
import { ICommandService, LocaleService, useDependency } from '@univerjs/core';
import { MoreDownSingle } from '@univerjs/icons';
import clsx from 'clsx';
import React, { forwardRef, useMemo } from 'react';
import { isObservable, Observable } from 'rxjs';
import { ComponentManager } from '../../../common/component-manager';
import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { useObservable } from '../../../components/hooks/observable';
import { Menu } from '../../../components/menu/desktop/Menu';
import { ILayoutService } from '../../../services/layout/layout.service';
import { MenuItemType } from '../../../services/menu/menu';
import { ToolbarButton } from './Button/ToolbarButton';
import { useToolbarItemStatus } from './hook';
import styles from './index.module.less';
import { DropdownWrapper, TooltipWrapper } from './TooltipButtonWrapper';

export const ToolbarItem = forwardRef<ITooltipWrapperRef, IDisplayMenuItem<IMenuItem> & { align?: IDropdownLegacyProps['align'] }>((props, ref) => {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const layoutService = useDependency(ILayoutService);
    const componentManager = useDependency(ComponentManager);

    const { value, hidden, disabled, activated } = useToolbarItemStatus(props);

    const executeCommand = (commandId: string, params?: Record<string, unknown>) => {
        layoutService.focus();
        commandService.executeCommand(commandId, params);
    };

    const { tooltip, shortcut, icon, title, label, id, commandId } = props;

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
        const selectionsCommandId = (props as IDisplayMenuItem<IMenuSelectorItem>).selectionsCommandId;
        const bId = commandId ?? id;
        const sId = selectionsCommandId ?? commandId ?? id;

        function handleSelect(option: IValueOption) {
            if (disabled) return;

            let commandId = sId;
            if (option.id) {
                commandId = option.id;
            }

            executeCommand(commandId, { value: option.value });
        }

        function handleSelectionsValueChange(value: string | number) {
            if (disabled) return;
            executeCommand(sId, { value });
        }

        function handleClick() {
            if (disabled) return;

            if (menuType === MenuItemType.BUTTON_SELECTOR) {
                executeCommand(bId, { value });
            }
        }

        if (menuType === MenuItemType.BUTTON_SELECTOR) {
            return (
                <div
                    className={clsx(styles.toolbarItemSelectButton, `
                      univer-group univer-h-6 univer-pr-5 univer-transition-colors
                      hover:univer-bg-gray-100
                    `, {
                        'univer-pointer-events-none univer-cursor-not-allowed univer-text-gray-200': disabled,
                    })}
                    data-disabled={disabled}
                >
                    <div
                        className={clsx(styles.toolbarItemSelectButtonLabel, `
                          univer-transition-colors
                          hover:univer-bg-gray-200
                        `, {
                            'univer-bg-gray-200': activated,
                            'univer-bg-gray-50': activated && disabled,
                        })}
                        onClick={handleClick}
                    >
                        <CustomLabel
                            icon={iconToDisplay}
                            title={title!}
                            value={value}
                            label={label}
                            onChange={handleSelectionsValueChange}
                        />
                    </div>

                    <DropdownWrapper
                        disabled={disabled}
                        offset={{ x: -24 }}
                        overlay={(
                            <Menu
                                overViewport="scroll"
                                menuType={id}
                                options={options}
                                onOptionSelect={handleSelect}
                                value={value}
                            />
                        )}
                    >
                        <div
                            className={clsx(`
                              univer-absolute univer-right-0 univer-top-0 univer-box-border text-gray-400 univer-flex
                              univer-h-6 univer-w-5 univer-items-center univer-justify-center univer-transition-colors
                              hover:univer-bg-gray-200
                            `, {
                                'univer-pointer-events-none univer-cursor-not-allowed univer-text-gray-400': disabled,
                                'univer-bg-gray-200': activated,
                                'univer-bg-gray-50': activated && disabled,
                            })}
                            data-disabled={disabled}
                        >
                            <MoreDownSingle className="univer-text-gray-400" />
                        </div>
                    </DropdownWrapper>
                </div>
            );
        } else {
            return (
                <DropdownWrapper
                    disabled={disabled}
                    overlay={(
                        <Menu
                            overViewport="scroll"
                            menuType={id}
                            options={options}
                            onOptionSelect={handleSelect}
                            value={value}
                        />
                    )}
                >
                    <div
                        className={clsx(styles.toolbarItemSelect, {
                            'univer-pointer-events-none univer-cursor-not-allowed univer-text-gray-200': disabled,
                            [styles.toolbarItemSelectActivated]: activated,
                        })}
                    >
                        <CustomLabel
                            icon={iconToDisplay}
                            title={title!}
                            value={value}
                            label={label}
                            onChange={handleSelectionsValueChange}
                        />
                        <div
                            className={clsx(styles.toolbarItemSelectArrow, {
                                'univer-pointer-events-none univer-cursor-not-allowed univer-text-gray-200': disabled,
                            })}
                        >
                            <MoreDownSingle className="univer-text-gray-400" />
                        </div>
                    </div>
                </DropdownWrapper>
            );
        }
    }

    function renderButtonType() {
        const isCustomComponent = componentManager.get(typeof label === 'string' ? label : label?.name ?? '');

        return (
            <span>
                <ToolbarButton
                    noIcon={!icon}
                    active={activated}
                    disabled={disabled}
                    onClick={() => executeCommand(props.commandId ?? props.id)}
                    onDoubleClick={() => props.subId && executeCommand(props.subId)}
                >
                    {isCustomComponent
                        ? (
                            <CustomLabel title={title!} value={value} label={label} />
                        )
                        : (
                            icon ? <CustomLabel icon={icon} /> : <CustomLabel title={title!} />
                        )}
                </ToolbarButton>
            </span>
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

    return !hidden && (
        <TooltipWrapper
            ref={ref}
            title={tooltipTitle}
            placement="bottom"
        >
            {renderItem()}
        </TooltipWrapper>
    );
});

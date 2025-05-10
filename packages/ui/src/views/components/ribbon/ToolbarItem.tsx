/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IDisplayMenuItem, IMenuItem, IMenuSelectorItem, IValueOption } from '../../../services/menu/menu';
import type { ITooltipWrapperRef } from './TooltipButtonWrapper';
import { ICommandService, LocaleService } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { MoreDownSingle } from '@univerjs/icons';
import { forwardRef, useMemo } from 'react';
import { isObservable, Observable } from 'rxjs';
import { ComponentManager } from '../../../common/component-manager';
import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { ILayoutService } from '../../../services/layout/layout.service';
import { MenuItemType } from '../../../services/menu/menu';
import { useDependency, useObservable } from '../../../utils/di';
import { ToolbarButton } from './Button/ToolbarButton';
import { useToolbarItemStatus } from './hook';
import { DropdownMenuWrapper, TooltipWrapper } from './TooltipButtonWrapper';

export const ToolbarItem = forwardRef<ITooltipWrapperRef, IDisplayMenuItem<IMenuItem>>((props, ref) => {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const layoutService = useDependency(ILayoutService);
    const componentManager = useDependency(ComponentManager);

    const { value, hidden, disabled, activated } = useToolbarItemStatus(props);

    const executeCommand = (commandId: string, params?: Record<string, unknown>) => {
        layoutService.focus();
        commandService.executeCommand(commandId, params);
    };

    const { tooltip, shortcut, icon, title, label, id, commandId, type, slot } = props;

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
                    className={clsx(`
                      univer-group univer-relative univer-flex univer-h-6 univer-cursor-pointer univer-items-center
                      univer-rounded univer-pr-5 univer-text-sm univer-transition-colors univer-animate-in
                      univer-fade-in
                      dark:hover:univer-bg-gray-700
                      hover:univer-bg-gray-100
                    `, {
                        'univer-text-gray-900 dark:univer-text-white': !disabled,
                        'univer-pointer-events-none univer-cursor-not-allowed univer-text-gray-300 dark:univer-text-gray-600': disabled,
                    })}
                    data-disabled={disabled}
                >
                    <div
                        className={clsx(`
                          univer-relative univer-z-[1] univer-flex univer-h-full univer-items-center univer-rounded-l
                          univer-px-1 univer-transition-colors
                          dark:hover:univer-bg-gray-600
                          hover:univer-bg-gray-200
                        `, {
                            'univer-bg-gray-200 dark:univer-bg-gray-500': activated,
                            'univer-bg-gray-100': activated && disabled,
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

                    <DropdownMenuWrapper
                        menuId={id}
                        slot={slot}
                        value={value}
                        options={options}
                        disabled={disabled}
                        onOptionSelect={handleSelect}
                    >
                        <div
                            className={clsx(`
                              univer-absolute univer-right-0 univer-top-0 univer-box-border univer-flex univer-h-6
                              univer-w-5 univer-items-center univer-justify-center univer-rounded-r
                              univer-transition-colors
                              dark:hover:univer-bg-gray-600
                              hover:univer-bg-gray-200
                            `, {
                                'univer-pointer-events-none univer-cursor-not-allowed univer-text-gray-300 dark:univer-text-gray-600': disabled,
                                'univer-bg-gray-200 dark:univer-bg-gray-500': activated,
                                'univer-bg-gray-100': activated && disabled,
                            })}
                            data-disabled={disabled}
                        >
                            <MoreDownSingle />
                        </div>
                    </DropdownMenuWrapper>
                </div>
            );
        } else {
            return (
                <DropdownMenuWrapper
                    menuId={id}
                    slot={slot}
                    value={value}
                    options={options}
                    disabled={disabled}
                    onOptionSelect={handleSelect}
                >
                    <div
                        className={clsx(`
                          univer-relative univer-flex univer-h-6 univer-cursor-pointer univer-items-center univer-gap-2
                          univer-whitespace-nowrap univer-rounded univer-px-1 univer-transition-colors univer-animate-in
                          univer-fade-in
                          dark:hover:univer-bg-gray-700
                          hover:univer-bg-gray-100
                        `, {
                            'univer-text-gray-900 dark:univer-text-white': !disabled,
                            'univer-pointer-events-none univer-cursor-not-allowed univer-text-gray-300 dark:univer-text-gray-600': disabled,
                            'univer-bg-gray-200': activated,
                            'univer-bg-gray-100': activated && disabled,
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
                            className={clsx('univer-flex univer-h-full univer-items-center', {
                                'univer-pointer-events-none univer-cursor-not-allowed univer-text-gray-300 dark:univer-text-gray-600': disabled,
                            })}
                        >
                            <MoreDownSingle />
                        </div>
                    </div>
                </DropdownMenuWrapper>
            );
        }
    }

    function renderButtonType() {
        const isCustomComponent = componentManager.get(typeof label === 'string' ? label : label?.name ?? '');

        return (
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
        );
    }

    function renderItem() {
        switch (type) {
            case MenuItemType.BUTTON_SELECTOR:
            case MenuItemType.SELECTOR:
            case MenuItemType.SUBITEMS:
                return renderSelectorType(type);
            case MenuItemType.BUTTON:
            default:
                return renderButtonType();
        }
    }

    return !hidden && (
        tooltipTitle
            ? (
                <TooltipWrapper
                    ref={ref}
                    title={tooltipTitle}
                    placement="bottom"
                >
                    {renderItem()}
                </TooltipWrapper>
            )
            : renderItem()
    );
});

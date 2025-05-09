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

import type { IDropdownMenuProps, IDropdownProps, ITooltipProps } from '@univerjs/design';
import type { ReactNode } from 'react';
import type { IMenuItem, IValueOption } from '../../../services/menu/menu';
import { clsx, Dropdown, DropdownMenu, Tooltip } from '@univerjs/design';
import { CheckMarkSingle } from '@univerjs/icons';
import { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { combineLatest, of } from 'rxjs';
import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { useDependency } from '../../../utils/di';

const TooltipWrapperContext = createContext({
    dropdownVisible: false,
    setDropdownVisible: (_visible: boolean) => {},
});

export interface ITooltipWrapperRef {
    el: HTMLSpanElement | null;
}

export const TooltipWrapper = forwardRef<ITooltipWrapperRef, ITooltipProps>((props, ref) => {
    const { children, ...tooltipProps } = props;
    const spanRef = useRef<HTMLSpanElement>(null);

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    function handleChangeTooltipVisible(visible: boolean) {
        if (dropdownVisible) {
            setTooltipVisible(false);
        } else {
            setTooltipVisible(visible);
        }
    }

    function handleChangeDropdownVisible(visible: boolean) {
        setDropdownVisible(visible);

        setTooltipVisible(false);
    }

    const contextValue = useMemo(() => ({
        dropdownVisible,
        setDropdownVisible: handleChangeDropdownVisible,
    }), [dropdownVisible]);

    useImperativeHandle(ref, () => ({
        el: spanRef.current,
    }));

    return (
        <Tooltip
            {...tooltipProps}
            visible={tooltipVisible}
            onVisibleChange={handleChangeTooltipVisible}
        >
            <span ref={spanRef}>
                <TooltipWrapperContext.Provider value={contextValue}>
                    {children}
                </TooltipWrapperContext.Provider>
            </span>
        </Tooltip>
    );
});

export function DropdownWrapper(props: Omit<Partial<IDropdownProps>, 'overlay'> & { overlay: ReactNode; align?: 'start' | 'end' | 'center' }) {
    const { children, overlay, disabled, align = 'start' } = props;
    const { setDropdownVisible } = useContext(TooltipWrapperContext);

    function handleVisibleChange(visible: boolean) {
        setDropdownVisible(visible);
    }

    return (
        <Dropdown
            align={align}
            overlay={(
                <div className="univer-grid univer-gap-2">
                    {overlay}
                </div>
            )}
            disabled={disabled}
            onOpenChange={handleVisibleChange}
        >
            <div className="univer-h-full" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </Dropdown>
    );
}

function Label({ icon, value, option, onOptionSelect }: {
    icon?: IMenuItem['icon'];
    value?: string | number;
    option: IValueOption;
    onOptionSelect?: (option: IValueOption) => void;
}) {
    const onChange = (v: string | number) => {
        onOptionSelect?.({ value: v, label: option?.label, commandId: option?.commandId });
    };

    const hasCheckMark = typeof option.label === 'string' || (typeof option.label === 'object' && option.label?.selectable !== false);

    return (
        <div
            className={clsx('univer-relative univer-flex univer-items-center univer-gap-2', {
                'univer-pl-6': hasCheckMark,
            })}
        >
            {hasCheckMark && String(value) === String(option.value) && (
                <CheckMarkSingle
                    className="univer-absolute univer-left-1 univer-top-0.5 univer-text-primary-600"
                />
            )}
            <CustomLabel
                className="univer-text-sm"
                icon={icon}
                value$={option.value$}
                value={option.value}
                label={option.label}
                onChange={onChange}
            />
        </div>
    );
}

export function DropdownMenuWrapper({
    menuId,
    slot,
    value,
    options,
    children,
    disabled,
    onOptionSelect,
}: {
    menuId: string;
    slot?: boolean;
    value?: string | number;
    options: IValueOption[];
    children: ReactNode;
    disabled?: boolean;
    onOptionSelect: (option: IValueOption) => void;
}) {
    const { setDropdownVisible } = useContext(TooltipWrapperContext);

    const menuManagerService = useDependency(IMenuManagerService);
    const [hiddenStates, setHiddenStates] = useState<Record<string, boolean>>({});

    const menuItems = useMemo(() => {
        return menuId ? menuManagerService.getMenuByPositionKey(menuId) : [];
    }, [menuId]);

    const filteredMenuItems = useMemo(() => {
        return menuItems.filter((item) => {
            if (!item.children) return item;

            const itemKey = item.key?.toString() || '';
            return !hiddenStates[itemKey];
        });
    }, [menuItems, hiddenStates]);

    function handleVisibleChange(visible: boolean) {
        setDropdownVisible(visible);
    }

    useEffect(() => {
        const subscriptions = menuItems.map((item) => {
            if (!item.children) return null;

            const hiddenObservables = item.children.map((subItem) => subItem.item?.hidden$ ?? of(false));

            return combineLatest(hiddenObservables).subscribe((hiddenValues) => {
                const isAllHidden = hiddenValues.every((hidden) => hidden === true);
                setHiddenStates((prev) => ({
                    ...prev,
                    [item.key]: isAllHidden,
                }));
            });
        });

        return () => {
            subscriptions.forEach((sub) => sub?.unsubscribe());
            setHiddenStates({});
        };
    }, [menuItems]);

    if (slot) {
        return (
            <DropdownWrapper
                disabled={disabled}
                overlay={options.map((option, index) => (
                    <Label
                        key={index}
                        value={value}
                        option={option}
                        onOptionSelect={onOptionSelect}
                    />
                ))}
            >
                {children}
            </DropdownWrapper>
        );
    }

    // options menu
    if (options?.length) {
        const items: IDropdownMenuProps['items'] = options.map((option) => ({
            type: 'item',
            className: clsx({
                'focus:univer-bg-white': typeof option.label !== 'string' && option.label?.hoverable === false,
            }),
            children: (
                <Label
                    icon={option.icon}
                    value={value}
                    option={option}
                    onOptionSelect={onOptionSelect}
                />
            ),
            disabled: option.disabled,
            onSelect: () => {
                if (typeof option.value === 'undefined') return;

                onOptionSelect?.({
                    ...option,
                });
            },
        }));

        for (const menuItem of filteredMenuItems) {
            if (!menuItem.item) continue;

            const { title, id, commandId, icon } = menuItem.item;

            if (!title) {
                throw new Error('Menu item title is required');
            }

            items.push({
                type: 'item',
                children: (
                    <Label
                        icon={icon}
                        value={value}
                        option={{
                            label: {
                                name: title,
                                selectable: false,
                            },
                        }}
                    />
                ),
                onSelect: () => {
                    onOptionSelect?.({
                        commandId,
                        id,
                    });
                },
            });
        }

        return (
            <DropdownMenu
                align="start"
                items={items}
                disabled={disabled}
                onOpenChange={handleVisibleChange}
            >
                {children}
            </DropdownMenu>
        );
    } else {
        const items: IDropdownMenuProps['items'] = [];

        for (const menuItem of filteredMenuItems) {
            if (menuItem.item) {
                const { title, id, commandId, icon } = menuItem.item;

                if (!title) {
                    throw new Error('Menu item title is required');
                }

                items.push({
                    type: 'item',
                    children: (
                        <Label
                            icon={icon}
                            value={value}
                            option={{
                                label: {
                                    name: title,
                                    selectable: false,
                                },
                            }}
                        />
                    ),
                    onSelect: () => {
                        onOptionSelect?.({
                            commandId,
                            id,
                        });
                    },
                });
            } else if (menuItem.children?.length) {
            // sub menu
            }
        }

        return (
            <DropdownMenu
                align="start"
                items={items}
                disabled={disabled}
                onOpenChange={handleVisibleChange}
            >
                {children}
            </DropdownMenu>
        );
    }
}

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
import type { Subscription } from 'rxjs';
import type { IMenuItem, IValueOption } from '../../../services/menu/menu';
import { clsx, Dropdown, DropdownMenu, Tooltip } from '@univerjs/design';
import { CheckMarkIcon } from '@univerjs/icons';
import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { combineLatest, of } from 'rxjs';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { useDependency } from '../../../utils/di';
import { keepInteractionInsideSameEmbedBoundary } from '../../../utils/embed-boundary';
import { CustomLabel } from '../../custom-label/CustomLabel';

const TooltipWrapperContext = createContext({
    dropdownVisible: false,
    setDropdownVisible: (_visible: boolean) => {},
});

const ToolbarDropdownContext = createContext<{
    openDropdownKey: string | null;
    setOpenDropdownKey: (key: string | null) => void;
} | null>(null);

export interface ITooltipWrapperRef {
    el: HTMLSpanElement | null;
}

export function ToolbarDropdownProvider(props: { children: ReactNode }) {
    const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
    const contextValue = useMemo(() => ({
        openDropdownKey,
        setOpenDropdownKey,
    }), [openDropdownKey]);

    return (
        <ToolbarDropdownContext.Provider value={contextValue}>
            {props.children}
        </ToolbarDropdownContext.Provider>
    );
}

export const TooltipWrapper = forwardRef<ITooltipWrapperRef, ITooltipProps & { dropdownKey?: string }>((props, ref) => {
    const { children, dropdownKey, ...tooltipProps } = props;

    const spanRef = useRef<HTMLSpanElement>(null);

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [localDropdownVisible, setLocalDropdownVisible] = useState(false);
    const toolbarDropdownContext = useContext(ToolbarDropdownContext);
    const dropdownVisible = dropdownKey && toolbarDropdownContext
        ? toolbarDropdownContext.openDropdownKey === dropdownKey
        : localDropdownVisible;

    function handleChangeTooltipVisible(visible: boolean) {
        if (dropdownVisible) {
            setTooltipVisible(false);
        } else {
            setTooltipVisible(visible);
        }
    }

    const handleChangeDropdownVisible = useCallback((visible: boolean) => {
        if (dropdownKey && toolbarDropdownContext) {
            toolbarDropdownContext.setOpenDropdownKey(visible ? dropdownKey : null);
        } else {
            setLocalDropdownVisible(visible);
        }

        setTooltipVisible(false);
    }, [dropdownKey, toolbarDropdownContext]);

    const contextValue = useMemo(() => ({
        dropdownVisible,
        setDropdownVisible: handleChangeDropdownVisible,
    }), [dropdownVisible, handleChangeDropdownVisible]);

    useImperativeHandle(ref, () => ({
        el: spanRef.current,
    }));

    const content = (
        <span ref={spanRef}>
            <TooltipWrapperContext.Provider value={contextValue}>
                {children}
            </TooltipWrapperContext.Provider>
        </span>
    );

    return tooltipProps.title
        ? (
            <Tooltip
                visible={tooltipVisible}
                onVisibleChange={handleChangeTooltipVisible}
                {...tooltipProps}
            >
                {content}
            </Tooltip>
        )
        : content;
});

export function DropdownWrapper(props: Omit<Partial<IDropdownProps>, 'overlay'> & { overlay: ReactNode; align?: 'start' | 'end' | 'center' }) {
    const { children, overlay, disabled, align = 'start' } = props;
    const { dropdownVisible, setDropdownVisible } = useContext(TooltipWrapperContext);

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
            open={dropdownVisible}
            onOpenChange={handleVisibleChange}
        >
            <div className="univer-h-full" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </Dropdown>
    );
}

export function DropdownMenuLabel({ icon, value, option, onOptionSelect }: {
    icon?: IMenuItem['icon'];
    value?: string | number;
    option: IValueOption;
    onOptionSelect?: (option: IValueOption) => void;
}) {
    const onChange = (v: string | number) => {
        onOptionSelect?.({ value: v, label: option?.label, commandId: option?.commandId });
    };

    const hasCheckMark = typeof option.label === 'string' || (typeof option.label === 'object' && option.label?.selectable !== false);
    const selected = hasCheckMark && String(value) === String(option.value);

    return (
        <div className="univer-flex univer-w-full univer-items-center univer-justify-between univer-gap-2">
            <div className="univer-flex univer-min-w-0 univer-items-center univer-gap-2">
                <CustomLabel
                    className="univer-text-sm"
                    icon={icon}
                    value$={option.value$}
                    value={option.value}
                    label={option.label}
                    onChange={onChange}
                />
            </div>
            {hasCheckMark && (
                <span className="univer-ml-auto univer-flex univer-w-4 univer-flex-shrink-0 univer-justify-end">
                    {selected && (
                        <CheckMarkIcon className="univer-text-primary-600" />
                    )}
                </span>
            )}
        </div>
    );
}

function getOptionKey(option: IValueOption) {
    return String(option.id ?? option.commandId ?? option.value ?? (typeof option.label === 'string' ? option.label : option.label?.name));
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
    const { dropdownVisible, setDropdownVisible } = useContext(TooltipWrapperContext);

    const menuManagerService = useDependency(IMenuManagerService);
    const [hiddenStates, setHiddenStates] = useState<Record<string, boolean>>({});
    const [_, setMenuVersion] = useState(0);

    useEffect(() => {
        const subscription = menuManagerService.menuChanged$.subscribe(() => {
            setMenuVersion((version) => version + 1);
        });

        return () => subscription.unsubscribe();
    }, [menuManagerService]);

    const menuItems = useMemo(() => {
        return menuId ? menuManagerService.getMenuByPositionKey(menuId) : [];
    }, [menuId, menuManagerService]);

    const filteredMenuItems = useMemo(() => {
        return menuItems.filter((item) => {
            if (!item.children) {
                return !hiddenStates[item.key];
            }

            const itemKey = item.key?.toString() || '';
            return !hiddenStates[itemKey];
        });
    }, [menuItems, hiddenStates]);

    function handleVisibleChange(visible: boolean) {
        setDropdownVisible(visible);
    }

    function handleEmbedBoundaryFocusOutside(event: { currentTarget: EventTarget | null; target: EventTarget | null; preventDefault: () => void }) {
        keepInteractionInsideSameEmbedBoundary(event);
    }

    function handleOptionSelect(option: IValueOption) {
        onOptionSelect(option);
        setDropdownVisible(false);
    }

    useEffect(() => {
        const subscriptions: Subscription[] = [];

        menuItems.forEach((item) => {
            if (!item.children) {
                if (item.item?.hidden$) {
                    const sub = item.item.hidden$.subscribe((hidden) => {
                        setHiddenStates((prev) => ({
                            ...prev,
                            [item.key]: hidden,
                        }));
                    });
                    subscriptions.push(sub);
                }
            } else {
                const hiddenObservables = item.children.map((subItem) => subItem.item?.hidden$ ?? of(false));

                const sub = combineLatest(hiddenObservables).subscribe((hiddenValues) => {
                    const isAllHidden = hiddenValues.every((hidden) => hidden === true);
                    setHiddenStates((prev) => ({
                        ...prev,
                        [item.key]: isAllHidden,
                    }));
                });

                subscriptions.push(sub);
            }
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
                overlay={options.map((option) => (
                    <DropdownMenuLabel
                        key={getOptionKey(option)}
                        value={value}
                        option={option}
                        onOptionSelect={handleOptionSelect}
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
                <DropdownMenuLabel
                    icon={option.icon}
                    value={value}
                    option={option}
                    onOptionSelect={handleOptionSelect}
                />
            ),
            disabled: option.disabled,
            onSelect: () => {
                if (typeof option.value === 'undefined') return;

                handleOptionSelect({
                    ...option,
                });
            },
        }));

        if (filteredMenuItems.length) {
            items.push({
                type: 'separator',
            });
        }

        for (const menuItem of filteredMenuItems) {
            if (!menuItem.item) continue;

            const { title, id, commandId, icon } = menuItem.item;

            if (!title) {
                throw new Error('Menu item title is required');
            }

            items.push({
                type: 'item',
                children: (
                    <DropdownMenuLabel
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
                    handleOptionSelect({
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
                open={dropdownVisible}
                onOpenChange={handleVisibleChange}
                onFocusOutside={handleEmbedBoundaryFocusOutside}
                onInteractOutside={handleEmbedBoundaryFocusOutside}
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
                        <DropdownMenuLabel
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
                        handleOptionSelect({
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
                open={dropdownVisible}
                onOpenChange={handleVisibleChange}
                onFocusOutside={handleEmbedBoundaryFocusOutside}
                onInteractOutside={handleEmbedBoundaryFocusOutside}
            >
                {children}
            </DropdownMenu>
        );
    }
}

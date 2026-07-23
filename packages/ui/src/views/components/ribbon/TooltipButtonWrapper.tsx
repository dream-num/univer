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
import { combineLatest, map, merge, of, scan, startWith } from 'rxjs';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { useDependency, useObservable } from '../../../utils/di';
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
    const triggerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (disabled) {
            setDropdownVisible(false);
        }
    }, [disabled, setDropdownVisible]);

    useEffect(() => {
        const ownerDocument = triggerRef.current?.ownerDocument;
        if (!dropdownVisible || !ownerDocument) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null;
            if (!target || triggerRef.current?.contains(target) || overlayRef.current?.contains(target)) return;

            setDropdownVisible(false);
        };

        ownerDocument.addEventListener('pointerdown', handlePointerDown, true);
        return () => ownerDocument.removeEventListener('pointerdown', handlePointerDown, true);
    }, [dropdownVisible, setDropdownVisible]);

    function handleVisibleChange(visible: boolean) {
        setDropdownVisible(visible);
    }

    return (
        <Dropdown
            align={align}
            overlay={(
                <div ref={overlayRef} className="univer-grid univer-gap-2">
                    {overlay}
                </div>
            )}
            disabled={disabled}
            open={dropdownVisible}
            onOpenChange={handleVisibleChange}
        >
            <div ref={triggerRef} className="univer-h-full" onClick={(e) => e.stopPropagation()}>
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
        onOptionSelect?.({ ...option, value: v });
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

    useEffect(() => {
        if (disabled) {
            setDropdownVisible(false);
        }
    }, [disabled, setDropdownVisible]);

    const menuManagerService = useDependency(IMenuManagerService);
    const resolveMenuItems = () => menuId ? menuManagerService.getMenuByPositionKey(menuId) : [];
    const menuItems = useObservable(
        () => menuManagerService.menuChanged$.pipe(map(resolveMenuItems), startWith(resolveMenuItems())),
        resolveMenuItems(),
        false,
        [menuId, menuManagerService]
    );
    const hiddenStates$ = useMemo(() => {
        const itemStates = menuItems.map((item) => {
            const hidden$ = item.children
                ? combineLatest(item.children.map((subItem) => subItem.item?.hidden$ ?? of(false))).pipe(
                    map((hiddenValues) => hiddenValues.every(Boolean))
                )
                : item.item?.hidden$ ?? of(false);
            return hidden$.pipe(map((hidden) => [String(item.key), hidden] as const));
        });
        return itemStates.length
            ? merge(...itemStates).pipe(
                scan((states, [key, hidden]) => ({ ...states, [key]: hidden }), {} as Record<string, boolean>),
                startWith({})
            )
            : of({});
    }, [menuItems]);
    const hiddenStates = useObservable<Record<string, boolean>>(hiddenStates$, {});

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
        const isSingleCustomPanel = options.length === 1 && typeof options[0].label === 'object' && options[0].label?.hoverable === false;
        const items: IDropdownMenuProps['items'] = options.map((option) => ({
            type: 'item',
            className: clsx({
                'focus:univer-bg-white': typeof option.label !== 'string' && option.label?.hoverable === false,
                '!univer-p-0': typeof option.label !== 'string' && option.label?.hoverable === false,
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
                className={clsx({ '!univer-p-0': isSingleCustomPanel })}
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

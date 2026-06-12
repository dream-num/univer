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

import type { IDisplayMenuItem, IMenuItem, IValueOption, MenuItemDefaultValueType } from '../../../services/menu/menu';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import type { TinyMenuLayoutVariant, TinyMenuSizeVariant } from './DesignTinyMenuGroup';
import { convertObservableToBehaviorSubject, LocaleService } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { useEffect, useMemo, useState } from 'react';
import { combineLatest, of } from 'rxjs';
import { ComponentManager } from '../../../common';
import { useDependency, useObservable } from '../../../utils/di';
import { DesignTinyMenuGroup } from './DesignTinyMenuGroup';

interface IUIQuickMenuGroupProps {
    item: IMenuSchema;
    activeItemIds?: string[];
    hiddenItemIds?: string[];
    hoverSuppressed?: boolean;
    columns?: number;
    sizeVariant?: TinyMenuSizeVariant;
    layoutVariant?: TinyMenuLayoutVariant;
    onOptionSelect?: (option: IValueOption) => void;
}

interface IUIQuickTileMenuItemProps {
    menuSchema: IMenuSchema;
    activeItemIds?: string[];
    onOptionSelect?: (option: IValueOption) => void;
}

const EMPTY_HIDDEN_ITEM_IDS: string[] = [];

type TinyMenuDisplayItem = IDisplayMenuItem<IMenuItem> & {
    value?: MenuItemDefaultValueType;
};

export function resolveMenuItemActiveState(itemId: string | undefined, observableActive: boolean, activeItemIds?: string[]): boolean {
    if (activeItemIds) {
        return Boolean(itemId && activeItemIds.includes(itemId));
    }

    return observableActive;
}

function getTinyMenuChildStateKey(child: IMenuSchema): string {
    return child.item?.id ?? child.key;
}

export function getVisibleTinyMenuChildren(children: IMenuSchema[], hiddenItemKeys: string[]): IMenuSchema[] {
    const hiddenSet = new Set(hiddenItemKeys);
    return children.filter((child) => !hiddenSet.has(getTinyMenuChildStateKey(child)));
}

function QuickTileMenuItem(props: IUIQuickTileMenuItemProps) {
    const { menuSchema, activeItemIds, onOptionSelect } = props;
    const componentManager = useDependency(ComponentManager);
    const localeService = useDependency(LocaleService);
    const menuItem = menuSchema.item as TinyMenuDisplayItem | undefined;
    const disabled = useObservable<boolean>(menuItem?.disabled$, false);
    const hidden = useObservable<boolean>(menuItem?.hidden$, false);
    const activated = useObservable<boolean>(menuItem?.activated$, false);

    if (!menuItem || hidden) {
        return null;
    }

    const Icon = menuItem.icon ? componentManager.get(menuItem.icon as string) : null;

    return (
        <button
            type="button"
            className={clsx(
                `
                  univer-relative univer-box-border univer-flex univer-size-12 univer-w-full univer-appearance-none
                  univer-flex-col univer-items-center univer-justify-center univer-gap-0.5 univer-rounded-lg
                  univer-border-none univer-bg-white univer-p-0 univer-font-medium univer-text-gray-700
                  univer-outline-none univer-transition-all
                  focus-visible:univer-ring-2 focus-visible:univer-ring-primary-600 focus-visible:univer-ring-offset-0
                  dark:!univer-bg-gray-700 dark:!univer-text-gray-100
                `,
                disabled
                    ? 'univer-cursor-not-allowed univer-opacity-60'
                    : `
                      univer-cursor-pointer
                      hover:univer-bg-gray-50
                      dark:hover:!univer-bg-gray-600
                    `,
                resolveMenuItemActiveState(menuItem.id, activated, activeItemIds) && `
                  univer-bg-primary-50 univer-text-primary-700 univer-ring-1 univer-ring-primary-600
                  dark:!univer-bg-primary-900 dark:!univer-text-primary-100
                `
            )}
            disabled={disabled}
            onClick={() => {
                if (disabled) {
                    return;
                }

                onOptionSelect?.({
                    label: menuItem.id ?? menuSchema.key,
                    commandId: menuItem.commandId,
                    id: menuItem.id,
                    params: menuItem.params,
                    value: menuItem.value,
                    tooltip: menuItem.tooltip && localeService.t(menuItem.tooltip),
                });
            }}
        >
            {Icon && (
                <Icon
                    className="univer-text-base"
                    extend={{ colorChannel1: 'var(--univer-primary-600)' }}
                />
            )}
            <span
                className="univer-break-words univer-text-center univer-text-xs univer-leading-4"
            >
                {menuItem.title ? localeService.t(menuItem.title) : menuSchema.key}
            </span>
        </button>
    );
}

export function UITinyMenuGroup(props: IUIQuickMenuGroupProps) {
    const { item, activeItemIds, hiddenItemIds = EMPTY_HIDDEN_ITEM_IDS, hoverSuppressed, columns, sizeVariant = 'default', layoutVariant = 'default', onOptionSelect } = props;
    const [activeItems, setActiveItems] = useState<string[]>([]);
    const [hiddenItems, setHiddenItems] = useState<string[]>([]);
    const componentManager = useDependency(ComponentManager);
    const localeService = useDependency(LocaleService);

    useEffect(() => {
        if (!item.children) return;
        const observables = item.children.map((child) => convertObservableToBehaviorSubject(child.item?.activated$ ?? of(false), false));
        const subscription = combineLatest(observables).subscribe((activedArr) => {
            const actived = activedArr
                .map((actived, index) => ({ actived, item: getTinyMenuChildStateKey(item.children![index]) }))
                .filter((actived) => actived.actived);
            if (actived.length === 0) {
                setActiveItems([]);
            } else {
                setActiveItems(actived.map((actived) => actived.item));
            }
        });

        return () => {
            subscription.unsubscribe();
            observables.forEach((observable) => {
                observable.complete();
            });
        };
    }, [item]);

    useEffect(() => {
        if (!item.children) return;
        const observables = item.children.map((child) => convertObservableToBehaviorSubject(child.item?.hidden$ ?? of(false), false));
        const subscription = combineLatest(observables).subscribe((hiddenArr) => {
            const hidden = hiddenArr
                .map((hidden, index) => ({ hidden, item: getTinyMenuChildStateKey(item.children![index]) }))
                .filter((hidden) => hidden.hidden);
            if (hidden.length === 0) {
                setHiddenItems([]);
            } else {
                setHiddenItems(hidden.map((hidden) => hidden.item));
            }
        });

        return () => {
            subscription.unsubscribe();
            observables.forEach((observable) => {
                observable.complete();
            });
        };
    }, [item]);

    const visibleChildren = useMemo(
        () => getVisibleTinyMenuChildren(item.children ?? [], [...hiddenItems, ...hiddenItemIds]),
        [hiddenItemIds, hiddenItems, item.children]
    );

    if (!item.children) return null;

    const items = visibleChildren
        .map((child) => {
            const Icon = child.item?.icon ? componentManager.get(child.item.icon as string) : undefined;

            if (!Icon) {
                return null;
            }

            return {
                key: child.key,
                onClick: () => {
                    onOptionSelect?.({
                        label: child.item?.id ?? child.key,
                        commandId: child.item?.commandId,
                        id: child.item?.id,
                        params: child.item?.params,
                        value: (child.item as TinyMenuDisplayItem | undefined)?.value,
                        tooltip: child.item?.tooltip && localeService.t(child.item?.tooltip),
                    });
                },
                className: '',
                iconClassName: child.item?.icon === 'TextTypeIcon'
                    ? (sizeVariant === 'paragraph-t' ? '!univer-size-4' : '!univer-size-3.5')
                    : undefined,
                Icon,
                active: resolveMenuItemActiveState(child.item?.id, activeItems.includes(child.item?.id ?? ''), activeItemIds),
                tooltip: child.item?.tooltip ? localeService.t(child.item.tooltip) : undefined,
            };
        })
        .filter((child): child is NonNullable<typeof child> => child != null);

    return (
        <DesignTinyMenuGroup
            columns={columns}
            sizeVariant={sizeVariant}
            layoutVariant={layoutVariant}
            hoverSuppressed={hoverSuppressed}
            items={items}
        />
    );
}

export function UIQuickTileMenuGroup(props: IUIQuickMenuGroupProps) {
    const { item, activeItemIds, hiddenItemIds = EMPTY_HIDDEN_ITEM_IDS, onOptionSelect } = props;

    if (!item.children?.length) {
        return null;
    }

    return (
        <div className="univer-item-center univer-grid univer-grid-cols-3 univer-gap-1.5 univer-py-1">
            {getVisibleTinyMenuChildren(item.children, hiddenItemIds).map((menuSchema) => (
                <QuickTileMenuItem
                    key={menuSchema.key}
                    menuSchema={menuSchema}
                    activeItemIds={activeItemIds}
                    onOptionSelect={onOptionSelect}
                />
            ))}
        </div>
    );
}

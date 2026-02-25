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

import type { IDisplayMenuItem, IMenuItem, IValueOption } from '../../../services/menu/menu';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import { convertObservableToBehaviorSubject, LocaleService } from '@univerjs/core';
import { clsx, TinyMenuGroup as DesignTinyMenuGroup } from '@univerjs/design';
import { useEffect, useState } from 'react';
import { combineLatest, of } from 'rxjs';
import { ComponentManager } from '../../../common';
import { useDependency, useObservable } from '../../../utils/di';

interface IUIQuickMenuGroupProps {
    item: IMenuSchema;
    onOptionSelect?: (option: IValueOption) => void;
}

interface IUIQuickTileMenuItemProps {
    menuSchema: IMenuSchema;
    onOptionSelect?: (option: IValueOption) => void;
}

function QuickTileMenuItem(props: IUIQuickTileMenuItemProps) {
    const { menuSchema, onOptionSelect } = props;
    const componentManager = useDependency(ComponentManager);
    const localeService = useDependency(LocaleService);
    const menuItem = menuSchema.item as IDisplayMenuItem<IMenuItem> | undefined;
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
                  univer-relative univer-box-border univer-flex univer-size-12 univer-appearance-none univer-flex-col
                  univer-items-center univer-justify-center univer-gap-0.5 univer-rounded-lg univer-border-none
                  univer-bg-white univer-p-0 univer-font-medium univer-text-gray-700 univer-outline-none
                  univer-transition-all
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
                activated && `
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
                className="univer-max-w-full univer-break-words univer-text-center univer-text-xs univer-leading-4"
            >
                {menuItem.title ? localeService.t(menuItem.title) : menuSchema.key}
            </span>
        </button>
    );
}

export function UITinyMenuGroup(props: IUIQuickMenuGroupProps) {
    const { item, onOptionSelect } = props;
    const [activeItems, setActiveItems] = useState<string[]>([]);
    const componentManager = useDependency(ComponentManager);
    const localeService = useDependency(LocaleService);

    useEffect(() => {
        if (!item.children) return;
        const observables = item.children.map((child) => convertObservableToBehaviorSubject(child.item?.activated$ ?? of(false), false));
        const subscription = combineLatest(observables).subscribe((activedArr) => {
            const actived = activedArr.map((actived, index) => ({ actived, item: item.children![index].item!.id })).filter((actived) => actived.actived);
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

    if (!item.children) return null;

    return (
        <DesignTinyMenuGroup
            items={item.children.map((child) => ({
                key: child.key,
                onClick: () => {
                    onOptionSelect?.({
                        label: child.item?.id ?? child.key,
                        commandId: child.item?.commandId,
                        id: child.item?.id,
                        tooltip: child.item?.tooltip && localeService.t(child.item?.tooltip),
                    });
                },
                className: '',
                Icon: componentManager.get(child.item!.icon as string)!,
                active: activeItems.includes(child.item?.id ?? ''),
            }))}
        />
    );
}

export function UIQuickTileMenuGroup(props: IUIQuickMenuGroupProps) {
    const { item, onOptionSelect } = props;

    if (!item.children?.length) {
        return null;
    }

    return (
        <div className="univer-flex univer-flex-wrap univer-justify-around univer-gap-1.5 univer-py-1">
            {item.children.map((menuSchema) => (
                <QuickTileMenuItem
                    key={menuSchema.key}
                    menuSchema={menuSchema}
                    onOptionSelect={onOptionSelect}
                />
            ))}
        </div>
    );
}

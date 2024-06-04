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

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Subscription } from 'rxjs';
import { combineLatest, map, Observable } from 'rxjs';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { type IDisplayMenuItem, type IMenuItem, MenuGroup, MenuPosition } from '../../../services/menu/menu';
import { IMenuService } from '../../../services/menu/menu.service';

type MenuPositionWithCustom = MenuPosition | string;

export interface IMenuGroup {
    name: MenuPositionWithCustom;
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
}

export interface IToolbarRenderHookHandler {
    /** The activated category. */
    category: MenuPositionWithCustom;

    /** Update current activate category. */
    setCategory: (position: MenuPositionWithCustom) => void;

    visibleItems: IDisplayMenuItem<IMenuItem>[];

    /** Menu grouped in this category. */
    groups: IMenuGroup[];

    groupsByKey: Record<MenuGroup, Array<IDisplayMenuItem<IMenuItem>>>;
}

/**
 * If your custom toolbar component need to render menu items by their category,
 * you can use this hook to get the toolbar status.
 * @returns toolbar status
 */
export function useToolbarGroups(categories: MenuPositionWithCustom[]): IToolbarRenderHookHandler {
    const menuService = useDependency(IMenuService);
    const [category, setCategory] = useState<MenuPositionWithCustom>(MenuPosition.TOOLBAR_START);
    const [groups, setGroups] = useState<IMenuGroup[]>([]);
    const [visibleItems, setVisibleItems] = useState<IDisplayMenuItem<IMenuItem>[]>([]);

    // Update visible menu items when the active group changes or the visibility of an item (hidden$) changes.
    useEffect(() => {
        const activeItems = groups.find((g) => g.name === category)?.menuItems ?? [];
        const filteredItems$ = combineLatest(
            activeItems.map((item) => item.hidden$ ?? new Observable((observer) => observer.next(false)))
        ).pipe(map((hiddenValues) => activeItems.filter((_, index) => !hiddenValues[index])));

        const s = filteredItems$.subscribe((items) => setVisibleItems(items));
        return () => s.unsubscribe();
    }, [groups, category]);

    // Update menu items when new items get registered or old items get unregistered.
    useEffect(() => {
        const s = menuService.menuChanged$.subscribe(() => {
            const group: IMenuGroup[] = [];
            for (const position of categories) {
                const menuItems = menuService.getMenuItems(position);
                if (menuItems.length) {
                    group.push({ name: position, menuItems });
                }
            }

            setGroups(group);
        });

        return () => s.unsubscribe();
    }, [menuService, category, categories]);

    const groupsByKey = useMemo(() => {
        return groups.find((g) => g.name === category)?.menuItems.reduce(
            (acc, item) => {
                const key = item.group ?? MenuGroup.TOOLBAR_OTHERS;
                if (!acc[key]) {
                    acc[key] = [];
                }

                acc[key].push(item);
                return acc;
            },
            {} as Record<MenuGroup, Array<IDisplayMenuItem<IMenuItem>>>
        ) ?? ({} as Record<MenuGroup, Array<IDisplayMenuItem<IMenuItem>>>);
    }, [groups, category]);

    return {
        setCategory,
        category,
        visibleItems,
        groups,
        groupsByKey,
    };
}

export interface IToolbarItemStatus {
    disabled: boolean;
    // eslint-disable-next-line ts/no-explicit-any
    value: any;
    activated: boolean;
    hidden: boolean;
}

// TODO@wzhudev: maybe we should use `useObservable` here.

/**
 * Subscribe to a menu item's status change and return the latest status.
 * @param menuItem The menu item
 * @returns The menu item's status
 */
export function useToolbarItemStatus(menuItem: IDisplayMenuItem<IMenuItem>): IToolbarItemStatus {
    const { disabled$, hidden$, activated$, value$ } = menuItem;

    // eslint-disable-next-line ts/no-explicit-any
    const [value, setValue] = useState<any>();
    const [disabled, setDisabled] = useState(false);
    const [activated, setActivated] = useState(false);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const subscriptions: Subscription[] = [];

        disabled$ && subscriptions.push(disabled$.subscribe((disabled) => setDisabled(disabled)));
        hidden$ && subscriptions.push(hidden$.subscribe((hidden) => setHidden(hidden)));
        activated$ && subscriptions.push(activated$.subscribe((activated) => setActivated(activated)));
        value$ && subscriptions.push(value$.subscribe((value) => setValue(value)));

        return () => subscriptions.forEach((subscription) => subscription.unsubscribe());
    }, [activated$, disabled$, hidden$, value$]);

    return { disabled, value, activated, hidden };
}

export function useToolbarCollapseObserver(visibleItems: IToolbarRenderHookHandler['visibleItems']) {
    const toolbarItemRefs = useRef<Record<string, {
        el: HTMLDivElement;
        key: string;
    }>>({});

    const toolbarRef = useRef<HTMLDivElement>(null);
    const [collapsedId, setCollapsedId] = useState<string[]>([]);

    // Deal with toolbar collapsing.
    useEffect(() => {
        function resize() {
            const wrapperWidth = toolbarRef.current?.clientWidth ?? 0;
            let GAP = 0;
            if (toolbarRef.current) {
                // firstElementChild is toolbar container
                const gapValue = Number.parseInt(getComputedStyle(toolbarRef.current.firstElementChild!).gap, 10);
                GAP = Number.isNaN(gapValue) ? 0 : gapValue;
            }

            const itemWidths = Object.entries(toolbarItemRefs.current)
                .filter(([_, ref]) => ref.el && ref.key && visibleItems.find((item) => item.id === ref.key))
                .map(([_, ref]) => ({
                    key: ref.key,
                    width: ref.el?.clientWidth + GAP,
                }));

            const collapsedId: string[] = [];

            let currentWidth = 182;
            for (const item of itemWidths) {
                currentWidth += item.width;

                if (currentWidth > wrapperWidth) {
                    collapsedId.push(item.key);
                }
            }

            setCollapsedId(collapsedId);
        }

        resize();
        const observer = new ResizeObserver(() => resize());

        const toolbarDom = toolbarRef.current;
        toolbarDom && observer.observe(toolbarDom);

        return () => {
            toolbarDom && observer.unobserve(toolbarDom);
        };
    }, [visibleItems]);

    return {
        toolbarRef,
        toolbarItemRefs,
        collapsedId,
    };
}

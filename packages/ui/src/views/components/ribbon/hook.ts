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

import type { Observable } from 'rxjs';
import type { IDisplayMenuItem, IMenuItem } from '../../../services/menu/menu';
import { useMemo } from 'react';
import { EMPTY, map, merge, of, startWith } from 'rxjs';
import { isMenuButtonSelectorItem } from '../../../services/menu/menu';
import { IShortcutService } from '../../../services/shortcut/shortcut.service';
import { useDependency, useObservable } from '../../../utils/di';

export interface IToolbarItemStatus {
    disabled: boolean;
    // eslint-disable-next-line ts/no-explicit-any
    value: any;
    activated: boolean;
    hidden: boolean;
    // eslint-disable-next-line ts/no-explicit-any
    selectionsValue: any;
}

/**
 * Subscribe to a menu item's status change and return the latest status.
 * @param menuItem The menu item
 * @returns The menu item's status
 */
export function useToolbarItemStatus(menuItem: IDisplayMenuItem<IMenuItem>): IToolbarItemStatus {
    const { disabled$, hidden$, activated$, value$ } = menuItem;

    // eslint-disable-next-line ts/no-explicit-any
    let selectionsValue$: Observable<any> | undefined;

    if (isMenuButtonSelectorItem(menuItem)) {
        const { selections } = menuItem;

        if (Array.isArray(selections)) {
            selectionsValue$ = selections?.[0]?.value$;
        }
    }

    const disabled = useObservable(disabled$ ?? null, false);
    const activated = useObservable(activated$ ?? null, false);
    const hidden = useObservable(hidden$ ?? null, false);
    const valueObservable = useMemo(
        () => merge(value$ ?? EMPTY, selectionsValue$ ?? EMPTY),
        [selectionsValue$, value$]
    );
    const value = useObservable(valueObservable);
    const selectionsValue = useObservable(selectionsValue$ ?? null);

    return { disabled, value, activated, hidden, selectionsValue };
}

export function useToolbarShortcutDisplay({
    id,
    commandId,
    shortcut,
}: Pick<IDisplayMenuItem<IMenuItem>, 'id' | 'commandId' | 'shortcut'>): string | null {
    const shortcutService = useDependency(IShortcutService);
    const shortcutCommandId = commandId ?? id;

    const shortcut$ = useMemo(
        () => shortcut
            ? of(shortcut)
            : shortcutService.shortcutChanged$.pipe(
                map(() => shortcutService.getShortcutDisplayOfCommand(shortcutCommandId)),
                startWith(shortcutService.getShortcutDisplayOfCommand(shortcutCommandId))
            ),
        [shortcut, shortcutService, shortcutCommandId]
    );

    return useObservable(shortcut$, null, true) as string | null;
}

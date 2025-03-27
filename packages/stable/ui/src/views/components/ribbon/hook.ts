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

import type { Subscription } from 'rxjs';
import type { IDisplayMenuItem, IMenuItem } from '../../../services/menu/menu';
import { useEffect, useState } from 'react';

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

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

import type { IMenuSchema } from '@univerjs/ui';
import { IMenuManagerService, MenuManagerPosition, ToolbarItem, useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';

interface IFloatToolbarProps {
    avaliableMenus?: string[];
    position?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    };
}

export function FloatToolbar(props: IFloatToolbarProps) {
    const { avaliableMenus = [], position = { top: 0, left: 0 } } = props;

    const { top, right, bottom, left } = position;

    const menuManagerService = useDependency(IMenuManagerService);

    const [menus, setMenus] = useState<IMenuSchema[]>([]);

    // subscribe to menu changes
    useEffect(() => {
        function getRibbon(): void {
            const flatMenus = menuManagerService.getFlatMenuByPositionKey(MenuManagerPosition.RIBBON);

            const menus: IMenuSchema[] = [];
            for (const key of avaliableMenus) {
                const item = flatMenus.find((item) => item.key === key);
                if (item) {
                    // TODO: should not delete the hidden$ property, it just a hack to make the menu visible in stories
                    delete item.item?.hidden$;

                    menus.push(item);
                }
            }
            setMenus(menus);
        }
        getRibbon();

        const subscription = menuManagerService.menuChanged$.subscribe(getRibbon);

        return () => {
            subscription.unsubscribe();
        };
    }, [menuManagerService]);

    return (
        <div
            className={`
              univer-fixed univer-box-border univer-flex univer-rounded-xl univer-border univer-border-solid
              univer-border-gray-200 univer-bg-white univer-p-2
              univer-shadow-[0_1px_6px_-2px_rgba(30,40,77,0.08),0_2px_6px_-1px_rgba(30,40,77,0.10)]
            `}
            style={{
                top: `${top}px`,
                right: `${right}px`,
                bottom: `${bottom}px`,
                left: `${left}px`,
            }}
        >
            {menus.map((groupItem) => groupItem.item && (
                <div key={groupItem.key} className="univer-flex univer-flex-nowrap univer-gap-2 univer-px-2">
                    <ToolbarItem key={groupItem.key} {...groupItem.item} />
                </div>
            ))}
        </div>
    );
}

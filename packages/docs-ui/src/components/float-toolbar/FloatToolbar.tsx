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
import { borderClassName, clsx } from '@univerjs/design';
import { IMenuManagerService, MenuManagerPosition, ToolbarItem, useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import {
    SetInlineFormatBoldCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from '../../commands/commands/inline-format.command';

interface IFloatToolbarProps {
    avaliableMenus?: string[];
}

const DEFAULT_AVALIABLE_MENUS: string[] = [
    SetInlineFormatFontSizeCommand.id,
    SetInlineFormatBoldCommand.id,
    SetInlineFormatItalicCommand.id,
    SetInlineFormatUnderlineCommand.id,
    SetInlineFormatStrikethroughCommand.id,
    SetInlineFormatSubscriptCommand.id,
    SetInlineFormatSuperscriptCommand.id,
    SetInlineFormatTextColorCommand.id,
    SetInlineFormatTextBackgroundColorCommand.id,
];

export function FloatToolbar(props: IFloatToolbarProps) {
    const { avaliableMenus = DEFAULT_AVALIABLE_MENUS } = props;

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
            className={clsx(`
              univer-box-border univer-flex univer-rounded univer-bg-white univer-py-1.5 univer-shadow-sm
              dark:univer-border-gray-700 dark:univer-bg-gray-900
            `, borderClassName)}
        >
            {menus.map((groupItem) => groupItem.item && (
                <div key={groupItem.key} className="univer-flex univer-flex-nowrap univer-gap-2 univer-px-2">
                    <ToolbarItem key={groupItem.key} {...groupItem.item} />
                </div>
            ))}
        </div>
    );
}

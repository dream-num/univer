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

import type { DocPopupMenu, IDocPopupMenuItem } from '../services/doc-quick-insert-popup.service';
import {
    ICommandService,
    LocaleService,
} from '@univerjs/core';
import { useDependency, useObservable } from '@univerjs/ui';
import { useMemo } from 'react';
import { CloseQuickInsertPopupOperation } from '../commands/operations/quick-insert-popup.operation';
import { DocQuickInsertPopupService } from '../services/doc-quick-insert-popup.service';
import { QuickInsertPlaceholder } from './QuickInsertPlaceholder';

function filterMenusByKeyword(menus: DocPopupMenu[], keyword: string) {
    return menus
        .map((menu) => ({ ...menu }))
        .filter((menu) => {
            if ('children' in menu) {
                menu.children = filterMenusByKeyword(menu.children!, keyword) as IDocPopupMenuItem[];

                return menu.children.length > 0;
            }

            const keywords = (menu as IDocPopupMenuItem).keywords;

            if (keywords) {
                return keywords.some((word) => word.includes(keyword));
            }

            return menu.title.toLowerCase().includes(keyword);
        });
}

function translateMenus(menus: DocPopupMenu[], localeService: LocaleService) {
    return menus.map((_menu) => {
        const menu = { ..._menu } as DocPopupMenu;
        if ('children' in menu) {
            menu.children = translateMenus(menu.children!, localeService) as IDocPopupMenuItem[];
        }

        menu.title = localeService.t(menu.title);

        if ('keywords' in menu) {
            menu.keywords = menu.keywords!
                .concat(menu.title)
                .map((word) => word.toLowerCase());
        }

        return menu;
    });
}

export function useQuickInsertPopup() {
    const localeService = useDependency(LocaleService);
    const docQuickInsertPopupService = useDependency(DocQuickInsertPopupService);
    const commandService = useDependency(ICommandService);
    const locale = useObservable(localeService.currentLocale$);
    const filterKeyword = useObservable(docQuickInsertPopupService.filterKeyword$, '');
    const currentPopup = useObservable(docQuickInsertPopupService.editPopup$);
    const menus = useObservable<DocPopupMenu[]>(currentPopup?.popup.menus$, []);
    const filteredMenus = useMemo(
        () => filterMenusByKeyword(translateMenus(menus, localeService), filterKeyword.toLowerCase()),
        [menus, localeService, locale, filterKeyword]
    );
    const handleMenuSelect = (menu: IDocPopupMenuItem) => {
        docQuickInsertPopupService.emitMenuSelected(menu);
        commandService.executeCommand(CloseQuickInsertPopupOperation.id);
    };
    const Placeholder = currentPopup?.popup.Placeholder || QuickInsertPlaceholder;
    return { filteredMenus, handleMenuSelect, Placeholder };
}

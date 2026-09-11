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

import type { DocPopupMenu, IDocPopupMenuItem } from '../../services/doc-quick-insert-popup.service';
import { Button, clsx, scrollbarClassName } from '@univerjs/design';
import { IconManager, useDependency } from '@univerjs/ui';
import { useQuickInsertPopup } from '../use-quick-insert-popup';

function MobileQuickInsertItems({ menus, onSelect }: { menus: DocPopupMenu[]; onSelect: (menu: IDocPopupMenuItem) => void }) {
    const iconManager = useDependency(IconManager);
    return menus.map((menu) => {
        const Icon = menu.icon ? iconManager.get(menu.icon) : null;
        if ('children' in menu) {
            return (
                <section key={menu.id} className="univer-grid univer-gap-1 univer-py-2">
                    <div className="univer-px-3 univer-text-sm univer-font-medium">{menu.title}</div>
                    <MobileQuickInsertItems menus={menu.children ?? []} onSelect={onSelect} />
                </section>
            );
        }
        return (
            <Button
                key={menu.id}
                variant="text"
                className="univer-min-h-12 univer-w-full univer-justify-start univer-gap-2 univer-px-3"
                onClick={() => onSelect(menu)}
            >
                {Icon && <Icon />}
                <span className="univer-truncate">{menu.title}</span>
            </Button>
        );
    });
}

export function MobileQuickInsertPopup() {
    const { filteredMenus, handleMenuSelect, Placeholder } = useQuickInsertPopup();
    return (
        <div className="univer-mt-1">
            {filteredMenus.length > 0
                ? (
                    <div
                        className={clsx(`
                          univer-box-border univer-max-h-[min(42vh,360px)] univer-w-[min(360px,calc(100vw-24px))]
                          univer-overflow-y-auto univer-overscroll-contain univer-rounded-2xl univer-bg-gray-0
                          univer-p-2 univer-shadow-md
                          dark:!univer-bg-gray-700
                        `, scrollbarClassName)}
                        onWheel={(event) => event.stopPropagation()}
                    >
                        <MobileQuickInsertItems menus={filteredMenus} onSelect={handleMenuSelect} />
                    </div>
                )
                : Placeholder && <Placeholder />}
        </div>
    );
}

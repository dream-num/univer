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

import type { IMenuSchema, IPopupWithExtraProps } from '@univerjs/ui';
import { MenuItemType, MobileMenu } from '@univerjs/ui';

export const MOBILE_DOC_ELEMENT_MENU = 'docs-ui.mobile-element-menu';

export interface IMobileDocElementMenuProps {
    onEdit: () => unknown;
    onDelete: () => unknown;
}

const schemas: IMenuSchema[] = [
    { key: 'edit', order: 0, item: { id: 'edit', type: MenuItemType.BUTTON, title: 'docs-ui.mobile.edit' } },
    { key: 'delete', order: 1, item: { id: 'delete', type: MenuItemType.BUTTON, title: 'docs-ui.rightClick.delete' } },
];

export function MobileDocElementMenu(props: IMobileDocElementMenuProps) {
    return (
        <MobileMenu
            schemas={schemas}
            presentation="context-bar"
            onOptionSelect={async ({ id }) => {
                if (id === 'edit') {
                    await props.onEdit();
                } else if (id === 'delete') {
                    await props.onDelete();
                }
            }}
        />
    );
}

export function MobileDocElementMenuPopup({ popup }: { popup: IPopupWithExtraProps<IMobileDocElementMenuProps> }) {
    return <MobileDocElementMenu {...popup.extraProps} />;
}

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

import { UniverInstanceType } from '@univerjs/core';
import { getMenuHiddenObservable, type IMenuItem, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { InsertHyperLinkOperation } from '../commands/operations/sidebar.operations';

export const insertLinkMenuFactory = (accessor: IAccessor) => {
    return {
        id: InsertHyperLinkOperation.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'hyperLink.menu.add',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    } as IMenuItem;
};

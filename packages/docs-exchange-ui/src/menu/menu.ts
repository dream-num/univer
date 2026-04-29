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

import type { IAccessor } from '@univerjs/core';
import type { IMenuButtonItem } from '@univerjs/ui';
import { UniverInstanceType } from '@univerjs/core';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { DocxImportOperation } from '../commands/commands/docx-import.command';

export const DOCX_IMPORT_ICON = 'docs-exchange-import-icon';

export function DocxImportMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocxImportOperation.id,
        type: MenuItemType.BUTTON,
        icon: DOCX_IMPORT_ICON,
        title: 'docsExchange.menu.import',
        tooltip: 'docsExchange.menu.importTooltip',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

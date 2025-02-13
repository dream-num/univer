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

import { EDITOR_ACTIVATED, FOCUSING_SHEET, IContextService, UniverInstanceType } from '@univerjs/core';
import type { IMenuButtonItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import type { IAccessor } from '@univerjs/core';
import { combineLatest, map } from 'rxjs';

import { OpenFindDialogOperation } from '../commands/operations/find-replace.operation';

export function FindReplaceMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const contextService = accessor.get(IContextService);

    return {
        id: OpenFindDialogOperation.id,
        icon: 'SearchIcon',
        tooltip: 'find-replace.toolbar',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: combineLatest([
            contextService.subscribeContextValue$(EDITOR_ACTIVATED),
            contextService.subscribeContextValue$(FOCUSING_SHEET),
        ]).pipe(map(([editorActivated, focusingSheet]) => editorActivated || !focusingSheet)),
    };
}

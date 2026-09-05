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
import { UnitObject } from '@univerjs/protocol';
import { objectPermissionMenuItemFactory } from '@univerjs/ui';
import { OpenDocPermissionPanelOperation } from '../commands/operations/permission-panel.operation';

export function DocPermissionMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return objectPermissionMenuItemFactory(accessor, OpenDocPermissionPanelOperation.id, UniverInstanceType.UNIVER_DOC, UnitObject.Document);
}

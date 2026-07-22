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

import type { LocaleKey } from '../locale/types';
import type { IMenuButtonItem } from '../services/menu/menu';
import { OpenFeatureSearchOperation } from '../commands/operations/open-feature-search.operation';
import { MenuItemType } from '../services/menu/menu';

export function FeatureSearchMenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: OpenFeatureSearchOperation.id,
        title: 'ui.featureSearch.title',
        tooltip: 'ui.featureSearch.title',
        icon: 'FeatureSearchIcon',
        type: MenuItemType.BUTTON,
    };
}

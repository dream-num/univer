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

import { Disposable, Inject } from '@univerjs/core';
import { ConditionsDoubleIcon, DataBarIcon, RatingIcon } from '@univerjs/icons';
import { ComponentManager, IconManager } from '@univerjs/ui';
import { CF_PANEL_KEY } from '../../const';
import { MobileConditionFormattingPanel } from '../../views/mobile/MobileConditionFormattingPanel';

export class MobileComponentsController extends Disposable {
    constructor(
        @Inject(ComponentManager) componentManager: ComponentManager,
        @Inject(IconManager) iconManager: IconManager
    ) {
        super();

        this.disposeWithMe(componentManager.register(CF_PANEL_KEY, MobileConditionFormattingPanel));
        this.disposeWithMe(iconManager.register({ ConditionsDoubleIcon, DataBarIcon, RatingIcon }));
    }
}

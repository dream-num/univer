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
import { LinkIcon } from '@univerjs/icons';
import { ComponentManager, IconManager } from '@univerjs/ui';
import { MobileCellLinkEdit } from '../../views/MobileCellLinkEdit';
import { MobileCellLinkPopup } from '../../views/MobileCellLinkPopup';

export class MobileComponentsController extends Disposable {
    constructor(
        @Inject(ComponentManager) componentManager: ComponentManager,
        @Inject(IconManager) iconManager: IconManager
    ) {
        super();

        this.disposeWithMe(componentManager.register(MobileCellLinkPopup.componentKey, MobileCellLinkPopup));
        this.disposeWithMe(componentManager.register(MobileCellLinkEdit.componentKey, MobileCellLinkEdit));
        this.disposeWithMe(iconManager.register({ LinkIcon }));
    }
}

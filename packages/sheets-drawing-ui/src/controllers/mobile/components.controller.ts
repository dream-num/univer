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
import { ComponentManager } from '@univerjs/ui';
import { BATCH_SAVE_IMAGES_DIALOG_ID } from '../../views/batch-save-images';
import { MobileBatchSaveImagesDialog } from '../../views/batch-save-images/MobileBatchSaveImagesDialog';
import { COMPONENT_SHEET_DRAWING_PANEL } from '../../views/sheet-image-panel/component-name';
import { SheetDrawingPanel } from '../../views/sheet-image-panel/SheetDrawingPanel';

export class MobileComponentsController extends Disposable {
    constructor(@Inject(ComponentManager) componentManager: ComponentManager) {
        super();

        this.disposeWithMe(componentManager.register(COMPONENT_SHEET_DRAWING_PANEL, SheetDrawingPanel));
        this.disposeWithMe(componentManager.register(BATCH_SAVE_IMAGES_DIALOG_ID, MobileBatchSaveImagesDialog));
    }
}

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

import type { IDrawingSearch } from '@univerjs/core';
import type { Image } from '@univerjs/engine-render';
import { combineLatest } from 'rxjs';
import { MobileImagePreviewButton } from '../../views/image-preview/mobile-image-preview-button';
import { ImageUpdateController } from '../image-update.controller';

export class MobileImageUpdateController extends ImageUpdateController {
    protected override _addPreviewControl(o: Image, param: IDrawingSearch, preview: () => void): void {
        const scene = o.getScene();
        if (scene) {
            const button = new MobileImagePreviewButton(o, scene, this._themeService, preview);
            const registration = this.disposeWithMe(() => button.dispose());
            button.disposeWithMe(() => registration.dispose());
            button.disposeWithMe(combineLatest([
                this._drawingManagerService.focus$,
                this._imageCropperController.cropping$,
            ]).subscribe(([drawings, cropping]) => {
                button.setPreviewEnabled(!cropping && !drawings.some((drawing) =>
                    drawing.unitId === param.unitId && drawing.subUnitId === param.subUnitId && drawing.drawingId === param.drawingId));
            }));
        }
    }
}

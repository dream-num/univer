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

import { DocumentFlavor, isInternalEditorID } from '@univerjs/core';
import { DocViewScaleService } from '../doc-view-scale';

export class MobileDocViewScaleService extends DocViewScaleService {
    override getFitToWidthScale(): number {
        if (isInternalEditorID(this._context.unitId) ||
            this._context.unit.getSnapshot().documentStyle.documentFlavor === DocumentFlavor.MODERN) {
            return 1;
        }
        return super.getFitToWidthScale();
    }
}

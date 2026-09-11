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

import { UniverInstanceType } from '@univerjs/core';
import { BuiltInUIPart, connectInjector } from '@univerjs/ui';
import { mobileMenuSchema } from '../../menu/mobile-schema';
import { menuSchema } from '../../menu/schema';
import { MobileDocEditDoneButton, MobileDocToolbar } from '../../views/mobile-doc-toolbar/MobileDocToolbar';
import { MobileDocCanvasViewport } from '../../views/mobile/MobileDocCanvasViewport';
import { DocUIController } from '../ui.controller';

export class DocMobileUIController extends DocUIController {
    protected override _initUiParts(): void {
        this.disposeWithMe(this._uiPartsService.registerComponent(
            BuiltInUIPart.CONTENT,
            () => connectInjector(MobileDocCanvasViewport, this._injector)
        ));
        this.disposeWithMe(this._uiPartsService.registerComponent(
            BuiltInUIPart.FOOTER,
            () => connectInjector(MobileDocToolbar, this._injector)
        ));
        this.disposeWithMe(this._uiPartsService.registerComponent(
            BuiltInUIPart.HEADER_MENU,
            () => connectInjector(MobileDocEditDoneButton, this._injector)
        ));
    }

    protected override _initMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
        this._menuManagerService.mergeMenu(mobileMenuSchema);
    }

    protected override _initFocusHandler(): void {
        // Only a direct canvas gesture may reopen the software keyboard.
        this.disposeWithMe(this._layoutService.registerFocusHandler(UniverInstanceType.UNIVER_DOC, () => {}));
    }

    protected override _initShortCut(): void {
        // Mobile interactions do not use keyboard shortcuts.
    }
}

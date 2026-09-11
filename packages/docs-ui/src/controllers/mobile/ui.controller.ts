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

import { Disposable, ICommandService, Inject, Injector, UniverInstanceType } from '@univerjs/core';
import { BuiltInUIPart, connectInjector, ILayoutService, IMenuManagerService, IUIPartsService } from '@univerjs/ui';
import { CoreHeaderFooterCommand, OpenHeaderFooterPanelCommand } from '../../commands/commands/doc-header-footer.command';
import { SidebarDocHeaderFooterPanelOperation } from '../../commands/operations/doc-header-footer-panel.operation';
import { OpenDocParagraphPermissionOperation } from '../../commands/operations/paragraph-permission.operation';
import { OpenDocPermissionPanelOperation } from '../../commands/operations/permission-panel.operation';
import { mobileMenuSchema } from '../../menu/mobile-schema';
import { menuSchema } from '../../menu/schema';
import { MobileDocEditDoneButton, MobileDocToolbar } from '../../views/mobile-doc-toolbar/MobileDocToolbar';
import { MobileDocCanvasViewport } from '../../views/mobile/MobileDocCanvasViewport';

export class DocMobileUIController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService
    ) {
        super();

        this._initMenus();
        this._initFocusHandler();
        this._initCommands();
        this._initUiParts();
    }

    private _initUiParts(): void {
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

    private _initMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
        this._menuManagerService.appendRootMenu(mobileMenuSchema);
    }

    private _initFocusHandler(): void {
        // Only a direct canvas gesture may reopen the software keyboard.
        this.disposeWithMe(this._layoutService.registerFocusHandler(UniverInstanceType.UNIVER_DOC, () => {}));
    }

    private _initCommands(): void {
        [
            OpenDocPermissionPanelOperation,
            OpenDocParagraphPermissionOperation,
            CoreHeaderFooterCommand,
            OpenHeaderFooterPanelCommand,
            SidebarDocHeaderFooterPanelOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }
}

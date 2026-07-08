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

import {
    Disposable,
    ICommandService,
    IConfigService,
    Inject,
    Injector,
    IUniverInstanceService,
    Optional,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    BuiltInUIPart,
    connectInjector,
    ILayoutService,
    IMenuManagerService,
    IShortcutService,
    IUIPartsService,
} from '@univerjs/ui';
import { CoreHeaderFooterCommand, OpenHeaderFooterPanelCommand } from '../commands/commands/doc-header-footer.command';
import { SidebarDocHeaderFooterPanelOperation } from '../commands/operations/doc-header-footer-panel.operation';
import { floatToolbarMenuSchema, menuSchema } from '../menu/schema';
import { IDocEmbedInteractionBoundaryService, IDocEmbedRuntimeFocusCoordinator } from '../services/doc-embed-integration.service';
import { DocSelectionRenderService } from '../services/selection/doc-selection-render.service';
import { TabShortCut } from '../shortcuts/format.shortcut';
import {
    AlignCenterShortCut,
    AlignJustifyShortCut,
    AlignLeftShortCut,
    AlignRightShortCut,
    BoldShortCut,
    BulletListShortCut,
    ItalicShortCut,
    OrderListShortCut,
    StrikeThroughShortCut,
    SubscriptShortCut,
    SuperscriptShortCut,
    UnderlineShortCut,
} from '../shortcuts/toolbar.shortcut';
import { DocFooter } from '../views/doc-footer';
import { DocSideMenu } from '../views/DocSideMenu';

export class DocUIController extends Disposable {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @ICommandService protected readonly _commandService: ICommandService,
        @ILayoutService protected readonly _layoutService: ILayoutService,
        @IMenuManagerService protected readonly _menuManagerService: IMenuManagerService,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService,
        @IUniverInstanceService protected readonly _univerInstanceService: IUniverInstanceService,
        @IShortcutService protected readonly _shortcutService: IShortcutService,
        @IConfigService protected readonly _configService: IConfigService,
        @Optional(IDocEmbedInteractionBoundaryService) _embedInteractionBoundaryService?: IDocEmbedInteractionBoundaryService,
        @Optional(IDocEmbedRuntimeFocusCoordinator) protected readonly _embedRuntimeFocusCoordinator?: IDocEmbedRuntimeFocusCoordinator
    ) {
        super();

        this._init();
    }

    private _initUiParts() {
        this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.FOOTER, () => connectInjector(DocFooter, this._injector)));
        this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(DocSideMenu, this._injector)));
    }

    private _initMenus(): void {
        this._menuManagerService.appendRootMenu(floatToolbarMenuSchema);
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initShortCut() {
        [
            BoldShortCut,
            ItalicShortCut,
            UnderlineShortCut,
            StrikeThroughShortCut,
            SubscriptShortCut,
            SuperscriptShortCut,
            AlignCenterShortCut,
            AlignJustifyShortCut,
            AlignRightShortCut,
            AlignLeftShortCut,
            OrderListShortCut,
            BulletListShortCut,
            TabShortCut,
        ].forEach((shortcut) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(shortcut));
        });
    }

    private _init(): void {
        this._initMenus();
        this._initFocusHandler();
        this._initCommands();
        this._initUiParts();
        this._initShortCut();
    }

    private _initCommands(): void {
        [
            CoreHeaderFooterCommand,
            OpenHeaderFooterPanelCommand,
            SidebarDocHeaderFooterPanelOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initFocusHandler(): void {
        this.disposeWithMe(
            this._layoutService.registerFocusHandler(UniverInstanceType.UNIVER_DOC, (unitId: string) => {
                if (this._shouldPreserveEmbedFocus(unitId)) {
                    return;
                }

                const renderManagerService = this._injector.get(IRenderManagerService);
                const docSelectionRenderService = renderManagerService.getRenderById(unitId)!.with(DocSelectionRenderService);

                docSelectionRenderService.focus();
            })
        );
    }

    private _shouldPreserveEmbedFocus(unitId: string): boolean {
        if (this._embedRuntimeFocusCoordinator?.shouldSuppressHostInteraction(unitId)) {
            return true;
        }

        return false;
    }
}

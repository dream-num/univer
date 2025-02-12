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

import type { SlideDataModel } from '@univerjs/core';
import { ICommandService, Inject, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SHAPE_MENU_ID, SlideAddTextCommand, SlideEditorContainer, SLIDES_IMAGE_MENU_ID, SlidesUIController } from '@univerjs/slides-ui';
import { BuiltInUIPart, ComponentManager, connectInjector, IMenuManagerService, IShortcutService, IUIPartsService, useDependency, useObservable } from '@univerjs/ui';
import { BuiltinUniToolbarItemId, UniToolbarService, UniUIPart } from '@univerjs/uniui';
import React from 'react';
import { UniSlideSideBar } from '../views/UniSlideSideBar';
import { menuSchema } from './menu.schema';

export class UniSlidesUIController extends SlidesUIController {
    constructor(
        @Inject(Injector) _injector: Injector,
        @IMenuManagerService _menuManagerService: IMenuManagerService,
        @Inject(ComponentManager) _componentManager: ComponentManager,
        @IUIPartsService _uiPartsService: IUIPartsService,
        @ICommandService _commandService: ICommandService,
        @IShortcutService _shortcutService: IShortcutService,
        @Inject(UniToolbarService) private readonly _toolbarService: UniToolbarService
    ) {
        super(_injector, _menuManagerService, _componentManager, _uiPartsService, _commandService, _shortcutService);
        this._initUniMenus();
    }

    protected override _initUIComponents(): void {
        this.disposeWithMe(this._uiPartsService.registerComponent(UniUIPart.OUTLINE, () => connectInjector(RenderOutline, this._injector)));

        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(SlideEditorContainer, this._injector))
        );
    }

    private _initUniMenus(): void {
        this._menuManagerService.appendRootMenu(menuSchema);

        ([
            [BuiltinUniToolbarItemId.IMAGE, SLIDES_IMAGE_MENU_ID],
            [BuiltinUniToolbarItemId.FONT_GROUP, SHAPE_MENU_ID],
            [BuiltinUniToolbarItemId.TABLE, SlideAddTextCommand.id],
        ]).forEach(([id, menuId]) => {
            this._toolbarService.implementItem(id, { id: menuId, type: UniverInstanceType.UNIVER_SLIDE });
        });
    }
}

function RenderOutline() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const focused = useObservable(univerInstanceService.focused$);
    const slide = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE), null, false, []);
    if (!slide || focused !== slide.getUnitId()) return null;

    return (
        <UniSlideSideBar />
    );
}

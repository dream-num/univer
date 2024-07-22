/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Workbook } from '@univerjs/core';
import { connectInjector, ICommandService, Inject, Injector, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType, useDependency } from '@univerjs/core';
import { type IUniverSheetsUIConfig, RenderSheetContent, SheetBar, SheetUIController } from '@univerjs/sheets-ui';
import { BuiltInUIPart, ComponentManager, ILayoutService, IMenuService, IShortcutService, IUIPartsService, useObservable } from '@univerjs/ui';
import { UniUIPart } from '@univerjs/uniui';
import React from 'react';

@OnLifecycle(LifecycleStages.Ready, SheetUIController)
export class UniSheetUIController extends SheetUIController {
    constructor(
        config: Partial<IUniverSheetsUIConfig>,
        @Inject(Injector) injector: Injector,
        @Inject(ComponentManager) componentManager: ComponentManager,
        @ILayoutService layoutService: ILayoutService,
        @ICommandService commandService: ICommandService,
        @IShortcutService shortcutService: IShortcutService,
        @IMenuService menuService: IMenuService,
        @IUIPartsService uiPartsService: IUIPartsService
    ) {
        super(
            config,
            injector,
            componentManager,
            layoutService,
            commandService,
            shortcutService,
            menuService,
            uiPartsService
        );
    }

    protected override _initWorkbenchParts(): void {
        const uiController = this._uiPartsService;
        const injector = this._injector;

        // this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.HEADER, () => connectInjector(RenderSheetHeader, injector)));
        this.disposeWithMe(uiController.registerComponent(UniUIPart.OUTLINE, () => connectInjector(RenderOutline, injector)));
        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(RenderSheetContent, injector)));
    }
}

function RenderOutline() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), null, false, []);
    if (!workbook) return null;

    return (
        <section>
            <SheetBar />
        </section>
    );
}


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

import type { IDisposable } from '@univerjs/core';
import type { IUniverWorkbenchProps } from '../../views/workbench/Workbench';
import type { IUniverUIConfig } from '../config.schema';
import type { IWorkbenchOptions } from './ui.controller';
import { Inject, Injector, IUniverInstanceService, LifecycleService, toDisposable } from '@univerjs/core';
import { render as createRoot, unmount } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import React from 'react';
import { ComponentManager } from '../../common';
import { HEADING_ITEM_COMPONENT, HeadingItem } from '../../components';
import { COMMON_LABEL_COMPONENT, CommonLabel } from '../../components/common-label';
import { ILayoutService } from '../../services/layout/layout.service';
import { IMenuManagerService } from '../../services/menu/menu-manager.service';
import { BuiltInUIPart, IUIPartsService } from '../../services/parts/parts.service';
import { connectInjector } from '../../utils/di';
import { FloatDom } from '../../views/components/dom/FloatDom';
import { CanvasPopup } from '../../views/components/popup/CanvasPopup';
import { Ribbon } from '../../views/components/ribbon/Ribbon';
import { DesktopWorkbench } from '../../views/workbench/Workbench';
import { menuSchema } from '../menus/menu.schema';
import { SingleUnitUIController } from './ui-shared.controller';

export class DesktopUIController extends SingleUnitUIController {
    constructor(
        private readonly _config: IUniverUIConfig,
        @Inject(Injector) injector: Injector,
        @Inject(LifecycleService) lifecycleService: LifecycleService,
        @IRenderManagerService renderManagerService: IRenderManagerService,
        @ILayoutService layoutService: ILayoutService,
        @IUniverInstanceService instanceService: IUniverInstanceService,
        @IMenuManagerService menuManagerService: IMenuManagerService,
        @IUIPartsService uiPartsService: IUIPartsService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super(injector, instanceService, layoutService, lifecycleService, renderManagerService);

        menuManagerService.mergeMenu(menuSchema);

        this._initBuiltinComponents(uiPartsService);
        this._registerComponents();
        this._bootstrapWorkbench();
    }

    private _registerComponents() {
        this.disposeWithMe(
            this._componentManager.register(
                COMMON_LABEL_COMPONENT,
                CommonLabel
            )
        );
        this.disposeWithMe(
            this._componentManager.register(
                HEADING_ITEM_COMPONENT,
                HeadingItem
            )
        );
    }

    override bootstrap(callback: (contentElement: HTMLElement, containerElement: HTMLElement) => void): IDisposable {
        return bootstrap(this._injector, this._config, callback);
    }

    private _initBuiltinComponents(uiPartsService: IUIPartsService): void {
        this.disposeWithMe(uiPartsService.registerComponent(BuiltInUIPart.FLOATING, () => connectInjector(CanvasPopup, this._injector)));
        this.disposeWithMe(uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(FloatDom, this._injector)));
        this.disposeWithMe(uiPartsService.registerComponent(BuiltInUIPart.TOOLBAR, () => connectInjector(Ribbon, this._injector)));
    }
}

function bootstrap(
    injector: Injector,
    options: IWorkbenchOptions,
    callback: (contentEl: HTMLElement, containerElement: HTMLElement) => void
): IDisposable {
    let mountContainer: HTMLElement;

    const container = options.container;
    if (typeof container === 'string') {
        const containerElement = document.getElementById(container);
        if (!containerElement) {
            mountContainer = createContainer(container);
        } else {
            mountContainer = containerElement;
        }
    } else if (container instanceof HTMLElement) {
        mountContainer = container;
    } else {
        mountContainer = createContainer('univer');
    }

    const ConnectedApp = connectInjector(DesktopWorkbench, injector) as React.ComponentType<IUniverWorkbenchProps>;
    const onRendered = (contentElement: HTMLElement) => callback(contentElement, mountContainer);

    function render() {
        createRoot(
            <ConnectedApp
                {...options}
                mountContainer={mountContainer}
                onRendered={onRendered}
            />,
            mountContainer
        );
    }

    render();

    return toDisposable(() => {
        // https://github.com/facebook/react/issues/26031
        createRoot(<div />, mountContainer);
        setTimeout(() => createRoot(<div />, mountContainer), 200);
        setTimeout(() => unmount(mountContainer), 500);
    });
}

function createContainer(id: string): HTMLElement {
    const element = document.createElement('div');
    element.id = id;
    return element;
}

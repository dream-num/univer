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
import type { IUniverUIConfig } from '../../config/config';
import type { IUIController, IWorkbenchOptions } from './ui.controller';
import { Inject, Injector, IUniverInstanceService, LifecycleService, toDisposable } from '@univerjs/core';
import { unmount } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import { menuSchema } from '../../menu/schema';
import { ILayoutService } from '../../services/layout/layout.service';
import { IMenuManagerService } from '../../services/menu/menu-manager.service';
import { BuiltInUIPart, IUIPartsService } from '../../services/parts/parts.service';
import { connectInjector } from '../../utils/di';
import { FloatDom } from '../../views/components/dom/FloatDom';
import { CanvasPopup } from '../../views/components/popup/CanvasPopup';
import { MobileRibbon } from '../../views/components/ribbon/MobileRibbon';
import { mountMobileWorkbench } from '../../views/mobile-workbench/MobileWorkbench';
import { SingleUnitUIController } from './ui-shared.controller';

export class MobileUIController extends SingleUnitUIController implements IUIController {
    constructor(
        private readonly _config: IUniverUIConfig,
        @Inject(Injector) injector: Injector,
        @Inject(LifecycleService) lifecycleService: LifecycleService,
        @IRenderManagerService renderManagerService: IRenderManagerService,
        @ILayoutService layoutService: ILayoutService,
        @IUniverInstanceService instanceService: IUniverInstanceService,
        @IMenuManagerService menuManagerService: IMenuManagerService,
        @IUIPartsService uiPartsService: IUIPartsService
    ) {
        super(injector, instanceService, layoutService, lifecycleService, renderManagerService);

        menuManagerService.mergeMenu(menuSchema);
        this._initBuiltinComponents(uiPartsService);
        this._bootstrapWorkbench();
    }

    override dispose(): void {
        super.dispose();
    }

    override bootstrap(callback: (contentElement: HTMLElement, containerElement: HTMLElement) => void): IDisposable {
        return bootstrap(this._injector, this._config, callback);
    }

    private _initBuiltinComponents(uiPartsService: IUIPartsService) {
        this.disposeWithMe(uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(CanvasPopup, this._injector)));
        this.disposeWithMe(uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(FloatDom, this._injector)));
        this.disposeWithMe(uiPartsService.registerComponent(BuiltInUIPart.TOOLBAR, () => connectInjector(MobileRibbon, this._injector)));
    }
}

function bootstrap(
    injector: Injector,
    options: IWorkbenchOptions,
    callback: (canvasEl: HTMLElement, containerElement: HTMLElement) => void
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

    const onRendered = (canvasElement: HTMLElement) => callback(canvasElement, mountContainer);

    function render() {
        mountMobileWorkbench(injector, options, mountContainer, onRendered);
    }

    render();

    return toDisposable(() => {
        unmount(mountContainer);
    });
}

function createContainer(id: string): HTMLElement {
    const element = document.createElement('div');
    element.id = id;
    // FIXME: the element is not append to the DOM tree. So it won't be rendered.
    return element;
}

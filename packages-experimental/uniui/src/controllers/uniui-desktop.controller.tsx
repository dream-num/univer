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
import type { IUniverUIConfig, IWorkbenchOptions } from '@univerjs/ui';
import { Disposable, Inject, Injector, LifecycleService, LifecycleStages, Optional, toDisposable } from '@univerjs/core';
import { render as createRoot, unmount } from '@univerjs/design';
import { BuiltInUIPart, CanvasPopup, connectInjector, FloatDom, ILayoutService, IUIPartsService } from '@univerjs/ui';
import { delay, filter, take } from 'rxjs';

import { UniWorkbench } from '../views/workbench/UniWorkbench';

const STEADY_TIMEOUT = 3000;

export class UniverUniUIController extends Disposable {
    constructor(
        private readonly _config: IUniverUIConfig,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService,
        @Optional(ILayoutService) private readonly _layoutService?: ILayoutService
    ) {
        super();

        this._initBuiltinComponents();

        Promise.resolve().then(() => this._bootstrapWorkbench());
    }

    private _bootstrapWorkbench(): void {
        this.disposeWithMe(
            bootstrap(this._injector, this._config, (contentEl, containerEl) => {
                if (this._layoutService) {
                    this.disposeWithMe(this._layoutService.registerContentElement(contentEl));
                    this.disposeWithMe(this._layoutService.registerContainerElement(containerEl));
                }

                this._lifecycleService.lifecycle$.pipe(
                    filter((lifecycle) => lifecycle === LifecycleStages.Ready),
                    delay(300),
                    take(1)
                ).subscribe(() => {
                    this._lifecycleService.stage = LifecycleStages.Rendered;
                    setTimeout(() => this._lifecycleService.stage = LifecycleStages.Steady, STEADY_TIMEOUT);
                });
            })
        );
    }

    private _initBuiltinComponents() {
        this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.FLOATING, () => connectInjector(CanvasPopup, this._injector)));
        this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.UNIT, () => connectInjector(FloatDom, this._injector)));
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

    const ConnectedApp = connectInjector(UniWorkbench, injector);
    function render() {
        createRoot(
            <ConnectedApp
                {...options}
                mountContainer={mountContainer}
                onRendered={(contentEl) => callback(contentEl, mountContainer)}
            />,
            mountContainer
        );
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

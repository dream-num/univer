/**
 * Copyright 2023 DreamNum Inc.
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

import { Disposable, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IDesktopUIController } from '@univerjs/ui';
import { IUIController } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

/**
 * This controller registers UI parts of slide workbench to the base-ui workbench.
 */
@OnLifecycle(LifecycleStages.Ready, SlideUIController)
export class SlideUIController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IUIController private readonly _uiController: IDesktopUIController
    ) {
        super();

        this._init();
    }

    private _init(): void {
        // this._uiController.registerSidebarComponent(() => connectInjector(SlideBar, this._injector));
    }
}

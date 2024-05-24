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

import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { BuiltInUIPart, IUIPartsService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';
import { SlideSideBar } from '../views/slide-bar/SlideBar';
import { ActivateSlidePageOperation } from '../commands/operations/activate.operation';
import { SetSlidePageThumbOperation } from '../commands/operations/setThumb.operation';

/**
 * This controller registers UI parts of slide workbench to the base-ui workbench.
 */
@OnLifecycle(LifecycleStages.Ready, SlideUIController)
export class SlideUIController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initCommands();
        this._initUIComponents();
    }

    private _initCommands(): void {
        [
            ActivateSlidePageOperation,
            SetSlidePageThumbOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initUIComponents(): void {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.LEFT_SIDEBAR, () => connectInjector(SlideSideBar, this._injector))
        );
    }
}

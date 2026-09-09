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

import { Disposable, ICommandService } from '@univerjs/core';
import { IMenuManagerService } from '@univerjs/ui';
import {
    DisableCrosshairHighlightOperation,
    EnableCrosshairHighlightOperation,
    SetCrosshairHighlightColorOperation,
    ToggleCrosshairHighlightOperation,
} from '../../commands/operations/operation';
import { mobileMenuSchema } from '../../menu/mobile-schema';

export class SheetsCrosshairHighlightMobileController extends Disposable {
    constructor(
        @ICommandService commandService: ICommandService,
        @IMenuManagerService menuManagerService: IMenuManagerService
    ) {
        super();

        [
            ToggleCrosshairHighlightOperation,
            SetCrosshairHighlightColorOperation,
            EnableCrosshairHighlightOperation,
            DisableCrosshairHighlightOperation,
        ].forEach((command) => this.disposeWithMe(commandService.registerCommand(command)));
        menuManagerService.mergeMenu(mobileMenuSchema);
    }
}

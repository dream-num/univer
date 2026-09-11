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

import { Disposable, ICommandService, Inject, Injector } from '@univerjs/core';
import { BuiltInUIPart, connectInjector, IMenuManagerService, IUIPartsService } from '@univerjs/ui';
import {
    SetDrawingAlignBottomOperation,
    SetDrawingAlignCenterOperation,
    SetDrawingAlignHorizonOperation,
    SetDrawingAlignLeftOperation,
    SetDrawingAlignMiddleOperation,
    SetDrawingAlignOperation,
    SetDrawingAlignRightOperation,
    SetDrawingAlignTopOperation,
    SetDrawingAlignVerticalOperation,
} from '../../commands/operations/drawing-align.operation';
import {
    SetDrawingArrangeBackOperation,
    SetDrawingArrangeBackwardOperation,
    SetDrawingArrangeForwardOperation,
    SetDrawingArrangeFrontOperation,
    SetDrawingArrangeOperation,
} from '../../commands/operations/drawing-arrange.operation';
import { CancelDrawingGroupOperation, SetDrawingGroupOperation } from '../../commands/operations/drawing-group.operation';
import { AutoImageCropOperation, CloseImageCropOperation, OpenImageCropOperation } from '../../commands/operations/image-crop.operation';
import { ImageResetSizeOperation } from '../../commands/operations/image-reset-size.operation';
import { menuSchema } from '../../menu/schema';
import { MobileCropActions } from '../../views/crop/MobileCropActions';

export class MobileDrawingUIController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initMenus();
        this._initCommands();
        this._initUiParts();
    }

    private _initMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initCommands(): void {
        [
            OpenImageCropOperation,
            CloseImageCropOperation,
            ImageResetSizeOperation,
            SetDrawingAlignOperation,
            SetDrawingAlignLeftOperation,
            SetDrawingAlignCenterOperation,
            SetDrawingAlignRightOperation,
            SetDrawingAlignTopOperation,
            SetDrawingAlignMiddleOperation,
            SetDrawingAlignBottomOperation,
            SetDrawingAlignHorizonOperation,
            SetDrawingAlignVerticalOperation,
            AutoImageCropOperation,
            SetDrawingGroupOperation,
            CancelDrawingGroupOperation,
            SetDrawingArrangeOperation,
            SetDrawingArrangeFrontOperation,
            SetDrawingArrangeForwardOperation,
            SetDrawingArrangeBackOperation,
            SetDrawingArrangeBackwardOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initUiParts(): void {
        this.disposeWithMe(this._uiPartsService.registerComponent(
            BuiltInUIPart.CONTENT,
            () => connectInjector(MobileCropActions, this._injector)
        ));
    }
}

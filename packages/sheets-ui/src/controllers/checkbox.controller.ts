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

import { Disposable, ICommandService, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { CURSOR_TYPE, getCurrentTypeOfRenderer, IRenderManagerService } from '@univerjs/engine-render';
import { ToggleCellCheckboxCommand } from '@univerjs/sheets';
import { HoverManagerService } from '../services/hover-manager.service';

export class SheetCheckboxController extends Disposable {
    private _isPointer = false;
    constructor(
        @Inject(HoverManagerService) private _hoverManagerService: HoverManagerService,
        @IUniverInstanceService private _instanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
        this._initPointerEvent();
        this._initHover();
    }

    private get _mainComponent() {
        return getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET, this._instanceService, this._renderManagerService)?.mainComponent;
    }

    private _initHover() {
        this.disposeWithMe(this._hoverManagerService.currentRichText$.subscribe((richText) => {
            if (richText?.bullet) {
                if (!this._isPointer) {
                    this._mainComponent?.setCursor(CURSOR_TYPE.POINTER);
                }
                this._isPointer = true;
            } else {
                if (this._isPointer) {
                    this._mainComponent?.setCursor(CURSOR_TYPE.AUTO);
                }
                this._isPointer = false;
            }
        }));
    }

    private _initPointerEvent() {
        this.disposeWithMe(this._hoverManagerService.currentClickedCell$.subscribe((cell) => {
            const { location, bullet } = cell;
            if (!bullet) {
                return;
            }
            this._commandService.executeCommand(ToggleCellCheckboxCommand.id, {
                unitId: location.unitId,
                subUnitId: location.subUnitId,
                row: location.row,
                col: location.col,
                paragraphIndex: bullet.startIndex,
            });
        }));
    }
}

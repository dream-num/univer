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

import { Inject, Injector } from '@univerjs/core';
import { connectInjector } from '../../utils/di';
import { MobileDialogPart } from '../../views/components/dialog-part/MobileDialogPart';
import { BuiltInUIPart, IUIPartsService } from '../parts/parts.service';
import { DesktopDialogService } from './desktop-dialog.service';

export class MobileDialogService extends DesktopDialogService {
    constructor(
        @Inject(Injector) injector: Injector,
        @IUIPartsService uiPartsService: IUIPartsService
    ) {
        super(injector, uiPartsService);
    }

    override close(id: string): void {
        const dialog = this._dialogOptions.find((item) => item.id === id);
        if (!dialog || dialog.open === false) return;
        super.close(id);
    }

    protected override _initUIPart(): void {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.GLOBAL, () => connectInjector(MobileDialogPart, this._injector))
        );
    }
}

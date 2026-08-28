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
import type { IDialogService } from './dialog.service';
import { Inject, Injector, toDisposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { connectInjector } from '../../utils/di';
import { MobileDialogPart } from '../../views/components/dialog-part/MobileDialogPart';
import { BuiltInUIPart, IUIPartsService } from '../parts/parts.service';
import { DesktopDialogService } from './desktop-dialog.service';

export class MobileDialogService extends DesktopDialogService {
    private _overlaySuspensionCount = 0;
    private readonly _overlaysSuspended$ = new BehaviorSubject(false);
    private readonly _overlaysSuspendedObservable$ = this._overlaysSuspended$.asObservable();

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

    getOverlaysSuspended$() {
        return this._overlaysSuspendedObservable$;
    }

    suspendOverlays(): IDisposable {
        this._overlaySuspensionCount += 1;
        this._overlaysSuspended$.next(true);

        return toDisposable(() => {
            this._overlaySuspensionCount = Math.max(0, this._overlaySuspensionCount - 1);
            this._overlaysSuspended$.next(this._overlaySuspensionCount > 0);
        });
    }

    protected override _initUIPart(): void {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.GLOBAL, () => connectInjector(MobileDialogPart, this._injector))
        );
    }
}

export function isMobileDialogService(dialogService: IDialogService): dialogService is MobileDialogService {
    return typeof Reflect.get(dialogService, 'getOverlaysSuspended$') === 'function' &&
        typeof Reflect.get(dialogService, 'suspendOverlays') === 'function';
}

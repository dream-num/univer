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

import type { IDialogPartMethodOptions } from '../../views/components/dialog-part/interface';
import type { IDialogService } from './dialog.service';
import { connectInjector, Disposable, toDisposable } from '@univerjs/core';

import { type IDisposable, Inject, Injector } from '@univerjs/core';
import { Subject } from 'rxjs';
import { DialogPart } from '../../views/components/dialog-part/DialogPart';
import { BuiltInUIPart, IUIPartsService } from '../parts/parts.service';

export class DesktopDialogService extends Disposable implements IDialogService {
    protected _dialogOptions: IDialogPartMethodOptions[] = [];
    protected readonly _dialogOptions$ = new Subject<IDialogPartMethodOptions[]>();

    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService
    ) {
        super();

        this._initUIPart();
    }

    override dispose(): void {
        super.dispose();

        this._dialogOptions$.complete();
    }

    open(option: IDialogPartMethodOptions): IDisposable {
        if (this._dialogOptions.find((item) => item.id === option.id)) {
            this._dialogOptions = this._dialogOptions.map((item) => ({
                ...(item.id === option.id ? option : item),
                visible: item.id === option.id ? true : item.visible,
            }));
        } else {
            this._dialogOptions.push({
                ...option,
                visible: true,
            });
        }

        this._dialogOptions$.next(this._dialogOptions);

        return toDisposable(() => {
            this._dialogOptions = [];
            this._dialogOptions$.next([]);
        });
    }

    close(id: string) {
        this._dialogOptions = this._dialogOptions.map((item) => ({
            ...item,
            visible: item.id === id ? false : item.visible,
        }));

        this._dialogOptions$.next([...this._dialogOptions]);
    }

    closeAll(expectIds?: string[]): void {
        const expectIdSet = new Set(expectIds);
        this._dialogOptions = this._dialogOptions.map((item) => ({
            ...item,
            visible: expectIdSet.has(item.id) ? item.visible : false,
        }));
        this._dialogOptions$.next([...this._dialogOptions]);
    }

    getDialogs$() {
        return this._dialogOptions$.asObservable();
    }

    protected _initUIPart(): void {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.GLOBAL, () => connectInjector(DialogPart, this._injector))
        );
    }
}

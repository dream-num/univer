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
import type { IConfirmPartMethodOptions } from '../../views/components/confirm-part/interface';
import type { IConfirmService } from './confirm.service';

import { Disposable, Inject, Injector, toDisposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { connectInjector } from '../../utils/di';
import { ConfirmPart } from '../../views/components/confirm-part/ConfirmPart';
import { BuiltInUIPart, IUIPartsService } from '../parts/parts.service';

export class DesktopConfirmService extends Disposable implements IConfirmService {
    private _confirmOptions: IConfirmPartMethodOptions[] = [];
    readonly confirmOptions$ = new BehaviorSubject<IConfirmPartMethodOptions[]>([]);

    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService
    ) {
        super();

        this._initUIPart();
    }

    open(option: IConfirmPartMethodOptions): IDisposable {
        if (this._confirmOptions.find((item) => item.id === option.id)) {
            this._confirmOptions = this._confirmOptions.map((item) => ({
                ...(item.id === option.id ? option : item),
                visible: item.id === option.id ? true : item.visible,
            }));
        } else {
            this._confirmOptions.push({
                ...option,
                visible: true,
            });
        }
        this.confirmOptions$.next(this._confirmOptions);

        return toDisposable(() => {
            this._confirmOptions = [];
            this.confirmOptions$.next([]);
        });
    }

    confirm(params: IConfirmPartMethodOptions): Promise<boolean> {
        return new Promise((resolve) => {
            const disposeHandler = this.open({
                ...params,
                onConfirm: () => {
                    disposeHandler.dispose();
                    resolve(true);
                },
                onClose: () => {
                    disposeHandler.dispose();
                    resolve(false);
                },
            });
        });
    }

    close(id: string): void {
        this._confirmOptions = this._confirmOptions.map((item) => ({
            ...item,
            visible: item.id === id ? false : item.visible,
        }));
        this.confirmOptions$.next([...this._confirmOptions]);
    }

    protected _initUIPart(): void {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.GLOBAL, () => connectInjector(ConfirmPart, this._injector))
        );
    }
}

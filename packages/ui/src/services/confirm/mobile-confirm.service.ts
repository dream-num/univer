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

import type { IConfirmService, IDisposable } from '@univerjs/core';
import type { IConfirmPartMethodOptions } from '../../views/components/confirm-part/interface';
import { Disposable, Inject, Injector, toDisposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { connectInjector } from '../../utils/di';
import { MobileConfirmPart } from '../../views/components/confirm-part/MobileConfirmPart';
import { BuiltInUIPart, IUIPartsService } from '../parts/parts.service';

export class MobileConfirmService extends Disposable implements IConfirmService<IConfirmPartMethodOptions> {
    private _confirmOptions: IConfirmPartMethodOptions[] = [];
    readonly confirmOptions$ = new BehaviorSubject<IConfirmPartMethodOptions[]>([]);

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IUIPartsService uiPartsService: IUIPartsService
    ) {
        super();

        this.disposeWithMe(
            uiPartsService.registerComponent(
                BuiltInUIPart.GLOBAL,
                () => connectInjector(MobileConfirmPart, this._injector)
            )
        );
    }

    override dispose(): void {
        super.dispose();
        this._confirmOptions = [];
        this.confirmOptions$.complete();
    }

    open(option: IConfirmPartMethodOptions): IDisposable {
        const existing = this._confirmOptions.some((item) => item.id === option.id);
        if (existing) {
            this._confirmOptions = this._confirmOptions.map((item) => item.id === option.id
                ? { ...option, visible: true }
                : item);
        } else {
            this._confirmOptions.push({ ...option, visible: true });
        }
        this.confirmOptions$.next(this._confirmOptions);

        return toDisposable(() => {
            this._confirmOptions = [];
            this.confirmOptions$.next([]);
        });
    }

    confirm(params: IConfirmPartMethodOptions): Promise<boolean> {
        return new Promise((resolve) => {
            const disposable = this.open({
                ...params,
                onConfirm: () => {
                    disposable.dispose();
                    resolve(true);
                },
                onClose: () => {
                    disposable.dispose();
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
}

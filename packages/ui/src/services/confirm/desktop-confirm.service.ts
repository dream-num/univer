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

import { toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import type { IConfirmPartMethodOptions } from '../../views/components/confirm-part/interface';
import type { IConfirmService } from './confirm.service';

export class DesktopConfirmService implements IConfirmService {
    private _confirmOptions: IConfirmPartMethodOptions[] = [];
    readonly confirmOptions$ = new Subject<IConfirmPartMethodOptions[]>();

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
}

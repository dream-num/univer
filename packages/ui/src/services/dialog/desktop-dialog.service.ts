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

import { Disposable, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import type { IDialogPartMethodOptions } from '../../views/components/dialog-part/interface';
import type { IDialogService } from './dialog.service';

export class DesktopDialogService extends Disposable implements IDialogService {
    private _dialogOptions: IDialogPartMethodOptions[] = [];
    private readonly _dialogOptions$ = new Subject<IDialogPartMethodOptions[]>();

    override dispose(): void {
        super.dispose();

        this._dialogOptions$.complete();
    }

    open(option: IDialogPartMethodOptions): IDisposable {
        if (this._dialogOptions.find((item) => item.id === option.id)) {
            this._dialogOptions = this._dialogOptions.map((item) => ({
                ...(item.id === option.id ? option : item),
                visible: true,
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

    getObservableDialog() {
        return this._dialogOptions$;
    }
}

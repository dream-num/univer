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
import { BorderStyleTypes, BorderType } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export interface IBorderInfo {
    type: BorderType;
    color: string | undefined;
    style: BorderStyleTypes;
    activeBorderType: boolean; // When you click on the border type, then click on the color and style, it should take effect immediately.
}

/**
 * This service is for managing settings border style status.
 */
export class BorderStyleManagerService implements IDisposable {
    private readonly _borderInfo: IBorderInfo = {
        type: BorderType.ALL,
        color: '#000000',
        style: BorderStyleTypes.THIN,
        activeBorderType: false,
    };

    private readonly _borderInfo$ = new BehaviorSubject<IBorderInfo>(this._borderInfo);
    readonly borderInfo$ = this._borderInfo$.asObservable();

    dispose(): void {
        this._borderInfo$.complete();
    }

    setType(type: BorderType): void {
        this._borderInfo.type = type;
        this.setActiveBorderType(true);
        this._refresh();
    }

    setColor(color: string): void {
        this._borderInfo.color = color;
        this._refresh();
    }

    setStyle(style: BorderStyleTypes): void {
        this._borderInfo.style = style;
        this._refresh();
    }

    setActiveBorderType(status: boolean) {
        this._borderInfo.activeBorderType = status;
    }

    getBorderInfo(): Readonly<IBorderInfo> {
        return this._borderInfo;
    }

    private _refresh(): void {
        this._borderInfo$.next(this._borderInfo);
    }
}

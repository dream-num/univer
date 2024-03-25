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

import { Tools } from '@univerjs/core';
import type { IBoundRectNoAngle } from '@univerjs/engine-render';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export interface IPopup {
    anchorRect: IBoundRectNoAngle;
    anchorRect$: Observable<IBoundRectNoAngle>;
    componentKey: string;
    onClickOutside?: (e: MouseEvent) => void;
    unitId: string;
    subUnitId: string;
    direction?: 'vertical' | 'horizontal';
    offset?: [number, number];
}

export interface ICanvasPopupService {
    addPopup(item: IPopup): string;
    removePopup(id: string): void;
    removeAll(): void;

    popups$: Observable<[string, IPopup][]>;

    get popups(): [string, IPopup][];
}

export const ICanvasPopupService = createIdentifier<ICanvasPopupService>('univer.popup.service');

export class CanvasPopupService implements ICanvasPopupService {
    private _popupMap = new Map<string, IPopup>();
    private _popups$ = new BehaviorSubject<[string, IPopup][]>([]);

    popups$ = this._popups$.asObservable();

    get popups() {
        return Array.from(this._popupMap.entries());
    }

    private _notice() {
        this._popups$.next(Array.from(this._popupMap.entries()));
    }

    addPopup(item: IPopup): string {
        const id = Tools.generateRandomId();
        this._popupMap.set(id, item);
        this._notice();
        return id;
    }

    removePopup(id: string): void {
        if (this._popupMap.delete(id)) {
            this._notice();
        }
    }

    removeAll(): void {
        this._popupMap.clear();
        this._notice();
    }
}

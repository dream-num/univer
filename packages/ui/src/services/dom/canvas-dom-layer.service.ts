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

import type { IPosition, Serializable } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export interface IFloatDomLayout extends IPosition {
    rotate: number;
    width: number;
    height: number;
    absolute: {
        left: boolean;
        top: boolean;
    };
    opacity?: number;
}

export interface IFloatDom {
    position$: Observable<IFloatDomLayout>;
    id: string;
    componentKey: string | React.ComponentType;
    onPointerMove: (evt: PointerEvent | MouseEvent) => void;
    onPointerDown: (evt: PointerEvent | MouseEvent) => void;
    onPointerUp: (evt: PointerEvent | MouseEvent) => void;
    onWheel: (evt: WheelEvent) => void;
    props?: Record<string, any>;
    data?: Serializable;
    unitId: string;
}

export class CanvasFloatDomService {
    private _domLayerMap = new Map<string, IFloatDom>();
    private _domLayers$ = new BehaviorSubject<[string, IFloatDom][]>([]);

    domLayers$ = this._domLayers$.asObservable();

    get domLayers() {
        return Array.from(this._domLayerMap.entries());
    }

    private _notice() {
        this._domLayers$.next(Array.from(this._domLayerMap.entries()));
    }

    addFloatDom(item: IFloatDom) {
        this._domLayerMap.set(item.id, item);
        this._notice();
    }

    removeFloatDom(id: string): void {
        if (this._domLayerMap.delete(id)) {
            this._notice();
        }
    }

    removeAll(): void {
        this._domLayerMap.clear();
        this._notice();
    }
}

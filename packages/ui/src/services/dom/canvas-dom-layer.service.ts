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
import { Disposable } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';

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

export interface IFloatDomContentBoxConfig {
    /** Amount subtracted from the visible wrapper width and height. @default 2 */
    wrapperInset?: number;
    /** Amount subtracted from the content width and height. @default 4 */
    contentInset?: number;
}

export interface IFloatDom {
    position$: Observable<IFloatDomLayout>;
    id: string;
    domId?: string; // Ensure unique id for dom element at runtime
    componentKey: string | React.ComponentType;
    /**
     * Whether pointer and wheel events inside the floating DOM should be
     * forwarded back to the host canvas. Existing canvas-owned float DOMs keep
     * forwarding by default; interactive embed runtimes can opt out.
     */
    eventPassThrough?: boolean;
    /**
     * Keep rendering this host-owned layer even when focus temporarily moves
     * into a child runtime unit. Interactive embed float blocks need this so
     * their DOM portal is not filtered out when the child handles focus.
     */
    preserveOnFocusChange?: boolean;
    /**
     * Insets subtracted from FloatDom's wrapper and content dimensions.
     * Omitted values preserve the historical wrapper/content insets of 2/4.
     */
    contentBox?: IFloatDomContentBoxConfig;
    onPointerMove: (evt: PointerEvent | MouseEvent) => void;
    onPointerDown: (evt: PointerEvent | MouseEvent) => void;
    onPointerUp: (evt: PointerEvent | MouseEvent) => void;
    onWheel: (evt: WheelEvent) => void;
    props?: Record<string, any>;
    data?: Serializable;
    unitId: string;
}

export function shouldForwardFloatDomEvents(layer: Pick<IFloatDom, 'eventPassThrough'>): boolean {
    return layer.eventPassThrough !== false;
}

export function shouldRenderFloatDomLayer(layer: Pick<IFloatDom, 'unitId' | 'preserveOnFocusChange'>, currentUnitId: string | null | undefined): boolean {
    return layer.unitId === currentUnitId || layer.preserveOnFocusChange === true;
}

export class CanvasFloatDomService extends Disposable {
    private _domLayerMap = new Map<string, IFloatDom>();
    private _domLayers$ = new BehaviorSubject<[string, IFloatDom][]>([]);

    domLayers$ = this._domLayers$.asObservable();

    get domLayers() {
        return Array.from(this._domLayerMap.entries());
    }

    private _notice() {
        this._domLayers$.next(Array.from(this._domLayerMap.entries()));
    }

    updateFloatDom(id: string, item: Partial<IFloatDom>) {
        const current = this._domLayerMap.get(id);
        if (!current) {
            return;
        }
        this._domLayerMap.set(id, {
            ...current,
            ...item,
        });

        this._notice();
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

    override dispose(): void {
        this._domLayerMap.clear();
        this._domLayers$.next([]);
        this._domLayers$.complete();
        super.dispose();
    }
}

export interface ICanvasFloatDomPreview {
    id: string;
    image: string;
    updatedAt: number;
}

export interface ICanvasFloatDomPreviewRequest {
    id: string;
    width: number;
    height: number;
    data?: unknown;
}

export class CanvasFloatDomPreviewService extends Disposable {
    readonly previewUpdated$ = new Subject<ICanvasFloatDomPreview>();
    readonly previewRequested$ = new Subject<ICanvasFloatDomPreviewRequest>();

    private readonly _previewMap = new Map<string, ICanvasFloatDomPreview>();
    private readonly _requestMap = new Map<string, ICanvasFloatDomPreviewRequest>();

    getPreview(id: string): ICanvasFloatDomPreview | undefined {
        return this._previewMap.get(id);
    }

    getPendingRequests(): ICanvasFloatDomPreviewRequest[] {
        return Array.from(this._requestMap.values());
    }

    setPreview(preview: ICanvasFloatDomPreview): void {
        this._previewMap.set(preview.id, preview);
        this._requestMap.delete(preview.id);
        this.previewUpdated$.next(preview);
    }

    removePreview(id: string): void {
        this._previewMap.delete(id);
        this._requestMap.delete(id);
    }

    requestPreview(request: ICanvasFloatDomPreviewRequest): void {
        this._requestMap.set(request.id, request);
        this.previewRequested$.next(request);
    }

    override dispose(): void {
        this._previewMap.clear();
        this._requestMap.clear();
        this.previewUpdated$.complete();
        this.previewRequested$.complete();
        super.dispose();
    }
}

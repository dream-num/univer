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

import type { IDisposable, IRange } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { Disposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export type FormatPainterMode = 'off' | 'once' | 'continuous';

export interface IFormatPainterTarget {
    unitId: string;
    subUnitId?: string;
    shapeId?: string;
    range?: IRange;
}

export interface IFormatPainterSource {
    unitId: string;
    apply(target: IFormatPainterTarget): boolean | Promise<boolean>;
    onModeChange?(mode: FormatPainterMode): void;
}

export interface IFormatPainterAdapter {
    id: string;
    priority: number;
    changes$: Observable<unknown>;
    /** Claim the editing context even when its selection cannot be sampled. */
    isActive(): boolean;
    canStart(): boolean;
    capture(): IFormatPainterSource | null;
    clear?(): boolean | Promise<boolean>;
}

/** One local interaction session; domain commands retain ownership of persisted formatting. */
export class FormatPainterSessionService extends Disposable {
    private readonly _adapters: IFormatPainterAdapter[] = [];
    private readonly _state$ = new BehaviorSubject<FormatPainterMode>('off');
    readonly state$ = this._state$.asObservable();
    private _session: { adapterId: string; source: IFormatPainterSource } | null = null;
    private _applying = false;

    get mode(): FormatPainterMode { return this._state$.value; }
    get unitId(): string | undefined { return this._session?.source.unitId; }

    register(adapter: IFormatPainterAdapter): IDisposable {
        this._adapters.push(adapter);
        this._adapters.sort((a, b) => b.priority - a.priority);
        const subscription = adapter.changes$.subscribe(() => this.refresh());
        this.refresh();
        return this.disposeWithMe(() => {
            subscription.unsubscribe();
            const index = this._adapters.indexOf(adapter);
            if (index >= 0) {
                this._adapters.splice(index, 1);
            }
            if (this.isActive(adapter.id)) {
                this.cancel();
            }
            this.refresh();
        });
    }

    refresh(): void { this._state$.next(this.mode); }
    canStart(): boolean { return this._adapters.find((adapter) => adapter.isActive())?.canStart() ?? false; }
    isActive(adapterId: string): boolean { return this._session?.adapterId === adapterId; }

    canClear(): boolean {
        const adapter = this._adapters.find((candidate) => candidate.isActive());
        return !!adapter?.clear && adapter.canStart();
    }

    async clearFormatting(): Promise<boolean> {
        const adapter = this._adapters.find((candidate) => candidate.isActive());
        if (!adapter?.clear || !adapter.canStart() || this._applying) {
            return false;
        }
        this.cancel();
        this._applying = true;
        try {
            return await adapter.clear();
        } finally {
            this._applying = false;
            this.refresh();
        }
    }

    activate(continuous = false): boolean {
        if (this._session) {
            if (continuous) {
                this._setMode('continuous');
            } else {
                this.cancel();
            }
            return true;
        }
        const adapter = this._adapters.find((candidate) => candidate.isActive());
        if (!adapter?.canStart()) {
            return false;
        }
        const source = adapter.capture();
        if (!source) {
            return false;
        }
        this._session = { adapterId: adapter.id, source };
        this._setMode(continuous ? 'continuous' : 'once');
        return true;
    }

    async apply(adapterId: string, target: IFormatPainterTarget): Promise<boolean> {
        const session = this._session;
        if (!session || session.adapterId !== adapterId || target.unitId !== session.source.unitId || this._applying) {
            return false;
        }
        this._applying = true;
        try {
            const applied = await session.source.apply(target);
            if (applied && this._session === session && this.mode === 'once') {
                this.cancel();
            }
            return applied;
        } finally {
            this._applying = false;
        }
    }

    cancel(): void {
        const session = this._session;
        this._session = null;
        session?.source.onModeChange?.('off');
        this._state$.next('off');
    }

    private _setMode(mode: FormatPainterMode): void {
        this._session?.source.onModeChange?.(mode);
        this._state$.next(mode);
    }

    override dispose(): void {
        this.cancel();
        this._adapters.length = 0;
        this._state$.complete();
        super.dispose();
    }
}

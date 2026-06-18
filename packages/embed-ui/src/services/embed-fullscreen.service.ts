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

import type { EmbedDescriptor } from '@univerjs/embed';
import type { EmbedFullscreenSession } from '../types/embed-ui';
import { BehaviorSubject, Subject } from 'rxjs';

export class EmbedFullscreenService {
    private readonly _session$ = new BehaviorSubject<EmbedFullscreenSession | null>(null);
    private readonly _exited$ = new Subject<EmbedFullscreenSession>();

    readonly session$ = this._session$.asObservable();
    readonly exited$ = this._exited$.asObservable();

    getSession(): EmbedFullscreenSession | null {
        return this._session$.getValue();
    }

    enter(descriptor: EmbedDescriptor): EmbedFullscreenSession {
        if (!descriptor.childUnitId || descriptor.childType == null) {
            throw new Error('EMBED_FULLSCREEN_CHILD_NOT_RESOLVED');
        }

        const floatingConfig = descriptor.sourceMeta?.floating || undefined;
        const tabConfig = descriptor.sourceMeta?.tab || undefined;
        if (tabConfig && tabConfig.enabled && !floatingConfig) {
            throw new Error('EMBED_FULLSCREEN_TAB_NOT_SUPPORTED');
        }

        const layout = floatingConfig
            ? floatingConfig.layout
            : undefined;
        if (!layout) {
            throw new Error('EMBED_FULLSCREEN_LAYOUT_NOT_RESOLVED');
        }

        const session: EmbedFullscreenSession = {
            hostUnitId: descriptor.hostUnitId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId,
            childType: descriptor.childType,
            entry: descriptor.entry,
            layout,
        };
        this._session$.next(session);
        return session;
    }

    exit(embedId?: string): void {
        const current = this.getSession();
        if (!current) {
            return;
        }

        if (!embedId || current.embedId === embedId) {
            this._session$.next(null);
        }
    }

    notifyExited(session: EmbedFullscreenSession): void {
        this._exited$.next(session);
    }
}

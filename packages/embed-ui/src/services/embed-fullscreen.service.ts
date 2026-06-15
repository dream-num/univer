import type { EmbedDescriptor } from '@univerjs/embed';
import type { EmbedFullscreenSession } from '../types/embed-ui';
import { BehaviorSubject } from 'rxjs';

export class EmbedFullscreenService {
    private readonly _session$ = new BehaviorSubject<EmbedFullscreenSession | null>(null);

    readonly session$ = this._session$.asObservable();

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
}

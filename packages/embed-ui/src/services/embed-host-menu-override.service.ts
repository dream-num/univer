import type { EmbedDescriptor, EmbedLayoutPolicy } from '@univerjs/embed';
import type { EmbedHostMenuOverride } from '../types/embed-ui';
import { DEFAULT_EMBED_TAB_LAYOUT_POLICY } from '@univerjs/embed';
import { BehaviorSubject } from 'rxjs';

export interface EmbedHostMenuOverrideActivateOptions {
    layoutPolicy?: EmbedLayoutPolicy;
    allowPlaceholder?: boolean;
}

export class EmbedHostMenuOverrideService {
    private readonly _override$ = new BehaviorSubject<EmbedHostMenuOverride | null>(null);

    readonly override$ = this._override$.asObservable();

    getOverride(): EmbedHostMenuOverride | null {
        return this._override$.getValue();
    }

    activate(
        descriptor: EmbedDescriptor,
        reason: EmbedHostMenuOverride['reason'],
        options: EmbedHostMenuOverrideActivateOptions = {}
    ): EmbedHostMenuOverride | null {
        if (!descriptor.childUnitId || descriptor.childType == null) {
            throw new Error('EMBED_MENU_OVERRIDE_CHILD_NOT_RESOLVED');
        }

        const tabConfig = descriptor.sourceMeta?.tab || undefined;
        if (reason !== 'tab-active' || !tabConfig || tabConfig.enabled !== true) {
            throw new Error('EMBED_MENU_OVERRIDE_TAB_REQUIRED');
        }

        const ribbonPlacement = options.layoutPolicy?.ribbon ?? DEFAULT_EMBED_TAB_LAYOUT_POLICY.ribbon;
        if (ribbonPlacement !== 'host' && options.allowPlaceholder !== true) {
            this.clear(descriptor.embedId);
            return null;
        }

        const override: EmbedHostMenuOverride = {
            hostUnitId: descriptor.hostUnitId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId,
            childType: descriptor.childType,
            entry: descriptor.entry,
            reason,
            hideHostFxBar: tabConfig?.hideHostFxBar,
            lockHostRibbon: tabConfig?.lockHostRibbon,
        };
        this._override$.next(override);
        return override;
    }

    clear(embedId?: string): void {
        const current = this.getOverride();
        if (!current) {
            return;
        }

        if (!embedId || current.embedId === embedId) {
            this._override$.next(null);
        }
    }
}

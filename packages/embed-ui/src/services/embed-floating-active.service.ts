import type { EmbedFloatingActivation } from '../types/embed-ui';
import { BehaviorSubject } from 'rxjs';

export class EmbedFloatingActiveService {
    private readonly _active$ = new BehaviorSubject<EmbedFloatingActivation | null>(null);

    readonly active$ = this._active$.asObservable();

    getActive(): EmbedFloatingActivation | null {
        return this._active$.getValue();
    }

    activate(next: EmbedFloatingActivation): void {
        this._active$.next(next);
    }

    clear(embedId?: string): void {
        const active = this.getActive();
        if (!active) {
            return;
        }

        if (!embedId || active.embedId === embedId) {
            this._active$.next(null);
        }
    }
}

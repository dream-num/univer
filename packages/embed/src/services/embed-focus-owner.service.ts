import type { EmbeddedFocusOwner } from '../types/embed';
import { BehaviorSubject } from 'rxjs';

export class EmbedFocusOwnerService {
    private readonly _focusOwner$ = new BehaviorSubject<EmbeddedFocusOwner | null>(null);

    readonly focusOwner$ = this._focusOwner$.asObservable();

    getFocusOwner(): EmbeddedFocusOwner | null {
        return this._focusOwner$.getValue();
    }

    setFocusOwner(owner: EmbeddedFocusOwner): void {
        const current = this.getFocusOwner();
        if (
            current &&
            current.hostUnitId === owner.hostUnitId &&
            current.embedId === owner.embedId &&
            current.childUnitId === owner.childUnitId &&
            current.childType === owner.childType &&
            current.reason === owner.reason
        ) {
            return;
        }

        this._focusOwner$.next(owner);
    }

    clearFocusOwner(embedId?: string): void {
        const current = this.getFocusOwner();
        if (!current) {
            return;
        }

        if (!embedId || current.embedId === embedId) {
            this._focusOwner$.next(null);
        }
    }
}

import { HorizontalAlign } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export class AlignStyleManagerService implements IDisposable {
    private readonly _alignInfo = {
        horizontal: HorizontalAlign.LEFT,
        vertical: 'top',
    };

    private readonly _alignInfo$ = new BehaviorSubject(this._alignInfo);

    // eslint-disable-next-line @typescript-eslint/member-ordering
    readonly alignInfo$ = this._alignInfo$.asObservable();

    dispose(): void {
        this._alignInfo$.complete();
    }

    setHorizontalAlign(horizontal: HorizontalAlign): void {}
}

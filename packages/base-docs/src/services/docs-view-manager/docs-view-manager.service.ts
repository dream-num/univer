import { Disposable, fromObservable, ICurrentUniverService, toDisposable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { Observable, Subject } from 'rxjs';

import type { DocsView } from '../../View/Render/Views/DocsView';

/**
 * This services manages instances of doc CanvasView and determines which one
 * the user is currently interacting with.
 */
export class DocsViewManagerService extends Disposable {
    readonly current$: Observable<DocsView | null>;

    private readonly _current$: Subject<DocsView | null> = new Subject();

    private readonly _viewsMap = new Map<string, DocsView>();

    constructor(@ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService) {
        super();

        this.disposeWithMe(
            fromObservable(
                this._currentUniverService.focused$.subscribe((id) => {
                    if (!id) {
                        this._current$.next(null);
                        return;
                    }

                    // FIXME: if the focused id is a sheet ID, we should focus on the cell editor instead
                    const view = this._viewsMap.get(id);
                    if (view) {
                        this._current$.next(view ?? null);
                    }
                })
            )
        );

        this.current$ = this._current$.asObservable();
    }

    override dispose(): void {
        super.dispose();

        this._viewsMap.clear();
        this._current$.complete();
    }

    registerCanvasViewForUniverInstance(unitId: string, docsView: DocsView): IDisposable {
        this._viewsMap.set(unitId, docsView);

        return toDisposable(() => {
            this._viewsMap.delete(unitId);
        });
    }

    getDocsView(unitId: string): DocsView | undefined {
        return this._viewsMap.get(unitId);
    }
}

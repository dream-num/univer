import { Disposable, IUniverInstanceService, toDisposable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

import { DocsView } from '../../View/Render/Views/DocsView';

/**
 * This services manages instances of doc CanvasView and determines which one
 * the user is currently interacting with.
 */
export class DocsViewManagerService extends Disposable {
    readonly current$: Observable<DocsView | null>;

    private readonly _current$ = new BehaviorSubject<DocsView | null>(null);

    private readonly _viewsMap = new Map<string, DocsView>();

    constructor(@IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService) {
        super();

        this.disposeWithMe(
            toDisposable(
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

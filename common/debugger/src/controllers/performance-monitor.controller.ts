import type { Nullable } from '@univerjs/core';
import type { Subscription } from 'rxjs';
import { Inject, IUniverInstanceService, LifecycleService, LifecycleStages, RxDisposable } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { distinctUntilChanged, filter, take, takeUntil } from 'rxjs';

export class PerformanceMonitorController extends RxDisposable {
    private _containerElement: HTMLDivElement | null;

    private _currentUnitSub: Nullable<Subscription>;

    constructor(
        @Inject(LifecycleService) lifecycleService: LifecycleService,
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        lifecycleService.subscribeWithPrevious()
            .pipe(
                filter((stage) => stage === LifecycleStages.Rendered),
                take(1)
            )
            .subscribe(() => this._listenDocumentTypeChange());
    }

    override dispose(): void {
        super.dispose();

        this._disposeCurrentObserver();
    }

    private _disposeCurrentObserver(): void {
        this._currentUnitSub?.unsubscribe();
        this._currentUnitSub = null;
    }

    private _listenDocumentTypeChange() {
        this._instanceService.focused$.pipe(takeUntil(this.dispose$), distinctUntilChanged()).subscribe((unitId) => {
            this._disposeCurrentObserver();
            if (unitId) {
                this._listenToRenderer(unitId);
            }
        });
    }

    private _listenToRenderer(unitId: string) {
        const renderer = this._renderManagerService.getRenderById(unitId);
        if (renderer) {
            const { engine } = renderer;
            this._currentUnitSub = engine.endFrame$.subscribe(() => {
                if (!this._containerElement) {
                    this._containerElement = document.querySelector('[data-u-comp=debugger-fps]');
                } else {
                    this._containerElement.textContent = `FPS: ${Math.round(engine.getFps()).toString()}`;
                }
            });
        }
    }
}

import { Inject, Injector } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

import { Disposable, toDisposable } from '../../Shared/lifecycle';
import { ILogService } from '../log/log.service';
import { LifecycleStages, LifecycleToModules } from './lifecycle';

export class LifecycleService extends Disposable {
    private _lifecycle$ = new BehaviorSubject<LifecycleStages>(LifecycleStages.Staring);

    lifecycle$ = this._lifecycle$.asObservable();

    constructor(@ILogService private readonly _logService: ILogService) {
        super();
    }

    get stage(): LifecycleStages {
        return this._lifecycle$.getValue();
    }

    set stage(stage: LifecycleStages) {
        if (stage < this.stage) {
            throw new Error('[LifecycleService]: lifecycle stage cannot go backward!');
        }

        if (stage === this.stage) {
            return;
        }

        this._logService.log('[LifecycleService]: lifecycle progressed to ', stage, ' .');
        this._lifecycle$.next(stage);
    }
}

export class LifecycleInitializerService extends Disposable {
    constructor(
        @Inject(LifecycleService) private _lifecycleService: LifecycleService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    start(): void {
        this.disposeWithMe(
            toDisposable(this._lifecycleService.lifecycle$.subscribe((stage) => this._initModulesOnStage(stage)))
        );
    }

    private _initModulesOnStage(stage: LifecycleStages): void {
        const modules = LifecycleToModules.get(stage);
        modules?.forEach((m) => {
            if (this._injector.has(m)) {
                this._injector.get(m);
            }
        });
    }
}

import { Inject, Injector } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

import { Disposable, toDisposable } from '../../Shared/lifecycle';
import { ILogService } from '../log/log.service';
import { LifecycleNameMap, LifecycleStages, LifecycleToModules } from './lifecycle';

export class LifecycleService extends Disposable {
    private _lifecycle$ = new BehaviorSubject<LifecycleStages>(LifecycleStages.Starting);

    lifecycle$ = this._lifecycle$.asObservable();

    constructor(@ILogService private readonly _logService: ILogService) {
        super();

        this._logService.log(
            `[LifecycleService]`,
            `lifecycle progressed to "${LifecycleNameMap[LifecycleStages.Starting]}".`
        );
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

        this._logService.log(`[LifecycleService]`, `lifecycle progressed to "${LifecycleNameMap[stage]}".`);
        this._lifecycle$.next(stage);
    }

    subscribeWithPrevious(): Observable<LifecycleStages> {
        return new Observable<LifecycleStages>((subscriber) => {
            // before subscribe, emit the current stage and all previous stages
            if (this.stage === LifecycleStages.Starting) {
                // do nothing
            } else if (this.stage === LifecycleStages.Ready) {
                subscriber.next(LifecycleStages.Starting);
            } else if (this.stage === LifecycleStages.Rendered) {
                subscriber.next(LifecycleStages.Starting);
                subscriber.next(LifecycleStages.Ready);
            } else {
                subscriber.next(LifecycleStages.Starting);
                subscriber.next(LifecycleStages.Ready);
                subscriber.next(LifecycleStages.Rendered);
            }

            return this._lifecycle$.subscribe(subscriber);
        });
    }
}

export class LifecycleInitializerService extends Disposable {
    private _started = false;

    constructor(
        @Inject(LifecycleService) private _lifecycleService: LifecycleService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    start(): void {
        if (this._started) {
            return;
        }

        this._started = true;
        this.disposeWithMe(
            toDisposable(
                this._lifecycleService.subscribeWithPrevious().subscribe((stage) => this.initModulesOnStage(stage))
            )
        );
    }

    initModulesOnStage(stage: LifecycleStages): void {
        const modules = LifecycleToModules.get(stage);
        modules?.forEach((m) => {
            if (this._injector.has(m)) {
                this._injector.get(m);
            }
        });
    }
}

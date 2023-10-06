import { DocumentSkeleton } from '@univerjs/base-render';
import { Nullable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

/**
 * This service is for worksheet build sheet skeleton.
 */
export class DocsSkeletonManagerService implements IDisposable {
    private _currentSkeleton: Nullable<DocumentSkeleton> = null;

    private readonly _currentSkeleton$ = new BehaviorSubject<Nullable<DocumentSkeleton>>(this._currentSkeleton);

    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();

    /**
     * CurrentSkeletonBefore for pre-triggered logic during registration
     */
    private readonly _currentSkeletonBefore$ = new BehaviorSubject<Nullable<DocumentSkeleton>>(this._currentSkeleton);

    readonly currentSkeletonBefore$ = this._currentSkeletonBefore$.asObservable();

    dispose(): void {
        this._currentSkeletonBefore$.complete();
        this._currentSkeleton$.complete();
    }

    getCurrent(): Nullable<DocumentSkeleton> {
        return this._currentSkeleton;
    }

    setCurrent(skeleton: DocumentSkeleton) {
        this._currentSkeleton = skeleton;

        this._currentSkeletonBefore$.next(this.getCurrent());

        this._currentSkeleton$.next(this.getCurrent());
    }
}

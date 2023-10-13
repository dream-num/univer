import { Disposable, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

/**
 * This controller controls rendering of the buttons to unhide hidden rows and columns.
 */
@OnLifecycle(LifecycleStages.Rendered, HeaderHiddenController)
export class HeaderHiddenController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();

        this._init();
    }

    override dispose(): void {
        super.dispose();
    }

    private _init(): void {}
}

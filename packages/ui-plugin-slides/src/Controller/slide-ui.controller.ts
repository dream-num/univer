import { IDesktopUIController, IUIController } from '@univerjs/base-ui';
import { Disposable, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

/**
 * This controller registers UI parts of slide workbench to the base-ui workbench.
 */
@OnLifecycle(LifecycleStages.Ready, SlideUIController)
export class SlideUIController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IUIController private readonly _uiController: IDesktopUIController
    ) {
        super();

        this._init();
    }

    private _init(): void {
        // this._uiController.registerSidebarComponent(() => connectInjector(SlideBar, this._injector));
    }
}

import { IDesktopUIController, IUIController } from '@univerjs/base-ui';
import { Disposable, LifecycleStages, LocaleService, LocaleType, ObserverManager, OnLifecycle } from '@univerjs/core';
import { Inject, Injector, SkipSelf } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';

import { ISheetUIPluginConfig } from '../Basics';
import { RenderSheetFooter } from '../View/SheetContainer/SheetContainer';
import { SheetContainerUIController } from './SheetContainerUIController';

@OnLifecycle(LifecycleStages.Rendered, AppUIController)
export class AppUIController extends Disposable {
    private _sheetContainerController: SheetContainerUIController;

    constructor(
        config: ISheetUIPluginConfig,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IUIController private readonly _uiController: IDesktopUIController,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager
    ) {
        super();

        this._sheetContainerController = this._injector.createInstance(SheetContainerUIController, config);
        this._injector.add([SheetContainerUIController, { useValue: this._sheetContainerController }]);

        this.disposeWithMe(
            this._uiController.registerFooterComponent(() => connectInjector(RenderSheetFooter, this._injector))
        );
    }

    /**
     * Change language
     * @param {String} lang new language
     *
     * e: {target: HTMLSelectElement } reference from  https://stackoverflow.com/a/48443771
     *
     */
    changeLocale = (locale: string) => {
        this._localeService.getLocale().change(locale as LocaleType);

        // publish
        this._globalObserverManager.requiredObserver('onAfterChangeUILocaleObservable', 'core')!.notifyObservers();
    };

    getSheetContainerController() {
        return this._sheetContainerController;
    }
}

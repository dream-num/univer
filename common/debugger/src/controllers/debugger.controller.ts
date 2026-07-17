import type { IUniverDebuggerConfig } from '../config/config';
import { Disposable, IConfigService, Inject, Injector } from '@univerjs/core';
import {
    BuiltInUIPart,
    connectInjector,
    IMenuManagerService,
    IUIPartsService,
    // MenuItemType,
    // RibbonStartGroup,
} from '@univerjs/ui';
import { DEBUGGER_PLUGIN_CONFIG_KEY } from '../config/config';
import { Fab } from '../views/Fab';
import { RecordController } from './local-save/record.controller';

export class DebuggerController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService
    ) {
        super();

        this._initCustomComponents();
        // this._menuManagerService.mergeMenu({
        //     [RibbonStartGroup.OTHERS]: {
        //         EMOJI: {
        //             order: 9999,
        //             menuItemFactory: () => {
        //                 return {
        //                     id: 'EMOJI',
        //                     icon: 'VueComponent',
        //                     type: MenuItemType.BUTTON,
        //                 };
        //             },
        //         },
        //         COUNTER: {
        //             order: 9999,
        //             menuItemFactory: () => {
        //                 return {
        //                     id: 'COUNTER',
        //                     icon: 'counter-component',
        //                     type: MenuItemType.BUTTON,
        //                 };
        //             },
        //         },
        //     },
        // });

        this._injector.add([RecordController]);
    }

    private _initCustomComponents(): void {
        const configs = this._configService.getConfig<IUniverDebuggerConfig>(DEBUGGER_PLUGIN_CONFIG_KEY);

        if (configs?.fab) {
            this.disposeWithMe(
                this._uiPartsService.registerComponent(BuiltInUIPart.GLOBAL, () => connectInjector(Fab, this._injector))
            );
        }
    }
}

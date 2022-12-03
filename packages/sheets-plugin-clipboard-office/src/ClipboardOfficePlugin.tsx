import { Plugin, SheetContext, UniverSheet } from '@univer/core';
import { zh, en } from './Locale';
import { CLIPBOARD_OFFICE_PLUGIN_NAME } from './Basic/Const/PLUGIN_NAME';
import { ClipboardOfficeController } from './Controller/ClipboardOfficeController';
import { RegisterPlugin, REGISTER_PLUGIN_NAME } from '@univer/common-plugin-register';
import { ClipboardOfficeExtensionFactory } from './Basic/Register';

export interface IClipboardOfficePluginConfig {}

export class ClipboardOfficePlugin extends Plugin<any, SheetContext> {
    private _clipboardOfficeController: ClipboardOfficeController;

    private _clipboardOfficeExtensionFactory: ClipboardOfficeExtensionFactory;

    constructor(config?: IClipboardOfficePluginConfig) {
        super(CLIPBOARD_OFFICE_PLUGIN_NAME);
    }

    static create(config?: IClipboardOfficePluginConfig) {
        return new ClipboardOfficePlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    initialize(): void {
        const context = this.getContext();

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en: en,
            zh: zh,
        });

        this._clipboardOfficeController = new ClipboardOfficeController(this);

        this.registerExtension();
    }

    registerExtension() {
        const clipboardRegister = this.getContext().getPluginManager().getRequirePluginByName<RegisterPlugin>(REGISTER_PLUGIN_NAME).getClipboardExtensionManager().getRegister();

        this._clipboardOfficeExtensionFactory = new ClipboardOfficeExtensionFactory(this);
        clipboardRegister.add(this._clipboardOfficeExtensionFactory);
    }

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {
        const clipboardRegister = this.getContext().getPluginManager().getRequirePluginByName<RegisterPlugin>(REGISTER_PLUGIN_NAME).getClipboardExtensionManager().getRegister();

        clipboardRegister.delete(this._clipboardOfficeExtensionFactory);
    }
}

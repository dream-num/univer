import { SheetContext, Plugin, UniverSheet } from '@univerjs/core';
import { SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '@univerjs/ui-plugin-sheets';
import { en, zh } from './Locale';
import { OPERATION_PLUGIN } from './Const';
import { Copy, Paste, UniverCopy, UniverPaste } from './Domain';
import { PasteExtensionFactory } from './Basics/Register/PasteExtension';
import { PasteOfficeExtensionFactory } from './Basics/Register/PasteOfficeExtension';
import { DEFAULT_OPERATION_PLUGIN_DATA } from './Basics/Const/DEFAULT_OPERATION_PLUGIN_DATA';
import { IOperationPluginConfig } from './Basics/Interfaces/IOperationPluginConfig';
import { CopyExtensionFactory } from './Basics/Register/CopyExtension';
import { CopyImageExtensionFactory } from './Basics/Register/CopyImageExtension';
import { PasteImageExtensionFactory } from './Basics/Register/PasteImageExtension';

interface CopyResolver {
    name: string;
    resolver: Copy;
}

interface PasteResolver {
    name: string;
    resolver: Paste;
}

export class OperationPlugin extends Plugin<any, SheetContext> {
    private _config: IOperationPluginConfig;

    private _copyResolvers: CopyResolver[] = [];

    private _pasteResolvers: PasteResolver[] = [];

    private _univerPaste: UniverPaste;

    private _univerCopy: UniverCopy;

    private _pasteExtensionFactory: PasteExtensionFactory;

    private _pasteOfficeExtensionFactory: PasteOfficeExtensionFactory;

    private _pasteImageExtensionFactory: PasteImageExtensionFactory;

    private _copyExtensionFactory: CopyExtensionFactory;

    private _copyImageExtensionFactory: CopyImageExtensionFactory;

    constructor(config?: Partial<IOperationPluginConfig>) {
        super(OPERATION_PLUGIN);
        this._config = Object.assign(DEFAULT_OPERATION_PLUGIN_DATA, config);
    }

    static create(config?: Partial<IOperationPluginConfig>) {
        return new OperationPlugin(config);
    }

    getConfig(): IOperationPluginConfig {
        return this._config;
    }

    initialize() {
        this.registerExtension();
    }

    registerExtension() {
        const pasteRegister = this.getGlobalContext()
            .getPluginManager()
            .getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
            .getRegisterManager()
            .getPasteExtensionManager()
            .getRegister();

        this._pasteExtensionFactory = new PasteExtensionFactory(this);
        pasteRegister.add(this._pasteExtensionFactory);

        this._pasteOfficeExtensionFactory = new PasteOfficeExtensionFactory(this);
        pasteRegister.add(this._pasteOfficeExtensionFactory);
        this._pasteImageExtensionFactory = new PasteImageExtensionFactory(this);
        pasteRegister.add(this._pasteImageExtensionFactory);

        const copyRegister = this.getGlobalContext()
            .getPluginManager()
            .getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
            .getRegisterManager()
            .getCopyExtensionManager()
            .getRegister();

        this._copyExtensionFactory = new CopyExtensionFactory(this);
        copyRegister.add(this._copyExtensionFactory);

        this._copyImageExtensionFactory = new CopyImageExtensionFactory(this);
        copyRegister.add(this._copyImageExtensionFactory);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    onDestroy(): void {
        const pasteRegister = this.getContext()
            .getPluginManager()
            .getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
            .getRegisterManager()
            .getPasteExtensionManager()
            .getRegister();
        pasteRegister.delete(this._pasteExtensionFactory);
        pasteRegister.delete(this._pasteOfficeExtensionFactory);
        pasteRegister.delete(this._pasteImageExtensionFactory);

        const copyRegister = this.getGlobalContext()
            .getPluginManager()
            .getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
            .getRegisterManager()
            .getCopyExtensionManager()
            .getRegister();

        copyRegister.delete(this._copyExtensionFactory);
        copyRegister.delete(this._copyImageExtensionFactory);
    }

    onMounted(context: SheetContext): void {
        super.onMounted(context);
        this.getLocale().load({
            en,
            zh,
        });
        // this.installPasteResolver({ name: 'univerPaste', resolver: new UniverPaste(context) });
        this._univerPaste = new UniverPaste(context);
        this._univerCopy = new UniverCopy(context);
        // this.installCopyResolver({ name: 'univerCopy', resolver: new UniverCopy(context) });
        this.initialize();
    }

    getUniverPaste() {
        return this._univerPaste;
    }

    getUniverCopy() {
        return this._univerCopy;
    }

    // installCopyResolver(resolver: CopyResolver) {
    //     const index = this._copyResolvers.findIndex((item) => item.name === resolver.name);
    //     if (index > -1) return false;
    //     this._copyResolvers.push(resolver);
    // }

    // installPasteResolver(resolver: PasteResolver) {
    //     const index = this._pasteResolvers.findIndex((item) => item.name === resolver.name);
    //     if (index > -1) return false;
    //     this._pasteResolvers.push(resolver);
    // }
}

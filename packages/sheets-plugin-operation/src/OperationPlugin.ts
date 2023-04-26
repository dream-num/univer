import { SheetContext, Plugin, UniverSheet } from '@univerjs/core';
import { SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '@univerjs/ui-plugin-sheets';
import { en, zh } from './Locale';
import { OPERATION_PLUGIN } from './Const';
import { Copy, Paste, UniverCopy, UniverPaste } from './Domain';
import { PasteExtensionFactory } from './Basics/Register/PasteExtension';
import { PasteOfficeExtensionFactory } from './Basics/Register/PasteOfficeExtension';

interface CopyResolver {
    name: string;
    resolver: Copy;
}

interface PasteResolver {
    name: string;
    resolver: Paste;
}

export class OperationPlugin extends Plugin<any, SheetContext> {
    private _copyResolvers: CopyResolver[] = [];

    private _pasteResolvers: PasteResolver[] = [];

    private _univerPaste: UniverPaste;

    private _clipboardExtensionFactory: PasteExtensionFactory;

    private _clipboardOfficeExtensionFactory: PasteOfficeExtensionFactory;

    constructor() {
        super(OPERATION_PLUGIN);
    }

    static create() {
        return new OperationPlugin();
    }

    initialize() {
        this.registerExtension();
    }

    registerExtension() {
        const clipboardRegister = this.getGlobalContext()
            .getPluginManager()
            .getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
            .getRegisterManager()
            .getClipboardExtensionManager()
            .getRegister();
        // const clipboardRegister = this.getGlobalContext().getPluginManager().getRequirePluginByName<RegisterPlugin>(REGISTER_PLUGIN_NAME).getClipboardExtensionManager().getRegister();

        this._clipboardExtensionFactory = new PasteExtensionFactory(this);
        clipboardRegister.add(this._clipboardExtensionFactory);

        this._clipboardOfficeExtensionFactory = new PasteOfficeExtensionFactory(this);
        clipboardRegister.add(this._clipboardOfficeExtensionFactory);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    onDestroy(): void {
        const clipboardRegister = this.getContext()
            .getPluginManager()
            .getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
            .getRegisterManager()
            .getClipboardExtensionManager()
            .getRegister();
        clipboardRegister.delete(this._clipboardExtensionFactory);
        clipboardRegister.delete(this._clipboardOfficeExtensionFactory);
    }

    onMounted(context: SheetContext): void {
        super.onMounted(context);
        this.getLocale().load({
            en,
            zh,
        });
        // this.installPasteResolver({ name: 'univerPaste', resolver: new UniverPaste(context) });
        this._univerPaste = new UniverPaste(context);
        this.installCopyResolver({ name: 'univerCopy', resolver: new UniverCopy(context) });
        this.initialize();
    }

    getUniverPaste() {
        return this._univerPaste;
    }

    installCopyResolver(resolver: CopyResolver) {
        const index = this._copyResolvers.findIndex((item) => item.name === resolver.name);
        if (index > -1) return false;
        this._copyResolvers.push(resolver);
    }

    // installPasteResolver(resolver: PasteResolver) {
    //     const index = this._pasteResolvers.findIndex((item) => item.name === resolver.name);
    //     if (index > -1) return false;
    //     this._pasteResolvers.push(resolver);
    // }
}

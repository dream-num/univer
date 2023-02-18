import { SheetContext, Plugin, UniverSheet, PLUGIN_NAMES } from '@univerjs/core';
import { BaseComponentPlugin } from '@univerjs/base-ui';
import { en, zh } from './Locale';
import { CLIPBOARD_PLUGIN } from './Const';
import { Copy, Paste, UniverCopy, UniverPaste } from './Domain';
import { ClipboardExtensionFactory } from './Basics/Register/ClipboardExtension';
import { ClipboardOfficeExtensionFactory } from './Basics/Register/ClipboardOfficeExtension';

interface CopyResolver {
    name: string;
    resolver: Copy;
}

interface PasteResolver {
    name: string;
    resolver: Paste;
}

export class ClipboardPlugin extends Plugin<any, SheetContext> {
    private _copyResolvers: CopyResolver[] = [];

    private _pasteResolvers: PasteResolver[] = [];

    private _univerPaste: UniverPaste;

    private _clipboardExtensionFactory: ClipboardExtensionFactory;

    private _clipboardOfficeExtensionFactory: ClipboardOfficeExtensionFactory;

    constructor() {
        super(CLIPBOARD_PLUGIN);
    }

    static create() {
        return new ClipboardPlugin();
    }

    initialize() {
        this.registerExtension();
    }

    registerExtension() {
        const clipboardRegister = this.getContext()
            .getPluginManager()
            .getRequirePluginByName<BaseComponentPlugin>(PLUGIN_NAMES.BASE_COMPONENT)
            .getRegisterManager()
            .getClipboardExtensionManager()
            .getRegister();
        // const clipboardRegister = this.getGlobalContext().getPluginManager().getRequirePluginByName<RegisterPlugin>(REGISTER_PLUGIN_NAME).getClipboardExtensionManager().getRegister();

        this._clipboardExtensionFactory = new ClipboardExtensionFactory(this);
        clipboardRegister.add(this._clipboardExtensionFactory);

        this._clipboardOfficeExtensionFactory = new ClipboardOfficeExtensionFactory(this);
        clipboardRegister.add(this._clipboardOfficeExtensionFactory);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    onDestroy(): void {
        const clipboardRegister = this.getContext()
            .getPluginManager()
            .getRequirePluginByName<BaseComponentPlugin>(PLUGIN_NAMES.BASE_COMPONENT)
            .getRegisterManager()
            .getClipboardExtensionManager()
            .getRegister();
        clipboardRegister.delete(this._clipboardExtensionFactory);

        clipboardRegister.delete(this._clipboardOfficeExtensionFactory);
    }

    onMounted(context: SheetContext): void {
        super.onMounted(context);
        context.getLocale().load({
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

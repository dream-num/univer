import { SheetContext, Plugin, UniverSheet } from '@univer/core';
import { RegisterPlugin, REGISTER_PLUGIN_NAME } from '@univer/common-plugin-register';
import { en, zh } from './Locale';
import { CLIPBOARD_PLUGIN } from './Const';
import { Copy, UniverCopy, Paste, UniverPaste } from './Domain';
import { ClipboardExtensionFactory } from './Basics/Register/ClipboardExtension';

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

    private _clipboardExtensionFactory: ClipboardExtensionFactory;

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
        const clipboardRegister = this.getContext().getPluginManager().getRequirePluginByName<RegisterPlugin>(REGISTER_PLUGIN_NAME).getClipboardExtensionManager().getRegister();

        this._clipboardExtensionFactory = new ClipboardExtensionFactory(this);
        clipboardRegister.add(this._clipboardExtensionFactory);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    onDestroy(): void {
        const clipboardRegister = this.getContext().getPluginManager().getRequirePluginByName<RegisterPlugin>(REGISTER_PLUGIN_NAME).getClipboardExtensionManager().getRegister();
        clipboardRegister.delete(this._clipboardExtensionFactory);
    }

    onMounted(context: SheetContext): void {
        super.onMounted(context);
        context.getLocale().load({
            en,
            zh,
        });
        this.installPasteResolver({ name: 'univerPaste', resolver: new UniverPaste(context) });
        this.installCopyResolver({ name: 'univerCopy', resolver: new UniverCopy(context) });
        this.initialize();
    }

    installCopyResolver(resolver: CopyResolver) {
        const index = this._copyResolvers.findIndex((item) => item.name === resolver.name);
        if (index > -1) return false;
        this._copyResolvers.push(resolver);
    }

    installPasteResolver(resolver: PasteResolver) {
        const index = this._pasteResolvers.findIndex((item) => item.name === resolver.name);
        if (index > -1) return false;
        this._pasteResolvers.push(resolver);
    }
}

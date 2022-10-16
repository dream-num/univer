import { Context, Plugin, UniverSheet } from '@univer/core';
import { en, zh } from './Locale';
import { CLIPBOARD_PLUGIN } from './Const';
import { Copy, UniverCopy, Paste, UniverPaste } from './Domain';

interface CopyResolver {
    name: string;
    resolver: Copy;
}

interface PasteResolver {
    name: string;
    resolver: Paste;
}

export class ClipboardPlugin extends Plugin {
    private _copyResolvers: CopyResolver[] = [];

    private _pasteResolvers: PasteResolver[] = [];

    constructor() {
        super(CLIPBOARD_PLUGIN);
    }

    static create() {
        return new ClipboardPlugin();
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    onMounted(context: Context): void {
        context.getLocale().load({
            en,
            zh,
        });
        this.installPasteResolver({ name: 'univerPaste', resolver: new UniverPaste(context) });
        this.installCopyResolver({ name: 'univerCopy', resolver: new UniverCopy(context) });
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

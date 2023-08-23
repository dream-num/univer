import { LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';
import { RegisterManager } from '@univerjs/base-ui';
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

export class OperationPlugin extends Plugin {
    static override type = PluginType.Sheet;

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

    constructor(
        config: Partial<IOperationPluginConfig>,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(RegisterManager) private readonly _registerManager: RegisterManager
    ) {
        super(OPERATION_PLUGIN);
        this._config = Object.assign(DEFAULT_OPERATION_PLUGIN_DATA, config);
        this.initializeDependencies(_injector);
    }

    getConfig(): IOperationPluginConfig {
        return this._config;
    }

    initialize() {
        this._localeService.getLocale().load({
            en,
            zh,
        });

        this.registerExtension();
        this._univerPaste = this._injector.get(UniverPaste);
        this._univerCopy = this._injector.get(UniverCopy);
    }

    registerExtension() {
        const pasteRegister = this._registerManager.getPasteExtensionManager().getRegister();

        this._pasteExtensionFactory = new PasteExtensionFactory(this);
        pasteRegister.add(this._pasteExtensionFactory);

        this._pasteOfficeExtensionFactory = new PasteOfficeExtensionFactory(this);
        pasteRegister.add(this._pasteOfficeExtensionFactory);
        this._pasteImageExtensionFactory = new PasteImageExtensionFactory(this);
        pasteRegister.add(this._pasteImageExtensionFactory);

        const copyRegister = this._registerManager.getCopyExtensionManager().getRegister();

        this._copyExtensionFactory = new CopyExtensionFactory(this);
        copyRegister.add(this._copyExtensionFactory);

        this._copyImageExtensionFactory = new CopyImageExtensionFactory(this);
        copyRegister.add(this._copyImageExtensionFactory);
    }

    // installTo(universheetInstance: UniverSheet) {
    //     universheetInstance.installPlugin(this);
    // }

    override onDestroy(): void {
        const pasteRegister = this._registerManager.getPasteExtensionManager().getRegister();
        pasteRegister.delete(this._pasteExtensionFactory);
        pasteRegister.delete(this._pasteOfficeExtensionFactory);
        pasteRegister.delete(this._pasteImageExtensionFactory);

        const copyRegister = this._registerManager.getCopyExtensionManager().getRegister();

        copyRegister.delete(this._copyExtensionFactory);
        copyRegister.delete(this._copyImageExtensionFactory);
    }

    override onMounted(): void {
        this.initialize();
    }

    getUniverPaste() {
        return this._univerPaste;
    }

    getUniverCopy() {
        return this._univerCopy;
    }

    initializeDependencies(injector: Injector) {
        const dependencies: Dependency[] = [[UniverPaste], [UniverCopy]];

        dependencies.forEach((d) => {
            injector.add(d);
        });
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

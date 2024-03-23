/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injector } from '@wendellhu/redi';

import type { DocumentDataModel } from '../docs/data-model/document-data-model';
import type { Plugin, PluginCtor } from '../plugin/plugin';
import { PluginRegistry, PluginStore, PluginType } from '../plugin/plugin';
import { CommandService, ICommandService } from '../services/command/command.service';
import { ConfigService, IConfigService } from '../services/config/config.service';
import { ContextService, IContextService } from '../services/context/context.service';
import { ErrorService } from '../services/error/error.service';
import {
    FloatingObjectManagerService,
    IFloatingObjectManagerService,
} from '../services/floating-object/floating-object-manager.service';
import { IUniverInstanceService, UniverInstanceService } from '../services/instance/instance.service';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../services/lifecycle/lifecycle.service';
import { LocaleService } from '../services/locale/locale.service';
import { DesktopLogService, ILogService } from '../services/log/log.service';
import { IPermissionService, PermissionService } from '../services/permission/permission.service';
import { UniverPermissionService } from '../services/permission/univer.permission.service';
import { ResourceManagerService } from '../services/resource-manager/resource-manager.service';
import { IResourceManagerService } from '../services/resource-manager/type';
import { ThemeService } from '../services/theme/theme.service';
import { IUndoRedoService, LocalUndoRedoService } from '../services/undoredo/undoredo.service';
import type { Workbook } from '../sheets/workbook';
import type { SlideDataModel } from '../slides/domain/slide-model';
import type { LocaleType } from '../types/enum/locale-type';
import type { IDocumentData, ISlideData, IUniverData, IWorkbookData } from '../types/interfaces';
import { PluginHolder } from './plugin-holder';
import { UniverDoc } from './univer-doc';
import { UniverSheet } from './univer-sheet';
import { UniverSlide } from './univer-slide';

const INIT_LAZY_PLUGINS_TIMEOUT = 200;

export class Univer extends PluginHolder {
    protected readonly _injector: Injector;

    private readonly _univerPluginStore = new PluginStore();
    private readonly _univerPluginRegistry = new PluginRegistry();

    private _univerSheet: UniverSheet | null = null;
    private _univerDoc: UniverDoc | null = null;
    private _univerSlide: UniverSlide | null = null;

    private get _univerInstanceService(): IUniverInstanceService {
        return this._injector.get(IUniverInstanceService);
    }

    protected get _lifecycleService(): LifecycleService {
        return this._injector.get(LifecycleService);
    }

    protected get _lifecycleInitializerService(): LifecycleInitializerService {
        return this._injector.get(LifecycleInitializerService);
    }

    constructor(univerData: Partial<IUniverData> = {}) {
        super();

        this._injector = this._initDependencies();

        const { theme, locale, locales, logLevel } = univerData;

        theme && this._injector.get(ThemeService).setTheme(theme);
        locales && this._injector.get(LocaleService).load(locales);
        locale && this._injector.get(LocaleService).setLocale(locale);
        logLevel && this._injector.get(ILogService).setLogLevel(logLevel);
    }

    __getInjector(): Injector {
        return this._injector;
    }

    override dispose(): void {
        this._injector.dispose();

        super.dispose();
    }

    setLocale(locale: LocaleType) {
        this._injector.get(LocaleService).setLocale(locale);
    }

    /**
     * Create a univer sheet instance with internal dependency injection.
     */
    createUniverSheet(config: Partial<IWorkbookData>): Workbook {
        let workbook: Workbook;
        const addSheet = () => {
            workbook = this._univerSheet!.createSheet(config);
            this._univerInstanceService.addSheet(workbook);
        };

        if (!this._univerSheet) {
            this._tryProgressToStart();

            const univerSheet = (this._univerSheet = this._injector.createInstance(UniverSheet));
            const sheetPlugins: Array<[PluginCtor<any>, any]> = this._univerPluginRegistry
                .getRegisterPlugins(PluginType.Sheet)
                .map((p) => [p.plugin, p.options]);
            this._univerPluginRegistry.clearPluginsOfType(PluginType.Sheet);
            univerSheet.addPlugins(sheetPlugins);

            addSheet();

            this._tryProgressToReady();
        } else {
            addSheet();
        }

        return workbook!;
    }

    createUniverDoc(config: Partial<IDocumentData>): DocumentDataModel {
        let doc: DocumentDataModel;
        const addDoc = () => {
            doc = this._univerDoc!.createDoc(config);
            this._univerInstanceService.addDoc(doc);
        };

        if (!this._univerDoc) {
            this._tryProgressToStart();

            const univerDoc = (this._univerDoc = this._injector.createInstance(UniverDoc));
            const docPlugins: Array<[PluginCtor<any>, any]> = this._univerPluginRegistry
                .getRegisterPlugins(PluginType.Doc)
                .map((p) => [p.plugin, p.options]);
            this._univerPluginRegistry.clearPluginsOfType(PluginType.Doc);
            univerDoc.addPlugins(docPlugins);

            addDoc();

            this._tryProgressToReady();
        } else {
            addDoc();
        }

        return doc!;
    }

    createUniverSlide(config: Partial<ISlideData>): SlideDataModel {
        let slide: SlideDataModel;
        const addSlide = () => {
            slide = this._univerSlide!.createSlide(config);
            this._univerInstanceService.addSlide(slide);
        };

        if (!this._univerSlide) {
            this._tryProgressToStart();

            const univerSlide = (this._univerSlide = this._injector.createInstance(UniverSlide));
            const slidePlugins: Array<[PluginCtor<any>, any]> = this._univerPluginRegistry
                .getRegisterPlugins(PluginType.Slide)
                .map((p) => [p.plugin, p.options]);
            this._univerPluginRegistry.clearPluginsOfType(PluginType.Slide);
            univerSlide.addPlugins(slidePlugins);

            addSlide();

            this._tryProgressToReady();
        } else {
            addSlide();
        }

        return slide!;
    }

    private _initDependencies(): Injector {
        return new Injector([
            [
                IUniverInstanceService,
                {
                    useFactory: (contextService: IContextService) =>
                        new UniverInstanceService(
                            {
                                createUniverDoc: (data) => this.createUniverDoc(data),
                                createUniverSheet: (data) => this.createUniverSheet(data),
                                createUniverSlide: (data) => this.createUniverSlide(data),
                            },
                            contextService
                        ),
                    deps: [IContextService],
                },
            ],
            [ErrorService],
            [LocaleService],
            [ThemeService],
            [LifecycleService],
            [LifecycleInitializerService],
            [IPermissionService, { useClass: PermissionService }],
            [UniverPermissionService],
            [ILogService, { useClass: DesktopLogService, lazy: true }],
            [ICommandService, { useClass: CommandService, lazy: true }],
            [IUndoRedoService, { useClass: LocalUndoRedoService, lazy: true }],
            [IConfigService, { useClass: ConfigService }],
            [IContextService, { useClass: ContextService }],
            [IFloatingObjectManagerService, { useClass: FloatingObjectManagerService, lazy: true }],
            [IResourceManagerService, { useClass: ResourceManagerService, lazy: true }],
        ]);
    }

    /**
     * Initialize modules provided by Univer-type plugins.
     */
    private _tryProgressToStart(): void {
        if (this._started) {
            return;
        }

        this._injector.get(LifecycleInitializerService).start();
        this._started = true;
    }

    private _tryProgressToReady(): void {
        const lifecycleService = this._injector.get(LifecycleService);
        if (lifecycleService.stage < LifecycleStages.Ready) {
            this._injector.get(LifecycleService).stage = LifecycleStages.Ready;
            this._univerPluginStore.forEachPlugin((p) => p.onReady());
        }
    }

    // #region register plugins

    /** Register a plugin into univer. */
    registerPlugin<T extends PluginCtor<Plugin>>(plugin: T, config?: ConstructorParameters<T>[0]): void {
        if (plugin.type === PluginType.Univer) {
            this._registerUniverPlugin(plugin, config);
        } else if (plugin.type === PluginType.Sheet) {
            this._registerSheetsPlugin(plugin, config);
        } else if (plugin.type === PluginType.Doc) {
            this._registerDocsPlugin(plugin, config);
        } else if (plugin.type === PluginType.Slide) {
            this._registerSlidesPlugin(plugin, config);
        } else {
            throw new Error(`Unimplemented plugin system for business: "${plugin.type}".`);
        }

        // If Univer has already started, we should manually call onStarting for the plugin.
        // We do that in an asynchronous way, because user may lazy load several plugins at the same time.
        if (this._started) {
            return this._scheduleInitPluginAfterStarted();
        }
    }

    private _initLazyPluginsTimer?: number;

    private _scheduleInitPluginAfterStarted() {
        if (this._initLazyPluginsTimer === undefined) {
            this._initLazyPluginsTimer = setTimeout(
                () => this._flushLazyPlugins(),
                INIT_LAZY_PLUGINS_TIMEOUT
            ) as unknown as number;
        }
    }

    private _flushLazyPlugins() {
        this._initLazyPluginsTimer = undefined;

        const univerLazyPlugins = this._univerPluginRegistry.getRegisterPlugins(PluginType.Univer);
        if (univerLazyPlugins.length) {
            this._univerPluginRegistry.clearPluginsOfType(PluginType.Univer);
            const pluginInstances = univerLazyPlugins.map((p) => this._injector.createInstance(p.plugin, p.options));
            this._takePluginsThroughLifecycle(pluginInstances);
        }

        if (this._univerSheet) {
            const sheetPlugins: Array<[PluginCtor<any>, any]> = this._univerPluginRegistry
                .getRegisterPlugins(PluginType.Sheet)
                .map((p) => [p.plugin, p.options]);

            if (sheetPlugins.length) {
                this._univerSheet.addPlugins(sheetPlugins);
                this._univerPluginRegistry.clearPluginsOfType(PluginType.Sheet);
            }
        }

        if (this._univerDoc) {
            const docPlugins: Array<[PluginCtor<any>, any]> = this._univerPluginRegistry
                .getRegisterPlugins(PluginType.Doc)
                .map((p) => [p.plugin, p.options]);

            if (docPlugins.length) {
                this._univerDoc.addPlugins(docPlugins);
                this._univerPluginRegistry.clearPluginsOfType(PluginType.Doc);
            }
        }

        if (this._univerSlide) {
            const slidePlugins: Array<[PluginCtor<any>, any]> = this._univerPluginRegistry
                .getRegisterPlugins(PluginType.Slide)
                .map((p) => [p.plugin, p.options]);

            if (slidePlugins.length) {
                this._univerSlide.addPlugins(slidePlugins);
                this._univerPluginRegistry.clearPluginsOfType(PluginType.Slide);
            }
        }
    }

    private _registerUniverPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options?: any): void {
        if (this._started) {
            this._univerPluginRegistry.registerPlugin(pluginCtor, options);
        } else {
            // For plugins at Univer level. Plugins would be initialized immediately so they can register dependencies.
            const pluginInstance: Plugin = this._injector.createInstance(pluginCtor, options);
            pluginInstance.onStarting(this._injector);
            this._univerPluginStore.addPlugin(pluginInstance);
        }
    }

    private _registerSheetsPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options?: any) {
        this._univerPluginRegistry.registerPlugin(pluginCtor, options);
    }

    private _registerDocsPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options?: any) {
        this._univerPluginRegistry.registerPlugin(pluginCtor, options);
    }

    private _registerSlidesPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options?: any) {
        this._univerPluginRegistry.registerPlugin(pluginCtor, options);
    }

    // #endregion
}

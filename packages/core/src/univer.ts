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

import { DocumentDataModel } from './docs/data-model/document-data-model';
import type { Plugin, PluginCtor } from './common/plugin';
import { PluginType } from './common/plugin';
import { CommandService, ICommandService } from './services/command/command.service';
import { ConfigService, IConfigService } from './services/config/config.service';
import { ContextService, IContextService } from './services/context/context.service';
import { ErrorService } from './services/error/error.service';
import {
    FloatingObjectManagerService,
    IFloatingObjectManagerService,
} from './services/floating-object/floating-object-manager.service';
import { IUniverInstanceService, UniverInstanceService } from './services/instance/instance.service';
import { LifecycleStages } from './services/lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from './services/lifecycle/lifecycle.service';
import { LocaleService } from './services/locale/locale.service';
import { DesktopLogService, ILogService } from './services/log/log.service';
import { IPermissionService, PermissionService } from './services/permission/permission.service';
import { UniverPermissionService } from './services/permission/univer.permission.service';
import { ResourceManagerService } from './services/resource-manager/resource-manager.service';
import { IResourceManagerService } from './services/resource-manager/type';
import { ResourceLoaderService } from './services/resource-loader/resource-loader.service';
import { IResourceLoaderService } from './services/resource-loader/type';
import { ThemeService } from './services/theme/theme.service';
import { IUndoRedoService, LocalUndoRedoService } from './services/undoredo/undoredo.service';
import { Workbook } from './sheets/workbook';
import { SlideDataModel } from './slides/slide-model';
import type { LocaleType } from './types/enum/locale-type';
import type { IDocumentData, ISlideData, IUniverData, IWorkbookData } from './types/interfaces';
import { PluginHolder } from './common/plugin-holder';
import type { UnitModel, UnitType } from './common/unit';
import { UniverInstanceType } from './common/unit';

const INIT_LAZY_PLUGINS_TIMEOUT = 200;

export class Univer extends PluginHolder {
    private _startedTypes = new Set<UnitType>();
    private _pluginHoldersForTypes = new Map<UnitType, PluginHolder>();

    private get _univerInstanceService(): IUniverInstanceService {
        return this._injector.get(IUniverInstanceService);
    }

    constructor(univerData: Partial<IUniverData> = {}) {
        const injector = createUniverInjector();
        const lifecycleService = injector.get(LifecycleService);
        const lifecycleInitializerService = injector.get(LifecycleInitializerService);

        super(injector, lifecycleService, lifecycleInitializerService);

        const { theme, locale, locales, logLevel } = univerData;

        theme && this._injector.get(ThemeService).setTheme(theme);
        locales && this._injector.get(LocaleService).load(locales);
        locale && this._injector.get(LocaleService).setLocale(locale);
        logLevel && this._injector.get(ILogService).setLogLevel(logLevel);

        this._init(injector);
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

    createUnit<T, U extends UnitModel>(type: UnitType, data: Partial<T>): U {
        return this._univerInstanceService.createUnit(type, data);
    }

    /**
     * Create a univer sheet instance with internal dependency injection.
     *
     * @deprecated use `createUnit` instead
     */
    createUniverSheet(data: Partial<IWorkbookData>): Workbook {
        return this._univerInstanceService.createUnit<IWorkbookData, Workbook>(UniverInstanceType.SHEET, data);
    }

    /**
     * @deprecated use `createUnit` instead
     */
    createUniverDoc(data: Partial<IDocumentData>): DocumentDataModel {
        return this._univerInstanceService.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.DOC, data);
    }

    /**
     * @deprecated use `createUnit` instead
     */
    createUniverSlide(data: Partial<ISlideData>): SlideDataModel {
        return this._univerInstanceService.createUnit<ISlideData, SlideDataModel>(UniverInstanceType.SLIDE, data);
    }

    private _init(injector: Injector): void {
        this._univerInstanceService.registerCtorForType(UniverInstanceType.SHEET, Workbook);
        this._univerInstanceService.registerCtorForType(UniverInstanceType.DOC, DocumentDataModel);
        this._univerInstanceService.registerCtorForType(UniverInstanceType.SLIDE, SlideDataModel);

        const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
        univerInstanceService.__setCreateHandler(
            (type: UnitType, data, ctor) => {
                this._start();

                if (!this._startedTypes.has(type)) {
                    this._startedTypes.add(type);

                    const pluginHolder = this._ensurePluginHolderForType(type);
                    pluginHolder._start();

                    const model = injector.createInstance(ctor, data);
                    univerInstanceService.__addUnit(model);

                    this._tryProgressToReady();

                    return model;
                }

                const model = injector.createInstance(ctor, data);
                univerInstanceService.__addUnit(model);
                return model;
            }
        );
    }

    private _tryProgressToReady(): void {
        const lifecycleService = this._injector.get(LifecycleService);
        if (lifecycleService.stage < LifecycleStages.Ready) {
            this._injector.get(LifecycleService).stage = LifecycleStages.Ready;
        }
    }

    private _ensurePluginHolderForType(type: UnitType): PluginHolder {
        if (!this._pluginHoldersForTypes.has(type)) {
            const pluginHolder = this._injector.createInstance(PluginHolder);
            this._pluginHoldersForTypes.set(type, pluginHolder);
            return pluginHolder;
        }

        return this._pluginHoldersForTypes.get(type)!;
    }

    /** Register a plugin into univer. */
    registerPlugin<T extends PluginCtor<Plugin>>(plugin: T, config?: ConstructorParameters<T>[0]): void {
        const type = plugin.type;
        if (type === PluginType.Univer) {
            return this._registerPlugin(plugin, config);
        }

        // If it's type is for specific document, we should run them at specific time.
        const holder = this._ensurePluginHolderForType(type);
        holder._registerPlugin(plugin, config);
    }

    override _registerPlugin<T extends PluginCtor<Plugin>>(pluginCtor: T, options?: ConstructorParameters<T>[0]): void {
        if (this._started) {
            this._pluginRegistry.registerPlugin(pluginCtor, options);

            // If Univer has already started, we should manually call onStarting for the plugin.
            // We do that in an asynchronous way, because user may lazy load several plugins at the same time.
            return this._scheduleInitPluginAfterStarted();
        } else {
            // For plugins at Univer level. Plugins would be initialized immediately so they can register dependencies.
            const pluginInstance: Plugin = this._injector.createInstance(pluginCtor, options);
            this._univerPluginStore.addPlugin(pluginInstance);
            this._pluginsRunLifecycle([pluginInstance], LifecycleStages.Starting);
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
        this._flush();

        for (const [_, holder] of this._pluginHoldersForTypes) {
            holder._flush();
        }
    }
}

function createUniverInjector() {
    const injector = new Injector([
        [ErrorService],
        [LocaleService],
        [ThemeService],
        [LifecycleService],
        [LifecycleInitializerService],
        [UniverPermissionService],
        [IUniverInstanceService, { useClass: UniverInstanceService }],
        [IPermissionService, { useClass: PermissionService }],
        [ILogService, { useClass: DesktopLogService, lazy: true }],
        [ICommandService, { useClass: CommandService, lazy: true }],
        [IUndoRedoService, { useClass: LocalUndoRedoService, lazy: true }],
        [IConfigService, { useClass: ConfigService }],
        [IContextService, { useClass: ContextService }],
        [IFloatingObjectManagerService, { useClass: FloatingObjectManagerService, lazy: true }],
        [IResourceManagerService, { useClass: ResourceManagerService, lazy: true }],
        [IResourceLoaderService, { useClass: ResourceLoaderService, lazy: true }],
    ]);

    return injector;
}

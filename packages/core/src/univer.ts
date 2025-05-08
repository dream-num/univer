/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { Theme } from '@univerjs/themes';
import type { Dependency, IDisposable } from './common/di';
import type { UnitModel, UnitType } from './common/unit';
import type { LogLevel } from './services/log/log.service';
import type { DependencyOverride } from './services/plugin/plugin-override';
import type { Plugin, PluginCtor } from './services/plugin/plugin.service';
import type { ILocales } from './shared';
import type { IWorkbookData } from './sheets/typedef';
import type { LocaleType } from './types/enum/locale-type';
import type { IDocumentData, ISlideData } from './types/interfaces';
import { Injector, touchDependencies } from './common/di';
import { UniverInstanceType } from './common/unit';
import { DocumentDataModel } from './docs/data-model/document-data-model';
import { AuthzIoLocalService } from './services/authz-io/authz-io-local.service';
import { IAuthzIoService } from './services/authz-io/type';
import { CommandService, ICommandService } from './services/command/command.service';
import { ConfigService, IConfigService } from './services/config/config.service';
import { ContextService, IContextService } from './services/context/context.service';
import { ErrorService } from './services/error/error.service';
import { IUniverInstanceService, UniverInstanceService } from './services/instance/instance.service';
import { LifecycleStages } from './services/lifecycle/lifecycle';
import { LifecycleService } from './services/lifecycle/lifecycle.service';
import { LocaleService } from './services/locale/locale.service';
import { DesktopLogService, ILogService } from './services/log/log.service';
import { MentionIOLocalService } from './services/mention-io/mention-io-local.service';
import { IMentionIOService } from './services/mention-io/type';
import { PermissionService } from './services/permission/permission.service';
import { IPermissionService } from './services/permission/type';
import { mergeOverrideWithDependencies } from './services/plugin/plugin-override';
import { PluginService } from './services/plugin/plugin.service';
import { ResourceLoaderService } from './services/resource-loader/resource-loader.service';
import { IResourceLoaderService } from './services/resource-loader/type';
import { ResourceManagerService } from './services/resource-manager/resource-manager.service';
import { IResourceManagerService } from './services/resource-manager/type';
import { ThemeService } from './services/theme/theme.service';
import { IUndoRedoService, LocalUndoRedoService } from './services/undoredo/undoredo.service';
import { UserManagerService } from './services/user-manager/user-manager.service';
import { DisposableCollection, toDisposable } from './shared';
import { Workbook } from './sheets/workbook';
import { SlideDataModel } from './slides/slide-model';

export interface IUniverConfig {
    /**
     * The theme of the Univer instance, default using the default theme.
     */
    theme?: Theme;

    /**
     * Whether to use dark mode.
     * @internal
     * @default false
     */
    darkMode?: boolean;

    /**
     * The locale of the Univer instance.
     */
    locale?: LocaleType;

    /**
     * The locales to be used
     */
    locales?: ILocales;

    /**
     * The log level of the Univer instance.
     */
    logLevel?: LogLevel;

    /**
     * The override dependencies of the Univer instance.
     */
    override?: DependencyOverride;
}

/**
 * @hideconstructor
 */
export class Univer implements IDisposable {
    private _startedTypes = new Set<UnitType>();
    private _injector: Injector;

    private get _univerInstanceService(): IUniverInstanceService {
        return this._injector.get(IUniverInstanceService);
    }

    private get _pluginService(): PluginService {
        return this._injector.get(PluginService);
    }

    private _disposingCallbacks = new DisposableCollection();

    /**
     * Create a Univer instance.
     * @param config Configuration data for Univer
     * @param parentInjector An optional parent injector of the Univer injector. For more information, see https://redi.wendell.fun/docs/hierarchy.
     */
    constructor(config: Partial<IUniverConfig> = {}, parentInjector?: Injector) {
        const injector = this._injector = createUniverInjector(parentInjector, config?.override);

        const { theme, darkMode, locale, locales, logLevel } = config;
        if (theme) this._injector.get(ThemeService).setTheme(theme);
        if (darkMode) this._injector.get(ThemeService).setDarkMode(darkMode);
        if (locales) this._injector.get(LocaleService).load(locales);
        if (locale) this._injector.get(LocaleService).setLocale(locale);
        if (logLevel) this._injector.get(ILogService).setLogLevel(logLevel);

        this._init(injector);
    }

    /**
     * @ignore
     */
    __getInjector(): Injector {
        return this._injector;
    }

    /**
     * Register a callback function which will be called when this Univer instance is disposing.
     *
     * @ignore
     *
     * @param callback The callback function.
     * @returns To remove this callback function from this Univer instance's on disposing list.
     */
    onDispose(callback: () => void): IDisposable {
        const d = this._disposingCallbacks.add(toDisposable(callback));
        return toDisposable(() => d.dispose(true));
    }

    dispose(): void {
        this._disposingCallbacks.dispose();
        this._injector.dispose();
    }

    setLocale(locale: LocaleType): void {
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
        this._injector.get(ILogService).warn('[Univer]', 'Univer.createUniverSheet is deprecated, use createUnit instead');
        return this._univerInstanceService.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
    }

    /**
     * @deprecated use `createUnit` instead
     */
    createUniverDoc(data: Partial<IDocumentData>): DocumentDataModel {
        this._injector.get(ILogService).warn('[Univer]', 'Univer.createUniverDoc is deprecated, use createUnit instead');
        return this._univerInstanceService.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, data);
    }

    /**
     * @deprecated use `createUnit` instead
     */
    createUniverSlide(data: Partial<ISlideData>): SlideDataModel {
        this._injector.get(ILogService).warn('[Univer]', 'Univer.createUniverSlide is deprecated, use createUnit instead');
        return this._univerInstanceService.createUnit<ISlideData, SlideDataModel>(UniverInstanceType.UNIVER_SLIDE, data);
    }

    private _init(injector: Injector): void {
        this._univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_SHEET, Workbook);
        this._univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_DOC, DocumentDataModel);
        this._univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_SLIDE, SlideDataModel);

        const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
        univerInstanceService.__setCreateHandler(
            (type: UnitType, data, ctor, options) => {
                if (!this._startedTypes.has(type)) {
                    this._pluginService.startPluginsForType(type);
                    this._startedTypes.add(type);

                    const model = injector.createInstance(ctor, data);
                    univerInstanceService.__addUnit(model, options);

                    this._tryProgressToReady();

                    return model;
                }

                const model = injector.createInstance(ctor, data);
                univerInstanceService.__addUnit(model, options);
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

    /** Register a plugin into univer. */
    registerPlugin<T extends PluginCtor<Plugin>>(plugin: T, config?: ConstructorParameters<T>[0]): void {
        this._pluginService.registerPlugin(plugin, config);
    }
}

function createUniverInjector(parentInjector?: Injector, override?: DependencyOverride): Injector {
    const dependencies: Dependency[] = mergeOverrideWithDependencies([
        [ErrorService],
        [LocaleService],
        [ThemeService],
        [LifecycleService],
        [PluginService],
        [UserManagerService],

        // abstract services
        [IUniverInstanceService, { useClass: UniverInstanceService }],
        [IPermissionService, { useClass: PermissionService }],
        [ILogService, { useClass: DesktopLogService, lazy: true }],
        [ICommandService, { useClass: CommandService }],
        [IUndoRedoService, { useClass: LocalUndoRedoService, lazy: true }],
        [IConfigService, { useClass: ConfigService }],
        [IContextService, { useClass: ContextService }],
        [IResourceManagerService, { useClass: ResourceManagerService, lazy: true }],
        [IResourceLoaderService, { useClass: ResourceLoaderService, lazy: true }],
        [IAuthzIoService, { useClass: AuthzIoLocalService }],
        [IMentionIOService, { useClass: MentionIOLocalService, lazy: true }],
    ], override);

    const injector = parentInjector ? parentInjector.createChild(dependencies) : new Injector(dependencies);
    touchDependencies(injector, [
        [UserManagerService],
        [IResourceLoaderService],
    ]);

    return injector;
}

import type { Dependency } from '@univerjs/core';
import type { IUniverDebuggerConfig } from './config/config';
import { IConfigService, Inject, Injector, merge, Plugin, registerDependencies, touchDependencies } from '@univerjs/core';
import pkg from '../package.json';
import { DEBUGGER_PLUGIN_CONFIG_KEY, defaultPluginConfig } from './config/config';
import { ComponentsController } from './controllers/components.controller';
import { DebuggerController } from './controllers/debugger.controller';
import { E2EController } from './controllers/e2e/e2e.controller';
import { PerformanceMonitorController } from './controllers/performance-monitor.controller';

export class UniverDebuggerPlugin extends Plugin {
    static override pluginName = 'UNIVER_DEBUGGER_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;

    private _debuggerController!: DebuggerController;

    constructor(
        private readonly _config: IUniverDebuggerConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(DEBUGGER_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        const dependencies: Dependency[] = [
            [DebuggerController],
            [ComponentsController],
            [E2EController],
        ];

        if (this._config.performanceMonitor?.enabled !== false) {
            dependencies.push([PerformanceMonitorController]);
        }

        registerDependencies(this._injector, dependencies);

        touchDependencies(this._injector, [
            [E2EController],
        ]);
    }

    override onReady(): void {
        touchDependencies(this._injector, [
            [ComponentsController],
            [DebuggerController],
        ]);
    }

    override onRendered(): void {
        touchDependencies(this._injector, [
            [PerformanceMonitorController],
        ]);
    }

    getDebuggerController() {
        this._debuggerController = this._injector.get(DebuggerController);
        return this._debuggerController;
    }
}

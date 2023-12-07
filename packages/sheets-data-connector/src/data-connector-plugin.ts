import { IUniverInstanceService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { DATA_CONNECTOR_PLUGIN_NAME } from './common/plugin-name';
import { DataConnectorController } from './controllers/data-connector.controller';
import { DataPreviewController } from './controllers/data-preview.controller';
import { enUS } from './locale';
import { DataPreviewService, IDataPreviewService } from './services/data-preview.service';

interface IDataConnectorConfig {}
export class DataConnectorPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        private _config: Partial<IDataConnectorConfig>,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService
    ) {
        super(DATA_CONNECTOR_PLUGIN_NAME);
    }

    initialize(): void {
        this._localeService.load({
            enUS,
        });

        const dependencies: Dependency[] = [
            // services
            [IDataPreviewService, { useClass: DataPreviewService }],
            // controllers
            [DataConnectorController],
            [DataPreviewController],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    override onReady(): void {
        this.initialize();
    }
}

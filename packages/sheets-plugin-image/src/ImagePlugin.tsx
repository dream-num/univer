import { Plugin, PluginType, CommandManager, LocaleService } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';
import { uninstall } from '@univerjs/base-sheets';
import { SheetContainerUIController } from '@univerjs/ui-plugin-sheets';
import { OverImageRender } from './View/OverImageRender';
import { OVER_GRID_IMAGE_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { install } from './Basics/Observer';
import { OverGridImageController, CellImageController } from './Controller';
import { IOverGridImagePluginConfig } from './Interfaces';

/**
 * TODO: 考虑加入单元格图片的情况，
 *
 * 如果工具栏的“插入单元格图片”“插入浮动图片”是在一个按钮的下拉列表里，那么UI部分是重叠的，所以这里应该叫 ImagePlugin，下面再细分 OverGridImage 和 CellImage
 *
 */
export class ImagePlugin extends Plugin {
    static override type = PluginType.Sheet;

    protected _overGridImageController: OverGridImageController;

    protected _overImageRender: OverImageRender;

    protected _cellImageController: CellImageController;

    constructor(
        private _config: IOverGridImagePluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(CommandManager) private readonly _commandManager: CommandManager
    ) {
        super(OVER_GRID_IMAGE_PLUGIN_NAME);
    }

    override onMounted(): void {
        install(this);
        const sheetContainerUIController = this._injector.get(SheetContainerUIController);
        sheetContainerUIController.UIDidMount(() => {
            this.initializeDependencies(this._injector);
        });
    }

    override onDestroy(): void {
        uninstall(this);
    }

    hideOverImagePanel(): void {
        // const plugin: SheetPlugin = this.getPluginByName(PLUGIN_NAMES.SPREADSHEET)!;
        // plugin.showSiderByName(OVER_GRID_IMAGE_PLUGIN_NAME, false);
    }

    showOverImagePanel(): void {
        // const plugin: SheetPlugin = this.getPluginByName(PLUGIN_NAMES.SPREADSHEET)!;
        // plugin.showSiderByName(OVER_GRID_IMAGE_PLUGIN_NAME, true);
    }

    private initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [[OverGridImageController], [CellImageController], [OverImageRender]];
        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
        this._overImageRender = sheetInjector.createInstance(OverImageRender);
        this._cellImageController = sheetInjector.createInstance(CellImageController);
        this._overGridImageController = sheetInjector.createInstance(OverGridImageController);
    }
}

import { Command, Plugin, Nullable, Worksheet, UniverSheet } from '@univerjs/core';
import { IPictureProps } from '@univerjs/base-render';
import { ACTION_NAMES } from './Const';
import { ImagePluginObserve, install, uninstall } from './Basics/Observer';
import { OVER_GRID_IMAGE_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { OverImageRender } from './View/OverImageRender';
import './Command/RegisterAction';
import { OverGridImageController } from './Controller/OverGridImageController';

export enum OverGridImageBorderType {
    DASHED,
    SOLID,
    DOUBLE,
}

export interface OverGridImageProperty extends IPictureProps {
    id: string;
    sheetId: string;
    radius: number;
    url: string;
    borderType: OverGridImageBorderType;
    width: number;
    height: number;
    row: number;
    column: number;
    borderColor: string;
    borderWidth: number;
}

export interface IOverGridImagePluginConfig {
    value: OverGridImageProperty[];
}

export class OverGridImage {
    protected readonly _property: OverGridImageProperty;

    protected readonly _plugin: Plugin;

    constructor(plugin: Plugin, property: OverGridImageProperty) {
        this._plugin = plugin;
        this._property = property;
    }

    getAltTextDescription(): string {
        return '';
    }

    getHeight(): number {
        return this._property.height;
    }

    getAltTextTitle(): string {
        return '';
    }

    getProperty(): OverGridImageProperty {
        return this._property;
    }

    getPlugin(): Plugin {
        return this._plugin;
    }

    getSheet(): Nullable<Worksheet> {
        return this.getPlugin().getUniver().getCurrentUniverSheetInstance().getWorkBook().getSheetBySheetId(this._property.sheetId);
    }

    setHeight(height: number): void {
        const manager = this.getPlugin().getContext().getCommandManager();
        const workbook = this.getPlugin().getUniver().getCurrentUniverSheetInstance().getWorkBook();
        const configure = {
            actionName: ACTION_NAMES.SET_IMAGE_TYPE_ACTION,
            sheetId: this._property.sheetId,
        };
        const command = new Command(
            {
                WorkBookUnit: workbook,
            },
            configure
        );
        manager.invoke(command);
    }
}

/**
 * TODO: 考虑加入单元格图片的情况，
 *
 * 如果工具栏的“插入单元格图片”“插入浮动图片”是在一个按钮的下拉列表里，那么UI部分是重叠的，所以这里应该叫 ImagePlugin，下面再细分 OverGridImage 和 CellImage
 *
 */
export class OverGridImagePlugin extends Plugin<ImagePluginObserve> {
    protected _config: IOverGridImagePluginConfig;

    protected _render: OverImageRender;

    protected _overGridImageController: OverGridImageController;

    constructor(config: IOverGridImagePluginConfig = { value: [] }) {
        super(OVER_GRID_IMAGE_PLUGIN_NAME);
        this._config = config;
    }

    static create(config: IOverGridImagePluginConfig): OverGridImagePlugin {
        return new OverGridImagePlugin(config);
    }

    installTo(univerSheetInstance: UniverSheet): void {
        univerSheetInstance.installPlugin(this);
    }

    onMounted(): void {
        install(this);
        this._overGridImageController = new OverGridImageController(this);
        this._render = new OverImageRender(this);
    }

    onDestroy(): void {
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

    getConfig(): IOverGridImagePluginConfig {
        return this._config;
    }

    getOverGridImages(): OverGridImage[] {
        return this._config.value.map((element) => new OverGridImage(this, element));
    }
}

import { ISlotElement, ISlotProps, IToolBarItemProps } from '@univerjs/base-component';
import { Command, Plugin, PLUGIN_NAMES, Nullable, Worksheet, IOCContainer, UniverSheet } from '@univerjs/core';
import { SheetPlugin } from '@univerjs/base-sheets';
import { IPictureProps } from '@univerjs/base-render';
import { ACTION_NAMES } from './Const';
import { ImagePluginObserve, install, uninstall } from './Basic/Observer';
import { OVER_GRID_IMAGE_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { OverImageRender } from './View/OverImageRender';
import { BorderType } from './Enum/BorderType';
import { NormalType } from './Enum/NormalType';
import { ImagePanelUI } from './UI/ImagePanel/ImagePanelUI';
import { ImageUploadButtonUI } from './UI/ImageUploadButton/ImageUploadButtonUI';
import './Command/RegisterAction';

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
        return this.getPlugin().getContext().getWorkBook().getSheetBySheetId(this._property.sheetId);
    }

    setHeight(height: number): void {
        const manager = this.getPlugin().getContext().getCommandManager();
        const workbook = this.getPlugin().getContext().getWorkBook();
        const configure = {
            actionName: ACTION_NAMES.SET_IMAGE_TYPE_ACTION,
            sheetId: this._property.sheetId,
        };
        const command = new Command(workbook, configure);
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

    constructor(config: IOverGridImagePluginConfig) {
        super(OVER_GRID_IMAGE_PLUGIN_NAME);
        this._config = config;
    }

    static create(config: IOverGridImagePluginConfig) {
        return new OverGridImagePlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    onMapping(ioc: IOCContainer) {
        super.onMapping(ioc);
    }

    onMounted(): void {
        install(this);
        const plugin = this.getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;
        const panel: ISlotProps = {
            name: OVER_GRID_IMAGE_PLUGIN_NAME,
            type: ISlotElement.JSX,
            label: <ImagePanelUI normal={NormalType.MoveAndSize} fixed={false} borderStyle={BorderType.Solid} borderWidth={1} borderRadius={1} borderColor={'#000000'} />,
        };
        const button: IToolBarItemProps = {
            locale: OVER_GRID_IMAGE_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: (
                <ImageUploadButtonUI
                    chooseCallback={(src: string) => {
                        const manager = this.getContext().getCommandManager();
                        const workbook = this.getContext().getWorkBook();
                        let image = new Image();
                        image.src = src;
                        image.onload = () => {
                            const configure = {
                                actionName: ACTION_NAMES.ADD_IMAGE_PROPERTY_ACTION,
                                sheetId: workbook.getActiveSheet()!.getSheetId(),
                                radius: 0,
                                url: src,
                                row: 0,
                                column: 0,
                                borderType: OverGridImageBorderType.DASHED,
                                width: image.width,
                                height: image.height,
                                borderWidth: 5,
                                borderColor: 'red',
                            };
                            const command = new Command(workbook, configure);
                            manager.invoke(command);
                        };
                    }}
                />
            ),
        };
        plugin.addButton(button);
        plugin.addSider(panel).then();
        this._render = new OverImageRender(this);
    }

    onDestroy() {
        uninstall(this);
    }

    hideOverImagePanel(): void {
        const plugin: SheetPlugin = this.getPluginByName(PLUGIN_NAMES.SPREADSHEET)!;
        plugin.showSiderByName(OVER_GRID_IMAGE_PLUGIN_NAME, false);
    }

    showOverImagePanel(): void {
        const plugin: SheetPlugin = this.getPluginByName(PLUGIN_NAMES.SPREADSHEET)!;
        plugin.showSiderByName(OVER_GRID_IMAGE_PLUGIN_NAME, true);
    }

    getConfig(): IOverGridImagePluginConfig {
        return this._config;
    }

    getOverGridImages(): OverGridImage[] {
        return this._config.value.map((element) => new OverGridImage(this, element));
    }
}

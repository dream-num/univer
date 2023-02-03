import { Nullable } from '@univerjs/core';
import { BaseComponentPlugin } from '..';
import { BaseMenuItem, BaseUlProps } from '../Interfaces';
import { SheetBar } from '../UI/SheetBar';

interface CustomComponent {
    name: string;
    props?: Record<string, any>;
}

interface SheetUlProps extends BaseUlProps {
    index: string;
    color?: Nullable<string>;
    sheetId: string;
}

interface SheetUl extends BaseMenuItem {
    locale?: string;
    customLabel?: CustomComponent;
    children?: SheetUl[];
}

export class SheetBarControl {
    private _plugin: BaseComponentPlugin;

    private _sheetBar: SheetBar;

    private _sheetUl: SheetUl[];

    private _sheetList: SheetUlProps[];

    private _menuList: SheetUlProps[];

    constructor(plugin: BaseComponentPlugin) {
        this._plugin = plugin;

        this._sheetUl = [
            {
                locale: 'sheetConfig.delete',
                onClick: () => {},
            },
            {
                locale: 'sheetConfig.copy',
                onClick: () => {},
            },
            {
                locale: 'sheetConfig.rename',
                onClick: () => {},
            },
        ];
    }

    private _initializeData() {
        const sheets = [1, 2, 3];
        this._menuList = sheets.map((sheet, index) => ({
            label: `sheet${index + 1}`,
            index: String(index),
            sheetId: '123',
            hidden: 1,
            selected: true,
            onClick: (e: MouseEvent) => {},
        }));
        this._sheetList = sheets
            // .filter((sheet) => {})
            .map((sheet, index) => ({
                sheetId: '123',
                label: `sheet${index + 1}`,
                index: String(index),
                selected: true,
                color: '#abcdef',
                onDown: (e: MouseEvent) => {},
                onClick: (e: MouseEvent) => {},
            }));
    }

    // 获取sheetBar组件
    getComponent = (ref: SheetBar) => {
        this._sheetBar = ref;
        this._initializeData();
        this.setSheetBar();
    };

    setSheetBar() {
        this._sheetBar.setValue({
            menuList: this._menuList,
            sheetUl: this._sheetUl,
            sheetList: this._sheetList,
        });
    }

    /**
     * 选中sheet
     * @param args
     */
    selectSheet(id: string): void {}

    /**
     * 隐藏sheet
     */
    hideSheet(): void {}

    /**
     * 取消隐藏
     */
    unHideSheet(): void {}

    /**
     * 增加sheet
     */
    addSheet(): void {}

    /**
     * 删除sheet
     */
    deleteSheet(): void {}

    /**
     * 向左向右移动sheet
     * @param direct
     */
    moveSheet(direct: string): void {}

    /**
     * 复制sheet
     */
    copySheet(): void {}

    /**
     * 可以更改sheet名
     */
    reNameSheet(): void {}

    /**
     * 重命名sheet
     * @param e
     */
    changeSheetName(e: Event): void {}

    /**
     * Set Sheet Color
     * @param color
     */
    setSheetColor(color: string): void {}
}

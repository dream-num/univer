import { IMouseEvent, IPointerEvent } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { BaseMenuItem, BaseSelectChildrenProps, resetDataLabel } from '@univerjs/base-ui';
import { PLUGIN_NAMES, Tools, UIObserver } from '@univerjs/core';
import { SheetUIPlugin } from '..';
import { DefaultRightMenuConfig, SheetRightMenuConfig } from '../Basics';
import { RightMenu, RightMenuInput, RightMenuItem } from '../View';
import styles from '../View/RightMenu/index.module.less'

export interface CustomLabelOptions extends BaseSelectChildrenProps {
    locale?: string;
}

interface CustomLabelProps {
    prefix?: string;
    suffix?: string;
    prefixLocale?: string[] | string;
    suffixLocale?: string[] | string;
    options?: CustomLabelOptions[];
    label?: string;
    children?: CustomLabelProps[];
    onKeyUp?: (e: Event) => void;
}

export interface RightMenuProps extends BaseMenuItem {
    customLabel?: {
        name: string;
        props?: CustomLabelProps;
    };
    children?: RightMenuProps[];
    suffix?: string;
    border?: boolean;
    locale?: string
}

export class RightMenuUIController {
    private _plugin: SheetUIPlugin;

    private _sheetPlugin: SheetPlugin

    private _rightMenu: RightMenu;

    private _menuList: RightMenuProps[];

    private _config: SheetRightMenuConfig;

    constructor(plugin: SheetUIPlugin, config?: SheetRightMenuConfig) {
        this._plugin = plugin;

        this._sheetPlugin = plugin.getContext().getUniver().getCurrentUniverSheetInstance().context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this._config = Tools.deepMerge({}, DefaultRightMenuConfig, config);


        this._menuList = [
            {
                label: 'rightClick.insertRow',
                onClick: () => this.insertRow(),
                show: this._config.InsertRow,
            },
            {
                label: 'rightClick.insertColumn',
                onClick: () => this.insertColumn(),
                show: this._config.InsertColumn,
            },
            {
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefix: 'rightClick.toTopAdd',
                        suffix: 'rightClick.row',
                    }
                },
                show: this._config.AddRowTop,
            },
            {
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefix: 'rightClick.toBottomAdd',
                        suffix: 'rightClick.row',
                    },
                },
                show: this._config.AddRowBottom,
            },
            {
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefix: 'rightClick.toLeftAdd',
                        suffix: 'rightClick.column',
                    },
                },
                show: this._config.AddColumnLeft,
            },
            {
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefix: 'rightClick.toRightAdd',
                        suffix: 'rightClick.column',
                    },
                },
                show: this._config.AddColumnRight,
            },
            {
                label: 'rightClick.deleteSelectedRow',
                onClick: () => this.deleteRow(),
                show: this._config.DeleteRow,
            },
            {
                label: 'rightClick.deleteSelectedColumn',
                onClick: () => this.deleteColumn(),
                show: this._config.DeleteColumn,
            },
            {
                label: 'rightClick.hideSelectedRow',
                show: this._config.HideRow,
            },
            {
                label: 'rightClick.showHideRow',
                show: this._config.ShowRow,
            },
            {
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefix: 'rightClick.rowHeight',
                        suffix: 'px',
                        onKeyUp: this.setRowHeight.bind(this),
                    },
                },
                onClick: () => { },
                show: this._config.RowHeight,
            },
            {
                label: 'rightClick.hideSelectedColumn',
                show: this._config.HideColumn,
            },
            {
                label: 'rightClick.showHideColumn',
                show: this._config.ShowColumn,
            },
            {
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefix: 'rightClick.columnWidth',
                        suffix: 'px',
                        onKeyUp: this.setColumnWidth.bind(this),
                    },
                },
                show: this._config.ColumnWidth,
            },
            {
                show: this._config.DeleteCell,
                customLabel: {
                    name: RightMenuItem.name,
                    props: {
                        label: 'rightClick.deleteCell',
                    },
                },
                border: true,
                children: [
                    {
                        label: 'rightClick.moveLeft',
                        className: styles.rightMenuCenter,
                        onClick: () => this.deleteCellLeft(),
                    },
                    {
                        label: 'rightClick.moveUp',
                        className: styles.rightMenuCenter,
                        onClick: () => this.deleteCellTop(),
                    },
                ],
            },
            {
                label: 'rightClick.clearContent',
                onClick: () => this.clearContent(),
                border: true,
                show: this._config.ClearContent,
            },
            // {
            //     show: this._config.hideMatrix,
            //     customLabel: {
            //         name: RightMenuItem.name,
            //         props: {
            //             locale: 'rightClick.matrix',
            //         },
            //     },
            //     children: [
            //         {
            //             customLabel: {
            //                 name: RightMenuButton.name,
            //                 props: {
            //                     locale: 'rightClick.flip',
            //                     children: [
            //                         {
            //                             locale: 'rightClick.upAndDown',
            //                         },
            //                         {
            //                             locale: 'rightClick.leftAndRight',
            //                         },
            //                     ],
            //                 },
            //             },
            //         },
            //         {
            //             customLabel: {
            //                 name: RightMenuButton.name,
            //                 props: {
            //                     locale: 'rightClick.flip',
            //                     children: [
            //                         {
            //                             locale: 'rightClick.clockwise',
            //                         },
            //                         {
            //                             locale: 'rightClick.counterclockwise',
            //                         },
            //                     ],
            //                 },
            //             },
            //         },
            //         {
            //             locale: ['rightClick.transpose'],
            //         },
            //         {
            //             customLabel: {
            //                 name: RightMenuSelect.name,
            //                 props: {
            //                     locale: 'rightClick.matrixCalculation',
            //                     options: [
            //                         {
            //                             locale: 'rightClick.plus',
            //                         },
            //                         {
            //                             locale: 'rightClick.minus',
            //                         },
            //                         {
            //                             locale: 'rightClick.multiply',
            //                         },
            //                         {
            //                             locale: 'rightClick.divided',
            //                         },
            //                         {
            //                             locale: 'rightClick.power',
            //                         },
            //                         {
            //                             locale: 'rightClick.root',
            //                         },
            //                         {
            //                             locale: 'rightClick.log',
            //                         },
            //                     ],
            //                 },
            //             },
            //         },
            //         {
            //             customLabel: {
            //                 name: RightMenuButton.name,
            //                 props: {
            //                     locale: 'rightClick.delete0',
            //                     children: [
            //                         {
            //                             locale: 'rightClick.byRow',
            //                         },
            //                         {
            //                             locale: 'rightClick.byCol',
            //                         },
            //                     ],
            //                 },
            //             },
            //         },
            //         {
            //             customLabel: {
            //                 name: RightMenuButton.name,
            //                 props: {
            //                     locale: 'rightClick.removeDuplicate',
            //                     children: [
            //                         {
            //                             locale: 'rightClick.byRow',
            //                         },
            //                         {
            //                             locale: 'rightClick.byCol',
            //                         },
            //                     ],
            //                 },
            //             },
            //         },
            //     ],
            // },
        ];

        this._initialize();
    }

    private _initialize() {
        this._plugin.getComponentManager().register(RightMenuInput.name, RightMenuInput)
        this._plugin.getComponentManager().register(RightMenuItem.name, RightMenuItem)

        this._sheetPlugin.getMainComponent().onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            if (evt.button === 2) {
                this._rightMenu.handleContextMenu(evt);
            }
        });
    }

    // 获取RightMenu组件
    getComponent = (ref: RightMenu) => {
        this._rightMenu = ref;
        this.setMenuList();
    };

    // 刷新
    setMenuList() {
        const locale = this._plugin.getContext().getLocale();
        const menuList = resetDataLabel(this._menuList, locale);
        this._rightMenu?.setMenuList(menuList);
    }

    setUIObserve<T>(msg: UIObserver<T>) {
        this._plugin.getContext().getObserverManager().requiredObserver<UIObserver<T>>('onUIChangeObservable', 'core').notifyObservers(msg);
    }

    insertRow() {
        const msg = {
            name: 'insertRow',
        };
        this.setUIObserve(msg);
    }

    insertColumn() {
        const msg = {
            name: 'insertColumn',
        };
        this.setUIObserve(msg);
    }

    deleteRow() {
        const msg = {
            name: 'deleteRow',
        };
        this.setUIObserve(msg);
    }

    deleteColumn() {
        const msg = {
            name: 'deleteColumn',
        };
        this.setUIObserve(msg);
    }

    setRowHeight(e: Event) {
        if ((e as KeyboardEvent).key !== 'Enter') {
            return;
        }
        const height = (e.target as HTMLInputElement).value;
        const msg = {
            name: 'setRowHeight',
            value: height
        };
        this.setUIObserve(msg);
    }

    setColumnWidth(e: Event) {
        if ((e as KeyboardEvent).key !== 'Enter') {
            return;
        }
        const width = (e.target as HTMLInputElement).value;
        const msg = {
            name: 'setColumnWidth',
            value: width
        };
        this.setUIObserve(msg);
    }

    deleteCellLeft() {
        const msg = {
            name: 'moveLeft',
        };
        this.setUIObserve(msg);
    }

    deleteCellTop() {
        const msg = {
            name: 'moveTop',
        };
        this.setUIObserve(msg);
    }

    clearContent() {
        const msg = {
            name: 'clearContent',
        };
        this.setUIObserve(msg);
    }
}

import { IMouseEvent, IPointerEvent } from '@univer/base-render';
import { PLUGIN_NAMES } from '@univer/core';
import { RightMenuConfig, RightMenuModel, RightMenuProps } from '../Model/RightMenuModel';
import { SheetPlugin } from '../SheetPlugin';
import { RightMenu } from '../View/UI/RightMenu';
import { SelectionControl } from './Selection/SelectionController';
import { SelectionModel } from '../Model/SelectionModel';
import { RightMenuInput } from '../View/UI/RightMenu/RightMenuInput';
import { RightMenuButton } from '../View/UI/RightMenu/RightMenuButton';
import { RightMenuSelect } from '../View/UI/RightMenu/RightMenuSelect';
import { RightMenuItem } from '../View/UI/RightMenu/RightMenuItem';
import styles from '../View/UI/RightMenu/index.module.less';

export class RightMenuController {
    private _rightMenuModel: RightMenuModel;

    private _plugin: SheetPlugin;

    private _RightMenu: RightMenu;

    private _menuList: RightMenuProps[];

    constructor(plugin: SheetPlugin) {
        this._plugin = plugin;

        this._initRegisterComponent();

        this._menuList = [
            {
                locale: ['rightClick.insert', 'rightClick.row'],
                onClick: this.insertRow,
                hide: RightMenuConfig.hideInsertRow,
            },
            {
                locale: ['rightClick.insert', 'rightClick.column'],
                onClick: this.insertColumn,
                hide: RightMenuConfig.hideInsertColumn,
            },
            {
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefixLocale: ['rightClick.to', 'rightClick.top', 'rightClick.add'],
                        suffixLocale: 'rightClick.row',
                    },
                },
                hide: RightMenuConfig.hideAddRowTop,
            },
            {
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefixLocale: ['rightClick.to', 'rightClick.bottom', 'rightClick.add'],
                        suffixLocale: 'rightClick.row',
                    },
                },
                hide: RightMenuConfig.hideAddRowBottom,
            },
            {
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefixLocale: ['rightClick.to', 'rightClick.left', 'rightClick.add'],
                        suffixLocale: 'rightClick.column',
                    },
                },
                hide: RightMenuConfig.hideAddColumnLeft,
            },
            {
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefixLocale: ['rightClick.to', 'rightClick.right', 'rightClick.add'],
                        suffixLocale: 'rightClick.column',
                    },
                },
                hide: RightMenuConfig.hideAddColumnRight,
            },
            {
                locale: ['rightClick.deleteSelected', 'rightClick.row'],
                onClick: this.deleteRow,
                hide: RightMenuConfig.hideDeleteRow,
            },
            {
                locale: ['rightClick.deleteSelected', 'rightClick.column'],
                onClick: this.deleteColumn,
                hide: RightMenuConfig.hideDeleteColumn,
            },
            {
                locale: ['rightClick.hideSelected', 'rightClick.row'],
                hide: RightMenuConfig.hideHideRow,
            },
            {
                locale: ['rightClick.showHide', 'rightClick.row'],
                hide: RightMenuConfig.hideShowRow,
            },
            {
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefixLocale: ['rightClick.row', 'rightClick.height'],
                        suffix: 'px',
                        onKeyUp: this.setRowHeight.bind(this),
                    },
                },
                onClick: (...arg) => console.dir(arg),
                hide: RightMenuConfig.hideRowHeight,
            },
            {
                locale: ['rightClick.hideSelected', 'rightClick.column'],
                hide: RightMenuConfig.hideHideColumn,
            },
            {
                locale: ['rightClick.showHide', 'rightClick.column'],
                hide: RightMenuConfig.hideShowColumn,
            },
            {
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefixLocale: ['rightClick.column', 'rightClick.width'],
                        suffix: 'px',
                        onKeyUp: this.setColumnWidth.bind(this),
                    },
                },
                hide: RightMenuConfig.hideColumnWidth,
            },
            {
                hide: RightMenuConfig.hideDeleteCell,
                customLabel: {
                    name: RightMenuItem.name,
                    props: {
                        locale: 'rightClick.deleteCell',
                    },
                },
                border: true,
                children: [
                    {
                        locale: ['rightClick.moveLeft'],
                        className: styles.rightMenuCenter,
                        onClick: (...arg: any) => this.deleteCellLeft(...arg),
                    },
                    {
                        locale: ['rightClick.moveUp'],
                        className: styles.rightMenuCenter,
                        onClick: (...arg: any) => this.deleteCellTop(...arg),
                    },
                ],
            },
            {
                locale: ['rightClick.clearContent'],
                onClick: (...arg: any) => this.clear(...arg),
                border: true,
                hide: RightMenuConfig.hideClearContent,
            },
            {
                hide: RightMenuConfig.hideMatrix,
                customLabel: {
                    name: RightMenuItem.name,
                    props: {
                        locale: 'rightClick.matrix',
                    },
                },
                children: [
                    {
                        customLabel: {
                            name: RightMenuButton.name,
                            props: {
                                locale: 'rightClick.flip',
                                children: [
                                    {
                                        locale: 'rightClick.upAndDown',
                                    },
                                    {
                                        locale: 'rightClick.leftAndRight',
                                    },
                                ],
                            },
                        },
                    },
                    {
                        customLabel: {
                            name: RightMenuButton.name,
                            props: {
                                locale: 'rightClick.flip',
                                children: [
                                    {
                                        locale: 'rightClick.clockwise',
                                    },
                                    {
                                        locale: 'rightClick.counterclockwise',
                                    },
                                ],
                            },
                        },
                    },
                    {
                        locale: ['rightClick.transpose'],
                    },
                    {
                        customLabel: {
                            name: RightMenuSelect.name,
                            props: {
                                locale: 'rightClick.matrixCalculation',
                                options: [
                                    {
                                        locale: 'rightClick.plus',
                                    },
                                    {
                                        locale: 'rightClick.minus',
                                    },
                                    {
                                        locale: 'rightClick.multiply',
                                    },
                                    {
                                        locale: 'rightClick.divided',
                                    },
                                    {
                                        locale: 'rightClick.power',
                                    },
                                    {
                                        locale: 'rightClick.root',
                                    },
                                    {
                                        locale: 'rightClick.log',
                                    },
                                ],
                            },
                        },
                    },
                    {
                        customLabel: {
                            name: RightMenuButton.name,
                            props: {
                                locale: 'rightClick.delete0',
                                children: [
                                    {
                                        locale: 'rightClick.byRow',
                                    },
                                    {
                                        locale: 'rightClick.byCol',
                                    },
                                ],
                            },
                        },
                    },
                    {
                        customLabel: {
                            name: RightMenuButton.name,
                            props: {
                                locale: 'rightClick.removeDuplicate',
                                children: [
                                    {
                                        locale: 'rightClick.byRow',
                                    },
                                    {
                                        locale: 'rightClick.byCol',
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
            // {
            //     locale: ['rightClick.sortSelection'],
            //     hide: true,
            // },
            // {
            //     locale: ['rightClick.filterSelection'],
            //     hide: true,
            // },
            // {
            //     locale: ['rightClick.chartGeneration'],
            //     hide: true,
            // },
            // {
            //     locale: ['toolbar.insertImage'],
            //     hide: true,
            // },
            // {
            //     locale: ['toolbar.insertLink'],
            //     hide: true,
            // },
            // {
            //     locale: ['toolbar.dataValidation'],
            //     hide: true,
            // },
            // {
            //     locale: ['toolbar.cellFormat'],
            //     hide: true,
            // },
        ];

        this._rightMenuModel = new RightMenuModel();
        this._initialize();
    }

    private _initialize() {
        const context = this._plugin.getContext();
        const manager = context.getObserverManager();

        manager.requiredObserver<RightMenu>('onRightMenuDidMountObservable', PLUGIN_NAMES.SPREADSHEET).add((component) => {
            this._RightMenu = component;

            this.resetMenuList(this.resetMenuLabel(this._menuList));
        });

        context.getContextObserver('onAfterChangeUILocaleObservable').add(() => {
            this.resetMenuList(this.resetMenuLabel(this._menuList));
        });

        context.getContextObserver('onSheetRenderDidMountObservable').add(() => {
            const spreadSheet = this._plugin.getContentRef().current;
            if (!spreadSheet) return;
            this._plugin.getMainComponent().onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
                const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
                if (evt.button === 2) {
                    spreadSheet.oncontextmenu = () => false;
                    this._RightMenu.handleContextMenu(evt);
                }
            });
            // this._plugin.getRowComponent().onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            //     const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            //     if (evt.button === 2) {
            //         spreadSheet.oncontextmenu = () => false;
            //         this.resetMenuLabel(this._menuList, 'row');
            //         this._RightMenu.handleContextMenu(evt);
            //     }
            // });
            // this._plugin.getColumnComponent().onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            //     const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            //     if (evt.button === 2) {
            //         spreadSheet.oncontextmenu = () => false;
            //         this.resetMenuLabel(this._menuList, 'column');
            //         this._RightMenu.handleContextMenu(evt);
            //     }
            // });
        });
    }

    private _initRegisterComponent() {
        this._plugin.registerComponent(RightMenuInput.name, RightMenuInput);
        this._plugin.registerComponent(RightMenuButton.name, RightMenuButton);
        this._plugin.registerComponent(RightMenuSelect.name, RightMenuSelect);
        this._plugin.registerComponent(RightMenuItem.name, RightMenuItem);
    }

    resetLabel(label: string[] | string) {
        const locale = this._plugin.context.getLocale();

        let str = '';

        if (label instanceof Array) {
            label.forEach((item) => {
                if (item.includes('.')) {
                    str += locale.get(item);
                } else {
                    str += item;
                }
            });
        } else {
            if (label.includes('.')) {
                str = locale.get(label);
            } else {
                str += label;
            }
        }

        return str;
    }

    findLocale(obj: any) {
        for (let k in obj) {
            if (k === 'locale') {
                obj.label = this.resetLabel(obj[k]);
            } else if (k.endsWith('Locale')) {
                const index = k.indexOf('Locale');
                obj[k.slice(0, index)] = this.resetLabel(obj[k]);
            } else if (!obj[k].$$typeof) {
                if (Object.prototype.toString.call(obj[k]) === '[object Object]') {
                    this.findLocale(obj[k]);
                } else if (Object.prototype.toString.call(obj[k]) === '[object Array]') {
                    this.resetMenuLabel(obj[k]);
                }
            }
        }

        return obj;
    }

    resetMenuLabel(menuList: RightMenuProps[]) {
        for (let i = 0; i < menuList.length; i++) {
            let item = menuList[i];

            item = this.findLocale(item);

            if (item.children) {
                item.children = this.resetMenuLabel(item.children);
            }
        }

        return menuList;
    }

    resetMenuList(menuList: RightMenuProps[]) {
        this._RightMenu?.setMenuList(menuList);
    }

    private _getSelections() {
        const controls = this._plugin?.getSelectionManager().getCurrentControls();
        const selections = controls?.map((control: SelectionControl) => {
            const model: SelectionModel = control.model;
            return {
                startRow: model.startRow,
                startColumn: model.startColumn,
                endRow: model.endRow,
                endColumn: model.endColumn,
            };
        });
        return selections;
    }

    insertRow = (...arg: any) => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet?.insertRowBefore(selections[0].startRow, selections[0].endRow - selections[0].startRow + 1);
            // this._render(sheet);
        }
    };

    deleteRow = (...arg: any) => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet?.deleteRows(selections[0].startRow, selections[0].endRow - selections[0].startRow + 1);
        }
    };

    insertColumn = (...arg: any) => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.insertColumnBefore(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
        }
    };

    deleteColumn = (...arg: any) => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.deleteColumns(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
        }
    };

    clear = (...arg: any) => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).clear();
        }
    };

    deleteCellLeft = (...arg: any) => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).deleteCells(0);
        }
    };

    deleteCellTop = (...arg: any) => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).deleteCells(1);
        }
    };

    setColumnWidth(e: Event) {
        if ((e as KeyboardEvent).key !== 'Enter') {
            return;
        }
        const width = (e.target as HTMLInputElement).value;
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.setColumnWidth(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1, Number(width));
        }
        this._RightMenu.showRightMenu(false);
    }

    setRowHeight(e: Event) {
        if ((e as KeyboardEvent).key !== 'Enter') {
            return;
        }
        const height = (e.target as HTMLInputElement).value;
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.setRowHeights(selections[0].startRow, selections[0].endRow - selections[0].startRow + 1, Number(height));
        }
        this._RightMenu.showRightMenu(false);
    }

    addItem = (item: RightMenuProps[] | RightMenuProps) => {
        if (item instanceof Array) {
            this._menuList.push(...item);
        } else {
            this._menuList.push(item);
        }
        this.resetMenuList(this.resetMenuLabel(this._menuList));
    };
}

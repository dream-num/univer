import { IMouseEvent, IPointerEvent } from '@univer/base-render';
import { PLUGIN_NAMES } from '@univer/core';
import { RightMenuModel, RightMenuProps } from '../Model/RightMenuModel';
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

        this.initRegisterComponent();

        this._menuList = [
            {
                locale: ['rightClick.insert', 'rightClick.row'],
                onClick: this.insertRow,
            },
            {
                locale: ['rightClick.insert', 'rightClick.column'],
                onClick: this.insertColumn,
            },
            {
                hide: true,
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefixLocale: ['rightClick.to', 'rightClick.top', 'rightClick.add'],
                        suffixLocale: 'rightClick.row',
                    },
                },
            },
            {
                hide: true,
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefixLocale: ['rightClick.to', 'rightClick.bottom', 'rightClick.add'],
                        suffixLocale: 'rightClick.row',
                    },
                },
            },
            {
                hide: true,
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefixLocale: ['rightClick.to', 'rightClick.left', 'rightClick.add'],
                        suffixLocale: 'rightClick.column',
                    },
                },
            },
            {
                hide: true,
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefixLocale: ['rightClick.to', 'rightClick.right', 'rightClick.add'],
                        suffixLocale: 'rightClick.column',
                    },
                },
            },
            {
                locale: ['rightClick.deleteSelected', 'rightClick.row'],
                onClick: this.deleteRow,
            },
            {
                locale: ['rightClick.deleteSelected', 'rightClick.column'],
                onClick: this.deleteColumn,
            },
            {
                hide: true,
                locale: ['rightClick.hideSelected', 'rightClick.row'],
            },
            {
                hide: true,
                locale: ['rightClick.showHide', 'rightClick.row'],
            },
            {
                hide: true,
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefixLocale: ['rightClick.row', 'rightClick.height'],
                        suffix: 'px',
                    },
                },
            },
            {
                hide: true,
                locale: ['rightClick.hideSelected', 'rightClick.column'],
            },
            {
                hide: true,
                locale: ['rightClick.showHide', 'rightClick.column'],
            },
            {
                hide: true,
                customLabel: {
                    name: RightMenuInput.name,
                    props: {
                        prefixLocale: ['rightClick.column', 'rightClick.width'],
                        suffix: 'px',
                    },
                },
            },
            {
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
            },
            {
                customLabel: {
                    name: RightMenuItem.name,
                    props: {
                        locale: 'rightClick.matrix',
                    },
                },
                hide: true,
                children: [
                    {
                        customLabel: {
                            name: RightMenuButton.name,
                            props: {
                                prefixLocale: 'rightClick.flip',
                                buttonsLocale: ['rightClick.upAndDown', 'rightClick.leftAndRight'],
                            },
                        },
                    },
                    {
                        customLabel: {
                            name: RightMenuButton.name,
                            props: {
                                prefixLocale: 'rightClick.flip',
                                buttonsLocale: ['rightClick.clockwise', 'rightClick.counterclockwise'],
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
                                prefixLocale: 'rightClick.matrixCalculation',
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
                                prefixLocale: 'rightClick.delete0',
                                buttonsLocale: ['rightClick.byRow', 'rightClick.byCol'],
                            },
                        },
                    },
                    {
                        customLabel: {
                            name: RightMenuButton.name,
                            props: {
                                prefixLocale: 'rightClick.removeDuplicate',
                                buttonsLocale: ['rightClick.byRow', 'rightClick.byCol'],
                            },
                        },
                    },
                ],
            },
            {
                locale: ['rightClick.sortSelection'],
                hide: true,
            },
            {
                locale: ['rightClick.filterSelection'],
                hide: true,
            },
            {
                locale: ['rightClick.chartGeneration'],
                hide: true,
            },
            {
                locale: ['toolbar.insertImage'],
                hide: true,
            },
            {
                locale: ['toolbar.insertLink'],
                hide: true,
            },
            {
                locale: ['toolbar.dataValidation'],
                hide: true,
            },
            {
                locale: ['toolbar.cellFormat'],
                hide: true,
            },
        ];

        this._rightMenuModel = new RightMenuModel();
        this._initialize();
    }

    private _initialize() {
        const context = this._plugin.getContext();
        const manager = context.getObserverManager();

        manager.requiredObserver<RightMenu>('onRightMenuDidMountObservable', PLUGIN_NAMES.SPREADSHEET).add((component) => {
            this._RightMenu = component;

            this._RightMenu.setMenuList(this.resetMenuList(this._menuList));
        });

        context.getContextObserver('onAfterChangeUILocaleObservable').add(() => {
            this._RightMenu.setMenuList(this.resetMenuList(this._menuList));
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
            //         this.resetMenuList(this._menuList, 'row');
            //         this._RightMenu.handleContextMenu(evt);
            //     }
            // });
            // this._plugin.getColumnComponent().onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            //     const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            //     if (evt.button === 2) {
            //         spreadSheet.oncontextmenu = () => false;
            //         this.resetMenuList(this._menuList, 'column');
            //         this._RightMenu.handleContextMenu(evt);
            //     }
            // });
        });
    }

    initRegisterComponent() {
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
            } else if (Object.prototype.toString.call(obj[k]) === '[object Object]' && !obj[k].$$typeof) {
                this.findLocale(obj[k]);
            }
        }

        return obj;
    }

    resetMenuList(menuList: RightMenuProps[]) {
        for (let i = 0; i < menuList.length; i++) {
            let item = menuList[i];

            item = this.findLocale(item);

            if (item.children) {
                item.children = this.resetMenuList(item.children);
            }
        }

        return menuList;
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
        arg[1].ref.hideSelect();

        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet?.insertRowBefore(selections[0].startRow, selections[0].endRow - selections[0].startRow + 1);
            // this._render(sheet);
        }
    };

    deleteRow = (...arg: any) => {
        arg[1].ref.hideSelect();

        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet?.deleteRows(selections[0].startRow, selections[0].endRow - selections[0].startRow + 1);
        }
    };

    insertColumn = (...arg: any) => {
        arg[1].ref.hideSelect();

        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.insertColumnBefore(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
        }
    };

    deleteColumn = (...arg: any) => {
        arg[1].ref.hideSelect();

        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.deleteColumns(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
        }
    };

    clear = (...arg: any) => {
        arg[1].ref.hideSelect();

        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).clear();
        }
    };

    deleteCellLeft = (...arg: any) => {
        arg[1].ref.hideSelect();
        arg[1].ref.getParent().hideSelect();

        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).deleteCells(0);
        }
    };

    deleteCellTop = (...arg: any) => {
        arg[1].ref.hideSelect();
        arg[1].ref.getParent().hideSelect();

        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).deleteCells(1);
        }
    };

    addItem = (item: RightMenuProps[] | RightMenuProps) => {
        if (item instanceof Array) {
            this._menuList.push(...item);
        } else {
            this._menuList.push(item);
        }
        this._RightMenu.setMenuList(this.resetMenuList(this._menuList));
    };
}

import { IMouseEvent, IPointerEvent } from '@univer/base-render';
import { Locale, PLUGIN_NAMES } from '@univer/core';
import { RightMenuModel, RightMenuProps } from '../Model/RightMenuModel';
import { SpreadsheetPlugin } from '../SpreadsheetPlugin';
import Style from '../View/UI/RightMenu/index.module.less';
import { RightMenu } from '../View/UI/RightMenu';
import { SelectionControl } from './Selection/SelectionController';
import { SelectionModel } from '../Model/SelectionModel';

type MenuFlag = 'row' | 'column';

export class RightMenuController {
    private _rightMenuModel: RightMenuModel;

    private _plugin: SpreadsheetPlugin;

    private _RightMenu: RightMenu;

    private _menuList: RightMenuProps[];

    constructor(plugin: SpreadsheetPlugin) {
        this._plugin = plugin;

        this._menuList = [
            {
                locale: ['rightClick.insert', 'rightClick.row'],
                onClick: this.insertRow,
                flag: 'normal',
            },
            {
                locale: ['rightClick.insert', 'rightClick.column'],
                onClick: this.insertColumn,
                flag: 'normal',
            },
            {
                locale: ['rightClick.to', 'rightClick.up', 'rightClick.add', { type: 'input', format: 'number', placeholder: 1 }, 'rightClick.row'],
                flag: 'row',
            },
            {
                locale: ['rightClick.to', 'rightClick.down', 'rightClick.add', { type: 'input', format: 'number', placeholder: 1 }, 'rightClick.row'],
                flag: 'row',
                border: true,
            },
            {
                locale: ['rightClick.to', 'rightClick.left', 'rightClick.add', { type: 'input', format: 'number', placeholder: 1 }, 'rightClick.column'],
                flag: 'column',
            },
            {
                locale: ['rightClick.to', 'rightClick.right', 'rightClick.add', { type: 'input', format: 'number', placeholder: 1 }, 'rightClick.column'],
                flag: 'column',
                border: true,
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
                locale: ['rightClick.hideSelected', 'rightClick.row'],
                flag: 'row',
            },
            {
                locale: ['rightClick.showHide', 'rightClick.row'],
                flag: 'row',
            },
            {
                locale: ['rightClick.row', 'rightClick.height', { type: 'input', format: 'number' }, 'px'],
                flag: 'row',
            },
            {
                locale: ['rightClick.hideSelected', 'rightClick.column'],
                flag: 'column',
            },
            {
                locale: ['rightClick.showHide', 'rightClick.column'],
                flag: 'column',
            },
            {
                locale: ['rightClick.column', 'rightClick.width', { type: 'input', format: 'number' }, 'px'],
                flag: 'column',
            },
            {
                locale: ['rightClick.deleteCell'],
                icon: 'RightIcon',
                border: true,
                children: [
                    {
                        locale: ['rightClick.moveLeft'],
                        className: Style.rightMenuCenter,
                        onClick: (...arg: any) => this.deleteCellLeft(...arg),
                    },
                    {
                        locale: ['rightClick.moveUp'],
                        className: Style.rightMenuCenter,
                        onClick: (...arg: any) => this.deleteCellTop(...arg),
                    },
                ],
            },
            {
                locale: ['rightClick.clearContent'],
                onClick: (...arg: any) => this.clear(...arg),
            },
            {
                locale: ['rightClick.matrix'],
                icon: 'RightIcon',
                hideLi: true,
                children: [
                    {
                        locale: [
                            'rightClick.flip',
                            { type: 'button', text: 'rightClick.upAndDown', locale: 'rightClick.upAndDown' },
                            { type: 'button', text: 'rightClick.leftAndRight', locale: 'rightClick.leftAndRight' },
                        ],
                    },
                    {
                        locale: [
                            'rightClick.flip',
                            { type: 'button', text: 'rightClick.clockwise', locale: 'rightClick.clockwise' },
                            { type: 'button', text: 'rightClick.counterclockwise', locale: 'rightClick.counterclockwise' },
                        ],
                    },
                    {
                        locale: ['rightClick.transpose'],
                    },
                    {
                        locale: [
                            'rightClick.matrixCalculation',
                            {
                                type: 'select',
                                option: [
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
                            { type: 'input', format: 'number' },
                        ],
                    },
                    {
                        locale: [
                            'rightClick.delete0',
                            { type: 'button', text: 'rightClick.byRow', locale: 'rightClick.byRow' },
                            { type: 'button', text: 'rightClick.byCol', locale: 'rightClick.byCol' },
                        ],
                    },
                    {
                        locale: [
                            'rightClick.removeDuplicate',
                            { type: 'button', text: 'rightClick.byRow', locale: 'rightClick.byRow' },
                            { type: 'button', text: 'rightClick.byCol', locale: 'rightClick.byCol' },
                        ],
                    },
                ],
            },
            {
                locale: ['rightClick.sortSelection'],
                hideLi: true,
            },
            {
                locale: ['rightClick.filterSelection'],
                hideLi: true,
            },
            {
                locale: ['rightClick.chartGeneration'],
                hideLi: true,
            },
            {
                locale: ['toolbar.insertImage'],
                hideLi: true,
            },
            {
                locale: ['toolbar.insertLink'],
                hideLi: true,
            },
            {
                locale: ['toolbar.dataValidation'],
                hideLi: true,
            },
            {
                locale: ['toolbar.cellFormat'],
                hideLi: true,
            },
        ];

        this._rightMenuModel = new RightMenuModel();
        this._initialize(this._menuList);
    }

    private _initialize(menuList: RightMenuProps[]) {
        const context = this._plugin.getContext();
        const manager = context.getObserverManager();

        manager.requiredObserver<RightMenu>('onRightMenuDidMountObservable', PLUGIN_NAMES.SPREADSHEET).add((component) => {
            this._RightMenu = component;
            this.resetMenuList(menuList);
        });

        context.getContextObserver('onAfterChangeUILocaleObservable').add(() => {
            const locale = this._plugin.context.getLocale();

            for (let i = 0; i < this._menuList.length; i++) {
                const item = this._menuList[i];
                item.label = this._jointJsx(item.locale, locale);
                if (item.children) {
                    for (let j = 0; j < item.children.length; j++) {
                        item.children[j].label = this._jointJsx(item.children[j].locale, locale);
                    }
                }
            }
            this._rightMenuModel.setRightMenu(this._menuList);
            this._RightMenu.setMenuList(this._menuList);
        });

        context.getContextObserver('onSheetRenderDidMountObservable').add(() => {
            const spreadSheet = this._plugin.getContentRef().current;
            if (!spreadSheet) return;
            this._plugin.getMainComponent().onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
                const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
                if (evt.button === 2) {
                    spreadSheet.oncontextmenu = () => false;
                    this.resetMenuList(this._menuList);
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

    private _hideLi(item: RightMenuProps, flag?: MenuFlag) {
        if (!flag) {
            if (item.flag === 'row') {
                item.hideLi = true;
            }
            if (item.flag === 'column') {
                item.hideLi = true;
            }
            if (item.flag === 'normal') {
                item.hideLi = false;
            }
        } else if (flag === 'row') {
            if (item.flag === 'normal') {
                item.hideLi = true;
            }
            if (item.flag === 'column') {
                item.hideLi = true;
            }
            if (item.flag === 'row') {
                item.hideLi = false;
            }
        } else {
            if (item.flag === 'row') {
                item.hideLi = true;
            }
            if (item.flag === 'column') {
                item.hideLi = true;
            }
            if (item.flag === 'column') {
                item.hideLi = false;
            }
        }
    }

    resetMenuList(menuList: RightMenuProps[], flag?: MenuFlag) {
        const locale = this._plugin.context.getLocale();

        for (let i = 0; i < menuList.length; i++) {
            let item = menuList[i];
            item.label = this._jointJsx(item.locale, locale);
            this._hideLi(item, flag);
            if (item.children) {
                for (let j = 0; j < item.children.length; j++) {
                    item.children[j].label = this._jointJsx(item.children[j].locale, locale);
                }
            }
        }
        this._rightMenuModel.setRightMenu(menuList);
        this._RightMenu.setMenuList(menuList);
    }

    private _jointJsx(option: any, locale: Locale) {
        let label;
        if (option.some((ele: any) => ele instanceof Object)) {
            label = [];
            for (let i = 0; i < option.length; i++) {
                let item = option[i];
                if (item instanceof Object) {
                    if (item.type === 'input') {
                        item.placeholder = locale.get(item.locale);
                    } else if (item.type === 'button') {
                        item.text = locale.get(item.locale);
                    } else if (item.type === 'select') {
                        item.option.forEach((ele: any) => {
                            ele.text = locale.get(ele.locale);
                        });
                    }
                    label.push(item);
                } else {
                    if (item.includes('.')) {
                        item = locale.get(item);
                    }
                    label.push(item);
                }
            }
        } else {
            label = '';
            for (let i = 0; i < option.length; i++) {
                let item = option[i];
                if (item.includes('.')) {
                    item = locale.get(item);
                }
                label += item;
            }
        }
        return label;
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

    // private _render(sheet: Worksheet) {
    //     this._plugin.getCanvasView().updateToSheet(sheet);
    //     this._plugin?.getMainComponent().makeDirty(true);
    // }

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
            // this._render(sheet);
        }
    };

    insertColumn = (...arg: any) => {
        arg[1].ref.hideSelect();

        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.insertColumnBefore(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
            // this._render(sheet);
        }
    };

    deleteColumn = (...arg: any) => {
        arg[1].ref.hideSelect();

        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.deleteColumns(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
            // this._render(sheet);
        }
    };

    clear = (...arg: any) => {
        arg[1].ref.hideSelect();

        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).clear();
            // this._render(sheet);
        }
    };

    deleteCellLeft = (...arg: any) => {
        arg[1].ref.hideSelect();
        arg[1].ref.getParent().hideSelect();

        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).deleteCells(0);
            // this._render(sheet);
        }
    };

    deleteCellTop = (...arg: any) => {
        arg[1].ref.hideSelect();
        arg[1].ref.getParent().hideSelect();

        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).deleteCells(1);
            // this._render(sheet);
        }
    };

    addItem = (item: RightMenuProps[] | RightMenuProps) => {
        if (item instanceof Array) {
            this._menuList.unshift(...item);
        } else {
            this._menuList.unshift(item);
        }
    };
}

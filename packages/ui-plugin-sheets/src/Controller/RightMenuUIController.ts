import { IMouseEvent, IPointerEvent } from '@univerjs/base-render';
import { BaseMenuItem, BaseSelectChildrenProps, ComponentChildren, ComponentManager } from '@univerjs/base-ui';
import { ICurrentUniverService, IDCurrentUniverService, ObserverManager, Tools, UIObserver } from '@univerjs/core';
import { Inject, SkipSelf } from '@wendellhu/redi';
import { CanvasView } from '@univerjs/base-sheets';
import { DefaultRightMenuConfig, SheetRightMenuConfig } from '../Basics';
import { RightMenu, RightMenuInput, RightMenuItem } from '../View';
import styles from '../View/RightMenu/index.module.less';

interface CustomLabelProps {
    prefix?: string[] | string;
    suffix?: string[] | string;
    options?: BaseSelectChildrenProps[];
    label?: string;
    children?: CustomLabelProps[];
    onKeyUp?: (e: Event) => void;
}

export interface CustomLabel {
    name: string;
    props?: CustomLabelProps;
}

export interface RightMenuProps extends BaseMenuItem {
    label?: string | CustomLabel | ComponentChildren;
    children?: RightMenuProps[];
    suffix?: string;
    border?: boolean;
}

export class RightMenuUIController {
    private _rightMenu: RightMenu;

    private _menuList: RightMenuProps[];

    private _config: SheetRightMenuConfig;

    // eslint-disable-next-line max-lines-per-function
    constructor(
        config: SheetRightMenuConfig | undefined,
        @Inject(CanvasView) private readonly _sheetCanvasView: CanvasView,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        @IDCurrentUniverService private readonly _currentUniverService: ICurrentUniverService
    ) {
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
                label: {
                    name: RightMenuInput.name,
                    props: {
                        prefix: 'rightClick.toTopAdd',
                        suffix: 'rightClick.row',
                    },
                },
                show: this._config.AddRowTop,
            },
            {
                label: {
                    name: RightMenuInput.name,
                    props: {
                        prefix: 'rightClick.toBottomAdd',
                        suffix: 'rightClick.row',
                    },
                },
                show: this._config.AddRowBottom,
            },
            {
                label: {
                    name: RightMenuInput.name,
                    props: {
                        prefix: 'rightClick.toLeftAdd',
                        suffix: 'rightClick.column',
                    },
                },
                show: this._config.AddColumnLeft,
            },
            {
                label: {
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
                label: {
                    name: RightMenuInput.name,
                    props: {
                        prefix: 'rightClick.rowHeight',
                        suffix: 'px',
                        onKeyUp: this.setRowHeight.bind(this),
                    },
                },
                onClick: () => {},
                // show: this._config.RowHeight,
                show: true,
            },
            {
                label: 'rightClick.hideSelectedColumn',
                onClick: () => this.hideColumn(),
                show: this._config.HideColumn,
            },
            {
                label: 'rightClick.showHideColumn',
                show: this._config.ShowColumn,
            },
            {
                label: {
                    name: RightMenuInput.name,
                    props: {
                        prefix: 'rightClick.columnWidth',
                        suffix: 'px',
                        onKeyUp: this.setColumnWidth.bind(this),
                    },
                },
                // show: this._config.ColumnWidth,
                show: true,
            },
            {
                show: this._config.DeleteCell,
                label: {
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
            //     label: {
            //         name: RightMenuItem.name,
            //         props: {
            //             label: 'rightClick.matrix',
            //         },
            //     },
            //     children: [
            //         {
            //             label: {
            //                 name: RightMenuButton.name,
            //                 props: {
            //                     label: 'rightClick.flip',
            //                     children: [
            //                         {
            //                             label: 'rightClick.upAndDown',
            //                         },
            //                         {
            //                             label: 'rightClick.leftAndRight',
            //                         },
            //                     ],
            //                 },
            //             },
            //         },
            //         {
            //             label: {
            //                 name: RightMenuButton.name,
            //                 props: {
            //                     label: 'rightClick.flip',
            //                     children: [
            //                         {
            //                             label: 'rightClick.clockwise',
            //                         },
            //                         {
            //                             label: 'rightClick.counterclockwise',
            //                         },
            //                     ],
            //                 },
            //             },
            //         },
            //         {
            //             label: ['rightClick.transpose'],
            //         },
            //         {
            //             label: {
            //                 name: RightMenuSelect.name,
            //                 props: {
            //                     label: 'rightClick.matrixCalculation',
            //                     options: [
            //                         {
            //                             label: 'rightClick.plus',
            //                         },
            //                         {
            //                             label: 'rightClick.minus',
            //                         },
            //                         {
            //                             label: 'rightClick.multiply',
            //                         },
            //                         {
            //                             label: 'rightClick.divided',
            //                         },
            //                         {
            //                             label: 'rightClick.power',
            //                         },
            //                         {
            //                             label: 'rightClick.root',
            //                         },
            //                         {
            //                             label: 'rightClick.log',
            //                         },
            //                     ],
            //                 },
            //             },
            //         },
            //         {
            //             label: {
            //                 name: RightMenuButton.name,
            //                 props: {
            //                     label: 'rightClick.delete0',
            //                     children: [
            //                         {
            //                             label: 'rightClick.byRow',
            //                         },
            //                         {
            //                             label: 'rightClick.byCol',
            //                         },
            //                     ],
            //                 },
            //             },
            //         },
            //         {
            //             label: {
            //                 name: RightMenuButton.name,
            //                 props: {
            //                     label: 'rightClick.removeDuplicate',
            //                     children: [
            //                         {
            //                             label: 'rightClick.byRow',
            //                         },
            //                         {
            //                             label: 'rightClick.byCol',
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

    // 获取RightMenu组件
    getComponent = (ref: RightMenu) => {
        this._rightMenu = ref;
        this.setMenuList();
    };

    // 刷新
    setMenuList() {
        this._rightMenu?.setMenuList(this._menuList);
    }

    setUIObserve<T>(msg: UIObserver<T>) {
        this._globalObserverManager.requiredObserver<UIObserver<T>>('onUIChangeObservable', 'core').notifyObservers(msg);
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

    hideColumn() {
        const msg = {
            name: 'hideColumn',
        };
        this.setUIObserve(msg);
    }

    setRowHeight(e: Event) {
        const univerSheet = this._currentUniverService.getCurrentUniverSheetInstance();
        console.dir(univerSheet.getWorkBook().getActiveSheet().getConfig());
        console.dir(univerSheet.getWorkBook().getStyles());

        if ((e as KeyboardEvent).key !== 'Enter') {
            return;
        }
        const height = (e.target as HTMLInputElement).value;
        const msg = {
            name: 'setRowHeight',
            value: height,
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
            value: width,
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

    private _initialize() {
        const componentManager = this._componentManager;
        componentManager.register(RightMenuInput.name, RightMenuInput);
        componentManager.register(RightMenuItem.name, RightMenuItem);

        // TODO: export MainComponent as a public module of base-sheets
        this._sheetCanvasView
            .getSheetView()
            .getSpreadsheet()
            .onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
                if (evt.button === 2) {
                    evt.preventDefault();
                    this._rightMenu.handleContextMenu(evt);
                }
            });
    }
}

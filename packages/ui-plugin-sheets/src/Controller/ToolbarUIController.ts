import { Inject, Injector, SkipSelf } from '@wendellhu/redi';
import { BorderInfo, ISelectionManager, SelectionManager } from '@univerjs/base-sheets';
import { BaseSelectChildrenProps, BaseSelectProps, ColorPicker, ComponentManager, CustomComponent, IMenuService, MenuPosition } from '@univerjs/base-ui';
import {
    BorderType,
    CommandManager,
    DEFAULT_STYLES,
    HorizontalAlign,
    IKeyValue,
    ISheetActionData,
    SheetActionBase,
    Tools,
    UIObserver,
    VerticalAlign,
    WrapStrategy,
    Range,
    ITextRotation,
    ICurrentUniverService,
    ObserverManager,
    Disposable,
} from '@univerjs/core';
import { ComponentChildren } from 'preact';
import { DefaultToolbarConfig, SheetToolbarConfig, SHEET_UI_PLUGIN_NAME } from '../Basics';
import { ColorSelect, LineBold, LineColor, Toolbar } from '../View';
import {
    FONT_FAMILY_CHILDREN,
    FONT_SIZE_CHILDREN,
    BORDER_LINE_CHILDREN,
    BORDER_SIZE_CHILDREN,
    MERGE_CHILDREN,
    HORIZONTAL_ALIGN_CHILDREN,
    VERTICAL_ALIGN_CHILDREN,
    TEXT_WRAP_CHILDREN,
    TEXT_ROTATE_CHILDREN,
} from '../View/Toolbar/Const';

import styles from '../View/Toolbar/index.module.less';
import { BoldMenuItemFactory, ItalicMenuItemFactory, RedoMenuItemFactory, StrikeThroughMenuItemFactory, UnderlineMenuItemFactory, UndoMenuItemFactory } from './menu';

export interface BaseToolbarSelectProps extends BaseSelectProps {
    children?: BaseSelectChildrenProps[];
}

enum ToolbarType {
    SELECT,
    BUTTON,
}

export interface IToolbarItemProps extends BaseToolbarSelectProps {
    active?: boolean;
    unActive?: boolean; //button不需保持状态
    show?: boolean; //是否显示按钮
    toolbarType?: ToolbarType;
    tooltip?: string; //tooltip文字
    border?: boolean;
    suffix?: ComponentChildren;
}

export class ToolbarUIController extends Disposable {
    private _toolbar: Toolbar;

    /**
     * @deprecated
     */
    private _toolList: IToolbarItemProps[];

    private _config: SheetToolbarConfig;

    private _lineColor: LineColor;

    private _lineBold: LineBold;

    private _colorSelect1: ColorSelect;

    private _textColor: string = '#000';

    private _colorSelect2: ColorSelect;

    private _background: string = '#fff';

    private _borderInfo: BorderInfo = {
        type: BorderType.ALL,
        color: '#000',
        style: 1,
    }; //存储边框信息

    // eslint-disable-next-line max-lines-per-function
    constructor(
        config: SheetToolbarConfig | undefined,
        @Inject(Injector) private readonly _injector: Injector,
        @ISelectionManager private readonly _selectionManager: SelectionManager,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IMenuService private readonly _menuService: IMenuService
    ) {
        super();

        this._config = Tools.deepMerge({}, DefaultToolbarConfig, config);

        // TODO: @wzhudev: toolbar configurations should be moved to command system
        this._toolList = [
            {
                type: 0,
                tooltip: 'toolbar.font',
                className: styles.selectLabelString,
                name: 'font',
                show: this._config.font,
                border: true,
                onMainClick: () => {
                    this.hideTooltip();
                },
                onClick: (fontFamily: string) => {
                    this.setFontFamily(fontFamily);
                },
                children: FONT_FAMILY_CHILDREN,
            },
            {
                type: 1,
                tooltip: 'toolbar.fontSize',
                label: String(DEFAULT_STYLES.fs),
                name: 'fontSize',
                show: this._config.fontSize,
                onClick: (fontSize: number) => {
                    this.setFontSize(fontSize);
                },
                onMainClick: () => {
                    this.hideTooltip();
                },
                onPressEnter: (fontSize: number) => {
                    this.setFontSize(fontSize);
                    this.hideTooltip();
                },
                children: FONT_SIZE_CHILDREN,
            },

            {
                type: 5,
                tooltip: 'toolbar.textColor.main',
                label: {
                    name: SHEET_UI_PLUGIN_NAME + ColorSelect.name,
                    props: {
                        getComponent: (ref: ColorSelect) => {
                            this._colorSelect1 = ref;
                        },
                        color: '#000',
                        label: {
                            name: 'TextColorIcon',
                        },
                    },
                },
                onClick: () => {
                    this.hideTooltip();
                    const textColor = this._toolList.find((item) => item.name === 'textColor');
                    if (!textColor || !textColor.label) return;
                    if (!(textColor.label as CustomComponent).props?.color) return;
                    (textColor.label as CustomComponent).props!.color = this._textColor;
                    this.changeColor(this._textColor);
                },
                hideSelectedIcon: true,
                className: styles.selectColorPickerParent,
                children: [
                    {
                        label: 'toolbar.resetColor',
                    },
                    {
                        label: {
                            name: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
                            props: {
                                onClick: (color: string, e: MouseEvent) => {
                                    this._colorSelect1.setColor(color);
                                    this._textColor = color;
                                },
                            },
                        },
                        className: styles.selectColorPicker,
                    },
                ],
                name: 'textColor',
                show: this._config.textColor,
            },
            {
                type: 5,
                tooltip: 'toolbar.fillColor.main',
                label: {
                    name: SHEET_UI_PLUGIN_NAME + ColorSelect.name,
                    props: {
                        getComponent: (ref: ColorSelect) => {
                            this._colorSelect2 = ref;
                        },
                        color: '#fff',
                        label: {
                            name: 'FillColorIcon',
                        },
                    },
                },
                onClick: () => {
                    this.hideTooltip();
                    const fillColor = this._toolList.find((item) => item.name === 'fillColor');
                    if (!fillColor || !fillColor.label) return;
                    if (!(fillColor.label as CustomComponent).props?.color) return;
                    (fillColor.label as CustomComponent).props!.color = this._background;
                    this.setBackground(this._background);
                },
                hideSelectedIcon: true,
                className: styles.selectColorPickerParent,
                children: [
                    {
                        label: 'toolbar.resetColor',
                    },
                    {
                        label: {
                            name: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
                            props: {
                                onClick: (color: string, e: MouseEvent) => {
                                    this._colorSelect2.setColor(color);
                                    this._background = color;
                                },
                            },
                        },
                        className: styles.selectColorPicker,
                    },
                ],
                name: 'fillColor',
                show: this._config.fillColor,
            },
            {
                type: 3,
                display: 1,
                show: this._config.border,
                tooltip: 'toolbar.border.main',
                className: styles.selectDoubleString,
                onClick: (value: string) => {
                    if (value) {
                        this._borderInfo.type = value as BorderType;
                    }
                    this.hideTooltip();
                    this.setBorder();
                },
                name: 'border',
                children: [
                    ...BORDER_LINE_CHILDREN,
                    {
                        name: 'borderColor',
                        label: {
                            name: SHEET_UI_PLUGIN_NAME + LineColor.name,
                            props: {
                                color: '#000',
                                label: 'borderLine.borderColor',
                                getComponent: (ref: LineColor) => (this._lineColor = ref),
                            },
                        },
                        unSelectable: true,
                        className: styles.selectColorPickerParent,
                        children: [
                            {
                                label: {
                                    name: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
                                    props: {
                                        onClick: (color: string, e: MouseEvent) => {
                                            this._lineColor.setColor(color);
                                            this._borderInfo.color = color;
                                            const borderItem = this._toolList.find((item) => item.name === 'border');
                                            const lineColor = borderItem?.children?.find((item) => item.name === 'borderColor');
                                            if (!lineColor || !lineColor.label) return;
                                            if (!(lineColor.label as CustomComponent).props?.color) return;
                                            (lineColor.label as CustomComponent).props!.color = color;
                                        },
                                    },
                                },
                                className: styles.selectColorPicker,
                                onClick: (...arg) => {
                                    arg[0].stopPropagation();
                                },
                            },
                        ],
                    },
                    {
                        label: {
                            name: SHEET_UI_PLUGIN_NAME + LineBold.name,
                            props: {
                                img: 0,
                                label: 'borderLine.borderSize',
                                getComponent: (ref: LineBold) => (this._lineBold = ref),
                            },
                        },
                        onClick: (...arg) => {
                            arg[0].stopPropagation();
                            const label = BORDER_SIZE_CHILDREN[arg[2]].label;
                            if (typeof label === 'string') {
                                this._lineBold.setImg(label);
                            } else {
                                this._lineBold.setImg(label.name);
                            }
                            this._borderInfo.style = arg[1];
                        },
                        className: styles.selectLineBoldParent,
                        unSelectable: true,
                        children: BORDER_SIZE_CHILDREN,
                    },
                ],
            },
            {
                type: 5,
                tooltip: 'toolbar.mergeCell.main',
                label: {
                    name: 'MergeIcon',
                },
                show: this._config.mergeCell,
                onClick: (value: string) => {
                    this.setMerge(value ?? 'all');
                    this.hideTooltip();
                },
                name: 'mergeCell',
                children: MERGE_CHILDREN,
            },
            {
                type: 3,
                tooltip: 'toolbar.horizontalAlignMode.main',
                className: styles.selectDoubleString,
                display: 1,
                name: 'horizontalAlignMode',
                show: this._config.horizontalAlignMode,
                onClick: (value: HorizontalAlign) => {
                    this.setHorizontalAlignment(value);
                    this.hideTooltip();
                },
                children: HORIZONTAL_ALIGN_CHILDREN,
            },
            {
                type: 3,
                tooltip: 'toolbar.verticalAlignMode.main',
                className: styles.selectDoubleString,
                display: 1,
                name: 'verticalAlignMode',
                show: this._config.verticalAlignMode,
                onClick: (value: VerticalAlign) => {
                    this.setVerticalAlignment(value);
                    this.hideTooltip();
                },
                children: VERTICAL_ALIGN_CHILDREN,
            },
            {
                type: 3,
                className: styles.selectDoubleString,
                tooltip: 'toolbar.textWrapMode.main',
                display: 1,
                name: 'textWrapMode',
                show: this._config.textWrapMode,
                onClick: (value: WrapStrategy) => {
                    this.setWrapStrategy(value);
                    this.hideTooltip();
                },
                children: TEXT_WRAP_CHILDREN,
            },
            {
                type: 3,
                className: styles.selectDoubleString,
                name: 'textRotateMode',
                tooltip: 'toolbar.textRotateMode.main',
                display: 1,
                show: this._config.textRotateMode,
                onClick: (value: number | string) => {
                    this.setTextRotation(value);
                    this.hideTooltip();
                },
                children: TEXT_ROTATE_CHILDREN,
            },
        ];

        this._initialize();
    }

    // 获取Toolbar组件
    getComponent = (ref: Toolbar) => {
        this._toolbar = ref;

        this._initializeToolbar();
        this.setToolbar();
    };

    // 增加toolbar配置
    /**
     * @deprecated
     */
    addToolbarConfig(config: IToolbarItemProps) {
        const index = this._toolList.findIndex((item) => item.name === config.name);
        if (index > -1) return;
        this._toolList.push(config);
    }

    /**
     * @deprecated
     */
    deleteToolbarConfig(name: string) {
        const index = this._toolList.findIndex((item) => item.name === name);
        if (index > -1) {
            this._toolList.splice(index, 1);
        }
    }

    // 刷新 toolbar 数据从 controller 层移动到 view 层
    setToolbar() {
        this._toolbar?.setToolbar(this._toolList);
        this._toolbar?.setToolbarNeo(this._menuService.getMenuItems(MenuPosition.TOOLBAR));
    }

    setUIObserve<T>(msg: UIObserver<T>) {
        this._globalObserverManager.requiredObserver<UIObserver<T>>('onUIChangeObservable', 'core').notifyObservers(msg);
    }

    changeColor(color: string) {
        this.setFontColor(color);
    }

    setFontFamily(fontFamily: string) {
        const msg = {
            name: 'fontFamily',
            value: fontFamily,
        };
        this.setUIObserve(msg);
    }

    setFontSize(fontSize: number) {
        const msg = {
            name: 'fontSize',
            value: fontSize,
        };
        this.setUIObserve<number>(msg);
    }

    setFontColor(color: string) {
        const msg = {
            name: 'fontColor',
            value: color,
        };
        this.setUIObserve(msg);
    }

    setBackground(color: string) {
        const msg = {
            name: 'background',
            value: color,
        };
        this.setUIObserve(msg);
    }

    setMerge(value: string) {
        const msg = {
            name: 'merge',
            value,
        };
        this.setUIObserve(msg);
    }

    setTextRotation(value: string | number) {
        const msg = {
            name: 'textRotation',
            value,
        };
        this.setUIObserve(msg);
    }

    setWrapStrategy(value: WrapStrategy) {
        const msg = {
            name: 'wrapStrategy',
            value,
        };
        this.setUIObserve<number>(msg);
    }

    setVerticalAlignment(value: VerticalAlign) {
        const msg = {
            name: 'verticalAlignment',
            value,
        };
        this.setUIObserve<number>(msg);
    }

    setHorizontalAlignment(value: HorizontalAlign) {
        const msg = {
            name: 'horizontalAlignment',
            value,
        };
        this.setUIObserve<number>(msg);
    }

    setBorder() {
        const msg = {
            name: 'borderInfo',
            value: this._borderInfo,
        };
        this.setUIObserve<IKeyValue>(msg);
    }

    hideTooltip() {
        const dom = this._toolbar.base as HTMLDivElement;
        const tooltip = dom.querySelectorAll(`.${styles.tooltipTitle}.${styles.bottom}`);
        tooltip.forEach((item) => {
            (item as HTMLSpanElement).style.display = 'none';
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private _changeToolbarState(range: Range): void {
        // FIXME@wzhudev: this is anti-pattern too, it should not compose all the toolbar items here
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const worksheet = workbook.getActiveSheet();
        if (worksheet) {
            const fontSize = range.getFontSize();
            const fontWeight = range.getFontWeight();
            const fontName = range.getFontFamily();
            const fontItalic = range.getFontStyle();
            const horizontalAlign = range.getHorizontalAlignment() ?? HorizontalAlign.LEFT;
            const verticalAlign = range.getVerticalAlignment() ?? VerticalAlign.BOTTOM;
            const rotation = range.getTextRotation() as ITextRotation;
            const warp = range.getWrapStrategy() ?? WrapStrategy.CLIP;

            const textRotateModeItem = this._toolList.find((item) => item.name === 'textRotateMode');
            const fontSizeItem = this._toolList.find((item) => item.name === 'fontSize');
            const fontNameItem = this._toolList.find((item) => item.name === 'font');
            const fontBoldItem = this._toolList.find((item) => item.name === 'bold');
            const fontItalicItem = this._toolList.find((item) => item.name === 'italic');
            const horizontalAlignModeItem = this._toolList.find((item) => item.name === 'horizontalAlignMode');
            const verticalAlignModeItem = this._toolList.find((item) => item.name === 'verticalAlignMode');
            const textWrapMode = this._toolList.find((item) => item.name === 'textWrapMode');

            if (fontNameItem) {
                fontNameItem.children?.forEach((item) => {
                    item.selected = fontName === item.value;
                });
            }
            if (fontSizeItem) {
                fontSizeItem.label = fontSize.toString();
            }
            if (fontBoldItem) {
                fontBoldItem.active = !!fontWeight;
            }
            if (fontItalicItem) {
                fontItalicItem.active = !!fontItalic;
            }
            if (horizontalAlignModeItem) {
                horizontalAlignModeItem.children?.forEach((item) => {
                    item.selected = horizontalAlign === item.value;
                });
            }
            if (textRotateModeItem) {
                textRotateModeItem.children?.forEach((item) => {
                    if ((rotation as ITextRotation).v) {
                        item.selected = item.value === 'v';
                    } else {
                        item.selected = (rotation as ITextRotation).a === item.value;
                    }
                });
            }
            if (verticalAlignModeItem) {
                verticalAlignModeItem.children?.forEach((item) => {
                    item.selected = verticalAlign === item.value;
                });
            }
            if (textWrapMode) {
                textWrapMode.children?.forEach((item) => {
                    item.selected = warp === item.value;
                });
            }

            this.setToolbar();
        }
    }

    private _initializeToolbar(): void {
        // NOTE@wzhudev: now we register menu items that only display in the toolbar here. In fact we should register all commands and menu items and shortcuts
        // in a single controller. I will do that layer.
        [UndoMenuItemFactory, RedoMenuItemFactory, BoldMenuItemFactory, ItalicMenuItemFactory, UnderlineMenuItemFactory, StrikeThroughMenuItemFactory].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }

    private _initialize() {
        const componentManager = this._componentManager;
        componentManager.register(SHEET_UI_PLUGIN_NAME + ColorSelect.name, ColorSelect);
        componentManager.register(SHEET_UI_PLUGIN_NAME + ColorPicker.name, ColorPicker);
        componentManager.register(SHEET_UI_PLUGIN_NAME + LineColor.name, LineColor);
        componentManager.register(SHEET_UI_PLUGIN_NAME + LineBold.name, LineBold);

        CommandManager.getCommandObservers().add(({ actions }) => {
            if (!actions || actions.length === 0) return;
            const action = actions[0] as SheetActionBase<ISheetActionData, ISheetActionData, void>;

            const currentUnitId = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getUnitId();

            // TODO not use try catch
            try {
                action.getWorkBook();
            } catch (error) {
                return;
            }

            const actionUnitId = action.getWorkBook().getUnitId();

            if (currentUnitId !== actionUnitId) return;

            const manager = this._selectionManager;
            const range = manager.getCurrentCell();
            if (range) {
                this._changeToolbarState(range);
            }
        });
    }
}

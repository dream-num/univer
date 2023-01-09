import { BaseComponentRender, BaseComponentSheet } from '@univer/base-component';
import { Tools, BorderType, BorderStyleTypes, HorizontalAlign, VerticalAlign, WrapStrategy, DEFAULT_STYLES } from '@univer/core';
import { ColorPicker } from '@univer/style-univer';
import { DocPlugin } from '../DocPlugin';
import { defaultLayout, ILayout } from '../View/UI/DocContainer';

import {
    BORDER_LINE_CHILDREN,
    FONT_FAMILY_CHILDREN,
    FONT_SIZE_CHILDREN,
    HORIZONTAL_ALIGN_CHILDREN,
    MERGE_CHILDREN,
    TEXT_ROTATE_CHILDREN,
    TEXT_WRAP_CHILDREN,
    VERTICAL_ALIGN_CHILDREN,
} from '../View/UI/ToolBar/Const';
import styles from '../View/UI/ToolBar/index.module.less';
import { LineColor } from '../View/UI/Common/Line/LineColor';
import { ToolBar } from '../View/UI/ToolBar';
import { IToolBarItemProps, ToolBarModel } from '../Model/ToolBarModel';

interface BorderInfo {
    color: string;
    width: string;
}

/**
 *
 */
export class ToolBarController {
    private _toolBarModel: ToolBarModel;

    private _plugin: DocPlugin;

    private _toolBarComponent: ToolBar;

    private _toolList: IToolBarItemProps[];

    private _lineColor: LineColor;

    Render: BaseComponentRender;

    private _borderInfo: BorderInfo; //存储边框信息

    constructor(plugin: DocPlugin) {
        this._plugin = plugin;

        const pluginName = this._plugin.getPluginName();

        this._initRegisterComponent();

        const config =
            this._plugin.config.layout === 'auto'
                ? Tools.deepClone(defaultLayout.toolBarConfig)
                : Tools.deepMerge(defaultLayout.toolBarConfig, (this._plugin.config.layout as ILayout).toolBarConfig);

        this._borderInfo = {
            color: '#000',
            width: '1',
        };

        this._toolList = [
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.undo',
                customLabel: {
                    name: 'ForwardIcon',
                },
                show: config.undoRedo,
                onClick: () => {
                    this.setUndo();
                },
            },
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.redo',
                customLabel: {
                    name: 'BackIcon',
                },
                show: config.undoRedo,
                onClick: () => {
                    this.setRedo();
                },
            },

            {
                type: 0,
                tooltipLocale: 'toolbar.font',
                selectClassName: styles.selectLabelString,
                show: config.font,
                border: true,
                onClick: (fontFamily: string) => {
                    this._plugin.getObserver('onAfterChangeFontFamilyObservable')?.notifyObservers(fontFamily);
                },
                children: FONT_FAMILY_CHILDREN,
            },
            {
                type: 1,
                tooltipLocale: 'toolbar.fontSize',
                label: String(DEFAULT_STYLES.fs),
                show: config.fontSize,
                onClick: (fontSize: number) => {
                    this._plugin.getObserver('onAfterChangeFontSizeObservable')?.notifyObservers(fontSize);
                },
                onKeyUp: (fontSize: number) => {
                    this._plugin.getObserver('onAfterChangeFontSizeObservable')?.notifyObservers(fontSize);
                },
                children: FONT_SIZE_CHILDREN,
            },
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.bold',
                customLabel: {
                    name: 'BoldIcon',
                },
                show: config.bold,
                onClick: (isBold: boolean) => {
                    this._plugin.getObserver('onAfterChangeFontWeightObservable')?.notifyObservers(isBold);
                },
            },
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.italic',
                customLabel: {
                    name: 'ItalicIcon',
                },
                show: config.italic,
                onClick: (isItalic: boolean) => {
                    this._plugin.getObserver('onAfterChangeFontItalicObservable')?.notifyObservers(isItalic);
                },
            },
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.strikethrough',
                customLabel: {
                    name: 'DeleteLineIcon',
                },
                show: config.strikethrough,
                onClick: (isStrikethrough: boolean) => {
                    this._plugin.getObserver('onAfterChangeFontStrikethroughObservable')?.notifyObservers(isStrikethrough);
                },
            },
            {
                toolbarType: 1,
                tooltipLocale: 'toolbar.underline',
                customLabel: {
                    name: 'UnderLineIcon',
                },
                show: config.underline,
                onClick: (isItalic: boolean) => {
                    this._plugin.getObserver('onAfterChangeFontUnderlineObservable')?.notifyObservers(isItalic);
                },
            },
            {
                type: 2,
                tooltipLocale: 'toolbar.textColor.main',
                customLabel: {
                    name: 'TextColorIcon',
                },
                show: config.textColor,
                onClick: (color: string) => {
                    this._plugin.getObserver('onAfterChangeFontColorObservable')?.notifyObservers(color);
                },
            },
            {
                type: 2,
                tooltipLocale: 'toolbar.fillColor.main',
                customLabel: {
                    name: 'FillColorIcon',
                },
                show: config.fillColor,
                onClick: (color: string) => {
                    this._plugin.getObserver('onAfterChangeFontBackgroundObservable')?.notifyObservers(color);
                },
            },
        ];

        this._toolBarModel = new ToolBarModel();
        this._toolBarModel.config = config;
        this._toolBarModel.toolList = this._toolList;

        this.init();
    }

    init() {
        this._plugin.getObserver('onAfterChangeFontFamilyObservable')?.add((value: string) => {
            this.setFontFamily(value);
        });
        this._plugin.getObserver('onAfterChangeFontSizeObservable')?.add((value: number) => {
            this.setFontSize(value);
        });
        this._plugin.getObserver('onAfterChangeFontWeightObservable')?.add((value: boolean) => {
            this.setFontWeight(value);
        });
        this._plugin.getObserver('onAfterChangeFontItalicObservable')?.add((value: boolean) => {
            this.setFontStyle(value);
        });
        this._plugin.getObserver('onAfterChangeFontStrikethroughObservable')?.add((value: boolean) => {
            this.setStrikeThrough(value);
        });
        this._plugin.getObserver('onAfterChangeFontUnderlineObservable')?.add((value: boolean) => {
            this.setUnderline(value);
        });
        this._plugin.getObserver('onAfterChangeFontColorObservable')?.add((value: string) => {
            this.setFontColor(value);
        });
        this._plugin.getObserver('onAfterChangeFontBackgroundObservable')?.add((value: string) => {
            this.setBackground(value);
        });

        this._plugin.getObserver('onToolBarDidMountObservable')?.add((component) => {
            //初始化视图
            this._toolBarComponent = component;
            this.resetToolBarList();
        });

        this._plugin.context
            .getObserverManager()
            .getObserver('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {});
    }

    private _initRegisterComponent() {
        const component = this._plugin.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        const pluginName = this._plugin.getPluginName();
        this.Render = component.getComponentRender();
        const registerIcon = {
            ForwardIcon: this.Render.renderFunction('ForwardIcon'),
            BackIcon: this.Render.renderFunction('BackIcon'),
            BoldIcon: this.Render.renderFunction('BoldIcon'),
            ItalicIcon: this.Render.renderFunction('ItalicIcon'),
            DeleteLineIcon: this.Render.renderFunction('DeleteLineIcon'),
            UnderLineIcon: this.Render.renderFunction('UnderLineIcon'),
            TextColorIcon: this.Render.renderFunction('TextColorIcon'),
            FillColorIcon: this.Render.renderFunction('FillColorIcon'),
            MergeIcon: this.Render.renderFunction('MergeIcon'),
            TopBorderIcon: this.Render.renderFunction('TopBorderIcon'),
            BottomBorderIcon: this.Render.renderFunction('BottomBorderIcon'),
            LeftBorderIcon: this.Render.renderFunction('LeftBorderIcon'),
            RightBorderIcon: this.Render.renderFunction('RightBorderIcon'),
            NoneBorderIcon: this.Render.renderFunction('NoneBorderIcon'),
            FullBorderIcon: this.Render.renderFunction('FullBorderIcon'),
            OuterBorderIcon: this.Render.renderFunction('OuterBorderIcon'),
            InnerBorderIcon: this.Render.renderFunction('InnerBorderIcon'),
            StripingBorderIcon: this.Render.renderFunction('StripingBorderIcon'),
            VerticalBorderIcon: this.Render.renderFunction('VerticalBorderIcon'),
            LeftAlignIcon: this.Render.renderFunction('LeftAlignIcon'),
            CenterAlignIcon: this.Render.renderFunction('CenterAlignIcon'),
            RightAlignIcon: this.Render.renderFunction('RightAlignIcon'),
            TopVerticalIcon: this.Render.renderFunction('TopVerticalIcon'),
            CenterVerticalIcon: this.Render.renderFunction('CenterVerticalIcon'),
            BottomVerticalIcon: this.Render.renderFunction('BottomVerticalIcon'),
            OverflowIcon: this.Render.renderFunction('OverflowIcon'),
            BrIcon: this.Render.renderFunction('BrIcon'),
            CutIcon: this.Render.renderFunction('CutIcon'),
            TextRotateIcon: this.Render.renderFunction('TextRotateIcon'),
            TextRotateAngleUpIcon: this.Render.renderFunction('TextRotateAngleUpIcon'),
            TextRotateAngleDownIcon: this.Render.renderFunction('TextRotateAngleDownIcon'),
            TextRotateVerticalIcon: this.Render.renderFunction('TextRotateVerticalIcon'),
            TextRotateRotationUpIcon: this.Render.renderFunction('TextRotateRotationUpIcon'),
            TextRotateRotationDownIcon: this.Render.renderFunction('TextRotateRotationDownIcon'),
        };

        for (let k in registerIcon) {
            this._plugin.registerComponent(k, registerIcon[k]);
        }
    }

    resetLocale(toolList: any[]) {
        const locale = this._plugin.context.getLocale();

        for (let i = 0; i < toolList.length; i++) {
            const item = toolList[i];
            if (item.tooltipLocale) {
                item.tooltip = locale.get(item.tooltipLocale);
            }
            if (item.locale) {
                item.label = locale.get(item.locale);
            }
            if (item.suffixLocale) {
                item.suffix = locale.get(item.suffixLocale);
            }
            if (item.children) {
                item.children = this.resetLocale(item.children);
            }
        }
        return toolList;
    }

    resetToolBarList() {
        const toolList = this.resetLocale(this._toolList);
        this._toolBarComponent.setToolBar(toolList);
    }

    setRedo() {
        this._plugin.getContext().getCommandManager().redo();
    }

    setUndo() {
        this._plugin.getContext().getCommandManager().undo();
    }

    setFontColor(value: string) {}

    setBackground(value: string) {}

    setFontSize(value: number) {}

    setFontFamily(value: string) {}

    setFontWeight(value: boolean) {}

    setFontStyle(value: boolean) {}

    setStrikeThrough(value: boolean) {}

    setUnderline(value: boolean) {}
}

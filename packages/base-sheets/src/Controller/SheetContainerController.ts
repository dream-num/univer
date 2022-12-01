import { BooleanNumber, CommandManager, ContextBase, ISheetActionData, LocaleType, PLUGIN_NAMES, SheetActionBase, Tools, Workbook } from '@univer/core';
import { BaseComponentSheet, BaseComponentRender, BaseComponentProps } from '@univer/base-component';

import { CellRangeModal } from '../View/UI/Common/CellRange/CellRangeModal';
import { SheetPlugin } from '../SheetPlugin';
import { IShowToolBarConfig } from '../Model';
import { SheetContainer } from '../View/UI/SheetContainer';
import { DefaultSheetContainerConfig } from '../Basics';
import { IHideRightMenuConfig } from './RightMenuController';
// All skins' less file

export interface IShowContainerConfig {
    outerLeft?: boolean;

    outerRight?: boolean;

    header?: boolean;

    footer?: boolean;

    innerLeft?: boolean;

    innerRight?: boolean;

    frozenHeaderLT?: boolean;

    frozenHeaderRT?: boolean;

    frozenHeaderLM?: boolean;

    frozenContent?: boolean;

    infoBar?: boolean;

    formulaBar?: boolean;

    countBar?: boolean;

    sheetBar?: boolean;

    // Whether to show the toolbar
    toolBar?: boolean;

    rightMenu?: boolean;

    contentSplit?: boolean | string;
}

export interface ILayout {
    sheetContainerConfig?: IShowContainerConfig | string;
    toolBarConfig?: IShowToolBarConfig;
    rightMenuConfig?: IHideRightMenuConfig;
}

export interface ISheetPluginConfigBase extends ILayout {
    layout?: ILayout;
}

export interface BaseSheetContainerConfig extends BaseComponentProps, ISheetPluginConfigBase {
    container: HTMLElement;
    skin: string;
    onDidMount: () => void;
    context: ContextBase;
}

export class SheetContainerController {
    private _plugin: SheetPlugin;

    private _render: BaseComponentRender;

    private _config: BaseSheetContainerConfig;

    private _defaultLayout: IShowContainerConfig;

    private _sheetContainer: SheetContainer;

    constructor(plugin: SheetPlugin, config: BaseSheetContainerConfig) {
        this._plugin = plugin;

        this._config = config;

        this._initRegisterComponent();

        this._initialize();

        this._defaultLayout =
            this._config.layout === 'auto'
                ? Tools.deepClone(DefaultSheetContainerConfig) // The defaultLayout must be cloned, otherwise the layout object will be referenced in multiple instances
                : Tools.deepMerge(DefaultSheetContainerConfig, this._config.layout?.sheetContainerConfig);
    }

    private _initialize() {
        // Monitor all command changes and automatically trigger the refresh of the canvas
        CommandManager.getCommandObservers().add(({ actions }) => {
            const plugin: SheetPlugin = this._plugin;

            if (!plugin) return;
            if (!actions || actions.length === 0) return;
            const action = actions[0] as SheetActionBase<ISheetActionData, ISheetActionData, void>;
            const worksheet = action.getWorkSheet();

            const currentUnitId = plugin.context.getWorkBook().getUnitId();
            const actionUnitId = worksheet.getContext().getWorkBook().getUnitId();

            if (currentUnitId !== actionUnitId) return;

            // Only the currently active worksheet needs to be refreshed
            if (worksheet.getConfig().status === BooleanNumber.TRUE) {
                try {
                    const canvasView = plugin.getCanvasView();
                    if (canvasView) {
                        canvasView.updateToSheet(worksheet);
                        plugin.getMainComponent().makeDirty(true);
                    }
                } catch (error) {
                    console.info(error);
                }
            }
        });

        this._plugin
            .getContext()
            .getObserverManager()
            .requiredObserver<SheetContainer>('onSheetContainerDidMountObservable', PLUGIN_NAMES.SPREADSHEET)
            .add((component) => {
                this._sheetContainer = component;

                this._sheetContainer.setState({
                    layout: this._defaultLayout,
                    currentLocale: this._plugin.getContext().getLocale().options.currentLocale,
                });
            });
    }

    // 注册常用icon和组件
    private _initRegisterComponent() {
        const component = this._plugin.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        const registerIcon = {
            ForwardIcon: this._render.renderFunction('ForwardIcon'),
            BackIcon: this._render.renderFunction('BackIcon'),
            BoldIcon: this._render.renderFunction('BoldIcon'),
            RightIcon: this._render.renderFunction('RightIcon'),
            ItalicIcon: this._render.renderFunction('ItalicIcon'),
            DeleteLineIcon: this._render.renderFunction('DeleteLineIcon'),
            UnderLineIcon: this._render.renderFunction('UnderLineIcon'),
            TextColorIcon: this._render.renderFunction('TextColorIcon'),
            FillColorIcon: this._render.renderFunction('FillColorIcon'),
            MergeIcon: this._render.renderFunction('MergeIcon'),
            TopBorderIcon: this._render.renderFunction('TopBorderIcon'),
            BottomBorderIcon: this._render.renderFunction('BottomBorderIcon'),
            LeftBorderIcon: this._render.renderFunction('LeftBorderIcon'),
            RightBorderIcon: this._render.renderFunction('RightBorderIcon'),
            NoneBorderIcon: this._render.renderFunction('NoneBorderIcon'),
            FullBorderIcon: this._render.renderFunction('FullBorderIcon'),
            OuterBorderIcon: this._render.renderFunction('OuterBorderIcon'),
            InnerBorderIcon: this._render.renderFunction('InnerBorderIcon'),
            StripingBorderIcon: this._render.renderFunction('StripingBorderIcon'),
            VerticalBorderIcon: this._render.renderFunction('VerticalBorderIcon'),
            LeftAlignIcon: this._render.renderFunction('LeftAlignIcon'),
            CenterAlignIcon: this._render.renderFunction('CenterAlignIcon'),
            RightAlignIcon: this._render.renderFunction('RightAlignIcon'),
            TopVerticalIcon: this._render.renderFunction('TopVerticalIcon'),
            CenterVerticalIcon: this._render.renderFunction('CenterVerticalIcon'),
            BottomVerticalIcon: this._render.renderFunction('BottomVerticalIcon'),
            OverflowIcon: this._render.renderFunction('OverflowIcon'),
            BrIcon: this._render.renderFunction('BrIcon'),
            CutIcon: this._render.renderFunction('CutIcon'),
            TextRotateIcon: this._render.renderFunction('TextRotateIcon'),
            TextRotateAngleUpIcon: this._render.renderFunction('TextRotateAngleUpIcon'),
            TextRotateAngleDownIcon: this._render.renderFunction('TextRotateAngleDownIcon'),
            TextRotateVerticalIcon: this._render.renderFunction('TextRotateVerticalIcon'),
            TextRotateRotationUpIcon: this._render.renderFunction('TextRotateRotationUpIcon'),
            TextRotateRotationDownIcon: this._render.renderFunction('TextRotateRotationDownIcon'),
            SearchIcon: this._render.renderFunction('SearchIcon'),
            ReplaceIcon: this._render.renderFunction('ReplaceIcon'),
            LocationIcon: this._render.renderFunction('LocationIcon'),
        };

        // 注册自定义组件
        for (let k in registerIcon) {
            this._plugin.registerComponent(k, registerIcon[k]);
        }
        this._plugin.registerModal(CellRangeModal.name, CellRangeModal);
    }

    /**
     * Change skin
     * @param {String} lang new skin
     */
    changeSkin = () => {
        // publish
        this._plugin.getContext().getObserverManager().getObserver<Workbook>('onAfterChangeUISkinObservable')?.notifyObservers(this._plugin.getContext().getWorkBook());
    };

    /**
     * Change language
     * @param {String} lang new language
     *
     * e: {target: HTMLSelectElement } reference from  https://stackoverflow.com/a/48443771
     *
     */
    changeLocale = (locale: string) => {
        this._plugin
            .getContext()
            .getLocale()
            .change(locale as LocaleType);

        // publish
        this._plugin.getContext().getContextObserver('onAfterChangeUILocaleObservable')?.notifyObservers();
    };

    getContentRef() {
        return this._sheetContainer.getContentRef();
    }

    getSplitLeftRef() {
        return this._sheetContainer.getSplitLeftRef();
    }

    getLayoutContainerRef() {
        return this._sheetContainer.getLayoutContainerRef();
    }
}

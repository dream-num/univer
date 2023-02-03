import { BaseComponentRender, BaseComponentSheet } from '../BaseComponent';
import { BaseComponentPlugin } from '../BaseComponentPlugin';
import { UniverConfig } from '../Basics';
import { UniverSheetConfig } from '../Basics/Interfaces/UniverSheetConfig';
import { LocaleType } from '../Enum';
import { UI } from '../UI';
import { UniverContainer } from '../UI/UniverContainer';
import { CellEditorController } from './CellEditorController';
import { ToolBarController } from './ToolbarController';

export class UniverContainerController {
    private _plugin: BaseComponentPlugin;

    private _render: BaseComponentRender;

    private _univerContainer: UniverContainer;

    private _toolbarController: ToolBarController;

    private _cellEditorController: CellEditorController;

    private _config: UniverConfig;

    constructor(plugin: BaseComponentPlugin) {
        this._plugin = plugin;

        this._config = this._plugin.getConfig();

        this._initRegisterComponent();

        this._initialize();

        this._toolbarController = new ToolBarController(this._plugin);
        this._cellEditorController = new CellEditorController(this._plugin);

        // 初始化UI
        const config = {
            config: this._config,
            changeSkin: this.changeSkin,
            changeLocale: this.changeLocale,
            getComponent: this.getComponent,
            mountCanvas: this.mountCanvas,
            methods: {
                toolbar: {
                    getComponent: this._toolbarController.getComponent,
                },
                cellEditor: {
                    getComponent: this._cellEditorController.getComponent,
                },
            },
        };
        UI.create(config);
    }

    // 注册常用icon和组件
    private _initRegisterComponent() {
        // TODO： import 组件
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
            BorderDashDot: this._render.renderFunction('BorderDashDot'),
            BorderDashDotDot: this._render.renderFunction('BorderDashDotDot'),
            BorderDashed: this._render.renderFunction('BorderDashed'),
            BorderDotted: this._render.renderFunction('BorderDotted'),
            BorderHair: this._render.renderFunction('BorderHair'),
            BorderMedium: this._render.renderFunction('BorderMedium'),
            BorderMediumDashDot: this._render.renderFunction('BorderMediumDashDot'),
            BorderMediumDashDotDot: this._render.renderFunction('BorderMediumDashDotDot'),
            BorderMediumDashed: this._render.renderFunction('BorderMediumDashed'),
            BorderThick: this._render.renderFunction('BorderThick'),
            BorderThin: this._render.renderFunction('BorderThin'),
        };

        // 注册自定义组件
        for (let k in registerIcon) {
            this._plugin.getComponentManager().register(k, registerIcon[k]);
        }
    }

    private _initialize() {}

    // 获取container组件
    getComponent = (ref: UniverContainer) => {
        this._univerContainer = ref;
    };

    // 挂载canvas
    mountCanvas = (container: HTMLElement) => {
        // const engine = this._plugin.getPluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER)?.getEngine()!;
        // engine.setContainer(container);
        // new CanvasView(engine, this._plugin.getSheetPlugin());
        //     window.addEventListener('resize', () => {
        //         engine.resize();
        //     });
        //     // should be clear
        //     setTimeout(() => {
        //         engine.resize();
        //     }, 0);
    };

    /**
     * Change skin
     * @param {String} lang new skin
     */
    changeSkin = () => {
        // publish
        this._plugin.getObserver('onAfterChangeUISkinObservable')!.notifyObservers();
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
        this._plugin.getObserver('onAfterChangeUILocaleObservable')!.notifyObservers();
    };

    addSheet(config: UniverSheetConfig) {
        this._toolbarController.addToolbarConfig('123', config.toolBarConfig!);
    }

    getContentRef() {
        return this._univerContainer.getContentRef();
    }
}

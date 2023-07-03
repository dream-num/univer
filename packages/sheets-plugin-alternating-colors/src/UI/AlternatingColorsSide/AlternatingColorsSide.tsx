import { closest, Component, createRef } from '@univerjs/base-ui';
import { IKeyValue, IRangeStringData, Nullable, Observer, PluginManager, PLUGIN_NAMES, Tools, Workbook } from '@univerjs/core';
import { SheetPlugin } from '@univerjs/base-sheets';

import { AlternatingColorsPlugin } from '../../AlternatingColorsPlugin';
import { BandingTheme } from '../../BandingTheme';
import { BANDING_THEME_COLOR_LIST, BANDING_THEME_COLOR_MAP } from '../../BANDING_THEME_COLOR';

import { ALTERNATING_COLORS_PLUGIN_NAME } from '../../Const';
import { IBandedRange, IBandingProperties } from '../../IBandedRange';
import styles from './index.module.less';

/**
 * type for props
 */
type IConfig = {
    bandedRange: IBandedRange;
    alternatingColorsPlugin: AlternatingColorsPlugin;
};
type IPanelProps = {
    config: IConfig;
    style?: JSX.CSSProperties;
};

// Types for state
interface IState {
    bandedRange: IBandedRange;
    customStyles: Array<IBandingProperties | string>;
    colorSelect: IBandingProperties;
    currentStyle: ICurrentStyle;
    panelBodyHeight: string | number;
    alternatingColors: IKeyValue;
    rangeStringData: IRangeStringData;
    showHeader: boolean;
    showFooter: boolean;
}

interface ICurrentStyle {
    type?: 'theme' | 'custom';
    index?: number;
}

export class AlternatingColorsSide extends Component<IPanelProps, IState> {
    alternatingColorsPlugin: AlternatingColorsPlugin;

    panelContainerRef = createRef();

    panelBodyRef = createRef();

    private _localeObserver: Nullable<Observer<Workbook>>;

    initialize(props: IPanelProps) {
        const { bandedRange, alternatingColorsPlugin } = props.config;

        this.alternatingColorsPlugin = alternatingColorsPlugin;

        let colorSelect: IBandingProperties;
        let currentStyle: ICurrentStyle = {};
        let customStyles: Array<IBandingProperties | string> = ['add'];

        // get colorSelect from user setting
        const banding = bandedRange.rowProperties;
        if (banding) {
            // string means BandingThemeType
            if (typeof banding.bandingTheme === 'string') {
                colorSelect = BANDING_THEME_COLOR_MAP[banding.bandingTheme];

                currentStyle.type = 'theme';

                // find index in theme color list
                currentStyle.index = BANDING_THEME_COLOR_LIST.findIndex((theme) => banding.bandingTheme === theme);
            }
            // or a object as custom colors
            else {
                colorSelect = banding.bandingTheme;

                // we don't store all custom styles to server, just init colorSelect as customStyles
                customStyles.push(colorSelect);

                // active current custom color
                currentStyle = {
                    type: 'custom',
                    index: 1,
                };
            }
        }
        // init default colorSelect
        else {
            currentStyle = {
                type: 'theme',
                index: 0,
            };

            colorSelect = BANDING_THEME_COLOR_MAP[BandingTheme.GREY];
        }

        this.state = {
            bandedRange,
            customStyles,
            colorSelect,
            currentStyle,
            panelBodyHeight: 0,
            alternatingColors: {},
            rangeStringData: Workbook.rangeDataToRangeStringData(bandedRange.rangeData),
            showHeader: banding.showHeader,
            showFooter: banding.showFooter,
        };

        this.alternatingColorsPlugin.addRowBanding(bandedRange);
    }

    /**
     * init
     */
    componentWillMount() {
        this.setLocale();

        // subscribe Locale change event

        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    /**
     * set scroll height
     */
    componentDidMount() {
        const dom = this.panelContainerRef.current?.base;
        if (dom) {
            const panelHeaderHeight = dom.querySelector(`.${styles.panelHeader}`)?.clientHeight;
            const panelFooterHeight = dom.querySelector(`.${styles.panelFooter}`)?.clientHeight;

            // this.panelBodyRef.current?.styles.height = panelBodyHeight // not working
            if (panelHeaderHeight !== undefined && panelFooterHeight !== undefined) {
                this.setState({
                    panelBodyHeight: `calc(100% - ${panelHeaderHeight + panelFooterHeight}px)`,
                });
            }
        }
    }

    /**
     * destory
     */
    componentWillUnmount() {
        // this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    /**
     * set text by config setting and Locale message
     */
    setLocale() {
        const locale = this._context.getLocale();

        this.setState((prevState: IState) => {
            const alternatingColors: IKeyValue = locale.getObject(ALTERNATING_COLORS_PLUGIN_NAME);
            alternatingColors.button = locale.getObject(`button`);
            return {
                alternatingColors,
            };
        });
    }

    /**
     * close panel
     */
    handleClosePanel() {
        const manage: PluginManager = this._context.getPluginManager();

        manage.getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.showSiderByName(ALTERNATING_COLORS_PLUGIN_NAME, false);
    }

    /**
     * choose a theme
     */
    handleDefaultStyleClick(e: MouseEvent) {
        // get current active item index in item list
        const currentItem = closest(e.target as HTMLElement, `.${styles.themeColorList} .${styles.themeColorItem}`);

        // click item gap
        if (!currentItem) {
            return;
        }

        const dom = this.panelContainerRef.current?.base;
        const nodes = Array.prototype.slice.call(dom.querySelectorAll(`.${styles.themeColorList} .${styles.themeColorItem}`));
        const index = nodes.indexOf(currentItem);

        this.setState((preState: IState) => {
            let { colorSelect, currentStyle } = preState;
            currentStyle = {
                type: 'theme',
                index,
            };

            // update current select
            colorSelect = Tools.deepClone(BANDING_THEME_COLOR_MAP[BANDING_THEME_COLOR_LIST[index]]);

            return {
                colorSelect,
                currentStyle,
            };
        });

        this.setBanding();
    }

    /**
     * choose a custom style
     */
    handleCustomStyleClick(e: MouseEvent) {
        // get current active item index in item list
        const currentItem = closest(e.target as HTMLElement, `.${styles.customColorList} .${styles.themeColorItem}`);

        // add button don't need active
        if (currentItem?.textContent === '+') {
            this.addCustomItem();
            return;
        }
        const dom = this.panelContainerRef.current?.base;
        const nodes = Array.prototype.slice.call(dom.querySelectorAll(`.${styles.customColorList} .${styles.themeColorItem}`));
        const index = nodes.indexOf(currentItem);
        this.setState((preState: IState) => {
            let { customStyles, colorSelect, currentStyle } = preState;
            currentStyle = {
                type: 'custom',
                index,
            };

            // update current select
            colorSelect = customStyles[index] as IBandingProperties;

            return {
                colorSelect,
                currentStyle,
            };
        });

        this.setBanding();
    }

    /**
     * add new custom color item
     */
    addCustomItem(colorBanding?: IBandingProperties) {
        this.setState((preState: IState) => {
            let { customStyles, colorSelect, currentStyle } = preState;

            // click default style,then change color,we need changed color to set custom style
            colorBanding ? customStyles.push(Tools.deepClone(colorBanding)) : customStyles.push(Tools.deepClone(colorSelect));

            // limit max length as 12
            if (customStyles.length === 13) {
                // remove add button
                customStyles.shift();
            }

            // update current item as active
            currentStyle = {
                type: 'custom',
                index: customStyles.length - 1,
            };

            // update current select
            colorSelect = customStyles[customStyles.length - 1] as IBandingProperties;

            return {
                colorSelect,
                currentStyle,
            };
        });

        this.setBanding();
    }

    /**
     * choose custom color
     */
    handleColorSelect(key: string, color: string) {
        let { customStyles, colorSelect, currentStyle } = this.state;

        const changeColor = {};
        changeColor[key] = color;
        colorSelect = Object.assign(colorSelect, changeColor);

        // change color by theme color
        if (currentStyle.type === 'theme') {
            this.addCustomItem(colorSelect);
        } else {
            this.setState({
                colorSelect,
            });
        }

        this.setBanding();
    }

    /**
     * cancel choose custom color
     */
    handleColorCancel() {
        // console.log('handleColorCancel', e, i, a);
    }

    // remove banding
    setBanding() {
        const { currentStyle, colorSelect, bandedRange } = this.state;
        let bandingTheme;
        if (currentStyle.type === 'theme') {
            bandingTheme = BANDING_THEME_COLOR_LIST[`${currentStyle.index}`];
        } else {
            bandingTheme = colorSelect;
        }

        const newBandedRange = Tools.deepMerge(bandedRange, {
            rowProperties: {
                bandingTheme,
            },
        });

        // 1. 每设置一次，就调用一次API

        // 确定时将结果状态保存到bandedRange
        this.alternatingColorsPlugin.getBandingById(bandedRange.bandedRangeId)?.setRowBanding(newBandedRange);
    }

    handleAlternatingColorsCancel() {
        const { bandedRange } = this.state;

        // 取消的话恢复到bandedRange
        this.alternatingColorsPlugin.getBandingById(bandedRange.bandedRangeId)?.setRowBanding(bandedRange);

        this.handleClosePanel();
    }

    handleAlternatingColorsConfirm() {
        this.setBanding();
        this.handleClosePanel();
    }

    /**
     * Render the component's HTML
     *
     * @returns
     */
    render(props: IPanelProps, state: IState) {
        const { customStyles, colorSelect, currentStyle, panelBodyHeight, alternatingColors, rangeStringData, showHeader, showFooter } = state;
        const { style } = props;
        // Set Provider for entire Container
        const SiderModal = this.getComponentRender().renderFunction('SiderModal');
        const Button = this.getComponentRender().renderFunction('Button');
        const CellRangeModal = this.getComponentRender().renderFunction('CellRangeModal');
        const Checkbox = this.getComponentRender().renderFunction('Checkbox');
        const ColorPickerCircleButton = this.getComponentRender().renderFunction('ColorPickerCircleButton');
        const DeleteIcon = this.getComponentRender().renderFunction('DeleteIcon');
        return (
            <SiderModal
                className={styles.alternatingColorsSide}
                title={alternatingColors.alternatingColorsLabel}
                ref={this.panelContainerRef}
                footer={
                    <div className={styles.panelFooter}>
                        <div className={styles.section}>
                            <span className={styles.iconContainer}>
                                <DeleteIcon></DeleteIcon>
                            </span>
                            <span className={styles.textContainer}>{alternatingColors.removeAlternatingColors}</span>
                        </div>
                    </div>
                }
                pluginName={ALTERNATING_COLORS_PLUGIN_NAME}
                style={{ ...style }}
            >
                <div className={styles.panelBody} ref={this.panelBodyRef} style={{ height: panelBodyHeight }}>
                    <div className={styles.panelBodyInner}>
                        {/* <div className={styles.panelBody} ref={this.panelBodyRef} > */}
                        <div className={styles.section}>
                            <h3>{alternatingColors.applyToRange}</h3>
                            <div>
                                <CellRangeModal placeholderProps={alternatingColors.applyToRange} valueProps={rangeStringData}></CellRangeModal>
                            </div>
                        </div>
                        <div className={styles.section}>
                            <h3>{alternatingColors.styles}</h3>
                            <div className={styles.stylesCheckbox}>
                                <Checkbox value={`Header`} checked={showHeader} children={`Header`} onChange={() => this.setState({ showHeader: !showHeader })}></Checkbox>
                                <Checkbox value={`Footer`} checked={showFooter} children={`Footer`} onChange={() => this.setState({ showFooter: !showFooter })}></Checkbox>
                            </div>

                            <h4>{alternatingColors.defaultStyles}</h4>
                            <div className={styles.themeColorList} onClick={this.handleDefaultStyleClick.bind(this)}>
                                {BANDING_THEME_COLOR_LIST.map((theme, index) => {
                                    // theme color list
                                    const colors = BANDING_THEME_COLOR_MAP[theme];
                                    return (
                                        <div
                                            className={
                                                currentStyle.type === 'theme' && currentStyle.index === index
                                                    ? `${styles.themeColorItem} ${styles.themeColorItemActive}`
                                                    : styles.themeColorItem
                                            }
                                        >
                                            <div className={styles.themeColorInnerItem}>
                                                <div style={showHeader ? { background: colors.headerColor } : {}}> — </div>
                                                <div style={{ background: colors.firstBandColor }}> — </div>
                                                <div style={{ background: colors.secondBandColor }}> — </div>
                                                <div style={showFooter ? { background: colors.footerColor } : {}}> — </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <h4>{alternatingColors.customStyles}</h4>
                            <div>
                                <div className={styles.customColorList} onClick={this.handleCustomStyleClick.bind(this)}>
                                    {customStyles.map((colors, index) =>
                                        typeof colors === 'string' ? (
                                            // add custom color button
                                            <div
                                                className={
                                                    currentStyle.type === 'custom' && currentStyle.index === index
                                                        ? `${styles.themeColorItem} ${styles.themeColorItemActive}`
                                                        : styles.themeColorItem
                                                }
                                            >
                                                <div className={styles.themeColorInnerItem}>
                                                    <div className={styles.customStyleAdd}>+</div>
                                                </div>
                                            </div>
                                        ) : (
                                            // custom color list
                                            <div
                                                className={
                                                    currentStyle.type === 'custom' && currentStyle.index === index
                                                        ? `${styles.themeColorItem} ${styles.themeColorItemActive}`
                                                        : styles.themeColorItem
                                                }
                                            >
                                                <div className={styles.themeColorInnerItem}>
                                                    <div style={showHeader ? { background: colors.headerColor } : {}}> — </div>
                                                    <div style={{ background: colors.firstBandColor }}> — </div>
                                                    <div style={{ background: colors.secondBandColor }}> — </div>
                                                    <div style={showFooter ? { background: colors.footerColor } : {}}> — </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className={styles.colorSelect}>
                                    {Object.keys(colorSelect).map((key) => (
                                        <div className={styles.colorSelectItem}>
                                            <span className={styles.colorSelectBanner} style={{ backgroundColor: colorSelect[key] }}>
                                                {alternatingColors[key]}
                                            </span>
                                            <span className={styles.colorSelectButton}>
                                                <ColorPickerCircleButton
                                                    color={colorSelect[key]}
                                                    onClick={this.handleColorSelect.bind(this, key)}
                                                    onCancel={this.handleColorCancel.bind(this)}
                                                    style={{ bottom: '30px', right: '0' }}
                                                />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.section} ${styles.bottomButtons}`}>
                            <Button onClick={this.handleAlternatingColorsCancel.bind(this)}>{alternatingColors.button.cancel}</Button>
                            <Button type="primary" onClick={this.handleAlternatingColorsConfirm.bind(this)}>
                                {alternatingColors.button.confirm}
                            </Button>
                        </div>
                    </div>
                </div>
            </SiderModal>
        );
    }
}

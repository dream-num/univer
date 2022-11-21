import { Component, VNode } from '@univer/base-component';
import { PLUGIN_NAMES } from '@univer/core';
import { SheetPlugin } from '@univer/base-sheets';
import { BorderType } from '../../Enum/BorderType';
import { NormalType } from '../../Enum/NormalType';
import { OVER_GRID_IMAGE_PLUGIN_NAME } from '../../Const/PLUGIN_NAME';

import Style from './ImagePanelUI.module.less';
import { OverGridImagePlugin } from '../../OverGridImagePlugin';

export interface ImagePanelUIProps {
    normal: NormalType;
    fixed: boolean;
    borderStyle: BorderType;
    borderWidth: number;
    borderColor: string;
    borderRadius: number;
}

export class ImagePanelUI extends Component<ImagePanelUIProps> {
    private _width: number;

    private _height: number;

    private _radius: number;

    initialize(props: ImagePanelUIProps) {
        const imagePlugin = this.getContext().getPluginManager().getPluginByName<OverGridImagePlugin>(OVER_GRID_IMAGE_PLUGIN_NAME)!;
        this.state = {};
        imagePlugin.getObserver('onActiveImage')!.add((data) => {
            this._width = data.width;
            this._height = data.height;
            this._radius = data.radius;
        });
    }

    render(): VNode {
        const ColorPickerCircleButton = this.getComponentRender().renderFunction('ColorPickerCircleButton');
        const SiderModal = this.getComponentRender().renderFunction('SiderModal');
        return (
            <SiderModal pluginName={OVER_GRID_IMAGE_PLUGIN_NAME} title={'图片设置'} style={{}}>
                <div className={Style.imagePanelSetting}>
                    {/* 常规 */}
                    <div className={Style.section}>
                        <div className={Style.wrap}>
                            <div className={Style.wrapTitle}> 常规 </div>
                            <div className={Style.wrapPanel}>
                                <div className={Style.wrapItem}>
                                    <input name="type" type="radio" />
                                    <span> 移动图片并调整单元格大小 </span>
                                </div>
                                <div className={Style.wrapItem}>
                                    <input name="type" type="radio" />
                                    <span> 移动图片并不调整单元格大小 </span>
                                </div>
                                <div className={Style.wrapItem}>
                                    <input name="type" type="radio" />
                                    <span> 不移动图片并调整单元格大小 </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 固定 */}
                    <div className={Style.section}>
                        <div className={Style.wrap}>
                            <div className={Style.wrapPanel}>
                                <input type="checkbox" className={Style.verticalMiddle} />
                                <span className={Style.verticalMiddle}>固定位置</span>
                            </div>
                        </div>
                    </div>

                    {/* 边框 */}
                    <div className={Style.section}>
                        <div className={Style.wrap}>
                            <div className={Style.wrapTitle}></div>
                            <div className={Style.wrapPanel}></div>
                        </div>
                    </div>

                    {/* 样式 */}
                    <div className={Style.section}>
                        <div className={Style.wrap}>
                            <div className={Style.wrapTitle}>边框</div>
                            <div className={Style.wrapPanel}>
                                <div className={Style.wrapItem}>
                                    <span className={Style.label}>宽度:</span>
                                    <input type="text" value={this._width} />
                                </div>
                                <div className={Style.wrapItem}>
                                    <span className={Style.label}>半径:</span>
                                    <input type="text" value={this._radius} />
                                </div>
                                <div className={Style.wrapItem}>
                                    <span className={Style.label}>样式:</span>
                                    <select>
                                        <option>实线</option>
                                        <option>虚线</option>
                                        <option>点状</option>
                                        <option>双线</option>
                                    </select>
                                </div>
                                <div className={Style.wrapItem}>
                                    <span className={Style.label}>颜色:</span>
                                    <ColorPickerCircleButton
                                        style={{ width: '152px', display: 'inline-block' }}
                                        color={'#000'}
                                        onCancel={() => {}}
                                        onClick={(color: string) => {}}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SiderModal>
        );
    }

    closed() {
        const plugin: SheetPlugin = this.getPluginByName(PLUGIN_NAMES.SPREADSHEET)!;
        plugin.showSiderByName(OVER_GRID_IMAGE_PLUGIN_NAME, false);
    }

    componentWillMount() {
        console.log('componentWillMount');
    }

    componentWillUnmount() {
        console.log('componentWillUnmount');
    }
}

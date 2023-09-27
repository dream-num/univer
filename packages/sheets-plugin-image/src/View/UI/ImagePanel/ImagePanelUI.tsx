import { ColorPickerCircleButton, SiderModal } from '@univerjs/base-ui';
import { Component } from 'react';

import { BorderType, NormalType, OVER_GRID_IMAGE_PLUGIN_NAME } from '../../../Basics';
import Style from './ImagePanelUI.module.less';

export interface ImagePanelUIProps {
    normal: NormalType;
    fixed: boolean;
    borderStyle: BorderType;
    borderWidth: number;
    borderColor: string;
    borderRadius: number;
}

export class ImagePanelUI extends Component<ImagePanelUIProps> {
    private _width: number = 0;

    private _height: number = 0;

    private _radius: number = 0;

    constructor(props: ImagePanelUIProps) {
        super(props);
        this.initialize(props);
    }

    initialize(props: ImagePanelUIProps) {
        // imagePlugin.getObserver('onActiveImage')!.add((data) => {
        //     this._width = data.width;
        //     this._height = data.height;
        //     this._radius = data.radius;
        // });
    }

    override render() {
        return (
            <SiderModal name={OVER_GRID_IMAGE_PLUGIN_NAME} title={'图片设置'} style={{}}>
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
}

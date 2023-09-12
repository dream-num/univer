// interface IState {
//     presetColors: string[][];
//     defaultColor: string;
//     afterColor: string;
//     rgb: boolean;
//     setting: boolean;
//     styles?: JSX.CSSProperties;
//     currentLocale: string;
//     root: Element | null;
// }
// class ColorPicker extends Component<BaseColorPickerProps & ICustomComponentProps<string>, IState> {
//     ulRef = createRef();
//     constructor(props: BaseColorPickerProps) {
//         super();
//         this.initialize(props);
//     }
//     initialize(props: BaseColorPickerProps) {
//         this.state = {
//             presetColors: allColor,
//             defaultColor: props.color || '#000',
//             afterColor: props.color || '#000',
//             rgb: true,
//             setting: false,
//             styles: {},
//             currentLocale: '',
//             root: null,
//         };
//     }
//     /**
//      * Gets the selected color
//      * @param {string} presetColor new color
//      * @param {boolean} val true:Close color selector
//      */
//     onChange = (presetColor: string) => {
//         this.props.onChange && this.props.onChange(presetColor);
//         this.setState({
//             afterColor: presetColor,
//         });
//     };
//     /**
//      * confirm color
//      *
//      * @eventProperty
//      */
//     onClick = (color: string, e: MouseEvent) => {
//         this.props.onClick?.(color, e);
//         this.props.onValueChange?.(color);
//     };
//     /**
//      * cancel and close
//      *
//      * @eventProperty
//      */
//     onCancel = () => {
//         this.props.onCancel && this.props.onCancel();
//         // this.hideSelect();
//     };
//     hideSelect = (e?: MouseEvent) => {
//         if (e && this.ulRef.current.contains(e.target)) return;
//         this.setState((prevState) => ({ styles: { display: 'none' } }));
//         document.removeEventListener('click', this.hideSelect, true);
//     };
//     showSelect = (root?: Element) => {
//         this.setState((prevState) => ({ styles: { display: 'block' } }));
//         // 点击外部隐藏子组件
//         document.addEventListener('click', this.hideSelect, true);
//     };
//     /**
//      *
//      * @param root Locate according to root
//      * @param ele Element to locate
//      * @returns
//      */
//     getOffset = (root: Element, ele: Element) => {
//         const rootRect = root.getBoundingClientRect();
//         const eleRect = this.ulRef.current.getBoundingClientRect();
//         const w = document.documentElement.clientWidth || document.body.clientWidth;
//         const h = document.documentElement.clientHeight || document.body.clientHeight;
//         let left: number = 0;
//         let top: number = 0;
//         top = rootRect.top + eleRect.height > h ? rootRect.top - eleRect.height : rootRect.top + rootRect.height;
//         left = rootRect.left + eleRect.width > w ? w - eleRect.width : rootRect.left;
//         return { left, top };
//     };
//     /**
//      * Custom switch
//      * @param e
//      */
//     onSwitch = (e: Event) => {
//         e.stopImmediatePropagation();
//         new Promise((resolve, reject) => {
//             this.setState({ setting: !this.state.setting });
//             resolve('end');
//         }).then(() => {
//             if (this.state.root) {
//                 const { top, left } = this.getOffset(this.state.root!, this.ulRef.current);
//                 this.ulRef.current.style.left = `${left}px`;
//                 this.ulRef.current.style.top = `${top}px`;
//             }
//         });
//     };
//     override componentDidMount() {
//         this.props.getComponent?.(this);
//     }
//     render() {
//         const obj = Object.assign(this.state.styles || {}, this.props.style);
//         return (
//             <div className={`${styles.colorPickerOuter} ${this.props.className}`} ref={this.ulRef} style={{ ...obj }}>
//                 <div
//                     className={styles.colorPicker}
//                     onClick={(e: MouseEvent) => {
//                         // e.stopImmediatePropagation();
//                     }}
//                 >
//                     <div className={styles.picker}>
//                         <div className={styles.pickerSwatches}>
//                             {this.state.presetColors.map((presetColor, index) => (
//                                 <div key={index} className={styles.pickerSwatchesItem}>
//                                     {presetColor.map((item) => (
//                                         <span key={item} className={styles.pickerSwatch} style={{ background: item }}>
//                                             <Tooltip title={item} placement="top">
//                                                 <button
//                                                     key={item}
//                                                     className={styles.pickerSwatchBtn}
//                                                     style={{ background: item }}
//                                                     onClick={(e: MouseEvent) => {
//                                                         this.onClick(item, e);
//                                                     }}
//                                                 />
//                                             </Tooltip>
//                                         </span>
//                                     ))}
//                                 </div>
//                             ))}
//                         </div>
//                         <div onClick={(e) => e.stopImmediatePropagation()}>
//                             <Button onClick={this.onSwitch}>
//                                 {this.state.setting ? <CustomLabel label="colorPicker.collapse" /> : <CustomLabel label="colorPicker.customColor" />}
//                             </Button>
//                         </div>
//                     </div>
//                     {this.state.setting ? (
//                         <div className={styles.colorfulWarp}>
//                             <ColorPickerPanel color={this.state.defaultColor} rgb={this.state.rgb} onChange={this.onChange.bind(this)} />
//                             <div>
//                                 <Button
//                                     type="primary"
//                                     onClick={(e: MouseEvent) => {
//                                         this.onClick?.(this.state.afterColor, e);
//                                         // this.hideSelect();
//                                     }}
//                                 >
//                                     <CustomLabel label="colorPicker.confirmColor" />
//                                 </Button>
//                                 <Button
//                                     danger
//                                     onClick={(e: MouseEvent) => {
//                                         this.onCancel();
//                                     }}
//                                 >
//                                     <CustomLabel label="colorPicker.cancelColor" />
//                                 </Button>
//                                 <Button
//                                     onClick={(e: MouseEvent) => {
//                                         e.stopPropagation();
//                                         this.setState({
//                                             rgb: !this.state.rgb,
//                                         });
//                                     }}
//                                 >
//                                     <CustomLabel label="colorPicker.change" />
//                                 </Button>
//                             </div>
//                         </div>
//                     ) : null}
//                 </div>
//             </div>
//         );
//     }
// }
import React, { useEffect, useRef, useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { CustomLabel } from '../CustomLabel';
import { Button, Tooltip } from '../index';
import { ColorPickerPanel } from './ColorPickerPanel';
import styles from './index.module.less';

export interface BaseColorPickerProps extends BaseComponentProps {
    /**
     * init color
     */
    color?: string;

    /**
     * cancel select
     */
    onCancel?: () => void;

    /**
     * Change colors in real time
     */
    onChange?: (color: string, val?: boolean) => void;

    /**
     * style
     */
    style?: React.CSSProperties;

    onClick?: (color: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; // 返回所选颜色
    onValueChange?: (value: string) => void; // 返回所选颜色

    /**
     * class name
     */
    className?: string;

    show?: boolean;
}

const allColor = [
    ['#000', '#444', '#666', '#999', '#ccc', '#eee', '#f3f3f3', '#fff'],
    ['#f00', '#f90', '#ff0', '#0f0', '#0ff', '#00f', '#90f', '#f0f'],
    ['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc'],
    ['#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
    ['#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0'],
    ['#c00', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79'],
    ['#900', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47'],
    ['#600', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130'],
]; // Replace with your actual styles import

export function ColorPicker(props: BaseColorPickerProps) {
    const ulRef = useRef<HTMLDivElement>(null);

    const [presetColors, setPresetColors] = useState(allColor);
    const [defaultColor, setDefaultColor] = useState(props.color || '#000');
    const [afterColor, setAfterColor] = useState(props.color || '#000');
    const [rgb, setRgb] = useState(true);
    const [setting, setSetting] = useState(false);
    const [style, setStyles] = useState({});
    const [currentLocale, setCurrentLocale] = useState('');
    const [root, setRoot] = useState(null);
    const [show, setShow] = useState(props.show || false);

    useEffect(() => {
        setPresetColors(allColor);
        setDefaultColor(props.color || '#000');
        setAfterColor(props.color || '#000');
        setRgb(true);
        setSetting(false);
        setStyles({});
        setCurrentLocale('');
        setRoot(null);
    }, [props.color]);

    useEffect(() => {
        const { show = false } = props;
        setShow(show);

        if (show) {
            document.addEventListener('click', hideSelect, true);
        }
    }, [props.show]);

    const onChange = (presetColor: string) => {
        props.onChange && props.onChange(presetColor);
        setAfterColor(presetColor);
    };

    const onClick = (color: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        props.onClick?.(color, e);
        props.onValueChange?.(color);
    };

    const onCancel = () => {
        props.onCancel && props.onCancel();
    };

    const hideSelect = (e?: MouseEvent) => {
        console.info('hide color picker. If it triggers too frequently, it needs to be corrected');
        if (e && ulRef.current && ulRef.current.contains(e.target as Node)) return;

        setShow(false);

        document.removeEventListener('click', hideSelect, true);
    };

    /**
     * TODO handle ele?
     * @param root
     * @param ele
     * @returns
     */
    const getOffset = (root: Element, ele: HTMLDivElement) => {
        const rootRect = root.getBoundingClientRect();
        const eleRect = ulRef.current?.getBoundingClientRect();

        if (!eleRect) return { left: 0, top: 0 };

        const w = document.documentElement.clientWidth || document.body.clientWidth;
        const h = document.documentElement.clientHeight || document.body.clientHeight;

        let left: number = 0;
        let top: number = 0;

        top = rootRect.top + eleRect.height > h ? rootRect.top - eleRect.height : rootRect.top + rootRect.height;
        left = rootRect.left + eleRect.width > w ? w - eleRect.width : rootRect.left;

        return { left, top };
    };

    const onSwitch = (e: Event) => {
        e.stopImmediatePropagation();

        new Promise((resolve, reject) => {
            setSetting(!setting);
            resolve('end');
        }).then(() => {
            if (root) {
                if (!ulRef.current) return;
                const { top, left } = getOffset(root, ulRef.current);
                ulRef.current.style.left = `${left}px`;
                ulRef.current.style.top = `${top}px`;
            }
        });
    };

    useEffect(() => {
        props.getComponent?.(ulRef.current);
    }, []);

    const obj = Object.assign(style || {}, props.style);

    return (
        <div className={`${styles.colorPickerOuter} ${props.className}`} ref={ulRef} style={{ ...obj, display: show ? 'block' : 'none' }}>
            <div className={styles.colorPicker}>
                <div className={styles.picker}>
                    <div className={styles.pickerSwatches}>
                        {presetColors.map((presetColor, index) => (
                            <div key={index} className={styles.pickerSwatchesItem}>
                                {presetColor.map((item) => (
                                    <span key={item} className={styles.pickerSwatch} style={{ background: item }}>
                                        <Tooltip title={item} placement="top">
                                            <button
                                                key={item}
                                                className={styles.pickerSwatchBtn}
                                                style={{ background: item }}
                                                onClick={(e) => {
                                                    onClick(item, e);
                                                }}
                                            />
                                        </Tooltip>
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div
                        onClick={(e) => {
                            e.nativeEvent.stopImmediatePropagation();
                        }}
                    >
                        <Button onClick={onSwitch}>{setting ? <CustomLabel label="colorPicker.collapse" /> : <CustomLabel label="colorPicker.customColor" />}</Button>
                    </div>
                </div>

                {setting ? (
                    <div className={styles.colorfulWarp}>
                        <ColorPickerPanel color={defaultColor} rgb={rgb} onChange={onChange} />

                        <div>
                            <Button
                                type="primary"
                                onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                    onClick(afterColor, e);
                                }}
                            >
                                <CustomLabel label="colorPicker.confirmColor" />
                            </Button>
                            <Button danger onClick={onCancel}>
                                <CustomLabel label="colorPicker.cancelColor" />
                            </Button>
                            <Button
                                onClick={(e: MouseEvent) => {
                                    e.stopPropagation();
                                    setRgb(!rgb);
                                }}
                            >
                                <CustomLabel label="colorPicker.change" />
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

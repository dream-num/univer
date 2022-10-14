import { BaseColorPickerProps, ColorPickerComponent, Component, createRef, JSXComponent } from '@univer/base-component';
import { Nullable, Observer, Workbook } from '@univer/core';
import { Button, Tooltip } from '../index';
import { ColorPickerPanel } from './ColorPickerPanel';
import styles from './index.module.less';

let allColor = [
    ['#000', '#444', '#666', '#999', '#ccc', '#eee', '#f3f3f3', '#fff'],
    ['#f00', '#f90', '#ff0', '#0f0', '#0ff', '#00f', '#90f', '#f0f'],
    ['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc'],
    ['#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
    ['#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0'],
    ['#c00', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79'],
    ['#900', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47'],
    ['#600', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130'],
];

interface IState {
    presetColors: string[][];
    defaultColor: string;
    afterColor: string;
    rgb: boolean;
    setting: boolean;
    styles?: JSX.CSSProperties;
    currentLocale: string;
    locale: {
        [index: string]: string;
    };
    root: Element | null;
}

class ColorPicker extends Component<BaseColorPickerProps, IState> {
    private _localeObserver: Nullable<Observer<Workbook>>;

    ulRef = createRef();

    initialize(props: BaseColorPickerProps) {
        // super(props);
        this.state = {
            presetColors: allColor,
            defaultColor: props.color || '#000',
            afterColor: props.color || '#000',
            rgb: true,
            setting: false,
            styles: {
                visibility: 'hidden',
            },
            currentLocale: '',
            locale: {},
            root: null,
        };
    }

    componentWillMount() {
        this.setLocale();
        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    componentWillUnmount() {
        this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    setLocale() {
        const locale = this.context.locale;
        const changeLocale = locale.get('colorPicker');

        this.setState({
            locale: changeLocale,
        });
    }

    /**
     * Gets the selected color
     * @param {string} presetColor new color
     * @param {boolean} val true:Close color selector
     */
    onChange = (presetColor: string) => {
        this.props.onChange && this.props.onChange(presetColor);
        this.setState({
            afterColor: presetColor,
        });
    };

    /**
     * confirm color
     *
     * @eventProperty
     */
    onClick = (color: string) => {
        this.props.onClick && this.props.onClick(color);
        this.hideSelect();
    };

    /**
     * cancel and close
     *
     * @eventProperty
     */
    onCancel = () => {
        this.props.onCancel && this.props.onCancel();
        this.hideSelect();
    };

    hideSelect = (e?: MouseEvent) => {
        if (e && this.ulRef.current.contains(e.target)) return;

        this.setState((prevState) => ({ styles: { visibility: 'hidden' } }));

        document.removeEventListener('click', this.hideSelect, true);
    };

    showSelect = (root?: Element) => {
        if (root) {
            const { top, left } = this.getOffset(root, this.ulRef.current);
            this.setState({ root, styles: { left: `${left}px`, top: `${top}px`, visibility: 'visible' } });
        } else {
            this.setState((prevState) => ({ styles: { visibility: 'visible' } }));
        }

        // 点击外部隐藏子组件
        document.addEventListener('click', this.hideSelect, true);
    };

    /**
     *
     * @param root Locate according to root
     * @param ele Element to locate
     * @returns
     */
    getOffset = (root: Element, ele: Element) => {
        const rootRect = root.getBoundingClientRect();
        const eleRect = this.ulRef.current.getBoundingClientRect();
        const w = document.documentElement.clientWidth || document.body.clientWidth;
        const h = document.documentElement.clientHeight || document.body.clientHeight;

        let left: number = 0;
        let top: number = 0;

        top = rootRect.top + eleRect.height > h ? rootRect.top - eleRect.height : rootRect.top + rootRect.height;
        left = rootRect.left + eleRect.width > w ? w - eleRect.width : rootRect.left;

        return { left, top };
    };

    /**
     * Custom switch
     * @param e
     */
    onSwitch = (e: Event) => {
        e.stopImmediatePropagation();

        new Promise((resolve, reject) => {
            this.setState({ setting: !this.state.setting });
            resolve('end');
        }).then(() => {
            if (this.state.root) {
                const { top, left } = this.getOffset(this.state.root!, this.ulRef.current);
                this.ulRef.current.style.left = `${left}px`;
                this.ulRef.current.style.top = `${top}px`;
            }
        });
    };

    render() {
        const obj = Object.assign(this.state.styles || {}, this.props.style);

        return (
            <div className={`${styles.colorPickerOuter} ${this.props.className}`} ref={this.ulRef} style={{ ...obj }}>
                {this.props.slot && this.props.slot.header ? <div className={styles.colorPickerSlot}>{this.props.slot.header.content}</div> : null}
                <div
                    className={styles.colorPicker}
                    onClick={(e: MouseEvent) => {
                        e.stopImmediatePropagation();
                    }}
                >
                    <div className={styles.picker}>
                        <div className={styles.pickerSwatches}>
                            {this.state.presetColors.map((presetColor) => (
                                <div className={styles.pickerSwatchesItem}>
                                    {presetColor.map((item) => (
                                        <span className={styles.pickerSwatch} style={{ background: item }}>
                                            <Tooltip title={item} placement="top">
                                                <button
                                                    key={item}
                                                    className={styles.pickerSwatchBtn}
                                                    style={{ background: item }}
                                                    onClick={(e: MouseEvent) => {
                                                        this.onChange(item);
                                                        this.onClick(item);
                                                    }}
                                                />
                                            </Tooltip>
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div>
                            <Button onClick={this.onSwitch}>{this.state.setting ? this.state.locale.collapse : this.state.locale.customColor}</Button>
                        </div>
                    </div>

                    {this.state.setting ? (
                        <div className={styles.colorfulWarp}>
                            <ColorPickerPanel color={this.state.defaultColor} rgb={this.state.rgb} onChange={this.onChange.bind(this)} />

                            <div>
                                <Button
                                    type="primary"
                                    onClick={(e: MouseEvent) => {
                                        console.info('确定');
                                        this.onClick(this.state.afterColor);
                                    }}
                                >
                                    {this.state.locale.confirmColor}
                                </Button>
                                <Button
                                    danger
                                    onClick={(e: MouseEvent) => {
                                        this.onCancel();
                                    }}
                                >
                                    {this.state.locale.cancelColor}
                                </Button>
                                <Button
                                    onClick={(e: MouseEvent) => {
                                        this.setState({
                                            rgb: !this.state.rgb,
                                        });
                                    }}
                                >
                                    {this.state.locale.change}
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>
                {/* {this.props.slot && this.props.slot.header ? <div className={styles.colorPickerSlot}>{this.props.slot.header.label}</div> : null} */}
                {/* {this.props.solt && this.props.solt.footer ? <div className={styles.colorPickSolt}>{this.props.solt.footer}</div> : null} */}
            </div>
        );
    }
}

export class UniverColorPicker implements ColorPickerComponent {
    render(): JSXComponent<BaseColorPickerProps> {
        return ColorPicker;
    }
}

export { ColorPicker };

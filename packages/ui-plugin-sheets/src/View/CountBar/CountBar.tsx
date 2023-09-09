import { BaseCountBarProps, Button, CountBarComponent, Icon, JSXComponent, Slider, AppContext } from '@univerjs/base-ui';
import { Component, createRef } from 'react';
import { ObserverManager, PLUGIN_NAMES } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import styles from './index.module.less';

interface CountState {
    zoom: number;
    content: string;
}

interface CountBarProps extends BaseCountBarProps {
    onChange?: (value: string) => void;
}

export class CountBar extends Component<CountBarProps, CountState> {
    static override contextType = AppContext;

    max = 400;

    min = 0;

    ref = createRef();

    constructor(props: CountBarProps) {
        super(props);
        this.initialize(props);
    }

    initialize(props: CountBarProps) {
        this.state = {
            zoom: 100,
            content: '',
        };
    }

    setValue = (value: object, fn?: () => void) => {
        this.setState(
            (prevState) => ({
                ...value,
            }),
            fn
        );
    };

    setZoom(zoom: number): void {
        if (zoom !== this.state.zoom) {
            this.setValue({
                zoom,
            });
            this.ref.current.changeInputValue(0, zoom);
        }
    }

    onChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (this.props.onChange) {
            this.props.onChange(target.value);
        }
        this.setValue({ zoom: target.value });
        this.ref.current.changeInputValue(0, target.value);
    };

    handleClick = (e: Event, value: number | string) => {
        this.setValue({ zoom: value });
    };

    addZoom = () => {
        const number = Math.floor(this.state.zoom / 10);
        let value = (number + 1) * 10;
        if (value >= this.max) value = this.max;
        this.setValue({ zoom: value });
        if (this.props.onChange) {
            this.props.onChange(String(value));
        }
    };

    reduceZoom = () => {
        const number = Math.ceil(this.state.zoom / 10);
        let value = (number - 1) * 10;
        if (value <= this.min) value = this.min;
        this.setValue({ zoom: value });
        if (this.props.onChange) {
            this.props.onChange(String(value));
        }
        this.ref.current.changeInputValue(0, value);
    };

    override componentDidMount() {
        (this.context.injector as Injector).get(ObserverManager).getObserver<CountBar>('onCountBarDidMountObservable', PLUGIN_NAMES.SPREADSHEET)?.notifyObservers(this);
    }

    render() {
        const { zoom, content } = this.state;
        // const PageIcon = this.getComponentRender().renderFunction('PageIcon');
        // const LayoutIcon = this.getComponentRender().renderFunction('LayoutIcon');
        return (
            <div className={styles.countBar}>
                <Button type="text" className={styles.countZoom}>
                    {zoom}
                </Button>
                <Button type="text" onClick={this.addZoom}>
                    <Icon.Math.AddIcon />
                </Button>
                <div className={styles.countSlider}>
                    <Slider ref={this.ref} onChange={this.onChange} value={zoom} min={this.min} max={this.max} onClick={this.handleClick} />
                </div>
                <Button type="text" onClick={this.reduceZoom}>
                    <Icon.Math.ReduceIcon />
                </Button>
                {/* <Button type="text">
                    <PageIcon />
                </Button> */}
                {/* <Button type="text">
                    <LayoutIcon />
                </Button> */}
                <Button type="text">
                    <Icon.Sheet.RegularIcon />
                </Button>
                <span className={styles.countStatistic}>{content}</span>
            </div>
        );
    }
}

export class UniverCountBar implements CountBarComponent {
    render(): JSXComponent<BaseCountBarProps> {
        return CountBar;
    }
}

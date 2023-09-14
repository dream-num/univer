import { AppContext, BaseComponentProps, Button, Icon, Slider } from '@univerjs/base-ui';
import { Component, createRef } from 'react';

import styles from './index.module.less';

export interface BaseCountBarProps extends BaseComponentProps {
    changeRatio: (ratio: string) => void;
}

interface CountState {
    zoom: number;
    content: string;
}

interface CountBarProps extends BaseComponentProps {
    changeRatio: (ratio: string) => void;
    onChange?: (value: string) => void;
}

export class CountBar extends Component<CountBarProps, CountState> {
    static override contextType = AppContext;

    max = 100;

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
        }
    }

    onChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (this.props.onChange) {
            this.props.onChange(target.value);
        }
        this.setValue({ zoom: target.value });
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
    };

    override render() {
        const { zoom, content } = this.state;
        // const PageIcon = this.getComponentRender().renderFunction('PageIcon');
        // const LayoutIcon = this.getComponentRender().renderFunction('LayoutIcon');
        return (
            <div className={styles.countBar}>
                <Button className={styles.countZoom}>{zoom}</Button>
                <Button onClick={this.addZoom}>
                    <Icon.Math.AddIcon />
                </Button>
                <div className={styles.countSlider}>
                    <Slider onChange={this.onChange} value={[20, 50]} min={this.min} max={this.max} range onClick={this.handleClick} />
                </div>
                <Button onClick={this.reduceZoom}>
                    <Icon.Math.ReduceIcon />
                </Button>
                {/* <Button type="text">
                    <PageIcon />
                </Button> */}
                {/* <Button type="text">
                    <LayoutIcon />
                </Button> */}
                <Button>
                    <Icon.Sheet.RegularIcon />
                </Button>
                <span className={styles.countStatistic}>{content}</span>
            </div>
        );
    }
}

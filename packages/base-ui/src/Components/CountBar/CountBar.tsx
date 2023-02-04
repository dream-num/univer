import { BaseCountBarProps, Component, CountBarComponent, createRef, JSXComponent } from '@univerjs/base-component';
import * as Icon from '../Icon';
import { Button, Slider } from '../index';
import styles from './index.module.less';

// type CountProps = {};
type CountState = {
    zoom: number;
    content: string;
};

export class CountBar extends Component<BaseCountBarProps, CountState> {
    max = 400;

    min = 0;

    ref = createRef();

    initialize(props: BaseCountBarProps) {
        this.state = {
            zoom: 100,
            content: '计数0',
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

    onChange = (e: Event) => {
        let target = e.target as HTMLInputElement;
        this.setValue({ zoom: target.value });
    };

    handleClick = (e: Event, value: number | string) => {
        this.setValue({ zoom: value });
    };

    addZoom = () => {
        let number = Math.floor(this.state.zoom / 10);
        let value = (number + 1) * 10;
        if (value >= this.max) value = this.max;
        this.setValue({ zoom: value });
        this.ref.current.changeInputValue(0, value);
    };

    reduceZoom = () => {
        let number = Math.ceil(this.state.zoom / 10);
        let value = (number - 1) * 10;
        if (value <= this.min) value = this.min;
        this.setValue({ zoom: value });
        this.ref.current.changeInputValue(0, value);
    };

    render(props: BaseCountBarProps, state: CountState) {
        const { zoom, content } = state;
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
                <Button type="text">
                    <Icon.Sheet.PageIcon />
                </Button>
                <Button type="text">
                    <Icon.Sheet.LayoutIcon />
                </Button>
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

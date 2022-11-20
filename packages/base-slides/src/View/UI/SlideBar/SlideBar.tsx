import { BaseComponentRender, BaseComponentSheet, Component, createRef } from '@univer/base-component';
import { PLUGIN_NAMES } from '@univer/core';
import styles from './index.module.less';

interface SlideBarState {
    slideList: any[];
}

interface IProps {
    addSlide: () => void;
}

export class SlideBar extends Component<IProps, SlideBarState> {
    private _render: BaseComponentRender;

    slideBarRef = createRef();

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        this.state = {
            slideList: [],
        };
    }

    componentDidMount() {
        this._context.getObserverManager().getObserver<SlideBar>('onSlideBarDidMountObservable', PLUGIN_NAMES.SLIDE)?.notifyObservers(this);
    }

    setSlide(slideList: any[]) {
        this.setState(
            {
                slideList,
            },
            () => {
                this.handleClick(0);
            }
        );
    }

    handleClick(index: number) {
        const item = this.slideBarRef.current.querySelectorAll(`.${styles.slideBarItem}`);
        for (let i = 0; i < item.length; i++) {
            item[i].classList.remove(styles.slideBarItemActive);
        }
        item[index].classList.add(styles.slideBarItemActive);
    }

    render() {
        const Button = this._render.renderFunction('Button');
        const { addSlide } = this.props;
        const { slideList } = this.state;

        return (
            <div className={styles.slideBar} ref={this.slideBarRef}>
                <div className={styles.slideBarContent}>
                    {slideList.map((item, index) => {
                        return (
                            <div className={styles.slideBarItem} onClick={() => this.handleClick(index)}>
                                <span>{index + 1}</span>
                                <div className={styles.slideBarBox}></div>
                            </div>
                        );
                    })}
                </div>
                <div className={styles.slideAddButton}>
                    <Button type="text" onClick={addSlide}>
                        +
                    </Button>
                </div>
            </div>
        );
    }
}

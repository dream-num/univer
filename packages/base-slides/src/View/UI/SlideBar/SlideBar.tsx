import { BaseComponentRender, BaseComponentSheet, Component, createRef } from '@univerjs/base-ui';
import { PLUGIN_NAMES, ISlidePage } from '@univerjs/core';
import styles from './index.module.less';

interface SlideBarState {
    slideList: ISlidePage[];
    activePageId?: string;
}

interface IProps {
    addSlide: () => void;
}

export class SlideBar extends Component<IProps, SlideBarState> {
    private _render: BaseComponentRender;

    slideBarRef = createRef<HTMLDivElement>();

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

    isActive(pageId: string, index: number = 0) {
        if (this.state.activePageId == null && index == 0) {
            return styles.slideBarItemActive;
        } else if (this.state.activePageId === pageId) {
            return styles.slideBarItemActive;
        }
        return '';
    }

    setSlide(slideList: ISlidePage[]) {
        this.setState({
            slideList,
        });
    }

    handleClick(pageId: string, index: number) {
        // const item = this.slideBarRef.current?.querySelectorAll(`.${styles.slideBarItem}`);
        // if (item == null) {
        //     return;
        // }
        // for (let i = 0; i < item.length; i++) {
        //     item[i].classList.remove(styles.slideBarItemActive);
        // }
        // item[index].classList.add(styles.slideBarItemActive);

        if (this.state.activePageId === pageId) {
            return;
        }

        this.setState({
            activePageId: pageId,
        });

        this._context.getObserverManager().getObserver<string>('onSlideBarMousedownObservable', PLUGIN_NAMES.SLIDE)?.notifyObservers(pageId);
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
                            <div className={`${styles.slideBarItem} ${this.isActive(item.id, index)}`} onClick={() => this.handleClick(item.id, index)}>
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

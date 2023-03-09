import { AppContext, AppContextValues, BaseComponentProps, Button, Component, createRef, PreactContext } from '@univerjs/base-ui';
import { ISlidePage } from '@univerjs/core';
import styles from './index.module.less';

interface SlideBarState {
    slideList: ISlidePage[];
    activePageId?: string;
}

interface IProps extends BaseComponentProps {
    addSlide: () => void;
    activeSlide: (pageId: string) => void;
}

export class SlideBar extends Component<IProps, SlideBarState> {
    static contextType: PreactContext<Partial<AppContextValues>> = AppContext;

    slideBarRef = createRef<HTMLDivElement>();

    initialize() {
        this.state = {
            slideList: [],
        };
    }

    componentDidMount() {
        this.props.getComponent?.(this);
    }

    isActive(pageId: string, index: number = 0) {
        if (this.state.activePageId == null && index === 0) {
            return styles.slideBarItemActive;
        }
        if (this.state.activePageId === pageId) {
            return styles.slideBarItemActive;
        }
        return '';
    }

    setSlide(slideList: ISlidePage[], cb?: () => void) {
        this.setState(
            {
                slideList,
            },
            cb
        );
    }

    activeSlide(pageId: string, index: number) {
        if (this.state.activePageId === pageId) {
            return;
        }

        this.setState({
            activePageId: pageId,
        });

        this.props.activeSlide(pageId);
    }

    render() {
        const { addSlide } = this.props;
        const { slideList } = this.state;

        return (
            <div className={styles.slideBar} ref={this.slideBarRef}>
                <div className={styles.slideBarContent}>
                    {slideList.map((item, index) => (
                        <div className={`${styles.slideBarItem} ${this.isActive(item.id, index)}`} onClick={() => this.activeSlide(item.id, index)}>
                            <span>{index + 1}</span>
                            <div className={styles.slideBarBox}></div>
                        </div>
                    ))}
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

import { Component } from '@univer/base-component';
import { Nullable, Observer, Workbook1 } from '@univer/core';

import styles from './index.module.less';

type IconContentProps = {
    config?: any;
};
type IconContentState = {
    iconOption: LabelProps[];
    title: Record<string, string>;
};
type LabelProps = {
    title: Record<string, string>;
    children: iconProps[];
};
type iconProps = {
    style: string;
    title: Record<string, string>;
    subtitle?: Record<string, string>;
};

export class IconContent extends Component<IconContentProps, IconContentState> {
    private _localeObserver: Nullable<Observer<Workbook1>>;

    initialize() {
        this.state = {
            title: {
                name: 'conditionalformat.pleaseSelectIcon',
            },
            iconOption: [
                {
                    title: {
                        name: 'conditionalformat.direction',
                    },
                    children: [
                        {
                            style: '0 0',
                            title: {
                                name: 'threeWayArrow',
                            },
                            subtitle: {
                                name: 'multicolor',
                            },
                        },
                        {
                            style: '-131px 0',
                            title: {
                                name: 'threeWayArrow',
                            },
                            subtitle: {
                                name: 'grayColor',
                            },
                        },
                        {
                            style: '0 -20px',
                            title: {
                                name: 'threeTriangles',
                            },
                        },
                        {
                            style: '-131px -20px',
                            title: {
                                name: 'fourWayArrow',
                            },
                            subtitle: {
                                name: 'grayColor',
                            },
                        },
                        {
                            style: '0 -40px',
                            title: {
                                name: 'fourWayArrow',
                            },
                            subtitle: {
                                name: 'multicolor',
                            },
                        },
                        {
                            style: '-131px -40px',
                            title: {
                                name: 'fiveWayArrow',
                            },
                            subtitle: {
                                name: 'grayColor',
                            },
                        },
                        {
                            style: '0 -60px',
                            title: {
                                name: 'fiveWayArrow',
                            },
                            subtitle: {
                                name: 'multicolor',
                            },
                        },
                    ],
                },
                {
                    title: {
                        name: 'conditionalformat.shape',
                    },
                    children: [
                        {
                            style: '0 -80px',
                            title: {
                                name: 'threeColorTrafficLight',
                            },
                            subtitle: {
                                name: 'rimless',
                            },
                        },
                        {
                            style: '-131px -80px',
                            title: {
                                name: 'threeColorTrafficLight',
                            },
                            subtitle: {
                                name: 'bordered',
                            },
                        },
                        {
                            style: '0 -100px',
                            title: {
                                name: 'threeSigns',
                            },
                        },
                        {
                            style: '-131px -100px',
                            title: {
                                name: 'fourColorTrafficLight',
                            },
                        },
                        {
                            style: '0 -120px',
                            title: {
                                name: 'greenRedBlackGradient',
                            },
                        },
                    ],
                },
                {
                    title: {
                        name: 'conditionalformat.mark',
                    },
                    children: [
                        {
                            style: '0 -140px',
                            title: {
                                name: 'threeSymbols',
                            },
                            subtitle: {
                                name: 'circled',
                            },
                        },
                        {
                            style: '-131px -140px',
                            title: {
                                name: 'threeSymbols',
                            },
                            subtitle: {
                                name: 'noCircle',
                            },
                        },
                        {
                            style: '0 -160px',
                            title: {
                                name: 'tricolorFlag',
                            },
                        },
                    ],
                },
                {
                    title: {
                        name: 'conditionalformat.grade',
                    },
                    children: [
                        {
                            style: '0 -180px',
                            title: {
                                name: 'threeStars',
                            },
                        },
                        {
                            style: '-131px -180px',
                            title: {
                                name: 'grade4',
                            },
                        },
                        {
                            style: '0 -200px',
                            title: {
                                name: 'fiveQuadrantDiagram',
                            },
                        },
                        {
                            style: '-131px -200px',
                            title: {
                                name: 'grade5',
                            },
                        },
                        {
                            style: '0 -220px',
                            title: {
                                name: 'fiveBoxes',
                            },
                        },
                    ],
                },
            ],
        };
    }

    setLocale() {
        const locale = this._context.getLocale();

        this.setState((prevState) => {
            let { title, iconOption } = prevState;
            title.label = locale.get(title.name);

            iconOption.forEach((item) => {
                item.title.label = locale.get(item.title.name);
                item.children.forEach((ele) => {
                    let subtitle = '';
                    if (ele.subtitle) {
                        subtitle = locale.get(ele.subtitle.name);
                        ele.title.label = `${locale.get(ele.title.name)}(${subtitle})`;
                    } else {
                        ele.title.label = locale.get(ele.title.name);
                    }
                });
            });

            return { title, iconOption };
        });
    }

    componentWillMount() {
        this.setLocale();

        // subscribe Locale change event
        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<Workbook1>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    componentWillUnmount() {
        this._context.getObserverManager().getObserver<Workbook1>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    setValue = (value: object, fn?: () => void) => {
        this.setState(
            (prevState) => ({
                ...value,
            }),
            fn
        );
    };

    render(props: IconContentProps, state: IconContentState) {
        const { iconOption, title } = state;
        return (
            <div className={styles.iconsContent}>
                <p>{title.label}</p>
                {iconOption.map((item) => (
                    <div>
                        <div className={styles.iconTitle}>{item.title!.label}</div>
                        <div className={styles.iconList}>
                            {item.children.map((ele) => (
                                <div className={styles.iconItem}>
                                    <div title={ele.title.label}>
                                        <div style={{ backgroundPosition: ele.style }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}

import { Nullable, Observer } from '@univerjs/core';
import { ISelectButton, Component, Icon } from '@univerjs/base-ui';
import { ComponentChild, RenderableProps } from 'preact';

interface IProps {}

export class GroupButton extends Component<IProps> {
    private _localeObserver: Nullable<Observer<void>>;

    initialize(props: IProps) {
        const group = {
            locale: 'group',
            type: 'select',
            label: <Icon.Data.OrderASCIcon />,
            icon: <Icon.NextIcon />,
            show: true,
            border: false,
            selectType: ISelectButton.DOUBLE,
            needChange: false,
            children: [
                {
                    locale: 'group.one',
                    icon: <Icon.Data.OrderASCIcon />,
                },
                {
                    locale: 'group.two',
                    icon: <Icon.Data.OrderDESCIcon />,
                },
                {
                    locale: 'group.three',
                    icon: <Icon.Data.OrderIcon />,
                },
            ],
        };

        this.state = {
            group,
        };
    }

    /**
     * init
     */
    componentWillMount() {
        this.setLocale();

        // subscribe Locale change event

        this._localeObserver = this.getContext()
            .getObserverManager()
            .getObserver('onAfterChangeUILocaleObservable', 'core')
            ?.add(() => {
                this.setLocale();
            });
    }

    /**
     * destory
     */
    componentWillUnmount() {
        // this._context.getObserverManager().getObserver('onAfterChangeUILocaleObservable','core')?.remove(this._localeObserver);
    }

    /**
     * set text by config setting and Locale message
     */
    setLocale() {
        // const locale = this.getContext().getLocale();
        // this.setState((prevState: IState) => {
        //     let item = prevState.group;
        //     // set current Locale string for tooltip
        //     item.tooltip = locale.get(`${item.locale}Label`);
        //     item.tooltipRight = locale.get(`${item.locale}RightLabel`);
        //
        //     // set current Locale string for select
        //     item.children?.forEach((ele) => {
        //         if (ele.locale) {
        //             ele.label = locale.get(`${ele.locale}`);
        //         }
        //     });
        //     item.label = typeof item.label === 'object' ? item.label : item.children![0].label;
        //
        //     return {
        //         group: item,
        //     };
        // });
    }

    render(props: RenderableProps<IProps> | undefined, state: Readonly<{}> | undefined, context: any): ComponentChild {
        return undefined;
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    // render(props: IProps, state: IState) {
    //     const { group } = state;
    //     // Set Provider for entire Container
    //     return (
    //         <Select
    //             tooltip={group.tooltip}
    //             tooltipRight={group.tooltipRight}
    //             border={group.border}
    //             needChange={group.needChange}
    //             key={group.locale}
    //             children={group.children as BaseSelectProps[]}
    //             label={group.label}
    //             icon={group.icon}
    //         />
    //     );
    // }
}

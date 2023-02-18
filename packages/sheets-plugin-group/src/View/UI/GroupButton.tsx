import { Nullable, Observer } from '@univerjs/core';
import { ISelectButton, IToolbarItemProps, Component, BaseSelectProps } from '@univerjs/base-ui';

interface IProps {}
// Types for state
interface IState {
    group: IToolbarItemProps;
}

export class GroupButton extends Component<IProps, IState> {
    private _localeObserver: Nullable<Observer<void>>;
    initialize(props: IProps) {
        const OrderASCIcon = this.getComponentRender().renderFunction('OrderASCIcon');
        const OrderDESCIcon = this.getComponentRender().renderFunction('OrderDESCIcon');
        const OrderIcon = this.getComponentRender().renderFunction('OrderIcon');
        const NextIcon = this.getComponentRender().renderFunction('NextIcon');

        const group: IToolbarItemProps = {
            locale: 'group',
            type: 'select',
            label: <OrderASCIcon />,
            icon: <NextIcon />,
            show: true,
            border: false,
            selectType: ISelectButton.DOUBLE,
            needChange: false,
            children: [
                {
                    locale: 'group.one',
                    icon: <OrderASCIcon />,
                },
                {
                    locale: 'group.two',
                    icon: <OrderDESCIcon />,
                },
                {
                    locale: 'group.three',
                    icon: <OrderIcon />,
                },
            ],
        };

        this.state = {
            group: group,
        };
    }

    /**
     * init
     */
    componentWillMount() {
        this.setLocale();

        // subscribe Locale change event

        this._localeObserver = this._context
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
        const locale = this._context.getLocale();
        this.setState((prevState: IState) => {
            let item = prevState.group;
            // set current Locale string for tooltip
            item.tooltip = locale.get(`${item.locale}Label`);
            item.tooltipRight = locale.get(`${item.locale}RightLabel`);

            // set current Locale string for select
            item.children?.forEach((ele: IToolbarItemProps) => {
                if (ele.locale) {
                    ele.label = locale.get(`${ele.locale}`);
                }
            });
            item.label = typeof item.label == 'object' ? item.label : item.children![0].label;

            return {
                group: item,
            };
        });
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render(props: IProps, state: IState) {
        const { group } = state;
        const Select = this.getComponentRender().renderFunction('Select');
        // Set Provider for entire Container
        return (
            <Select
                tooltip={group.tooltip}
                tooltipRight={group.tooltipRight}
                border={group.border}
                needChange={group.needChange}
                key={group.locale}
                children={group.children as BaseSelectProps[]}
                label={group.label}
                icon={group.icon}
            />
        );
    }
}

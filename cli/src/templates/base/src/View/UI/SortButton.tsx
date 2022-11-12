import { Nullable, Observer  } from '@univer/core';
import { ISelectButton, IToolBarItemProps, Component, BaseSelectProps } from '@univer/base-component';

interface IProps {}
// Types for state
interface IState {
    <%= projectValue %>: IToolBarItemProps;
}

export class <%= projectUpperValue %>Button extends Component<IProps, IState> {
    
    private _localeObserver: Nullable<Observer<void>>;
    initialize(props: IProps) {

        const OrderASCIcon = this.getComponentRender().renderFunction('OrderASCIcon');
        const OrderDESCIcon = this.getComponentRender().renderFunction('OrderDESCIcon');
        const OrderIcon = this.getComponentRender().renderFunction('OrderIcon');
        const NextIcon = this.getComponentRender().renderFunction('NextIcon');

        const <%= projectValue %>: IToolBarItemProps = {
            locale: '<%= projectValue %>',
            type: 'select',
            label: <OrderASCIcon />,
            icon: <NextIcon />,
            show: true,
            border: false,
            selectType: ISelectButton.DOUBLE,
            needChange: false,
            children: [
                {
                    locale: '<%= projectValue %>.one',
                    icon: <OrderASCIcon />,
                },
                {
                    locale: '<%= projectValue %>.two',
                    icon: <OrderDESCIcon />,
                },
                {
                    locale: '<%= projectValue %>.three',
                    icon: <OrderIcon />,
                },
            ],
        };

        this.state = {
            <%= projectValue %>: <%= projectValue %>,
        };
    }

    /**
     * init
     */
    componentWillMount() {
        this.setLocale();

        // subscribe Locale change event

        this._localeObserver = this._context.getObserverManager().getObserver('onAfterChangeUILocaleObservable','core')?.add(() => {
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
            let item = prevState.<%= projectValue %>;
            // set current Locale string for tooltip
            item.tooltip = locale.get(`${item.locale}Label`);
            item.tooltipRight = locale.get(`${item.locale}RightLabel`);

            // set current Locale string for select
            item.children?.forEach((ele: IToolBarItemProps) => {
                if (ele.locale) {
                    ele.label = locale.get(`${ele.locale}`);
                }
            });
            item.label = typeof item.label == 'object' ? item.label : item.children![0].label;

            return {
                <%= projectValue %>: item,
            };
        });
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render(props: IProps, state: IState) {
        const { <%= projectValue %> } = state;
        const Select = this.getComponentRender().renderFunction('Select');
        // Set Provider for entire Container
        return <Select tooltip={<%= projectValue %>.tooltip} tooltipRight={<%= projectValue %>.tooltipRight} border={<%= projectValue %>.border} needChange={<%= projectValue %>.needChange} key={<%= projectValue %>.locale} children={<%= projectValue %>.children as BaseSelectProps[]} label={<%= projectValue %>.label} icon={<%= projectValue %>.icon} />;
    }
}

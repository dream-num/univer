import { BaseSelectProps, Icon, Select } from '@univerjs/base-ui';
import { Component } from 'preact';
import { Nullable, Observer, Workbook } from '@univerjs/core';
import { IProps } from '../IData';
import { FilterPlugin } from '../FilterPlugin';

interface IState {
    filter: IToolbarItemProps;
    isFilter: boolean;
    filterPlugin: FilterPlugin | null;
}

export class FilterButton extends Component<IProps, IState> {
    protected _localeObserver: Nullable<Observer<Workbook>>;

    constructor(props: IProps) {
        super(props);
        this.initialize(props);
    }

    initialize(props: IProps) {
        this.state = {
            filter: {
                locale: 'filter',
                type: 'select',
                label: <Icon.Data.FilterRankIcon />,
                icon: <Icon.NextIcon />,
                show: true,
                children: [
                    {
                        locale: 'filter.filter',
                        icon: <Icon.Data.FilterIcon />,
                        onClick: () => {},
                    },
                    {
                        locale: 'filter.clearFilter',
                        icon: <Icon.Data.CleanIcon />,
                        onClick: () => {},
                    },
                ],
            },
            filterPlugin: null,
            isFilter: false,
        };
    }

    override componentDidMount() {
        this.props.getComponent?.(this);
    }

    /**
     * init
     */
    override componentWillMount() {
        this.setLocale();

        // subscribe Locale change event
        this._localeObserver = this.context.observerManager.requiredObserver('onAfterChangeUILocaleObservable', 'core')?.add(() => {
            this.setLocale();
        });
    }

    /**
     * destory
     */
    override componentWillUnmount() {
        this.context.observerManager.requiredObserver('onAfterChangeUILocaleObservable', 'core')?.remove(this._localeObserver);
    }

    /**
     * set text by config setting and Locale message
     */
    setLocale() {
        const locale = this.context.localeService.getLocale();
        this.setState((prevState: IState) => {
            const item = prevState.filter;
            // set current Locale string for tooltip
            item.tooltip = locale.get(`${item.locale}Label`);

            // set current Locale string for select
            item.children?.forEach((ele: IToolbarItemProps) => {
                if (ele.locale) {
                    ele.label = locale.get(`${ele.locale}`);
                }
            });
            item.label = typeof item.label === 'object' ? item.label : item.children![0].label;

            return {
                filter: item,
            };
        });
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render(props: IProps, state: IState) {
        const { filter } = state;
        return <Select tooltip={filter.tooltip} key={filter.locale} children={filter.children as BaseSelectProps[]} label={filter.label} icon={filter.icon} />;
    }
}

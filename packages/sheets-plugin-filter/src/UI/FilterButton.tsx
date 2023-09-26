import {
    AppContext,
    IMenuSelectorItem,
    IValueOption,
    MenuItemType,
    MenuPosition,
    Select,
    SelectTypes,
} from '@univerjs/base-ui';
import { Nullable, Observer, Workbook } from '@univerjs/core';
import { Component } from 'react';

import { FilterPlugin } from '../FilterPlugin';
import { IProps } from '../IData';

interface IState {
    filter: IMenuSelectorItem<unknown>;
    isFilter: boolean;
    filterPlugin: FilterPlugin | null;
}

export class FilterButton extends Component<IProps, IState> {
    static override contextType = AppContext;

    protected _localeObserver: Nullable<Observer<Workbook>>;

    constructor(props: IProps) {
        super(props);
        this.initialize(props);
    }

    initialize(props: IProps) {
        this.state = {
            filter: {
                id: 'filter',
                title: 'filter',
                type: MenuItemType.SELECTOR,
                selectType: SelectTypes.NEO,
                positions: [MenuPosition.TOOLBAR],
                icon: 'FilterRankIcon',
                selections: [
                    {
                        label: 'filter.filter',
                        value: 'filter',
                        // icon: 'FilterIcon',
                    },
                    {
                        label: 'filter.clearFilter',
                        value: 'clearFilter',
                        // icon: 'CleanIcon',
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
    override UNSAFE_componentWillMount() {
        this.setLocale();

        // subscribe Locale change event
        const observerManager = (this.context as any).injector!.get('observerManager');
        this._localeObserver = observerManager.requiredObserver('onAfterChangeUILocaleObservable', 'core')?.add(() => {
            this.setLocale();
        });
    }

    /**
     * destory
     */
    override componentWillUnmount() {
        const observerManager = (this.context as any).injector!.get('observerManager');
        observerManager.requiredObserver('onAfterChangeUILocaleObservable', 'core')?.remove(this._localeObserver);
    }

    /**
     * set text by config setting and Locale message
     */
    setLocale() {
        const locale = (this.context as any).injector!.get('localeService');
        // const locale = this.context.localeService.getLocale();
        this.setState((prevState: IState) => {
            const item = prevState.filter;
            // set current Locale string for tooltip
            item.tooltip = locale.get(`${item.title}Label`);

            // set current Locale string for select
            (item.selections as IValueOption[])?.forEach((ele) => {
                if (ele.label) {
                    ele.label = locale.get(`${ele.label}`);
                }
            });
            item.label = typeof item.label === 'object' ? item.label : (item.selections![0] as IValueOption).label;

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
    override render() {
        const { filter } = this.state;
        return <Select tooltip={filter.tooltip} children={filter.selections as IValueOption[]} icon={filter.icon} />;
    }
}

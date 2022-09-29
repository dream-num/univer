import { BaseSelectProps, Component, IToolBarItemProps } from '@univer/base-component';
import { Nullable, Observer, WorkBook } from '@univer/core';
import { IProps } from '../IData';
import { ClipboardPlugin } from '../ClipboardPlugin';

interface IState {
    filter: IToolBarItemProps;
    isFilter: boolean;
    filterPlugin: ClipboardPlugin | null;
}

export class FilterButton extends Component<IProps, IState> {
    protected _localeObserver: Nullable<Observer<WorkBook>>;

    initialize(props: IProps) {
        const FilterRankIcon = this.getComponentRender().renderFunction('FilterRankIcon');
        const NextIcon = this.getComponentRender().renderFunction('NextIcon');
        const FilterIcon = this.getComponentRender().renderFunction('FilterIcon');
        const CleanIcon = this.getComponentRender().renderFunction('CleanIcon');

        this.state = {
            filter: {
                locale: 'filter',
                type: 'select',
                label: <FilterRankIcon />,
                icon: <NextIcon />,
                show: true,
                children: [
                    {
                        locale: 'filter.filter',
                        icon: <FilterIcon />,
                        onClick: () => {},
                    },
                    {
                        locale: 'filter.clearFilter',
                        icon: <CleanIcon />,
                        onClick: () => {},
                    },
                ],
            },
            filterPlugin: null,
            isFilter: false,
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
            .getObserver<WorkBook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    /**
     * destory
     */
    componentWillUnmount() {
        this.getContext().getObserverManager().getObserver<WorkBook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    /**
     * set text by config setting and Locale message
     */
    setLocale() {
        const locale = this._context.getLocale();
        this.setState((prevState: IState) => {
            let item = prevState.filter;
            // set current Locale string for tooltip
            item.tooltip = locale.get(`${item.locale}Label`);

            // set current Locale string for select
            item.children?.forEach((ele: IToolBarItemProps) => {
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
        const Select = this.getComponentRender().renderFunction('Select');
        return <Select tooltip={filter.tooltip} key={filter.locale} children={filter.children as BaseSelectProps[]} label={filter.label} icon={filter.icon} />;
    }
}

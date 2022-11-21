import { BaseComponentRender, BaseComponentSheet, BaseSelectProps, Component, IToolBarItemProps } from '@univer/base-component';
import { Nullable, Observer, Workbook } from '@univer/core';
import { SheetPlugin } from '@univer/base-sheets';

import { IProps } from '../IData/IComment';

// Types for state
interface IState {
    comment: IToolBarItemProps;
}

export class CommentButton extends Component<IProps, IState> {
    private _localeObserver: Nullable<Observer<Workbook>>;

    Render: BaseComponentRender;

    initialize(props: IProps) {
        const component = new SheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();
        const NextIcon = this.Render.renderFunction('NextIcon');
        const CommentIcon = this.Render.renderFunction('CommentIcon');

        // super(props);
        const commentState: IToolBarItemProps = {
            locale: 'comment.commentLabel',
            type: 'select',
            label: <CommentIcon />,
            icon: <NextIcon />,
            show: true,
            border: false,
            needChange: false,
            children: [
                {
                    locale: 'comment.insert',
                },
                {
                    locale: 'comment.edit',
                },
                {
                    locale: 'comment.delete',
                },
                {
                    locale: 'comment.showOne',
                    border: true,
                },
                {
                    locale: 'comment.showAll',
                },
            ],
        };

        this.state = {
            comment: commentState,
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
            .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    /**
     * destory
     */
    componentWillUnmount() {
        // this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    /**
     * set text by config setting and Locale message
     */
    setLocale() {
        const locale = this._context.getLocale();
        this.setState((prevState: IState) => {
            let item = prevState.comment;
            // set current Locale string for tooltip
            item.tooltip = locale.get(`${item.locale}`);

            // set current Locale string for select
            item.children?.forEach((ele: IToolBarItemProps) => {
                if (ele.locale) {
                    ele.label = locale.get(`${ele.locale}`);
                }
            });
            item.label = typeof item.label === 'object' ? item.label : item.children![0].label;

            return {
                comment: item,
            };
        });
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render(props: IProps, state: IState) {
        const Select = this.Render.renderFunction('Select');

        const { comment } = state;
        // Set Provider for entire Container
        return (
            <Select
                tooltip={comment.tooltip}
                tooltipRight={comment.tooltipRight}
                border={comment.border}
                needChange={comment.needChange}
                key={comment.locale}
                children={comment.children as BaseSelectProps[]}
                label={comment.label}
                icon={comment.icon}
            />
        );
    }
}

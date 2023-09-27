import { AppContext, BaseComponentProps, CustomLabel, Icon } from '@univerjs/base-ui';
import { BorderStyleTypes } from '@univerjs/core';
import { Component } from 'react';

import { BORDER_SIZE_CHILDREN, LINE_BOLD_LABEL } from '../../../controller/menu/border.menu';

interface IState {
    img: BorderStyleTypes;
}

interface IProps extends BaseComponentProps {
    label: string;
    title: string;
    value: BorderStyleTypes;
}

export class LineBold extends Component<IProps, IState> {
    static readonly componentName = LINE_BOLD_LABEL;

    static override contextType = AppContext;

    declare context: React.ContextType<typeof AppContext>;

    constructor(props: IProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            img: BorderStyleTypes.NONE,
        };
    }

    override componentDidMount(): void {
        this.props.getComponent?.(this);
    }

    override UNSAFE_componentWillReceiveProps(props: IProps) {
        this.setState({
            img: props.value,
        });
    }

    setImg(img: BorderStyleTypes = BorderStyleTypes.NONE) {
        this.setState({
            img,
        });
    }

    getImg(img: BorderStyleTypes) {
        if (!img) return null;
        const span = document.querySelector('.base-sheets-line-bold') as HTMLDivElement;
        const props = { width: span.offsetWidth };
        const Img = this.context.componentManager.get(img as unknown as string) as any;
        if (Img) {
            return <Img {...(props as any)} />;
        }
    }

    override render() {
        const { img } = this.state;
        const { title, value } = this.props;
        const imgComponent = img && this.getImg(img);

        // TODO: display a style according to the value
        const label = BORDER_SIZE_CHILDREN.find((item) => item.value === value)?.label;

        return (
            <div
                style={{
                    paddingBottom: '3px',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <span className={'base-sheets-line-bold'} style={{ position: 'relative' }}>
                    <CustomLabel label={title} />
                    <br></br>
                    <CustomLabel label={label} />
                    <div style={{ width: '100%', height: 0, position: 'absolute', left: 0, bottom: '14px' }}>
                        {imgComponent}
                    </div>
                </span>
                <Icon.RightIcon />
            </div>
        );
    }
}

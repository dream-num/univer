import { BaseComponentProps, Component, Icon } from '@univerjs/base-ui';

interface IState {
    img: string;
}

interface IProps extends BaseComponentProps {
    label: string;
    img: string;
}

export class LineBold extends Component<IProps, IState> {
    initialize() {
        this.state = {
            img: '',
        };
    }

    componentDidMount(): void {
        this.props.getComponent?.(this);
    }

    componentWillReceiveProps(props: IProps) {
        this.setState({
            img: props.img,
        });
    }

    setImg(img: string = '') {
        this.setState({
            img,
        });
    }

    getImg(img: string) {
        if (!img) return null;
        const span = document.querySelector('.base-sheets-line-bold') as HTMLDivElement;
        const props = { width: span.offsetWidth };
        const Img = this.context.componentManager.get(img);
        if (Img) {
            return <Img {...(props as any)} />;
        }
    }

    render() {
        const { img } = this.state;
        const { label } = this.props;
        return (
            <div style={{ paddingBottom: '3px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={'base-sheets-line-bold'} style={{ position: 'relative' }}>
                    {this.getLabel(label)}
                    <div style={{ width: '100%', height: 0, position: 'absolute', left: 0, bottom: '14px' }}>{img.length ? this.getImg(img) : ''}</div>
                </span>
                <Icon.RightIcon />
            </div>
        );
    }
}

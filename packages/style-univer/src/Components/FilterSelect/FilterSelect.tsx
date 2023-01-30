import { BaseFilterSelectProps, Component, createRef, FilterSelectComponent, JSXComponent, List } from '@univerjs/base-component';
import { ColorPicker, Icon, Ul } from '../index';
import styles from './index.module.less';

// interface IProps {}
interface IState {
    list: List[];
    sheetUl: any;
}

class FilterSelect extends Component<BaseFilterSelectProps, IState> {
    buttonRef = createRef();

    root = createRef();

    initialize(props: BaseFilterSelectProps) {
        this.state = {
            list: [
                { content: '以A-Z升序排列', onClick: this.printContent.bind(this, '以A-Z升序排列') },
                { content: '以Z-A降序排列', onClick: this.printContent.bind(this, '以Z-A降序排列') },
                {
                    content: '按颜色筛选',
                    onClick: this.printContent.bind(this, '按颜色筛选'),
                    children: [{ content: <ColorPicker color="#000" onClick={() => {}} onCancel={() => {}} style={{ display: 'flex' }} />, type: 'jsx' }],
                },
                { content: '按条件过滤', onClick: this.printContent.bind(this, '按条件过滤') },
                { content: '按值过滤', onClick: this.printContent.bind(this, '按值过滤') },
            ],
            sheetUl: [
                {
                    label: '删除',
                },
                {
                    label: '复制',
                },
                {
                    label: '重命名',
                },
                {
                    label: '更改颜色',
                    icon: <Icon.Format.RightIcon />,

                    children: [
                        {
                            label: <ColorPicker style={{ visibility: 'visible', position: 'relative', boxShadow: 'none' }} color="#000" onClick={() => {}} onCancel={() => {}} />,
                            isJsx: true,
                        },
                    ],
                },
                {
                    label: '隐藏',
                    border: true,
                },
                {
                    label: '取消隐藏',
                },
                {
                    label: '向左移',
                    border: true,
                },
                {
                    label: '向右移',
                },
            ],
        };
    }

    printContent(val: string) {
        console.log(val);
    }

    onClick(e: MouseEvent) {
        e.preventDefault();
        this.root.current.showSelect();
    }

    handleClick = (e: Event) => {
        if (this.buttonRef.current.contains(e.target)) return;
        this.root.current.hideSelect();
    };

    // TODO:remove to show select
    componentDidMount() {
        // 添加右键点击、点击事件监听
        document.addEventListener('click', this.handleClick);
    }

    componentWillUnmount() {
        // 移除事件监听
        document.removeEventListener('click', this.handleClick);
    }

    render() {
        return (
            <div className={styles.filterSelect}>
                <span ref={this.buttonRef} onClick={this.onClick.bind(this)}>
                    <Icon.Format.NextIcon />
                </span>
                <Ul children={this.state.sheetUl} ref={this.root}></Ul>
            </div>
        );
    }
}

export class UniverFilterSelect implements FilterSelectComponent {
    render(): JSXComponent<BaseFilterSelectProps> {
        return FilterSelect;
    }
}

export { FilterSelect };

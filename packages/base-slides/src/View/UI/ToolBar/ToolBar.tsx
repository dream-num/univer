import { BaseComponentProps, BaseComponentRender, BaseComponentSheet, Component, createRef } from '@univer/base-component';

import { PLUGIN_NAMES } from '@univer/core';
import { SlidePlugin } from '../../../SlidePlugin';
import { IToolBarItemProps } from '../../../Model/ToolBarModel';
import { TextButton } from '../Common/TextButton/TextButton';
import styles from './index.module.less';
import { Select } from '../Common/Select/Select';

interface IProps extends BaseComponentProps {
    style?: JSX.CSSProperties;
    toolList: IToolBarItemProps[];
    // forwardRefs?: RefObject<HTMLElement>;
}

interface IState {
    toolList: IToolBarItemProps[];
    moreToolList: IToolBarItemProps[];
    defaultToolList: IToolBarItemProps[];
    more: boolean;
    index: number;
    toolbarListWidths: number[];
    moreText: string;
}

export class ToolBar extends Component<IProps, IState> {
    toolbarWarp = createRef();

    toolbarRef = createRef();

    moreBtn = createRef();

    moreToolRef = createRef();

    SelectRef = createRef();

    Render: BaseComponentRender;

    initialize(props: IProps) {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();

        this.state = {
            // Button contains main button and drop down arrow, translation file contains main and right
            more: false,
            toolList: [],
            defaultToolList: [],
            moreToolList: [],
            index: 0,
            toolbarListWidths: [],
            moreText: '',
        };
    }

    /**
     * show more tool buttons
     *
     * TODO : 点击其他地方需要隐藏more buttons
     */
    moreTool = () => {
        let more = this.state.more;
        this.setState({ more: !more });

        if (!more) {
            document.addEventListener('click', this.hide, true);
        }
    };

    hide = (e: Event) => {
        if (this.moreToolRef.current.contains(e.target)) return;
        e.stopImmediatePropagation();
        this.setState({ more: false });
        document.removeEventListener('click', this.hide, true);
    };

    resetLabel = (toolList: any[]) => {
        const plugin = this._context.getPluginManager().getPluginByName<SlidePlugin>(PLUGIN_NAMES.SLIDE);

        for (let i = 0; i < toolList.length; i++) {
            const item = toolList[i];

            // 优先寻找自定义组件
            if (item.customLabel) {
                const Label = plugin?.getRegisterComponent(item.customLabel.name);
                if (Label) {
                    const props = item.customLabel.props ?? {};
                    item.label = <Label {...props} />;
                }
            }

            if (item.customSuffix) {
                const Suffix = plugin?.getRegisterComponent(item.customSuffix.name);
                if (Suffix) {
                    const props = item.customSuffix.props ?? {};
                    item.suffix = <Suffix {...props} />;
                }
            }

            if (item.children) {
                item.children = this.resetLabel(item.children);
            }
        }
        return toolList;
    };

    setToolBar = (toolList: any[]) => {
        toolList = this.resetLabel(toolList);

        this.setState({
            toolList,
        });
    };

    componentDidMount() {
        this._context.getObserverManager().getObserver<ToolBar>('onToolBarDidMountObservable')?.notifyObservers(this);
    }

    render(props: IProps, state: IState) {
        const { toolList } = state;

        const Button = this.Render.renderFunction('Button');
        const Container = this.Render.renderFunction('Container');
        const Tooltip = this.Render.renderFunction('Tooltip');

        return (
            <Container style={{ position: 'relative' }}>
                <div className={styles.toolbarWarp} ref={this.toolbarWarp}>
                    <div className={styles.toolbar} ref={this.toolbarRef}>
                        {toolList.map((item) => {
                            if (item.toolbarType) {
                                return (
                                    <Tooltip title={item.tooltip} placement={'bottom'}>
                                        <TextButton label={item.label} onClick={item.onClick}></TextButton>
                                    </Tooltip>
                                );
                            }
                            return (
                                <Select
                                    tooltip={item.tooltip}
                                    type={item.type}
                                    display={item.display}
                                    children={item.children}
                                    customLabel={item.customLabel}
                                    customSuffix={item.customSuffix}
                                    label={item.label}
                                    onClick={item.onClick}
                                    onKeyUp={item.onKeyUp}
                                    defaultColor={item.defaultColor}
                                    hideSelectedIcon={item.hideSelectedIcon}
                                    selectClassName={item.selectClassName}
                                ></Select>
                            );
                        })}
                    </div>
                    {this.state.moreToolList.length === 0 ? null : (
                        <div ref={this.moreBtn} className={styles.singleButton}>
                            <Tooltip title={this.state.moreText} placement={'bottom'}>
                                <Button type="text" onClick={this.moreTool}>
                                    <div style={{ fontSize: '14px' }}>{this.state.moreText}</div>
                                </Button>
                            </Tooltip>
                        </div>
                    )}
                </div>

                <div className={`${styles.moreTool} ${this.state.more ? styles.moreShow : null}`} ref={this.moreToolRef}></div>
            </Container>
        );
    }
}

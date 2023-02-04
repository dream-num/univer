import { Nullable } from '@univerjs/core';
import { BaseComponentProps, BaseComponentRender, BaseComponentSheet } from '../../BaseComponent';
import { BaseInfoBarProps } from '../../Controller/InfoBarController';
import { Component } from '../../Framework';
import styles from './index.module.less';

interface IState {
    infoList: Nullable<BaseInfoBarProps>;
}

interface IProps extends BaseComponentProps {
    renameSheet: () => void;
}

export class InfoBar extends Component<IProps, IState> {
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        this.state = {
            infoList: null,
        };
    }

    componentDidMount() {
        this.props.getComponent?.(this);
    }

    setInfoList(list: BaseInfoBarProps) {
        this.setState({
            infoList: list,
        });
    }

    render() {
        const { renameSheet } = this.props;
        if (!this.state.infoList) return;
        const Button = this._render.renderFunction('Button');
        const Container = this._render.renderFunction('Container');
        const Input = this._render.renderFunction('Input');
        const Tooltip = this._render.renderFunction('Tooltip');
        const DropDownIcon = this._render.renderFunction('DropDownIcon');
        const LogoIcon = this._render.renderFunction('LogoIcon');

        const { back, sheetName, update, save, rename } = this.state.infoList;

        return (
            <Container className={styles.infoDetail}>
                {/* <div style={{ marginRight: '18px' }}>
                    <Tooltip title={back.label} placement={'bottom'}>
                        <Button className={styles.infoReturn} type="text">
                            <DropDownIcon rotate={90} />
                        </Button>
                    </Tooltip>
                </div> */}
                {/* <LogoIcon style={{ width: '152px', height: '32px' }} /> */}
                <div className={styles.sheetName}>
                    <Tooltip title={rename.label} placement={'bottom'}>
                        <Input bordered={false} value={sheetName} onBlur={renameSheet} />
                    </Tooltip>
                </div>
                <div className={styles.infoDetailUpdate}>{update.label}</div>
                <div className={styles.infoDetailSave}>{save.label}</div>
            </Container>
        );
    }
}

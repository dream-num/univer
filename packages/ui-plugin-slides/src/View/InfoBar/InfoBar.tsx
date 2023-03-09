import { BaseComponentProps, Component, Container, Input, Tooltip } from '@univerjs/base-ui';
import { Nullable } from '@univerjs/core';
import { BaseInfoBarProps } from '../../Controller/InfoBarUIController';
import styles from './index.module.less';

interface IState {
    infoList: Nullable<BaseInfoBarProps>;
}

interface IProps extends BaseComponentProps {
    renameSheet: () => void;
}

export class InfoBar extends Component<IProps, IState> {
    initialize() {
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

        const { back, slide, update, save, rename } = this.state.infoList;

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
                        <Input bordered={false} value={slide.label} onBlur={renameSheet} />
                    </Tooltip>
                </div>
                <div className={styles.infoDetailUpdate}>{update.label}</div>
                <div className={styles.infoDetailSave}>{save.label}</div>
            </Container>
        );
    }
}

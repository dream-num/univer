import { BaseInfoBarProps, InfoBarComponent, JSXComponent } from '@univerjs/base-component';
import { Button, Container, Input, Tooltip } from '../../index';
import * as Icon from '../Icon';
import './index.less';

export const InfoBar = (props: BaseInfoBarProps) => (
    <Container className={'universheet-info-detail'}>
        <div style={{ marginRight: '18px' }}>
            <Tooltip title={'返回'} placement={'bottom'}>
                <Button className={'universheet-info-return'} type="text">
                    <Icon.Other.DropDownIcon rotate={90} />
                </Button>
            </Tooltip>
        </div>

        <Icon.LogoIcon style={{ width: '152px', height: '32px' }} />
        <div className={'sheet-name'}>
            <Input bordered={false} value="Universheet Demo" />
        </div>
        <div id="universheet-info-detail-update" className="universheet-info-detail-update">
            新打开
        </div>
        <div id="universheet-info-detail-save" className="universheet-info-detail-save">
            已恢复本地缓存
        </div>
    </Container>
);

export class UniverInfoBar implements InfoBarComponent {
    render(): JSXComponent<BaseInfoBarProps> {
        return InfoBar;
    }
}

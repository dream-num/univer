import { BaseComponentRender, BaseComponentSheet, Component } from '@univer/base-component';
import { Nullable, PLUGIN_NAMES } from '@univer/core';
import { BaseInfoBarProps } from '../../../Controller/InfoBarController';
import './index.less';

interface IState {
    infoList: Nullable<BaseInfoBarProps>;
}

interface Iprops {}

export class InfoBar extends Component<Iprops, IState> {
    Render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();

        this.state = {
            infoList: null,
        };
    }

    componentDidMount() {
        this._context.getObserverManager().getObserver<InfoBar>('onInfoBarDidMountObservable', PLUGIN_NAMES.SPREADSHEET)?.notifyObservers(this);
    }

    setInfoList(list: BaseInfoBarProps) {
        this.setState({
            infoList: list,
        });
    }

    render() {
        if (!this.state.infoList) return;
        const Button = this.Render.renderFunction('Button');
        const Container = this.Render.renderFunction('Container');
        const Input = this.Render.renderFunction('Input');
        const Tooltip = this.Render.renderFunction('Tooltip');
        const DropDownIcon = this.Render.renderFunction('DropDownIcon');
        const LogoIcon = this.Render.renderFunction('LogoIcon');

        const { back, sheet, update, save, rename } = this.state.infoList;

        return (
            <Container className={'universheet-info-detail'}>
                <div style={{ marginRight: '18px' }}>
                    <Tooltip title={back.label} placement={'bottom'}>
                        <Button className={'universheet-info-return'} type="text">
                            <DropDownIcon rotate={90} />
                        </Button>
                    </Tooltip>
                </div>
                <LogoIcon style={{ width: '152px', height: '32px' }} />
                <div className={'sheet-name'}>
                    <Tooltip title={rename.label} placement={'bottom'}>
                        <Input bordered={false} value={sheet.label} onBlur={sheet.onBlur} />
                    </Tooltip>
                </div>
                <div id="universheet-info-detail-update" className="universheet-info-detail-update">
                    {update.label}
                </div>
                <div id="universheet-info-detail-save" className="universheet-info-detail-save">
                    {save.label}
                </div>
            </Container>
        );
    }
}

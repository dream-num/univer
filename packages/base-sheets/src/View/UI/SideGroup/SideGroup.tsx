import { Component } from '@univerjs/base-component';
import { PLUGIN_NAMES } from '@univerjs/core';
import { SideProps } from '../../../Controller/SideGroupController';
import { SheetPlugin } from '../../../SheetPlugin';

interface IState {
    sideGroup: any[];
}

interface SideRenderProps extends SideProps {
    side?: any;
}

export class SideGroup extends Component<any, IState> {
    initialize() {
        this.state = {
            sideGroup: [],
        };
    }

    componentDidMount(): void {
        this._context.getObserverManager().getObserver<SideGroup>('onSideGroupDidMountObservable')?.notifyObservers(this);
    }

    setSideGroup(group: SideRenderProps[]) {
        const plugin = this._context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        const sideGroup = group.map((item) => {
            const Side = plugin?.getRegisterComponent(item.name);
            if (Side) {
                item.side = <Side></Side>;
            }
            return item;
        });

        this.setState({
            sideGroup,
        });
    }

    render() {
        const { sideGroup } = this.state;
        return (
            <div>
                {sideGroup.map((item) => {
                    if (item.show) {
                        return (
                            <div onClick={() => item.onClick(item.name)} style={{ zIndex: item.zIndex }}>
                                {item.side}
                            </div>
                        );
                    }
                    return <></>;
                })}
            </div>
        );
    }
}

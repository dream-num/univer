import { Component, SiderModal } from '@univerjs/base-ui';

type IProps = {};

type IState = {};

export class Test extends Component<IProps, IState> {
    render() {
        return (
            <SiderModal zIndex={92} name="test" title={'test'} style={{ width: '30%', background: 'red' }}>
                Hello
            </SiderModal>
        );
    }
}

import { Component, SiderModal } from '@univerjs/base-ui';

type IProps = {};

type IState = {};

export class Test1 extends Component<IProps, IState> {
    render() {
        return (
            <SiderModal zIndex={91} name="test1" title={'test1'} style={{ width: '70%', background: '#abcdef' }}>
                Hello 1
            </SiderModal>
        );
    }
}

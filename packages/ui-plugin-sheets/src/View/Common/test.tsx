import { SiderModal } from '@univerjs/base-ui';
import { Component } from 'react';

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

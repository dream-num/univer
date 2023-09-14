import type { Meta } from '@storybook/react';

import { Content, Footer, Header, Layout, Sider } from './Layout';

const meta: Meta<typeof Layout> = {
    title: 'Components / Layout',
    component: Layout,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: <div>basic layout</div>,
    },
};

export default meta;

export const Playground = {
    args: {},
};

export const SiderLayout = {
    title: 'Sider',
    args: {
        style: { width: '640px', height: '320px' },
        children: (
            <>
                <Sider style={{ color: '#fff', background: '#001529' }}>aside</Sider>
                <Content style={{ padding: '24px', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
                    <Header style={{ color: '#fff', background: '#001529' }}>header</Header>
                    <Content style={{ background: '#fff' }}>content</Content>
                    <Footer style={{ color: '#fff', background: '#001529' }}>footer</Footer>
                </Content>
            </>
        ),
    },
};

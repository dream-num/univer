import { BaseDemoProps, Component, DemoComponent, JSXComponent } from '@univer/base-component';

// type BaseDemoProps = {

// };

// Types for state
type IState = {};

export class Demo extends Component<BaseDemoProps, IState> {
    render(props: BaseDemoProps, state: IState) {
        // const { onClick } = props;
        // const UniverComponentSheet = new UniverComponentSheet();
        // const render = UniverComponentSheet.getComponentRender();
        // const Button = render.renderFunction('Button');

        // const Container = render.renderFunction('Container');
        // const CellRangeModal = render.renderClass('CellRangeModal');
        // const Layout = render.renderClass('Layout');
        // const Header = render.renderFunction('Header');
        // const Footer = render.renderFunction('Footer');
        // const Content = render.renderFunction('Content');
        // const Sider = render.renderFunction('Sider');

        return (
            <div style={{ position: 'fixed', left: '0', top: '0', right: '0', bottom: '0', zIndex: '1' }}>
                {/* <Button onClick={onClick}>Close</Button>
                <Container style={{ height: '100%', width: '100%', background: 'gray' }}>
                    <Layout>
                        <Header>
                            <Button>Close</Button>
                        </Header>
                        <Content>
                            <CellRangeModal placeholderProps="cell1"></CellRangeModal>

                        </Content>
                        <Sider>6</Sider>
                        <Footer>7</Footer>
                    </Layout>
                </Container> */}
            </div>
        );
    }
}

export class UniverDemo implements DemoComponent {
    render(): JSXComponent<BaseDemoProps> {
        return Demo;
    }
}

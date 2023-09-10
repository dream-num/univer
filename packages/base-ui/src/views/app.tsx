import { LocaleService, ObserverManager } from '@univerjs/core';
import { useDependency, useInjector } from '@wendellhu/redi/react-bindings';

import { ComponentManager, ZIndexManager } from '../Common';
import { AppContext } from '../Common/AppContext';
import { Header, Layout, Sider } from '../Components';
import { Container } from '../Components/Container/Container';
import { IWorkbenchOptions } from '../controllers/ui/ui.controller';
import { LocaleType } from '../Enum';
import style from './app.module.less';
import { Toolbar } from './components/toolbar/toolbar';

export interface IUniverAppProps extends IWorkbenchOptions {}

export function App(props: IUniverAppProps) {
    const injector = useInjector();
    const localeService = useDependency(LocaleService);
    const observerManager = useDependency(ObserverManager);
    const zIndexManager = useDependency(ZIndexManager);
    const componentManager = useDependency(ComponentManager);

    // TODO: there should be some slots to let business render their own components

    // NOTE: Toolbar 那些东西我来负责迁移好了，他们只用负责迁移 base-ui 里面的东西，即先从最底下的组件开始做起
    return (
        <AppContext.Provider value={{ injector, localeService, locale: LocaleType.EN, componentManager, zIndexManager, observerManager }}>
            {/* TODO: UI here is not fine tuned */}
            <div
                style={{
                    position: 'fixed',
                    right: '250px',
                    top: '14px',
                    fontSize: '14px',
                    zIndex: 100,
                }}
                className="univer-dev-operation"
            >
                {/* language selector */}
                <span
                    style={{
                        display: 'inline-block',
                        width: 70,
                        margin: '5px 0 0 5px',
                    }}
                >
                    Language
                </span>
                <select value={LocaleType.EN} style={{ width: 70 }} onChange={(e) => localeService.setLocale(e.target.value as LocaleType)}>
                    <option value={LocaleType.EN}>English</option>
                    <option value={LocaleType.ZH}>简体中文</option>
                </select>
            </div>
            <Container className={style.layoutContainer}>
                <Layout>
                    <Sider style={{ display: props.outerLeft ? 'block' : 'none' }}></Sider>
                    <Layout className={style.mainContent} style={{ position: 'relative' }}>
                        <Header style={{ display: props.header ? 'block' : 'none' }}>
                            {/* TODO: move Toolbar component to base-ui plugin */}
                            {props.toolbar && <Toolbar></Toolbar>}
                        </Header>
                    </Layout>
                </Layout>
            </Container>
        </AppContext.Provider>
    );
}

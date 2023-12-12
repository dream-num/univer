// import { useHistory } from '@docusaurus/router';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// import Heading from '@theme/Heading';
// import Layout from '@theme/Layout';
// import { DiscordSingle24, GithubSingle24 } from '@univerjs/icons';
// import clsx from 'clsx';
// import React from 'react';

// import styles from './index.module.css';

// export default function Home() {
//     const { siteConfig } = useDocusaurusContext();
//     const history = useHistory();

//     function handleRedirect(external: boolean, url: string) {
//         if (external) {
//             window.open(url, '_blank');
//         } else {
//             history.push(url);
//         }
//     }

//     return (
//         <Layout>
//             <header className={clsx('container', styles.header)}>
//                 <Heading as="h1" className={styles.h1}>
//                     {siteConfig.title}
//                 </Heading>

//                 <Heading as="h2" className={styles.h2}>
//                     {siteConfig.tagline}
//                 </Heading>

//                 <section>
//                     <button
//                         className="button button--primary margin-right--sm"
//                         onClick={() => handleRedirect(false, '/docs/guides/intro')}
//                     >
//                         Get Started
//                     </button>
//                     <button
//                         className={clsx('button button--outline button--secondary margin-right--sm', styles.btn)}
//                         onClick={() => handleRedirect(true, 'https://discord.gg/z3NKNT6D2f')}
//                     >
//                         <DiscordSingle24 className={styles.icon} />
//                         Discord
//                     </button>
//                     <button
//                         className={clsx('button button--outline button--secondary', styles.btn)}
//                         onClick={() => handleRedirect(true, 'https://github.com/dream-num/univer')}
//                     >
//                         <GithubSingle24 className={styles.icon} />
//                     </button>
//                 </section>
//             </header>
//         </Layout>
//     );
// }

import { Redirect } from "@docusaurus/router";

export default function Home () {
    return <Redirect to="/docs/guides/intro" />;
}

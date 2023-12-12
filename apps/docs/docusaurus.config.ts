import fs from 'node:fs';
import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';
import rootTsConfig from '../../tsconfig.json';

const packages = rootTsConfig.references
    .filter((ref) => {
        // read package.json
        try {
            const pkg = fs.readFileSync(`../../${ref.path}/package.json`, 'utf-8');
            const { private: p } = JSON.parse(pkg);
            return !p;
        } catch (e) {
            console.error(e)
        }
    })
    .map((ref) => ref.path.replace('./packages/', ''));

const config: Config = {
    title: 'Univer',
    tagline: 'An open source collaborative solution.',
    favicon: 'img/favicon.ico',

    // Set the production url of your site here
    url: 'https://univer-docs.vercel.app',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'Dream-num', // Usually your GitHub org/user name.
    projectName: 'Univer', // Usually your repo name.

    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'zh-Hans',
        // locales: ['zh-Hans', 'en'],
        locales: ['zh-Hans'],
    },

    markdown: {
        format: 'detect',
    },

    plugins: [
        ...packages.map((name) => [
            'docusaurus-plugin-typedoc',
            {
                id: `api/${name}`,
                entryPoints: [`../../packages/${name}/src/index.ts`],
                tsconfig: `../../packages/${name}/tsconfig.json`,
                typeDeclarationFormat: 'table',
                expandObjects: true,
                exclude: ['node_modules/**/*', '**/*+(.spec|.e2e|.test).ts'],
                excludePrivate: true,
                excludeExternals: true,
                excludeInternal: true,
                cleanOutputDir: true,
                skipErrorChecking: true,
                out: `docs/api/${name}`,
                entryFileName: "index.md",
                sidebar: {
                    pretty: false
                }
            },
        ]),
    ],

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: 'https://github.com/dream-num/univer/edit/dev/apps/docs/',
                },
                // blog: {
                //     showReadingTime: true,
                //     // Please change this to your repo.
                //     // Remove this to remove the "edit this page" links.
                //     editUrl:
                //         'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
                // },
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        // image: 'img/docusaurus-social-card.jpg',
        navbar: {
            title: 'Univer',
            // logo: {
            //     alt: 'My Site Logo',
            //     src: 'img/logo.svg',
            // },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'guidesSidebar',
                    position: 'left',
                    label: '指南',
                },
                {
                    to: 'docs/api/core',
                    activeBasePath: 'docs/api',
                    // type: 'docSidebar',
                    // sidebarId: 'apiSidebar',
                    position: 'left',
                    label: 'API',
                },
                {
                    to: 'playground',
                    position: 'left',
                    label: 'Playground',
                },
                {
                    href: 'https://github.com/dream-num/univer',
                    label: 'GitHub',
                    position: 'right',
                },
                {
                    type: 'localeDropdown',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: '文档',
                    items: [
                        {
                            label: '指南',
                            to: '/docs/guides/intro',
                        },
                        {
                            label: 'API',
                            to: '/docs/api/core',
                        },
                    ],
                },
                {
                    title: '社区',
                    items: [
                        {
                            label: 'Github Discussions',
                            href: 'https://github.com/dream-num/univer/discussions',
                        },
                        {
                            label: 'Discord',
                            href: 'https://discord.gg/z3NKNT6D2f',
                        },
                    ],
                },
                {
                    title: '其他',
                    items: [
                        // {
                        //     label: 'Blog',
                        //     to: '/blog',
                        // },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/dream-num/univer',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Dream-num, Inc.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;

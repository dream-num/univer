import Layout from '@theme/Layout';

export default function Home(): JSX.Element {
    return (
        <Layout>
            <div
                style={{
                    display: 'flex',
                    flex: 1,
                }}
            >
                <iframe
                    style={{ width: '100% ' }}
                    src="https://stackblitz.com/edit/typescript-uvcstu?embed=1&file=index.ts"
                />
            </div>
        </Layout>
    );
}

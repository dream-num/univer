import Layout from '@theme/Layout';
import React from 'react';

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
                    src="https://stackblitz.com/edit/vite-univer-sheets?embed=1&file=src%2Fmain.ts"
                />
            </div>
        </Layout>
    );
}

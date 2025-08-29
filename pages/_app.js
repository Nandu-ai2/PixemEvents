import { UserProvider } from '../context/UserContext';
import '../styles/globals.css'; // updated path
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <Head>
        <title>PixaBeam Events</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Component {...pageProps} />
      </div>
    </UserProvider>
  );
}

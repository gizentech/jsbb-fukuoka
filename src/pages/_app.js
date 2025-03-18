import { Noto_Sans_JP } from 'next/font/google';
import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  preload: true,
});

export default function MyApp({ Component, pageProps }) {
  const siteName = '久留米市野球連盟';

  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <title>{`${siteName} - 福岡県久留米市の野球大会・試合情報`}</title>
      </Head>
      <div className={notoSansJP.className}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
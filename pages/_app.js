import '@/styles/globals.css'
import '@livekit/components-styles'
import NextNProgress from 'nextjs-progressbar'
import Layout from '@/components/Layout'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/redux/store'
import BASE_URL from '@/config'
import { SnackbarProvider } from 'notistack'
import { DefaultSeo, NextSeo } from 'next-seo'
import { seoData } from '@/utility/const'
import Script from 'next/script'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const isPrivateCarePath = path => /^\/(consultation|doctor|doctors|user|admin)(\/|$)/.test(path)
  const privateCarePage = isPrivateCarePath(router.pathname)
  useEffect(() => {
    const protect = url => {
      if (!isPrivateCarePath(url.split('?')[0])) return
      window['ga-disable-G-V1J9SKGV3W'] = true
      window.clarity?.('consent', false)
    }
    protect(router.asPath)
    router.events.on('routeChangeStart', protect)
    return () => router.events.off('routeChangeStart', protect)
  }, [router.events, router.asPath])
  return (
    <>
      <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
      <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
      <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
      <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
      <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
      <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
      <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
      <meta name="theme-color" content="#ffffff"></meta>


      <DefaultSeo {...seoData} />
      {!privateCarePage && <Script
        async
        src='https://www.googletagmanager.com/gtag/js?id=G-V1J9SKGV3W'
      ></Script>}
      {!privateCarePage && <Script id='clarity-script' strategy='afterInteractive'>
        {`    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "nkik2r1lg7");`}
      </Script>}
      {!privateCarePage && <script
        dangerouslySetInnerHTML={{
          __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-V1J9SKGV3W');
              `
        }}
      />}

      <Provider store={store}>
        <SnackbarProvider>
          <Layout>
            <>
              <NextNProgress color='black' />
              <Component {...pageProps} />
            </>
          </Layout>{' '}
        </SnackbarProvider>
      </Provider>
    </>
  )
}

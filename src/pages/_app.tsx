import { type AppType } from "next/app";
import { api } from "~/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import "~/styles/globals.css";
import { GlobalStateProvider } from "~/components/layout";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from '@vercel/speed-insights/next';

export { reportWebVitals } from 'next-axiom';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Toaster position="bottom-center" />
      <GlobalStateProvider>
        <Component {...pageProps} />
      </GlobalStateProvider>
      <SpeedInsights />
    </ClerkProvider>
  )
};

export default api.withTRPC(MyApp);

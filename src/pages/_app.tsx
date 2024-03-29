import { type AppType } from "next/app";
import { api } from "~/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import "~/styles/globals.css";
import { PageLayout } from "~/components/layout";
import { Toaster } from "react-hot-toast";
export { reportWebVitals } from 'next-axiom'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Toaster position="bottom-center" />
      <PageLayout>
        <Component {...pageProps} />
      </PageLayout>
    </ClerkProvider>
  )
};

export default api.withTRPC(MyApp);

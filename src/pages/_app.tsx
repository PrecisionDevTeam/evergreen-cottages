import ProgressBar from "@badrap/bar-of-progress";
import type { AppProps } from "next/app";
import { Router } from "next/router";
import "../styles/globals.css";

const progress = new ProgressBar({
  size: 3,
  color: "#16a34a", // evergreen-600
  className: "z-50",
  delay: 80,
});

Router.events.on("routeChangeStart", progress.start);
Router.events.on("routeChangeComplete", progress.finish);
Router.events.on("routeChangeError", progress.finish);

const MyApp = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default MyApp;

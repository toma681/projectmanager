import auth0 from "../utils/auth0.js";
import LandingPage from "../Components/LandingPage.jsx";
import { useState, useEffect } from "react";
import styles from "../Components/landingcss.module.css";

export default function Home({ user }) {
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  return pageLoaded && (
    <div className={styles.repeat}>
      <LandingPage user={user} />
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await auth0.getSession(context.req);
  return {
    props: {
      user: session?.user || null,
    },
  };
}

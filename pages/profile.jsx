import PageTemplate from "../Components/PageTemplate.jsx";
import withAuth from "../Components/withAuth.jsx";
import {useState, useEffect} from "react";

export function pageContent({ user }) {
  return (
    <div>
      <h1>Name: {user.name}</h1>
      <h1>UserID: {user.sub}</h1>
    </div>
  );
}

export default function Profile({ user }) {
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    setPageLoaded(true);
  }, []);
  return pageLoaded && (<PageTemplate pageContent={pageContent} user={user} />) 

}

export async function getServerSideProps(context) {
  return withAuth(context);
}

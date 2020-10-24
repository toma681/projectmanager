import PageTemplate from "../../../Components/PageTemplate.jsx";
import withAuth from "../../../Components/withAuth";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function pageContent() {
  const router = useRouter();

  async function handleNewUser() {
    const data = {
      _id: router.query.projectID,
      newUserID: document.querySelector("#userID").value,
    };

    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    await fetch("/api/projects?options=addUser", options);

    router.push(`/projects/${router.query.projectID}`);
  }

  return (
    <div>
      <h1 style={{ marginTop: "0" }}>Add New User</h1>
      <TextField
        autoComplete="off"
        id="userID"
        style={{ width: "40%" }}
        variant="outlined"
        label="User ID"
      />{" "}
      <br />
      <Button
        onClick={handleNewUser}
        variant="contained"
        style={{ backgroundColor: "#D3D3D3", marginTop: "20px" }}
      >
        Submit
      </Button>
    </div>
  );
}

export default function addUser({ user }) {
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    setPageLoaded(true);
  }, []);
  return pageLoaded && <PageTemplate pageContent={pageContent} user={user} />;
}

export async function getServerSideProps(context) {
  return withAuth(context);
}

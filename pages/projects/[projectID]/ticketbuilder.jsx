import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import withAuth from "../../../Components/withAuth.jsx";
import PageTemplate from "../../../Components/PageTemplate.jsx";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

function pageContent() {
  const [urgency, setUrgency] = useState("Low");
  const router = useRouter();

  const handleSub = async (e) => {
    e.preventDefault();

    let titleElement = document.querySelector("#title");
    let descElement = document.querySelector("#desc");

    const description = descElement.value;
    const title = titleElement.value;

    const data = {
      description,
      urgency,
      projectID: router.query.projectID,
      title,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    await fetch("/api/tickets", options);

    router.push(`/projects/${router.query.projectID}`);
  };

  function handleUrgencyChange(e) {
    setUrgency(e.target.value);
  }

  return (
    <>
      <h1 style={{ marginTop: "0" }}>New Ticket</h1>
      <TextField
        autoComplete="off"
        variant="outlined"
        label="Ticket Title"
        style={{ width: "30%" }}
        id="title"
      />
      <Select
        onChange={handleUrgencyChange}
        label="sad"
        labelId="dd"
        variant="outlined"
        value={urgency}
        style={{ width: "18.5%", marginBottom: "20px", marginLeft: "21px" }}
      >
        <MenuItem value={"Low"}>Low</MenuItem>
        <MenuItem value={"Medium"}>Medium</MenuItem>
        <MenuItem value={"High"}>High</MenuItem>
        <MenuItem value={"Very High"}>Very High</MenuItem>
      </Select>
      <br />
      <TextField
        autoComplete="off"
        id="desc"
        variant="outlined"
        multiline
        rows={4}
        label="Ticket Description"
        style={{ width: "50%", marginBottom: "20px" }}
      />
      <br />
      <Button
        onClick={handleSub}
        variant="contained"
        style={{ backgroundColor: "#D3D3D3" }}
      >
        Submit
      </Button>
    </>
  );
}

export default function TicketBuilder({ user }) {
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    setPageLoaded(true);
  }, []);
  return pageLoaded && <PageTemplate pageContent={pageContent} user={user} />;
}

export async function getServerSideProps(context) {
  return withAuth(context);
}

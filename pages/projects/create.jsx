import { useState, useEffect } from "react";
import withAuth from "../../Components/withAuth.jsx";
import { useRouter } from "next/router";
import PageTemplate from "../../Components/PageTemplate.jsx";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

function pageContent({ user }) {
  const router = useRouter();

  const handleSub = async (e) => {
    e.preventDefault();
    
    let nameElement = document.querySelector("#name");
    let descElement = document.querySelector("#desc");

    const projectName = nameElement.value;
    const description = descElement.value;

    const data = {
      projectName,
      description,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    await fetch("/api/projects", options);

    router.push("/projects/all");
  };

  return (
    <div>
      <h1 style={{ marginTop: "0px" }}>Create New Project</h1>

        <form>
          <TextField autoComplete='off' id="name" label="Project Name" variant="outlined" placeholder="Ex: MyProject" style={{width: "50%"}} /> <br />
          <TextField autoComplete='off' id="desc" label="Project Description" variant="outlined" rows={4} multiline placeholder="Example Description" style={{marginTop: "20px", marginBottom: "20px", width: "50%"}}/> <br/>
          <Button variant="contained" onClick={handleSub} style={{backgroundColor: "#D3D3D3"}}>Submit</Button>
        </form>
    </div>
  );
}

export default function CreateProject({ user }) {
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    setPageLoaded(true);
  }, []);
  return pageLoaded && <PageTemplate pageContent={pageContent} user={user} />;
}

export async function getServerSideProps(context) {
  return withAuth(context);
}

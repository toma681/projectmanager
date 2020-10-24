import withAuth from "../../Components/withAuth";
import { useState, useEffect } from "react";
import PageTemplate from "../../Components/PageTemplate.jsx";
import MUIDataTable from "mui-datatables";
import Button from "@material-ui/core/Button";
import { useRouter } from "next/router";
import trimCharacters from "trim-characters";

function pageContent() {
  const router = useRouter();

  const [projects, setProjects] = useState();
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  const getProjects = () => {
    fetch("/api/projects?options=all")
      .then((response) => response.json())
      .then((data) => {
        setProjectsLoaded(true);
        convertProjectToData(data);
      });
  };

  const convertProjectToData = (data) => {
    let result = [];

    data.forEach((proj) => {
      if (proj !== null) {
        result.push([
          proj.projectName,
          trimCharacters(proj.description, 25, true, "..."),
          proj.dateCreated,
          proj._id,
        ]);
      }
    });

    setProjects(result);
  };

  const columns = [
    {
      name: "Project Name",
      options: {
        customBodyRenderLite: (dataIndex) => {
          return (
            <Button
              onClick={() => {
                router.push(`/projects/${projects[dataIndex][3]}`);
              }}
              variant="contained"
              color="default"
              style={{ backgroundColor: "#d3d3d3" }}
            >
              {projects[dataIndex][0]}
            </Button>
          );
        },
      },
    },
    "Description",
    "Date Created",
    "Project ID",
  ];

  const options = {
    selectableRows: "none",
  };

  useEffect(() => {
    getProjects();
  }, []);

  const refresh = () => {
    getProjects();
  };

  return (
    <div>
      <Button
        variant="contained"
        color="default"
        style={{ marginBottom: "20px" }}
        onClick={() => router.push("/projects/create")}
      >
        New Project
      </Button>
      <Button
        variant="contained"
        color="default"
        style={{ marginLeft: "5px", marginBottom: "20px" }}
        onClick={refresh}
      >
        Refresh
      </Button>

      {projectsLoaded ? (
        <MUIDataTable
          title={"My Projects"}
          data={projects}
          columns={columns}
          options={options}
        />
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

export default function Projects({ user }) {
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    setPageLoaded(true);
  }, []);
  return pageLoaded && <PageTemplate pageContent={pageContent} user={user} />;
}

export async function getServerSideProps(context) {
  return withAuth(context);
}

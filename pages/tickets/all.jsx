import PageTemplate from "../../Components/PageTemplate.jsx";
import withAuth from "../../Components/withAuth";
import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import Button from "@material-ui/core/Button";
import { useRouter } from "next/router";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import trimCharacters from "trim-characters";

function pageContent() {
  const [openTicketList, setOpenTicketList] = useState([]);
  const [closedTicketList, setClosedTicketList] = useState([]);
  const [ticketsLoaded, setTicketsLoaded] = useState(false);
  const router = useRouter();

  function getTickets() {
    fetch("/api/tickets?options=all")
      .then((response) => response.json())
      .then((data) => {
        formatTicketData(data);
      });
  }

  function formatTicketData(data) {
    let openResult = [];
    let closedResult = [];

    data.forEach((tick) => {
      if (tick.status === "Open") {
        openResult.push([
          tick.title,
          tick.ticketID,
          tick.projectName,
          trimCharacters(tick.description, 25, true, "..."),
          tick.urgency,
          tick.timeStamp,
          tick.projectID,
          tick._id,
        ]);
      } else {
        closedResult.push([
          tick.title,
          tick.ticketID,
          tick.projectName,
          trimCharacters(tick.description, 25, true, "..."),
          tick.urgency,
          tick.timeStamp,
          tick.projectID,
          tick._id,
        ]);
      }
    });
    setOpenTicketList(openResult);
    setClosedTicketList(closedResult);
    setTicketsLoaded(true);
  }

  useEffect(() => {
    getTickets();
  }, []);

  const options = {
    selectableRows: "none",
  };

  function refresh() {
    getTickets();
  }

  const openColumns = [
    {
      name: "Title",
      options: {
        customBodyRenderLite: (dataIndex) => {
          return (
            <Button
              onClick={() => {
                router.push(
                  `/projects/${openTicketList[dataIndex][6]}/ticket/${openTicketList[dataIndex][7]}`
                );
              }}
              variant="contained"
              color="default"
              style={{ backgroundColor: "#d3d3d3" }}
            >
              {openTicketList[dataIndex][0]}
            </Button>
          );
        },
      },
    },
    "Number",
    "Location",
    "Description",
    "Urgency",
    "Date Created",
  ];
  const closedColumns = [
    {
      name: "Title",
      options: {
        customBodyRenderLite: (dataIndex) => {
          return (
            <Button
              onClick={() => {
                router.push(
                  `/projects/${closedTicketList[dataIndex][6]}/ticket/${closedTicketList[dataIndex][7]}`
                );
              }}
              variant="contained"
              color="default"
              style={{ backgroundColor: "#d3d3d3" }}
            >
              {closedTicketList[dataIndex][0]}
            </Button>
          );
        },
      },
    },
    "Number",
    "Location",
    "Description",
    "Urgency",
    "Date Created",
  ];

  return (
    <div>
      <Button
        variant="contained"
        color="default"
        style={{ marginLeft: "5px", marginBottom: "20px" }}
        onClick={refresh}
      >
        Refresh
      </Button>

      <Tabs>
        <TabList>
          <Tab>Open Tickets</Tab>
          <Tab>Closed Tickets</Tab>
        </TabList>

        <TabPanel>
          {ticketsLoaded ? (
            <MUIDataTable
              title={"My Tickets"}
              data={openTicketList}
              columns={openColumns}
              options={options}
            />
          ) : (
            <h1>Loading...</h1>
          )}
        </TabPanel>
        <TabPanel>
          {ticketsLoaded ? (
            <MUIDataTable
              title={"My Tickets"}
              data={closedTicketList}
              columns={closedColumns}
              options={options}
            />
          ) : (
            <h1>Loading...</h1>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default function AllTickets({ user }) {
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    setPageLoaded(true);
  }, []);
  return pageLoaded && <PageTemplate pageContent={pageContent} user={user} />;
}

export async function getServerSideProps(context) {
  return withAuth(context);
}

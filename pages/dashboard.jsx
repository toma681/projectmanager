import PageTemplate from "../Components/PageTemplate.jsx";
import { customAuthMakeUser } from "../Components/withAuth.jsx";
import { PieChart } from "react-minimal-pie-chart";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { useState, useEffect } from "react";

function pageContent({ user, dashboardTickets }) {
  const [openCount, setOpenCount] = useState(0);
  const [closedCount, setClosedCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [lowCount, setLowCount] = useState(0);
  const [mediumCount, setMediumCount] = useState(0);
  const [highCount, setHighCount] = useState(0);
  const [veryHighCount, setVeryHighCount] = useState(0);
  const [foundNoTickets, setFoundNoTickets] = useState(false);

  function formatTicketData(data) {
    let curOpenCount = 0;
    let curClosedCount = 0;
    let curLowCount = 0;
    let curMediumCount = 0;
    let curHighCount = 0;
    let curVeryHighCount = 0;

    data.forEach((tick) => {
      switch (tick.status) {
        case "Open":
          switch (tick.urgency) {
            case "Low":
              curLowCount++;
              break;
            case "Medium":
              curMediumCount++;
              break;
            case "High":
              curHighCount++;
              break;
            case "Very High":
              curVeryHighCount++;
              break;
          }
          curOpenCount++;
          break;
        case "Closed":
          curClosedCount++;
          break;
      }
    });

    if (curOpenCount + curClosedCount === 0) {
      // No Tickets Found
      setFoundNoTickets(true);
    } else {
      setOpenCount(curOpenCount);
      setClosedCount(curClosedCount);
      setLowCount(curLowCount);
      setMediumCount(curMediumCount);
      setHighCount(curHighCount);
      setVeryHighCount(curVeryHighCount);
    }
    setLoaded(true);
  }

  useEffect(() => {
    formatTicketData(dashboardTickets);
  }, []);

  const defaultLabelStyle = {
    fontSize: "5px",
    fontFamily: "sans-serif",
  };
  return loaded ? (
    <>
      <h1 style={{ marginTop: "0", textAlign: "center", marginBottom: "40px" }}>Welcome {user.name}</h1>
      <Grid
        container
        spacing={8}
        justify="center"
        alignItems="center"
        style={{ width: "100%", marginLeft: "0" }}
      >
        <Grid item sm={5}>
          <Paper>
            {!foundNoTickets ? (
              <PieChart
                animate
                segmentsShift
                label={(labelRenderProps) => {
                  return (
                    labelRenderProps.dataEntry.value !== 0 &&
                    `${labelRenderProps.dataEntry.title}: ${labelRenderProps.dataEntry.value}`
                  );
                }}
                labelStyle={{
                  ...defaultLabelStyle,
                }}
                radius={47}
                data={[
                  { title: "Open", value: openCount, color: "#fbd46d" },
                  { title: "Closed", value: closedCount, color: "#e0dede" },
                ]}
              />
            ) : (
              <PieChart
                animate
                segmentsShift
                label={(labelRenderProps) => {
                  return "No Tickets Found";
                }}
                labelStyle={{
                  ...defaultLabelStyle,
                }}
                radius={47}
                data={[{ title: "None", value: 1, color: "#fbd46d" }]}
              />
            )}
            <div
              style={{
                textAlign: "center",
                paddingBottom: "3px",
                backgroundColor: "#cdc9c3",
                paddingTop: "3px",
              }}
            >
              <h1>Tickets by Status</h1>
            </div>
          </Paper>
        </Grid>
        <Grid item sm={5}>
          <Paper>
            {!foundNoTickets ? (
              <PieChart
                animate
                segmentsShift
                radius={47}
                data={[
                  {
                    title: "Very High",
                    value: veryHighCount,
                    color: "#C13C37",
                  },
                  { title: "High", value: highCount, color: "#BD4C17" },
                  { title: "Medium", value: mediumCount, color: "#f0a500" },
                  { title: "Low", value: lowCount, color: "#81b214" },
                ]}
                label={(labelRenderProps) => {
                  return (
                    labelRenderProps.dataEntry.value !== 0 &&
                    `${labelRenderProps.dataEntry.title}: ${labelRenderProps.dataEntry.value}`
                  );
                }}
                labelStyle={{
                  ...defaultLabelStyle,
                }}
              />
            ) : (
              <PieChart
                animate
                segmentsShift
                label={(labelRenderProps) => {
                  return "No Tickets Found";
                }}
                labelStyle={{
                  ...defaultLabelStyle,
                }}
                radius={47}
                data={[{ title: "None", value: 1, color: "#fbd46d" }]}
              />
            )}
            <div
              style={{
                textAlign: "center",
                paddingBottom: "3px",
                backgroundColor: "#cdc9c3",
                paddingTop: "3px",
              }}
            >
              <h1>Open Tickets by Urgency</h1>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </>
  ) : (
    <h1>Loading...</h1>
  );
}

export default function Dashboard({ user, ticketList }) {
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    setPageLoaded(true);
  }, []);
  return (
    pageLoaded && (
      <PageTemplate
        pageContent={pageContent}
        user={user}
        dashboardTickets={ticketList}
      />
    )
  );
}

export async function getServerSideProps(context) {
  const oldProps = await customAuthMakeUser(context);
  return {
    ...oldProps,
  };
}

import withAuth from "../../Components/withAuth.jsx";
import PageTemplate from "../../Components/PageTemplate.jsx";
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import Button from "@material-ui/core/Button";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import trimCharacters from "trim-characters";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import io from "socket.io-client";

function pageContent({ user }) {
  const [projectObj, setProjectObj] = useState();
  const [projectLoaded, setProjectLoaded] = useState(false);

  const [ticketsLoaded, setTicketsLoaded] = useState(false);

  const [noProjectFound, setNoProjectFound] = useState(false);

  const [openTickets, setOpenTickets] = useState([]);
  const [closedTickets, setClosedTickets] = useState([]);

  const [admins, setAdmins] = useState([]);
  const [adminsIDs, setAdminsID] = useState([]);

  const [members, setMembers] = useState([]);
  const [membersIDs, setMembersID] = useState([]);

  const [allUsers, setAllUsers] = useState([]);

  const [chatVisible, setChatVisible] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);

  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();

  const socketRef = useRef();

  const grabProject = async () => {
    await fetch(
      `/api/projects?options=getprojectbyid&projectid=${router.query.projectID}`
    )
      .then((response) => response.json())
      .then((data) => {
        socketRef.current = io("https://trackerchat.herokuapp.com/");
        if (typeof data.description === "undefined") {
          setNoProjectFound(true);
        } else {
          setProjectObj(data);
          setAdmins(data.admins);
          setAdminsID(data.adminIDs);
          setMembers(data.users);
          setMembersID(data.userIDs);
          combineUsers(data.admins, data.adminIDs, data.users, data.userIDs);
          setProjectLoaded(true);

          socketRef.current.on("receivePrevMessages", (prevMessages) => {
            setChatMessages(prevMessages);
          });

          socketRef.current.emit("joinRoom", data._id);
        }
      });
  };

  function combineUsers(adminList, adminIDList, userList, userIDList) {
    let result = [];
    adminList.forEach((cur, index) => {
      if (user.sub === adminIDList[index]) {
        setIsAdmin(true); //Make urself an admin in the state
      }
      result.push([cur, adminIDList[index], "Admin"]);
    });
    userList.forEach((cur, index) => {
      result.push([cur, userIDList[index], "Member"]);
    });
    setAllUsers(result);
  }

  const grabTickets = async () => {
    await fetch(
      `/api/tickets?options=getprojecttickets&projectid=${router.query.projectID}`
    )
      .then((response) => response.json())
      .then((data) => {
        formatTickets(data);
      });
  };

  useEffect(() => {
    grabProject().then(() => {
      grabTickets();
      socketRef.current.on("receiveMessage", (msg) => {
        setChatMessages((prev) => {
          return [...prev, msg];
        });
        let scrollDiv = document.querySelector(".scrollDiv");
        if (scrollDiv) {
          scrollDiv.scrollTop = scrollDiv.scrollHeight;
        }
      });
    });

    return () => {
      socketRef.current.close();
    };
  }, []);

  const openTicketColumns = [
    {
      name: "Title",
      options: {
        customBodyRenderLite: (dataIndex) => {
          return (
            <Button
              onClick={() => {
                router.push(
                  `/projects/${router.query.projectID}/ticket/${openTickets[dataIndex][6]}`
                );
              }}
              variant="contained"
              color="default"
              style={{ backgroundColor: "#d3d3d3" }}
            >
              {openTickets[dataIndex][0]}
            </Button>
          );
        },
      },
    },
    "Number",
    "Description",
    "Urgency",
    "Date",
    "Submitter",
  ];

  const closedTicketColumns = [
    {
      name: "Title",
      options: {
        customBodyRenderLite: (dataIndex) => {
          return (
            <Button
              onClick={() => {
                router.push(
                  `/projects/${router.query.projectID}/ticket/${closedTickets[dataIndex][6]}`
                );
              }}
              variant="contained"
              color="default"
              style={{ backgroundColor: "#d3d3d3" }}
            >
              {closedTickets[dataIndex][0]}
            </Button>
          );
        },
      },
    },
    "Number",
    "Description",
    "Urgency",
    "Date",
    "Submitter",
  ];

  let adminColumns = [
    "Name",
    "ID",
    "Role",
    {
      name: "Delete User",
      options: {
        customBodyRenderLite: (dataIndex) => {
          return (
            <IconButton
              value={
                dataIndex < admins.length
                  ? adminsIDs[dataIndex]
                  : membersIDs[dataIndex - admins.length]
              }
              onClick={handleDel}
            >
              <DeleteIcon />
            </IconButton>
          );
        },
      },
    },
  ];

  let memberColumns = ["Name", "ID", "Role"];

  async function handleDel(e) {
    let myID = e.currentTarget.value;

    let role = "member";

    let position = membersIDs.findIndex((id) => myID === id);

    if (position === -1) {
      position = adminsIDs.findIndex((id) => myID === id);
      role = "admin";
    }

    if (role === "member") {
      membersIDs.splice(position, 1);
      members.splice(position, 1);
    } else {
      adminsIDs.splice(position, 1);
      admins.splice(position, 1);
    }

    const pData = {
      ...projectObj,
      admins,
      adminsIDs,
      users: members,
      userIDs: membersIDs,
      myID,
    };

    const ops = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pData),
    };

    await fetch("/api/projects?options=delUser", ops);

    grabProject();
  }

  const options = {
    selectableRows: "none",
  };

  function formatTickets(data) {
    let openResult = [];
    let closedResult = [];
    data.forEach((tick) => {
      if (tick.status === "Open") {
        openResult.push([
          tick.title,
          tick.ticketID,
          trimCharacters(tick.description, 25, true, "..."),
          tick.urgency,
          tick.timeStamp,
          tick.submitterID,
          tick._id,
        ]);
      } else {
        closedResult.push([
          tick.title,
          tick.ticketID,
          trimCharacters(tick.description, 25, true, "..."),
          tick.urgency,
          tick.timeStamp,
          tick.submitterID,
          tick._id,
        ]);
      }
    });
    setOpenTickets(openResult);
    setClosedTickets(closedResult);
    setTicketsLoaded(true);
  }

  function handleSendMessage(e) {
    e.preventDefault();

    let inputElement = document.querySelector("#chatmessagebox");
    const val = inputElement.value;

    socketRef.current.emit("sendMessage", {
      name: user.name,
      msg: val,
      projectID: router.query.projectID,
    });

    inputElement.value = "";
  }

  return !noProjectFound ? (
    <div>
      {projectLoaded ? (
        <>
          <Grid container>
            <Grid item style={{ height: "40px", marginBottom: "20px" }}>
              <h1 style={{ marginTop: "0px" }}>
                Project: {projectObj.projectName}
              </h1>
            </Grid>
            <Grid item style={{ marginBottom: "20px" }}>
              <Button
                onClick={() =>
                  router.push(
                    `/projects/${router.query.projectID}/ticketbuilder`
                  )
                }
                variant="contained"
                style={{ marginLeft: "20px", marginRight: "5px" }}
              >
                New Ticket
              </Button>
              <Button
                onClick={() => {
                  grabProject();
                  grabTickets();
                }}
                variant="contained"
              >
                Refresh
              </Button>
            </Grid>
          </Grid>

          <Tabs>
            <TabList>
              <Tab>Details</Tab>
              <Tab>Open Tickets</Tab>
              <Tab>Closed Tickets</Tab>
              <Tab>Members</Tab>
            </TabList>

            <TabPanel>
              <Grid container>
                <Grid item container sm={12}>
                  <Paper>
                    <h3
                      style={{
                        marginLeft: "20px",
                        paddingTop: "5px",
                        paddingRight: "20px",
                      }}
                    >
                      Description
                    </h3>
                    <h5
                      style={{
                        marginLeft: "30px",
                        marginTop: "-10px",
                        paddingRight: "20px",
                      }}
                    >
                      {projectObj.description}
                    </h5>
                    <h3
                      style={{
                        marginLeft: "20px",
                        paddingTop: "10px",
                        paddingRight: "20px",
                      }}
                    >
                      Date Created
                    </h3>
                    <h5
                      style={{
                        marginLeft: "30px",
                        marginTop: "-10px",
                        paddingBottom: "10px",
                        paddingRight: "20px",
                      }}
                    >
                      {projectObj.dateCreated}
                    </h5>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel>
              {ticketsLoaded ? (
                <MUIDataTable
                  title={"Open Tickets"}
                  data={openTickets}
                  columns={openTicketColumns}
                  options={options}
                />
              ) : (
                <h1>Loading...</h1>
              )}
            </TabPanel>
            <TabPanel>
              {ticketsLoaded ? (
                <MUIDataTable
                  title={"Closed Tickets"}
                  data={closedTickets}
                  columns={closedTicketColumns}
                  options={options}
                />
              ) : (
                <h1>Loading...</h1>
              )}
            </TabPanel>
            <TabPanel>
              <Button
                variant="contained"
                style={{ backgroundColor: "#D3D3D3", marginBottom: "12px" }}
                onClick={() => {
                  router.push(`/projects/${router.query.projectID}/adduser`);
                }}
              >
                Add Member
              </Button>

              {isAdmin ? (
                <>
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: "#D3D3D3",
                      marginBottom: "12px",
                      marginLeft: "5px",
                    }}
                    onClick={() => {
                      router.push(`/projects/${router.query.projectID}/roles`);
                    }}
                  >
                    Manage Roles
                  </Button>
                  <MUIDataTable
                    title={"Members"}
                    data={allUsers}
                    columns={adminColumns}
                    options={options}
                  />
                </>
              ) : (
                <>
                  <MUIDataTable
                    title={"Members"}
                    data={allUsers}
                    columns={memberColumns}
                    options={options}
                  />
                </>
              )}
            </TabPanel>
          </Tabs>

          <div
            style={{
              position: "fixed",
              zIndex: "10000",
              top: "80px",
              right: "20px",
            }}
          >
            <Button
              variant="contained"
              style={{
                borderRadius: "20px",
                backgroundColor: "#5695FF",
                color: "white",
                position: "relative",
              }}
              onClick={() => {
                setChatVisible((prev) => {
                  return !prev;
                });
                setTimeout(() => {
                  if (!chatVisible) {
                    let scrollDiv = document.querySelector(".scrollDiv");
                      scrollDiv.scrollTop = scrollDiv.scrollHeight;
                  }
                }, 0);
              }}
            >
              Live Team Chat
            </Button>
          </div>
          {chatVisible ? (
            <Paper
              className="scrollDiv"
              style={{
                zIndex: "100",
                width: "400px",
                height: "60%",
                position: "fixed",
                right: "20px",
                top: "130px",
                overflowY: "auto",
                overflowWrap: "break-word",
                color: "black",
                fontSize: "18px",
                borderRadius: "40px",
              }}
            >
              <ul>
                {chatMessages.map((cur, index) => {
                  return (
                    <li key={index} style={{ listStyleType: "none" }}>
                      {cur.name}: {cur.msg}
                    </li>
                  );
                })}
              </ul>
              <div>
                <form onSubmit={handleSendMessage}>
                  <input
                    id="chatmessagebox"
                    style={{ position: "fixed", bottom: "0" }}
                  ></input>
                </form>
              </div>
            </Paper>
          ) : null}
        </>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  ) : (
    <h1>Error: No Project Found!</h1>
  );
}

export default function ViewProject({ user }) {
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    setPageLoaded(true);
  }, []);
  return pageLoaded && <PageTemplate pageContent={pageContent} user={user} />;
}

export async function getServerSideProps(context) {
  return withAuth(context);
}

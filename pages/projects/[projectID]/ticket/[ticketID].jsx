import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import withAuth from "../../../../Components/withAuth.jsx";
import PageTemplate from "../../../../Components/PageTemplate.jsx";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import TextField from "@material-ui/core/TextField";
import MUIDataTable from "mui-datatables";

function pageContent({ user, dashboardTickets }) {
  const [ticketObject, setTicketObject] = useState({});
  const [ticketLoaded, setTicketLoaded] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentsUserWhoPosted, setCommentsUserWhoPosted] = useState([]);
  const [status, setStatus] = useState();
  const [noTicketFound, setNoTicketFound] = useState(false);
  const Router = useRouter();

  async function grabTicket() {
    await fetch(
      `/api/tickets?options=ticketbyid&ticketid=${Router.query.ticketID}`
    ).then((response) => {
      response.json().then((data) => {
        if (typeof data.description === "undefined") {
          setNoTicketFound(true);
        } else {
          setTicketObject(data);
          formatCommentData(data.comments, data.commentsUserWhoPosted);
          setStatus(data.status);
          setTicketLoaded(true);
        }
      });
    });
  }

  function formatCommentData(comments, whoPosted) {
    let commentResult = [];

    comments.forEach((cur, index) => {
      commentResult.push([whoPosted[index], cur]);
    });

    setCommentsList(commentResult);
    setCommentsUserWhoPosted(whoPosted);
    setComments(comments);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    let commentBoxElement = document.querySelector("#commentBox");

    const data = {
      comments: [...comments, commentBoxElement.value],
      commentsUserWhoPosted: [...commentsUserWhoPosted, user.name],
      _id: Router.query.ticketID,
    };

    setCommentsList((prev) => {
      return [...prev, [user.name, commentBoxElement.value]];
    });

    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    commentBoxElement.value = "";

    await fetch("/api/tickets", options);
  }

  function changeStatus() {
    let options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: {},
    };

    if (status === "Closed") {
      setStatus("Open");
      options.body = JSON.stringify({
        ...ticketObject,
        status: "Open",
      });
    } else {
      setStatus("Closed");
      options.body = JSON.stringify({
        ...ticketObject,
        status: "Closed",
      });
    }
    fetch("/api/tickets", options);
  }

  const columns = ["Name", "Comment"];

  const options = {
    selectableRows: "none",
    rowsPerPageOptions: [3, 5],
    rowsPerPage: 5,
  };

  useEffect(() => {
    grabTicket();
  }, []);

  return !noTicketFound ? (
    <div>
      {ticketLoaded ? (
        <>
          <h1 style={{ marginTop: "0" }}>
            Ticket: {ticketObject.title}
            <Button
              variant="contained"
              onClick={changeStatus}
              style={{ marginLeft: "20px", backgroundColor: "#D3D3D3" }}
            >
              {status === "Closed" ? "Re-Open Ticket" : "Close Ticket"}
            </Button>
          </h1>
          <Tabs>
            <TabList>
              <Tab>Details</Tab>
              <Tab>Comments</Tab>
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
                      {ticketObject.description}
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
                      {ticketObject.timeStamp}
                    </h5>
                    <h3
                      style={{
                        marginLeft: "20px",
                        paddingRight: "20px",
                      }}
                    >
                      Status:&nbsp;
                      <span
                        style={
                          status === "Open"
                            ? { color: "red" }
                            : { color: "green" }
                        }
                      >
                        {status}
                      </span>
                    </h3>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel>
              <MUIDataTable
                title={"My Projects"}
                data={commentsList}
                columns={columns}
                options={options}
              />
              <form onSubmit={handleSubmit}>
                <TextField
                  variant="outlined"
                  label="Enter Comment"
                  multiline
                  rows={4}
                  style={{
                    width: "50%",
                    marginTop: "20px",
                    marginRight: "10px",
                  }}
                  id="commentBox"
                />

                <Button
                  type="submit"
                  variant="contained"
                  style={{ marginTop: "10px", display: "block" }}
                >
                  Submit
                </Button>
              </form>
            </TabPanel>
          </Tabs>
        </>
      ) : (
        <h1>"Loading..."</h1>
      )}
    </div>
  ) : (
    <h1>Error: No Ticket Found!</h1>
  );
}

export default function ViewTicket({ user }) {
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    setPageLoaded(true);
  }, []);
  return pageLoaded && (<PageTemplate pageContent={pageContent} user={user} />) 

}

export async function getServerSideProps(context) {
  return withAuth(context);
}

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useRouter } from "next/router";
import { useState } from "react";
import Grid from "@material-ui/core/Grid";
import Carousel from "react-material-ui-carousel";
import styles from "./landingcss.module.css";

export default function LandingPage({ user }) {
  const classes = useStyles();
  const router = useRouter();
  const [color, setColor] = useState("#6B6DFF");

  function Item(props) {
    return (
      <div>
        <h2
          style={{
            marginLeft: "20px",
            marginRight: "20px",
            paddingTop: "20px",
          }}
        >
          {props.item.name}
        </h2>
        <p
          style={{
            marginLeft: "20px",
            marginRight: "20px",
            paddingBottom: "20px",
          }}
        >
          {props.item.description}
        </p>
      </div>
    );
  }

  function handleLogs() {
    if (user) {
      router.push("/api/logout");
    } else {
      router.push("/api/login");
    }
  }

  function getStarted() {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/api/login");
    }
  }
  const items = [
    {
      name: "Ticketing",
      description: "Submit Tickets to Squash Bugs and Improve Productivity",
      // color: "#C9A27E",
    },
    {
      name: "Communication",
      description:
        "Communicate with Team Members through Real-Time Chat and Comments",
      // color: "#CE7E78",
    },
    {
      name: "Management",
      description: "Manage Your Team and Keep Them Updated",
      // color: "#7D85B1",
    },
  ];

  return (
    <div style={{ height: "100vh" }}>
      <div className={classes.root}>
        <AppBar position="static" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={`${classes.title} ${styles.logo}`}>
              Issue & Project Management
            </Typography>
            <Button
              color="inherit"
              variant="contained"
              style={{ backgroundColor: "#6B6DFF" }}
              onClick={handleLogs}
            >
              {user ? "Logout" : "Login"}
            </Button>
          </Toolbar>
        </AppBar>
      </div>

      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        style={{ width: "100%", height: "90%" }}
      >
        <Grid
          item
          style={{ height: "50px", marginTop: "-100px", marginBottom: "110px" }}
        >
          <h1 style={{ fontSize: "3em"}}>Manage Your Team's Project Today!</h1>
        </Grid>
        <Grid item>
          <Carousel>
            {items.map((item, i) => (
              <Item key={i} item={item} />
            ))}
          </Carousel>
        </Grid>
        <Grid item style={{ width: "30%", height: "50px", marginTop: "100px" }}>
          <Button
            onMouseEnter={() => setColor("#8082FC")}
            onMouseLeave={() => setColor("#6B6DFF")}
            variant="contained"
            style={{
              backgroundColor: color,
              borderRadius: "50px",
              width: "100%",
              height: "100%",
              fontSize: "1.2em"
            }}
            onClick={getStarted}
          >
            Get Started
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: "#14274e",
  },
}));

import PageTemplate from "../../../Components/PageTemplate.jsx";
import withAuth from "../../../Components/withAuth.jsx";
import { useRouter } from "next/router";
import Button from "@material-ui/core/Button";
import { useState, useEffect } from "react";
import NativeSelect from "@material-ui/core/NativeSelect";
import MUIDataTable from "mui-datatables";
import CheckIcon from "@material-ui/icons/Check";

function pageContent() {
  const [projectObj, setProjectObj] = useState();
  const [projectLoaded, setProjectLoaded] = useState(false);

  const [noProjectFound, setNoProjectFound] = useState(false);

  const [membersLoaded, setMembersLoaded] = useState(false);

  const [admins, setAdmins] = useState([]);
  const [adminsIDs, setAdminsID] = useState([]);

  const [members, setMembers] = useState([]);
  const [membersIDs, setMembersID] = useState([]);

  const [allUsers, setAllUsers] = useState([]);

  const router = useRouter();

  function grabProject() {
    fetch(
      `/api/projects?options=getprojectbyid&projectid=${router.query.projectID}`
    )
      .then((response) => response.json())
      .then((data) => {
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
        }
      });
  }

  function combineUsers(adminList, adminIDList, userList, userIDList) {
    let result = [];
    adminList.forEach((cur, index) => {
      result.push([cur, adminIDList[index]]);
    });
    userList.forEach((cur, index) => {
      result.push([cur, userIDList[index]]);
    });
    setAllUsers(result);
    setMembersLoaded(true);
  }

  useEffect(() => {
    grabProject();
  }, []);

  function handleRoleChange(e) {
    const myID = e.target.name;
    let myName = "";
    const val = e.target.value;
    if (val === "Member") {
      adminsIDs.forEach((cur, index) => {
        if (cur === myID) {
          adminsIDs.splice(index, 1);
          myName = admins[index];
          admins.splice(index, 1);
          membersIDs.push(myID);
          members.push(myName);
        }
      });
    } else {
      membersIDs.forEach((cur, index) => {
        if (cur === myID) {
          membersIDs.splice(index, 1);
          myName = members[index];
          members.splice(index, 1);
          adminsIDs.push(myID);
          admins.push(myName);
        }
      });
    }
  }

  async function handleSubmitChanges() {
    const pData = {
      ...projectObj,
      admins,
      adminsIDs,
      users: members,
      userIDs: membersIDs,
    };

    const ops = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pData),
    };

    await fetch("/api/projects", ops);
    goBack();
  }

  function goBack() {
    router.push(`/projects/${router.query.projectID}`);
  }

  const memberColumns = [
    "Name",
    "User ID",
    {
      name: "Role",
      options: {
        customBodyRenderLite: (dataIndex) => {
          return (
            <NativeSelect
              defaultValue={dataIndex < admins.length ? "Admin" : "Member"}
              inputProps={{
                name:
                  dataIndex < admins.length
                    ? adminsIDs[dataIndex]
                    : membersIDs[dataIndex - admins.length],
              }}
              onChange={handleRoleChange}
            >
              <option value={"Admin"}>Admin</option>
              <option value={"Member"}>Member</option>
            </NativeSelect>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: "none",
  };

  return (
    <div>
      <h1 style={{ marginTop: "0", marginBottom: "10px" }}>Role Management</h1>
      <div style={{ marginBottom: "20px" }}>
        <Button
          variant="contained"
          style={{
            backgroundColor: "#5695FF",
            marginRight: "5px",
            color: "white",
          }}
          onClick={handleSubmitChanges}
        >
          <CheckIcon />
          &nbsp; Save
        </Button>
        <Button variant="outlined" color="secondary" onClick={goBack}>
          Cancel
        </Button>
      </div>
      {membersLoaded ? (
        <MUIDataTable
          title={"Role Management"}
          data={allUsers}
          columns={memberColumns}
          options={options}
        />
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

export default function Roles({ user }) {
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    setPageLoaded(true);
  }, []);
  return pageLoaded && <PageTemplate pageContent={pageContent} user={user} />;
}

export async function getServerSideProps(context) {
  return withAuth(context);
}

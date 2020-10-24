import React, { Component } from "react";
import auth0 from "../utils/auth0";
import { fetchUser } from "../utils/user";
import dbConnect from "../utils/dbConnect";
import user from "../models/users";
import {serverSideTickets} from "../pages/api/tickets";

export async function customAuthMakeUser(ctx) {
  const session = await auth0.getSession(ctx.req);
  let ticketList = null;

  dbConnect();
  const foundUser = await user.findOne({ userID: session?.user.sub }).lean();
  if (!foundUser && session?.user?.sub) {
    user.create({
      projects: [],
      userID: session?.user?.sub,
      name: session?.user?.name,
    });
  }

  if (!session?.user) {
    //Create User the first time one Logs in
    ctx.res.writeHead(302, {
      // Location: createLoginUrl(ctx.req.url)
      Location: "/api/login",
    });
    ctx.res.end();
  } else {
    ticketList = await serverSideTickets(session?.user?.sub);
  }
  // console.log(ticketList);
  return {
    props: {
      user: session?.user || null,
      ticketList: ticketList
    },
  };
}

export default async function customAuth(ctx) {
  const session = await auth0.getSession(ctx.req);
  if (!session?.user) {
    //Create User the first time one Logs in
    ctx.res.writeHead(302, {
      // Location: createLoginUrl(ctx.req.url)
      Location: "/api/login",
    });
    ctx.res.end();
  }
  return {
    props: {
      user: session?.user || null,
    },
  };
}

export function withAuth(InnerComponent) {
  return class Authenticated extends Component {
    static async getInitialProps(ctx) {
      if (!ctx.req) {
        const user = await fetchUser();
        return {
          user,
        };
      }

      const session = await auth0.getSession(ctx.req);
      if (!session || !session.user) {
        ctx.res.writeHead(302, {
          // Location: createLoginUrl(ctx.req.url)
          Location: "/api/login",
        });
        ctx.res.end();
        return;
      }

      return { user: session.user };
    }

    constructor(props) {
      super(props);
    }

    render() {
      return (
        <div>{<InnerComponent {...this.props} user={this.props.user} />}</div>
      );
    }
  };
}

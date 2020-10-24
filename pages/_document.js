import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
          <meta
            name="description"
            content="Issue and Project Management Tracker intended for aiding the construction of small web projects"
          />
          <meta
            name="keywords"
            content="Project, Tracking, software, bugtracker, bug, bugs, ticket, tickets, ticketing"
          />
          <meta name="author" content="Andrew Tom" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

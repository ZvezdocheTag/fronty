import React from "react";
import { Helmet } from "react-helmet";
import get from "lodash.get";
import Layout from "./layout";

const Page = (props) => {
  let title = "fronty";
  const postTitle = get(
    props.data,
    "post.title",
    get(props, "pageContext.frontmatter.title")
  );
  const description =
    get(
      props.data,
      "post.excerpt",
      get(props, "pageContext.frontmatter.excerpt")
    ) || "The writing of Vitaly Yastremsky";

  if (postTitle) {
    title = `${postTitle} | ${title}`;
  }

  return (
    <>
      <Helmet
        htmlAttributes={{
          lang: "en-us",
        }}
      >
        <link
          rel="icon"
          type="image/png"
          href="https://fronty.ru/favicon.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          href="https://fronty.ru/avatar.png"
        />
        <link rel="canonical" href={props.location.href} />
        <meta name="twitter:site" content="@fronty" />
        <meta name="og:image" content="https://fronty.ru/avatar.png" />
        <title>{title}</title>
        <meta name="og:title" content={title} />
        <meta name="og:description" content={description} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:creator" content="Vitaly Yastremsky" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <Layout {...props}>{props.children}</Layout>
    </>
  );
};

export const wrapPageElement = ({ element, props }) => (
  <Page {...props}>{element}</Page>
);

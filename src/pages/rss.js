import rss from '@astrojs/rss';
import * as marked from 'marked';

const postImportResult = import.meta.globEager('../notes/**/*.md');
const posts = Object.values(postImportResult);

const postsWithContent = await Promise.all(
  posts.map(async (post) => {
    const rawContent = await post.rawContent();
    let html = marked.parse(rawContent);

    return {
      ...post,
      htmlContent: html,
    };
  })
);

postsWithContent.sort((a, b) => {
  return new Date(b.frontmatter.added) - new Date(a.frontmatter.added);
});

export const get = () =>
  rss({
    title: "Rach Smith's digital garden",
    description:
      "Hi 👋🏼 I'm Rach. A developer building software for CodePen, wife, mother of two, productivity nerd and recovering screen addict. This is my digital garden.",
    site: import.meta.env.SITE,
    items: postsWithContent.map((post, i) => {
      const categoryTags = post.frontmatter.tags
        .map((tag) => `<category><![CDATA[${tag}]]></category>`)
        .join('');
      return {
        link: post.frontmatter.slug,
        title: post.frontmatter.title,
        pubDate: post.frontmatter.added,
        description: post.htmlContent,
        customData: categoryTags,
      };
    }),
    // customData: `<atom:link href="https://rachsmith.com/rss/" rel="self" type="application/rss+xml" />`,
    xmlns: {
      // atom: 'http://www.w3.org/2005/Atom',
    },
  });

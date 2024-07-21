import { promises as fs } from "fs";
import nunjucks from "nunjucks";
import { fileURLToPath } from "url";
import { dirname, resolve as pathResolve } from "path";
import { copy } from "./lib/fs.mjs";
import { DB } from "./lib/queries.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseDir = pathResolve(__dirname, "../public");

const nunjucksEnv = nunjucks.configure(pathResolve(__dirname, "views"), {
  autoescape: true,
});

const db = new DB();
await db.init(pathResolve(__dirname, "../data.json"));

nunjucksEnv.addFilter("lookup", (id) =>
  db.data.find((x) => x.identifier === id),
);
nunjucksEnv.addGlobal("data", db.data);

const isByCreator = (identifier) => (work) =>
  (work.author && work.author.find((y) => y.identifier === identifier)) ||
  (work.director && work.director.find((y) => y.identifier === identifier)) ||
  (work.illustrator &&
    work.illustrator.find((y) => y.identifier === identifier));

const pages = [
  // MARK: Static
  { url: "about", template: "pages/about.njk", data: {} },
  { url: "contribute", template: "pages/contribute.njk", data: {} },
  { url: "404", template: "pages/404.njk", data: {} },
  {
    url: "",
    template: "pages/index.njk",
    data: {
      genres: db.genres.sort((a, b) => a.name.localeCompare(b.name)),
    },
  },
  // MARK: Abstract
  // Novels
  ...db.works.map((x) => ({
    url: `novel/${x.identifier}`,
    template: "pages/novel.njk",
    data: { novel: x },
  })),
  // MARK: Lists
  // Creators
  {
    url: "creator",
    template: "pages/list.njk",
    data: {
      title: "All creators",
      list: db.creators
        .sort((a, b) => a.name.trim().localeCompare(b.name.trim()))
        .map((creator) => {
          const workCount = db.works.filter(
            isByCreator(creator.identifier),
          ).length;

          return {
            url: `/creator/${creator.identifier}`,
            label: creator.name,
            append: `(${workCount} works)`,
          };
        }),
    },
  },
  // Publishers
  {
    url: "publisher",
    template: "pages/list.njk",
    data: {
      title: "All publishers",
      list: db.publishers
        .sort((a, b) => a.name.trim().localeCompare(b.name.trim()))
        .map((publisher) => {
          const workCount = db.works.filter((x) =>
            x.publisher?.find((p) => p.identifier === publisher.identifier),
          ).length;

          return {
            url: `/publisher/${publisher.identifier}`,
            label: publisher.name,
            append: `(${workCount} works)`,
          };
        }),
    },
  },
  // MARK: Collections
  // Creators
  ...db.creators.map((creator) => {
    const entries = db.works.filter(isByCreator(creator.identifier));

    return {
      url: `creator/${creator.identifier}`,
      template: "pages/collection.njk",
      data: {
        title: `Texts by <strong>${creator.name}</strong>`,
        entries,
      },
    };
  }),
  // Publishers
  ...db.publishers.map((publisher) => {
    const entries = db.works.filter(
      (work) =>
        work.publisher &&
        work.publisher.find((p) => p.identifier === publisher.identifier),
    );

    return {
      url: `publisher/${publisher.identifier}`,
      template: "pages/collection.njk",
      data: {
        title: `Texts published by <strong>${publisher.name}</strong>`,
        entries,
      },
    };
  }),
  // Genres
  ...db.genres.map((genre) => {
    const entries = db.works.filter(
      (work) => work.genre && work.genre.includes(genre.name),
    );

    return {
      url: `genre/${genre.identifier}`,
      template: "pages/collection.njk",
      data: {
        title: `<strong>${genre.name}</strong> texts`,
        entries,
      },
    };
  }),
  // Years
  ...db.works
    .filter((x) => x.datePublished)
    .map((x) => x.datePublished.substr(0, 4))
    .filter((x, i, a) => a.indexOf(x === i))
    .map((year) => {
      const entries = db.works.filter((work) =>
        work.datePublished?.startsWith(year),
      );

      return {
        url: `year/${year}`,
        template: "pages/collection.njk",
        data: {
          title: `Texts from <strong>${year}</strong>`,
          entries,
        },
      };
    }),
  // Tags
  ...db.tags.map((tag) => {
    const entries = db.works.filter((work) =>
      work.keywords?.find((k) => k.identifier === tag.identifier),
    );

    return {
      url: `tag/${tag.identifier}`,
      template: "pages/collection.njk",
      data: {
        title: `Texts tagged <strong>#${tag.name}</strong>`,
        entries,
      },
    };
  }),
  // All entries
  {
    url: "all",
    template: "pages/collection.njk",
    data: {
      title: "All entries",
      entries: db.works.sort((a, b) =>
        a.name.trim().localeCompare(b.name.trim()),
      ),
    },
  },
];

const copies = {
  "../assets/fonts": "fonts",
  "../assets/main.css": "main.css",
  "../assets/main.js": "main.js",
  "../data.json": "data.json",
};

await fs.rm(baseDir, { recursive: true, force: true });

for (const [from, to] of Object.entries(copies)) {
  await copy(pathResolve(__dirname, from), pathResolve(baseDir, to));
}

pages.forEach(async ({ url, template, data }) => {
  const content = nunjucks.render(template, data);

  await fs.mkdir(pathResolve(baseDir, url), { recursive: true });
  await fs.writeFile(pathResolve(baseDir, url, "index.html"), content);
});

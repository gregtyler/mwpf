const fs = require("fs");
const contentful = require("contentful");
const Thing = require("./schema/Thing.js");

const path = process.argv.slice(2)[0] || "./test.json";

function arrayToRefs(arr, type) {
  if (!arr) return undefined;

  return arr.map((item) => new Thing(type, { identifier: item.sys.id }));
}

async function main() {
  const client = contentful.createClient({
    space: process.env.CONTENTFUL_API_SPACE ?? "",
    accessToken: process.env.CONTENTFUL_API_KEY ?? "",
  });

  const allEntries = await client.getEntries({
    limit: 1000,
  });

  let allItems = allEntries.items;

  console.log(`Downloaded items 0–${allEntries.items.length}`);

  if (allEntries.total > 1000) {
    for (let skip = 1000; skip < allEntries.total; skip += 1000) {
      const entries = await client.getEntries({
        limit: 1000,
        skip,
      });

      console.log(`Downloaded items ${skip}–${entries.total - skip}`);

      allItems = [...allItems, ...entries.items];
    }
  }

  const items = allItems
    .map(({ sys, fields }) => {
      const contentType = sys.contentType.sys.id;

      if (contentType === "novel") {
        let type = "CreativeWork";
        if (fields.filmDirector) type = "Movie";
        if (fields.illustrator_2) type = "Book";

        return new Thing(type, {
          identifier: sys.id,
          name: fields.title,
          thumbnailUrl: fields?.coverImage?.fields?.file.url ?? null,
          author: arrayToRefs(fields.author, "Person"),
          genre: fields.genre_2
            ? fields.genre_2.map((g) => g.fields.genre)
            : null,
          publisher: arrayToRefs(fields.publisher, "Organization"),
          provider: arrayToRefs(fields.distributor, "Organization"),
          datePublished: fields.year ? `${fields.year}-01-01` : null,
          keywords: fields.tags
            ? fields.tags.map(
                (t) => new Thing("DefinedTerm", { identifier: t.sys.id }),
              )
            : null,
          comment: fields.notes
            ? new Thing("Comment", { text: fields.notes })
            : null,
          citation: arrayToRefs(fields.relatedTexts_2, "CreativeWork"),
          url: fields.link,
          director: arrayToRefs(fields.filmDirector, "Person"),
          illustrator: arrayToRefs(fields.illustrator_2, "Person"),
        });
      } else if (contentType === "author") {
        return new Thing("Person", {
          identifier: sys.id,
          name: fields.name,
        });
      } else if (contentType === "publisher" || contentType === "distributor") {
        return new Thing("Organization", {
          identifier: sys.id,
          name: fields[contentType],
        });
      } else if (contentType === "tag") {
        return new Thing("DefinedTerm", {
          identifier: sys.id,
          name: fields.tag,
        });
      } else if (contentType === "genre") {
        return new Thing("DefinedTerm", {
          identifier: sys.id,
          name: fields.genre,
          image: fields?.image?.fields?.file.url ?? null,
          inDefinedTermSet: new Thing("DefinedTermSet", {
            identifier: "genre",
          }),
        });
      }
    })
    .filter((x) => !!x);

  fs.writeFileSync(path, JSON.stringify(items));

  console.log("Download complete");
}

main();

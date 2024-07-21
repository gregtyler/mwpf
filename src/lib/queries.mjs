import { promises as fs } from "fs";

const toUnique = (x, i, a) => a.indexOf(x) === i;

export class DB {
  data = [];

  async init(path) {
    this.data = JSON.parse(await fs.readFile(path, "utf-8"));
  }

  #works = [];
  get works() {
    if (!this.#works.length) {
      this.#works = this.data.filter((x) =>
        ["CreativeWork", "Book", "Movie"].includes(x["@type"]),
      );
    }

    return this.#works;
  }

  #creators = [];
  get creators() {
    if (!this.#creators.length) {
      const creatorIds = this.works
        .reduce(
          (ids, w) => [
            ...ids,
            ...(w.author?.map((p) => p.identifier) ?? []),
            ...(w.director?.map((p) => p.identifier) ?? []),
            ...(w.illustrator?.map((p) => p.identifier) ?? []),
          ],
          [],
        )
        .filter(toUnique);

      this.#creators = this.data.filter((x) =>
        creatorIds.includes(x.identifier),
      );
    }

    return this.#creators;
  }

  #publishers = [];
  get publishers() {
    if (!this.#publishers.length) {
      const publisherIds = this.works
        .reduce(
          (ids, w) => [
            ...ids,
            ...(w.publisher?.map((p) => p.identifier) ?? []),
          ],
          [],
        )
        .filter(toUnique);

      this.#publishers = this.data.filter((x) =>
        publisherIds.includes(x.identifier),
      );
    }

    return this.#publishers;
  }

  #genres = [];
  get genres() {
    if (!this.#genres.length) {
      this.#genres = this.data.filter(
        (entry) =>
          entry["@type"] === "DefinedTerm" &&
          entry.inDefinedTermSet &&
          entry.inDefinedTermSet.identifier === "genre",
      );
    }

    return this.#genres;
  }

  #tags = [];
  get tags() {
    if (!this.#tags.length) {
      this.#tags = this.data.filter(
        (entry) => entry["@type"] === "DefinedTerm" && !entry.inDefinedTermSet,
      );
    }

    return this.#tags;
  }
}

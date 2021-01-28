# Muslim Women's Popular Fiction database

Created to support the [Muslim Women's Popular Fiction][module] module run at the University of Birmingham.

The database is managed in [Contentful], transformed into [Schema.org] models and then served through a custom JavaScript frontend.

To run locally, run `make sync` to download the database and transform it into a JSON file. Then `make up` to serve the application. There's no compilation or build step.

## Technical decisions

I used the [Schema.org] architecture because I _love_ structured data and I'm doing other stuff with it elsewhere. It also means the frontend application uses a consistent data structure: any changes to the Contentful model just need to be handled by the transformer.

I didn't use a JavaScript frontend because I didn't need to, and the bespoke version is much smaller than anything a frontend framework would spit out. To keep it feasible I'm also using quite a lot of modern language features, which comes at the cost of older browser support.

I used GitHub Actions because they're easy to set up when the repo's already here, but it's just an rsync job so the task runner is pretty inconsequential.

[contentful]: https://www.contentful.com/
[module]: https://www.birmingham.ac.uk/postgraduate/courses/taught/english/english-literature-optional-modules.aspx#uob-expandable-area-19
[schema.org]: https://schema.org/

const notes = [
  {
    id: 'note-1',
    tag: 'SQL',
    title: 'Window functions changed how I read data',
    text: 'ROW_NUMBER(), LAG(), and RANK() let you look across rows without collapsing them like GROUP BY does. Once you understand PARTITION BY, you will never write a correlated subquery for running totals again.',
    body: [
      { type: 'p', text: 'Before I learned window functions, I was writing correlated subqueries to do things like "get the previous row\'s value" or "rank results within a group". They worked, but they were slow and hard to read.' },
      { type: 'h3', text: 'What makes them different' },
      { type: 'p', text: 'Unlike GROUP BY, window functions do not collapse rows. They calculate across a set of rows related to the current row — and return a value for every single row. That is the key insight.' },
      { type: 'h3', text: 'The ones I use most' },
      { type: 'p', text: 'ROW_NUMBER() OVER (PARTITION BY region ORDER BY date DESC) — gives each row a rank within its partition. LAG(column, 1) OVER (ORDER BY date) — pulls the value from the previous row. SUM(sales) OVER (PARTITION BY region) — running total without collapsing.' },
      { type: 'h3', text: 'When to use them' },
      { type: 'p', text: 'Any time you need to compare a row to another row in the same dataset — previous period, next event, cumulative total, rank within category — reach for a window function first. They are almost always faster and cleaner than the subquery alternative.' },
    ],
  },
  {
    id: 'note-2',
    tag: 'Power BI',
    title: 'Your DAX measure is not wrong — your filter context is',
    text: 'Most DAX bugs are not bugs. CALCULATE() rewrites the filter context — understanding that one function explains 80% of confusing measure behaviour. When a number looks wrong, check what slicers and visuals are silently filtering before touching the formula.',
    body: [
      { type: 'p', text: 'I spent an embarrassing amount of time early on rewriting DAX measures that were actually correct. The issue was never the formula — it was that I did not understand what filters were being applied around it.' },
      { type: 'h3', text: 'What filter context actually means' },
      { type: 'p', text: 'Every DAX measure evaluates inside a filter context — a set of filters that come from slicers, row context in tables, visual filters, and page-level filters. The same measure can return completely different results depending on where it is placed.' },
      { type: 'h3', text: 'CALCULATE() is the key' },
      { type: 'p', text: 'CALCULATE(expression, filter1, filter2) is the one function that lets you modify the filter context. It evaluates the expression after applying your filters. Once you understand that it rewrites context rather than adding to it, most DAX confusion disappears.' },
      { type: 'h3', text: 'Debugging approach' },
      { type: 'p', text: 'When a measure looks wrong, open the Performance Analyser and check which filters are active. Use ALLEXCEPT() to explicitly control which filters you want to keep. Nine times out of ten, the measure is fine — the context just was not what you expected.' },
    ],
  },
  {
    id: 'note-3',
    tag: 'Python',
    title: 'Pandas is just SQL you can read line by line',
    text: 'df.groupby().agg() is GROUP BY. df.merge() is JOIN. df[df[\'value\'] > 0] is WHERE. Once you map the concepts across, the learning curve disappears. The real advantage is that you can inspect each transformation step before running the next.',
    body: [
      { type: 'p', text: 'The biggest barrier to learning Pandas for SQL people is that it looks completely different. It is not. Every core operation maps directly to something you already know.' },
      { type: 'h3', text: 'The mental model' },
      { type: 'p', text: 'A DataFrame is a table. df[df["status"] == "active"] is a WHERE clause. df.groupby("region").agg({"sales": "sum"}) is GROUP BY region with SUM(sales). df.merge(other, on="id", how="left") is a LEFT JOIN. df.sort_values("date", ascending=False) is ORDER BY date DESC.' },
      { type: 'h3', text: 'Where Pandas wins over SQL' },
      { type: 'p', text: 'You can inspect your data at every step. Run one transformation, print the shape, check it looks right, move on. In SQL you either run the whole query or nothing. That step-by-step debuggability is what makes Pandas so powerful for exploratory analysis.' },
      { type: 'h3', text: 'Where SQL still wins' },
      { type: 'p', text: 'For anything that lives in a database — joins across millions of rows, production pipelines, shared queries — SQL is still faster and more readable to non-coders. Use Pandas for analysis and automation, SQL for anything that needs to run reliably at scale.' },
    ],
  },
  {
    id: 'note-4',
    tag: 'Data Modelling',
    title: 'Star schema: one fact table, many dimensions — do not overthink it',
    text: 'A fact table holds measurements — sales, events, records. Dimension tables hold context — dates, customers, products. Keep your joins simple and avoid snowflaking unless storage is genuinely a constraint.',
    body: [
      { type: 'p', text: 'When I first started building data models, I tried to normalise everything because that is what database courses teach. It made the SQL harder, the DAX harder, and the Power BI model slower. A star schema fixed all three.' },
      { type: 'h3', text: 'The two table types' },
      { type: 'p', text: 'Fact tables hold the things you measure — a row per transaction, event, or record. They are wide, they are long, and they contain foreign keys. Dimension tables hold the context — a row per customer, product, or date. They are smaller and change less frequently.' },
      { type: 'h3', text: 'Why it makes everything easier' },
      { type: 'p', text: 'Every join goes from the fact table outward to a dimension. One hop. No chaining through three tables to get a customer name. In Power BI this means relationships are always one-to-many and DAX filter propagation works exactly as expected.' },
      { type: 'h3', text: 'The snowflake trap' },
      { type: 'p', text: 'Snowflaking — normalising your dimensions further into sub-dimensions — adds joins without adding real value in analytics. Unless you are genuinely constrained on storage (rare in modern cloud DWs), keep dimensions flat. The query performance and readability gains are worth the repeated data.' },
    ],
  },
]

export default notes

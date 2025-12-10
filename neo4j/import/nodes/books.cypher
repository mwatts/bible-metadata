WITH "https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json/books.json" AS url
CALL apoc.load.json(url) YIELD value
MERGE (t:Testament{ title:value.fields.testament })
MERGE (d:Division{ title:value.fields.bookDiv })
MERGE (b:Book{ id:value.id })
SET b.osisRef = value.fields.osisName
SET b.bookOrder = value.fields.bookOrder
SET b.shortName = value.fields.shortName
SET b.slug = value.fields.slug
SET b.title = value.fields.bookName

MERGE (t)-[:CONTAINS]-(d)
MERGE (t)-[:CONTAINS]-(b)
MERGE (d)-[:CONTAINS]-(b)
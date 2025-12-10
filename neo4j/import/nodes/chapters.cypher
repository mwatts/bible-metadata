WITH "https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json/chapters.json" AS url
CALL apoc.load.json(url) YIELD value
MERGE (c:Chapter{ id:value.id })
SET c.osisRef = value.fields.osisRef
SET c.chapterNum = value.fields.chapterNum
SET c.slug = value.fields.slug
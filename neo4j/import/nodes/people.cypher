CALL apoc.periodic.iterate("
  WITH 'https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json/people.json' AS url
  CALL apoc.load.json(url) YIELD value RETURN value
", "
  MERGE (p:Person{ id:value.id })
  SET p.personId = value.fields.personID
  SET p.name = value.fields.name
  SET p.alsoCalled = value.fields.alsoCalled
  SET p.title = value.fields.displayTitle
  SET p.slug = value.fields.slug
  SET p.gender = value.fields.gender
  SET p.description = value.fields.dictionaryText
  SET p.status = value.fields.status
  SET p.birthYear = value.fields.birthYear
  SET p.deathYear = value.fields.deathYear
", {batchSize: 1000, iterateList: true, parallel: false});

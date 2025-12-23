CALL apoc.periodic.iterate("
  WITH 'https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json/periods.json' AS url
  CALL apoc.load.json(url) YIELD value RETURN value
", "
  MERGE (y:Year{ id:value.id })
  SET y.year = value.fields.yearNum
  SET y.formattedYear = value.fields.formattedYear
  SET y.isoYear = value.fields.isoYear
", {batchSize: 1000, iterateList: true, parallel: false});

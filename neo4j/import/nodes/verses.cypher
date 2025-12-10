CALL apoc.periodic.iterate("
  WITH 'https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json/verses.json' AS url
  CALL apoc.load.json(url) YIELD value RETURN value
", "
  MERGE (v:Verse{ id:value.id })
  SET v.osisRef = value.fields.osisRef
  SET v.verseNum = value.fields.verseNum
  SET v.verseId = value.fields.verseID
  SET v.verseText = value.fields.verseText
  SET v.mdText = value.fields.mdText
", {batchSize: 5000, iterateList: true, parallel:true});
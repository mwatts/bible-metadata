CALL apoc.periodic.iterate("
  WITH 'https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json/events.json' AS url
  CALL apoc.load.json(url) YIELD value RETURN value
", "
  MERGE (e:Event{ id:value.id })
  SET e.eventID = value.fields.eventID
  SET e.title = value.fields.eventName
  SET e.startDate = value.fields.startDate
  SET e.duration = value.fields.duration
  SET e.sequence = value.fields.sequence
  SET e.precision = value.fields.precision
  SET e.sortKey = value.fields.sortKey

", {batchSize: 1000, iterateList: true, parallel:true});

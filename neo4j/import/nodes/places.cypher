CALL apoc.periodic.iterate("
  WITH 'https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json/places.json' AS url
  CALL apoc.load.json(url) YIELD value RETURN value
", "
  MERGE (p:Place{ id:value.id })
  SET p.placeId = value.fields.placeID
  SET p.name = value.fields.displayTitle
  SET p.latitude = value.fields.latitude
  SET p.longitude = value.fields.longitude
  SET p.precision = value.fields.precision
  SET p.featureType = value.fields.featureType
  SET p.description = value.fields.dictionaryText
  SET p.source = CASE WHEN NOT value.fields.recogitoUri IS NULL
      THEN value.fields.recogitoUri
      ELSE 'https://openbible.info/geo'
      END
  SET p.slug = value.fields.slug
  SET p.status = value.fields.status
  SET p.comment = value.fields.comment
", {batchSize: 1000, iterateList: true, parallel: false});

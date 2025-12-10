CALL apoc.periodic.iterate("
    WITH 'https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json/places.json' AS url
    CALL apoc.load.json(url) YIELD value RETURN value
", "
    MATCH (p:Place{ id: value.id })
    WITH p, value

    FOREACH (verse in value.fields.verses |
    MERGE (v:Verse{ id: verse })
    MERGE (v)-[:MENTIONS]->(p)
    )

    FOREACH ( event in value.fields.eventsHere |
    MERGE (e:Event{ id: event })
    MERGE (e)-[:OCCURRED_IN]->(p)
    )

    FOREACH ( born in value.fields.peopleBorn |
    MERGE (pb:Person{ id: born })
    MERGE (pb)-[:BORN_IN]->(p)
    )

    FOREACH ( died in value.fields.peopleBorn |
    MERGE (pd:Person{ id: died })
    MERGE (pd)-[:DIED_IN]->(p)
    )

", {batchSize: 1000, iterateList: true, parallel:true});

CALL apoc.periodic.iterate("
    WITH 'https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json/events.json' AS url
    CALL apoc.load.json(url) YIELD value RETURN value
", "
    MATCH (e:Event{ id: value.id })
    WITH e, value

    FOREACH( verse in value.fields.verses |
    MERGE (v:Verse{ id: verse })
    MERGE (v)-[:DESCRIBES]->(e)
    )

    FOREACH( participant in value.fields.participants |
    MERGE (p:Person{ id: participant })
    MERGE (p)-[:PARTICIPATED_IN]->(e)
    )

    FOREACH( place in value.fields.`places (from verses)` |
    MERGE (l:Place{ id: place })
    MERGE (e)-[:OCCURRED_IN]->(l)
    )

    FOREACH( pre in value.fields.predecessor |
    MERGE (pr:Event{ id: pre })
    MERGE (pr)-[:PRECEEDS]->(e)
    )
    )

", {batchSize: 1000, iterateList: true, parallel: false});
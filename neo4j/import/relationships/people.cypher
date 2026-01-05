CALL apoc.periodic.iterate("
    WITH 'https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json/people.json' AS url
    CALL apoc.load.json(url) YIELD value RETURN value
", "
    MATCH (p:Person{ id: value.id })
    WITH p, value

    FOREACH (verse in value.fields.verses |
    MERGE (v:Verse{ id: verse })
    MERGE (v)-[:MENTIONS]->(p)
    )

    FOREACH (birthplace in value.fields.birthPlace |
    MERGE (bp:Place{ id: birthplace })
    MERGE (p)-[:BORN_IN]->(bp)
    )

    FOREACH (deathplace in value.fields.deathPlace |
    MERGE (dp:Place{ id: deathplace })
    MERGE (p)-[:DIED_IN]->(dp)
    )

    FOREACH (mother in value.fields.mother |
    MERGE (m:Person{ id: mother })
    MERGE (m)-[:PARENT_OF]->(p)
    MERGE (p)-[:CHILD_OF]->(m)
    )

    FOREACH (father in value.fields.father |
    MERGE (f:Person{ id: father })
    MERGE (f)-[:PARENT_OF]->(p)
    MERGE (p)-[:CHILD_OF]->(f)
    )

    FOREACH (partner in value.fields.partners |
    MERGE (s:Person{ id: partner })
    MERGE (p)-[:PARTNER_OF]->(s)
    MERGE (s)-[:PARTNER_OF]->(p)
    )

    FOREACH (child in value.fields.children |
    MERGE (c:Person{ id: child })
    MERGE (c)-[:CHILD_OF]->(p)
    )

", {batchSize: 1000, iterateList: true, parallel: false});
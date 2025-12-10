# Neo4j Import Scripts

Import Theographic Bible metadata into a Neo4j graph database using these Cypher scripts.

## Prerequisites

- **Neo4j Database** (Desktop, AuraDB, or self-hosted instance)
- **APOC Plugin** installed and enabled
- **Python 3.x** with `neo4j` driver (optional, for running via Python)
- Internet connection (scripts load JSON from GitHub)

## Quick Start

### Option 1: Neo4j Browser (Recommended for First-Time Users)

1. **Install Neo4j Desktop**
   - Download from [neo4j.com/download](https://neo4j.com/download/)
   - Create a new project and database
   - Install the APOC plugin in database settings
   - Start your database

2. **Open Neo4j Browser**
   - Click "Open" on your database
   - Neo4j Browser will launch

3. **Run Import Scripts in Order**
   - Copy and paste each script from `import/nodes/` first (in numerical order)
   - Then run scripts from `import/relationships/` (in numerical order)
   - Wait for each script to complete before running the next

### Option 2: Neo4j Sandbox (No Installation Required)

1. Create a free account at [Neo4j Sandbox](https://neo4j.com/sandbox-v2/)
2. Create a blank sandbox instance
3. Copy and paste scripts into the query interface

### Option 3: Python Script

Use the original Jupyter notebook (`Neo4j_imports.ipynb`) which automates the entire process.

## Import Order (IMPORTANT!)

**Nodes must be imported before relationships.** Follow this order:

### Phase 1: Import Nodes
Run all scripts in `import/nodes/` in order:
1. `01-import-books.cypher`
2. `02-import-chapters.cypher`
3. `03-import-verses.cypher`
4. `04-import-easton-dictionary.cypher`
5. `05-import-people.cypher`
6. `06-import-people-groups.cypher`
7. `07-import-places.cypher`
8. `08-import-events.cypher`
9. `09-import-years.cypher`

### Phase 2: Import Relationships
Run all scripts in `import/relationships/` in order:
10. `10-import-book-relationships.cypher`
11. `11-import-chapter-relationships.cypher`
12. `12-import-event-relationships.cypher`
13. `13-import-place-relationships.cypher`
14. `14-import-people-group-relationships.cypher`
15. `15-import-people-relationships.cypher`

## Data Source

All data is loaded directly from the JSON files in this repository:
- [json/books.json](../../json/books.json)
- [json/chapters.json](../../json/chapters.json)
- [json/verses.json](../../json/verses.json)
- [json/people.json](../../json/people.json)
- [json/places.json](../../json/places.json)
- [json/events.json](../../json/events.json)
- [json/peopleGroups.json](../../json/peopleGroups.json)
- [json/easton.json](../../json/easton.json)
- [json/periods.json](../../json/periods.json)

## Graph Structure

### Node Types
- **Testament** - Old Testament, New Testament
- **Division** - Law, History, Wisdom, Prophets, Gospels, etc.
- **Book** - Individual books of the Bible
- **Chapter** - Chapters within books
- **Verse** - Individual verses with full text
- **Person** - Biblical figures
- **PeopleGroup** - Groups, tribes, nations
- **Place** - Locations with coordinates
- **Event** - Historical events with dates
- **Year** - Timeline periods
- **Dictionary** - Easton's Bible Dictionary entries

### Relationship Types
- **CONTAINS** - Testament→Division→Book→Chapter→Verse hierarchy
- **WROTE** - Person→Chapter (authorship)
- **MENTIONS** - Verse→Person/Place (references)
- **PARENT_OF / CHILD_OF** - Family relationships
- **PARTNER_OF** - Marriage relationships
- **BORN_IN / DIED_IN** - Person→Place or Person→Year
- **PARTICIPATED_IN** - Person→Event
- **OCCURRED_IN** - Event→Place or Event→Year
- **DESCRIBES** - Verse→Event
- **MEMBER_OF** - Person→PeopleGroup
- **PRECEEDS** - Event→Event (chronological order)

## Troubleshooting

### APOC Plugin Not Found
Ensure the APOC plugin is installed and enabled. Add this to your `neo4j.conf`:
```
dbms.security.procedures.unrestricted=apoc.*
```

### Connection Refused
- Verify Neo4j is running
- Check your connection credentials (default: username=`neo4j`, password set during first login)
- Confirm the bolt port (default: 7687)

### Out of Memory
For large imports, increase Neo4j heap size in settings:
```
dbms.memory.heap.initial_size=2G
dbms.memory.heap.max_size=4G
```

### Import Takes Too Long
- The verses import is the largest and may take several minutes
- Other imports should complete in under a minute each
- You'll see "done in X.Xs" when using the Python notebook

## Next Steps

After importing, explore the data with example queries in `queries/examples/`.

## Reference

- Original notebook: `Neo4j_imports.ipynb`
- [Neo4j Documentation](https://neo4j.com/docs/)
- [APOC Documentation](https://neo4j.com/labs/apoc/)
- [Cypher Reference](https://neo4j.com/docs/cypher-manual/current/)
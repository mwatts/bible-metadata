// Create indexes for all node types to optimize import performance
// Run this script BEFORE running any node or relationship imports

CREATE INDEX book_id IF NOT EXISTS FOR (b:Book) ON (b.id);
CREATE INDEX chapter_id IF NOT EXISTS FOR (c:Chapter) ON (c.id);
CREATE INDEX verse_id IF NOT EXISTS FOR (v:Verse) ON (v.id);
CREATE INDEX person_id IF NOT EXISTS FOR (p:Person) ON (p.id);
CREATE INDEX place_id IF NOT EXISTS FOR (p:Place) ON (p.id);
CREATE INDEX event_id IF NOT EXISTS FOR (e:Event) ON (e.id);
CREATE INDEX year_id IF NOT EXISTS FOR (y:Year) ON (y.id);
CREATE INDEX peopleGroup_id IF NOT EXISTS FOR (g:PeopleGroup) ON (g.id);
CREATE INDEX dictionary_id IF NOT EXISTS FOR (d:Dictionary) ON (d.id);
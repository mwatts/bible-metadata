const { ApolloServer } = require('@apollo/server');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');
const { gql } = require('graphql-tag');
const fs = require('fs');
const path = require('path');

const typeDefs = gql`
  # ── Filter input types ───────────────────────────────────────────────────────
  #
  # Every collection query accepts an optional "where" argument.
  # All fields within a where clause are combined with AND logic.
  # String fields support exact match (eq) and case-insensitive substring (contains).
  # Numeric/boolean fields support exact match and, where sensible, range (gte/lte).

  input StringFilter {
    eq: String          # exact match (case-sensitive)
    contains: String    # case-insensitive substring
  }

  input IntFilter {
    eq: Int
    gte: Int
    lte: Int
  }

  input BooleanFilter {
    eq: Boolean
  }

  input BookFilter {
    id: StringFilter
    bookName: StringFilter
    osisName: StringFilter
    shortName: StringFilter
    testament: StringFilter   # "Old Testament" | "New Testament"
    bookDiv: StringFilter     # "Pentateuch", "Gospels", etc.
    bookOrder: IntFilter
    chapterCount: IntFilter
    verseCount: IntFilter
    slug: StringFilter
  }

  input ChapterFilter {
    id: StringFilter
    osisRef: StringFilter
    slug: StringFilter
    chapterNum: IntFilter
    peopleCount: IntFilter
    placesCount: IntFilter
    writerCount: IntFilter
  }

  input VerseFilter {
    id: StringFilter
    osisRef: StringFilter
    verseText: StringFilter
    yearNum: IntFilter
    peopleCount: IntFilter
    status: StringFilter      # "publish" | "draft"
  }

  input PersonFilter {
    id: StringFilter
    name: StringFilter
    displayTitle: StringFilter
    personLookup: StringFilter
    gender: StringFilter      # "Male" | "Female"
    slug: StringFilter
    alsoCalled: StringFilter
    alphaGroup: StringFilter
    status: StringFilter
    ambiguous: BooleanFilter
    isProperName: BooleanFilter
    verseCount: IntFilter
    minYear: IntFilter
    maxYear: IntFilter
  }

  input PlaceFilter {
    id: StringFilter
    kjvName: StringFilter
    esvName: StringFilter
    displayTitle: StringFilter
    placeLookup: StringFilter
    featureType: StringFilter  # "City", "Water", "Mountain", etc.
    featureSubType: StringFilter
    slug: StringFilter
    alphaGroup: StringFilter
    status: StringFilter
    ambiguous: BooleanFilter
    verseCount: IntFilter
  }

  input EventFilter {
    id: StringFilter
    title: StringFilter
    notes: StringFilter
    startDate: StringFilter
    duration: StringFilter
    lagType: StringFilter
    rangeFlag: BooleanFilter
    eventID: IntFilter
    sortKey: IntFilter        # treated as Int range (truncated); use startDate for precision
  }

  input PeopleGroupFilter {
    id: StringFilter
    groupName: StringFilter
  }

  input EastonFilter {
    id: StringFilter
    termLabel: StringFilter
    dictLookup: StringFilter
    matchType: StringFilter
    dictText: StringFilter
  }

  # ── Core types ────────────────────────────────────────────────────────────────

  type Book {
    id: String!
    osisName: String
    bookName: String
    chapterCount: Int
    bookDiv: String
    shortName: String
    bookOrder: Int
    verses: [Verse]
    yearWritten: [String]
    placeWritten: [Place]
    verseCount: Int
    chapters: [Chapter]
    writers: [Person]
    testament: String
    slug: String
    peopleCount: Int
    placeCount: Int
  }

  type Chapter {
    id: String!
    osisRef: String
    book: [Book]
    chapterNum: Int
    writer: [Person]
    verses: [Verse]
    slug: String
    peopleCount: Int
    placesCount: Int
    modified: String
    writerCount: Int
  }

  type Verse {
    id: String!
    osisRef: String
    verseNum: String
    verseText: String
    book: [Book]
    people: [Person]
    peopleCount: Int
    places: [Place]
    placesCount: Int
    yearNum: Int
    peopleGroups: [PeopleGroup]
    chapter: [Chapter]
    status: String
    mdText: String
    richText: String
    verseID: String
    modified: String
    event: [Event]
  }

  type Person {
    id: String!
    personLookup: String
    personID: Int
    name: String
    surname: String
    isProperName: Boolean
    gender: String
    birthYear: [String]
    deathYear: [String]
    memberOf: [PeopleGroup]
    birthPlace: [Place]
    deathPlace: [Place]
    dictionaryLink: String
    dictionaryText: String
    events: String
    verseCount: Int
    verses: [Verse]
    siblings: [Person]
    halfSiblingsSameMother: [Person]
    halfSiblingsSameFather: [Person]
    chaptersWritten: [Chapter]
    mother: [Person]
    father: [Person]
    children: [Person]
    minYear: Int
    maxYear: Int
    displayTitle: String
    status: String
    alphaGroup: String
    slug: String
    partners: [Person]
    alsoCalled: String
    ambiguous: Boolean
    eastons: [Easton]
    dictText: [String]
    modified: String
    timeline: [Event]
  }

  type PeopleGroup {
    id: String!
    groupName: String
    members: [Person]
    verses: [Verse]
    modified: String
    events: String
    eventsDev: [Event]
    partOf: [PeopleGroup]
  }

  type Place {
    id: String!
    placeLookup: String
    openBibleLat: String
    openBibleLong: String
    kjvName: String
    esvName: String
    comment: String
    precision: String
    featureType: String
    rootID: [String]
    aliases: String
    dictionaryLink: String
    dictionaryText: String
    verseCount: Int
    placeID: Int
    recogitoUri: String
    recogitoLat: String
    recogitoLon: String
    peopleBorn: [Person]
    peopleDied: [Person]
    booksWritten: [Book]
    verses: [Verse]
    recogitoStatus: String
    recogitoType: String
    recogitoComments: String
    recogitoLabel: String
    recogitoUID: String
    hasBeenHere: String
    latitude: String
    longitude: String
    status: String
    displayTitle: String
    alphaGroup: String
    slug: String
    duplicateOf: [Place]
    ambiguous: Boolean
    eastons: [Easton]
    dictText: [String]
    modified: String
    eventsHere: [Event]
    featureSubType: String
  }

  type Event {
    id: String!
    title: String
    startDate: String
    duration: String
    participants: [Person]
    locations: [Place]
    verses: [Verse]
    predecessor: [Event]
    lag: String
    partOf: [Event]
    notes: String
    verseSort: String
    groups: [PeopleGroup]
    modified: String
    sortKey: Float
    rangeFlag: Boolean
    lagType: String
    eventID: Int
  }

  type Easton {
    id: String!
    dictLookup: String
    termID: String
    termLabel: String
    defId: String
    hasList: String
    itemNum: Int
    matchType: String
    matchSlugs: String
    dictText: String
    personLookup: [Person]
    placeLookup: [Place]
    index: Int
  }

  # ── Queries ───────────────────────────────────────────────────────────────────

  type Query {
    books(where: BookFilter, limit: Int, offset: Int): [Book]
    chapters(where: ChapterFilter, limit: Int, offset: Int): [Chapter]
    verses(where: VerseFilter, limit: Int, offset: Int): [Verse]
    people(where: PersonFilter, limit: Int, offset: Int): [Person]
    places(where: PlaceFilter, limit: Int, offset: Int): [Place]
    events(where: EventFilter, limit: Int, offset: Int): [Event]
    peopleGroups(where: PeopleGroupFilter, limit: Int, offset: Int): [PeopleGroup]
    easton(where: EastonFilter, limit: Int, offset: Int): [Easton]

    # Full-text search queries (unchanged)
    searchVerses(input: String!): [Verse]
    searchPeople(input: String!): [Person]
    searchPlaces(input: String!): [Place]
  }
`;

// ── Data loading ──────────────────────────────────────────────────────────────

// Resolve the json/ directory. Try candidate paths in order:
//   1. Repo root relative to this file (local dev): api/netlify/functions/ -> ../../../json
//   2. Bundled alongside function at Lambda root (Netlify deploy): ../../../json same as above
//      but NFT places included_files relative to repo root, so also try ../../json and ./json
const candidateDirs = [
  path.join(__dirname, '../../../json'), // local dev: api/netlify/functions -> repo root/json
  path.join(__dirname, '../../json'),    // one level shallower (nft bundle layout)
  path.join(__dirname, 'json'),          // same directory as function
  path.join(process.cwd(), 'json'),      // cwd-relative (Lambda /var/task/json)
];

const dataDir = candidateDirs.find(dir => fs.existsSync(path.join(dir, 'books.json'))) || candidateDirs[0];
console.log('[graphql] dataDir resolved to:', dataDir);

const data = {};
const maps = {};

const types = ['books', 'chapters', 'verses', 'people', 'places', 'events', 'peopleGroups', 'easton'];

types.forEach(type => {
  const filePath = path.join(dataDir, `${type}.json`);
  if (fs.existsSync(filePath)) {
    data[type] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    maps[type] = new Map(data[type].map(item => [item.id, item]));
  } else {
    console.warn('[graphql] WARNING: could not find', filePath);
    data[type] = [];
    maps[type] = new Map();
  }
});

// Secondary lookup maps for fields that use alternate keys instead of record IDs
const peopleByLookup = new Map(data.people.map(p => [p.fields.personLookup, p]));

// ── Filter helpers ────────────────────────────────────────────────────────────

/**
 * Test a single StringFilter against a value.
 * { eq } — case-sensitive exact match
 * { contains } — case-insensitive substring match
 * Returns true if the filter is satisfied (or if filter is null/undefined).
 */
function matchString(filter, value) {
  if (!filter) return true;
  const str = value == null ? '' : String(value);
  if (filter.eq !== undefined && filter.eq !== null) {
    if (str !== filter.eq) return false;
  }
  if (filter.contains !== undefined && filter.contains !== null) {
    if (!str.toLowerCase().includes(filter.contains.toLowerCase())) return false;
  }
  return true;
}

/**
 * Test a single IntFilter against a value.
 * { eq } — exact match; { gte } — >=; { lte } — <=
 */
function matchInt(filter, value) {
  if (!filter) return true;
  const num = value == null ? null : Number(value);
  if (filter.eq !== undefined && filter.eq !== null) {
    if (num !== filter.eq) return false;
  }
  if (filter.gte !== undefined && filter.gte !== null) {
    if (num == null || num < filter.gte) return false;
  }
  if (filter.lte !== undefined && filter.lte !== null) {
    if (num == null || num > filter.lte) return false;
  }
  return true;
}

/**
 * Test a BooleanFilter against a value.
 */
function matchBool(filter, value) {
  if (!filter) return true;
  if (filter.eq !== undefined && filter.eq !== null) {
    if (Boolean(value) !== filter.eq) return false;
  }
  return true;
}

/**
 * Apply a where clause + optional limit/offset to an array of raw records.
 * fieldMap is an object keyed by filter field name, each value is a function
 * (record) => rawValue to extract the field from the raw JSON record.
 */
function applyFilter(records, where, limit, offset, fieldMap) {
  let results = records;

  if (where) {
    results = records.filter(record => {
      for (const [key, extract] of Object.entries(fieldMap)) {
        const filterValue = where[key];
        if (!filterValue) continue;
        const rawValue = extract(record);
        // Determine filter kind by the fields present in the filter object
        if ('eq' in filterValue || 'contains' in filterValue) {
          if (!matchString(filterValue, rawValue)) return false;
        } else if ('gte' in filterValue || 'lte' in filterValue) {
          if (!matchInt(filterValue, rawValue)) return false;
        } else if ('eq' in filterValue && typeof filterValue.eq === 'boolean') {
          if (!matchBool(filterValue, rawValue)) return false;
        }
      }
      return true;
    });
  }

  if (offset) results = results.slice(offset);
  if (limit)  results = results.slice(0, limit);

  return results;
}

/**
 * Generic filter dispatcher: inspects the filter object's keys and applies
 * the correct matcher based on the filter type (String/Int/Boolean).
 *
 * We detect filter type from the keys present:
 *   StringFilter  has { eq?, contains? }  where eq is a string
 *   IntFilter     has { eq?, gte?, lte? } where eq is a number
 *   BooleanFilter has { eq }              where eq is a boolean
 */
function testFilter(filterValue, rawValue) {
  if (!filterValue || typeof filterValue !== 'object') return true;
  const keys = Object.keys(filterValue).filter(k => filterValue[k] !== null && filterValue[k] !== undefined);
  if (keys.length === 0) return true;

  // Boolean filter: eq is explicitly boolean
  if ('eq' in filterValue && typeof filterValue.eq === 'boolean' && !('contains' in filterValue)) {
    return matchBool(filterValue, rawValue);
  }
  // Int filter: has gte or lte, or eq is a number
  if ('gte' in filterValue || 'lte' in filterValue || ('eq' in filterValue && typeof filterValue.eq === 'number')) {
    return matchInt(filterValue, rawValue);
  }
  // Default: string filter
  return matchString(filterValue, rawValue);
}

/**
 * Build a filter function for a given where clause and field-extractor map.
 * Returns a predicate (record) => boolean.
 */
function buildPredicate(where, fieldMap) {
  if (!where) return () => true;
  return (record) => {
    for (const [key, extract] of Object.entries(fieldMap)) {
      const filterValue = where[key];
      if (!filterValue) continue;
      const rawValue = extract(record);
      if (!testFilter(filterValue, rawValue)) return false;
    }
    return true;
  };
}

/**
 * Filter, then paginate a dataset.
 */
function query(records, where, limit, offset, fieldMap) {
  const predicate = buildPredicate(where, fieldMap);
  let results = where ? records.filter(predicate) : records;
  if (offset) results = results.slice(offset);
  if (limit)  results = results.slice(0, limit);
  return results;
}

// ── Field-extractor maps (one per type) ───────────────────────────────────────

const bookFields = {
  id:           r => r.id,
  bookName:     r => r.fields.bookName,
  osisName:     r => r.fields.osisName,
  shortName:    r => r.fields.shortName,
  testament:    r => r.fields.testament,
  bookDiv:      r => r.fields.bookDiv,
  bookOrder:    r => r.fields.bookOrder,
  chapterCount: r => r.fields.chapterCount,
  verseCount:   r => r.fields.verseCount,
  slug:         r => r.fields.slug,
};

const chapterFields = {
  id:           r => r.id,
  osisRef:      r => r.fields.osisRef,
  slug:         r => r.fields.slug,
  chapterNum:   r => r.fields.chapterNum,
  peopleCount:  r => r.fields.peopleCount,
  placesCount:  r => r.fields.placesCount,
  writerCount:  r => r.fields['writer count'],
};

const verseFields = {
  id:          r => r.id,
  osisRef:     r => r.fields.osisRef,
  verseText:   r => r.fields.verseText,
  yearNum:     r => r.fields.yearNum,
  peopleCount: r => r.fields.peopleCount,
  status:      r => r.fields.status,
};

const personFields = {
  id:            r => r.id,
  name:          r => r.fields.name,
  displayTitle:  r => r.fields.displayTitle,
  personLookup:  r => r.fields.personLookup,
  gender:        r => r.fields.gender,
  slug:          r => r.fields.slug,
  alsoCalled:    r => r.fields.alsoCalled,
  alphaGroup:    r => r.fields.alphaGroup,
  status:        r => r.fields.status,
  ambiguous:     r => r.fields.ambiguous,
  isProperName:  r => r.fields.isProperName,
  verseCount:    r => r.fields.verseCount ?? r.fields.verses?.length ?? 0,
  minYear:       r => r.fields.minYear,
  maxYear:       r => r.fields.maxYear,
};

const placeFields = {
  id:             r => r.id,
  kjvName:        r => r.fields.kjvName,
  esvName:        r => r.fields.esvName,
  displayTitle:   r => r.fields.displayTitle,
  placeLookup:    r => r.fields.placeLookup,
  featureType:    r => r.fields.featureType,
  featureSubType: r => r.fields.featureSubType,
  slug:           r => r.fields.slug,
  alphaGroup:     r => r.fields.alphaGroup,
  status:         r => r.fields.status,
  ambiguous:      r => r.fields.ambiguous,
  verseCount:     r => r.fields.verseCount ?? r.fields.verses?.length ?? 0,
};

const eventFields = {
  id:        r => r.id,
  title:     r => r.fields.title,
  notes:     r => r.fields.notes,
  startDate: r => r.fields.startDate,
  duration:  r => r.fields.duration,
  lagType:   r => r.fields.lagType,
  rangeFlag: r => r.fields.rangeFlag,
  eventID:   r => r.fields.eventID,
  sortKey:   r => r.fields.sortKey,
};

const peopleGroupFields = {
  id:        r => r.id,
  groupName: r => r.fields.groupName,
};

const eastonFields = {
  id:         r => r.id,
  termLabel:  r => r.fields.termLabel,
  dictLookup: r => r.fields.dictLookup,
  matchType:  r => r.fields.matchType,
  dictText:   r => r.fields.dictText,
};

// ── Resolvers ─────────────────────────────────────────────────────────────────

const resolvers = {
  Query: {
    books:        (_, { where, limit, offset } = {}) => query(data.books,        where, limit, offset, bookFields),
    chapters:     (_, { where, limit, offset } = {}) => query(data.chapters,     where, limit, offset, chapterFields),
    verses:       (_, { where, limit, offset } = {}) => query(data.verses,       where, limit, offset, verseFields),
    people:       (_, { where, limit, offset } = {}) => query(data.people,       where, limit, offset, personFields),
    places:       (_, { where, limit, offset } = {}) => query(data.places,       where, limit, offset, placeFields),
    events:       (_, { where, limit, offset } = {}) => query(data.events,       where, limit, offset, eventFields),
    peopleGroups: (_, { where, limit, offset } = {}) => query(data.peopleGroups, where, limit, offset, peopleGroupFields),
    easton:       (_, { where, limit, offset } = {}) => query(data.easton,       where, limit, offset, eastonFields),

    searchVerses: (_, { input }) => {
      const lowerInput = input.toLowerCase();
      return data.verses.filter(v =>
        v.fields.osisRef?.toLowerCase().includes(lowerInput) ||
        v.fields.verseText?.toLowerCase().includes(lowerInput)
      );
    },
    searchPeople: (_, { input }) => {
      const lowerInput = input.toLowerCase();
      return data.people.filter(p =>
        p.fields.name?.toLowerCase().includes(lowerInput) ||
        p.fields.alsoCalled?.toLowerCase().includes(lowerInput) ||
        p.fields.personLookup?.toLowerCase().includes(lowerInput)
      );
    },
    searchPlaces: (_, { input }) => {
      const lowerInput = input.toLowerCase();
      return data.places.filter(p =>
        p.fields.kjvName?.toLowerCase().includes(lowerInput) ||
        p.fields.displayTitle?.toLowerCase().includes(lowerInput) ||
        p.fields.placeLookup?.toLowerCase().includes(lowerInput)
      );
    },
  },

  Book: {
    osisName:    (book) => book.fields.osisName,
    bookName:    (book) => book.fields.bookName,
    chapterCount:(book) => book.fields.chapterCount,
    bookDiv:     (book) => book.fields.bookDiv,
    shortName:   (book) => book.fields.shortName,
    bookOrder:   (book) => book.fields.bookOrder,
    verses:      (book) => book.fields.verses?.map(id => maps.verses.get(id)).filter(Boolean) || [],
    yearWritten: (book) => book.fields.yearWritten || [],
    placeWritten:(book) => book.fields.placeWritten?.map(id => maps.places.get(id)).filter(Boolean) || [],
    verseCount:  (book) => book.fields.verseCount,
    chapters:    (book) => book.fields.chapters?.map(id => maps.chapters.get(id)).filter(Boolean) || [],
    writers:     (book) => book.fields.writers?.map(id => maps.people.get(id) || peopleByLookup.get(id)).filter(Boolean) || [],
    testament:   (book) => book.fields.testament,
    slug:        (book) => book.fields.slug,
    peopleCount: (book) => book.fields.peopleCount,
    placeCount:  (book) => book.fields.placeCount,
  },

  Chapter: {
    osisRef:     (chapter) => chapter.fields.osisRef,
    book:        (chapter) => chapter.fields.book?.map(id => maps.books.get(id)).filter(Boolean) || [],
    chapterNum:  (chapter) => chapter.fields.chapterNum,
    writer:      (chapter) => chapter.fields.writer?.map(id => maps.people.get(id)).filter(Boolean) || [],
    verses:      (chapter) => chapter.fields.verses?.map(id => maps.verses.get(id)).filter(Boolean) || [],
    slug:        (chapter) => chapter.fields.slug,
    peopleCount: (chapter) => chapter.fields.peopleCount,
    placesCount: (chapter) => chapter.fields.placesCount,
    modified:    (chapter) => chapter.fields.modified,
    writerCount: (chapter) => chapter.fields['writer count'],
  },

  Verse: {
    osisRef:     (verse) => verse.fields.osisRef,
    verseNum:    (verse) => verse.fields.verseNum,
    verseText:   (verse) => verse.fields.verseText,
    book:        (verse) => verse.fields.book?.map(id => maps.books.get(id)).filter(Boolean) || [],
    people:      (verse) => verse.fields.people?.map(id => maps.people.get(id)).filter(Boolean) || [],
    peopleCount: (verse) => verse.fields.peopleCount,
    places:      (verse) => verse.fields.places?.map(id => maps.places.get(id)).filter(Boolean) || [],
    placesCount: (verse) => verse.fields.placesCount,
    yearNum:     (verse) => verse.fields.yearNum,
    peopleGroups:(verse) => verse.fields.peopleGroups?.map(id => maps.peopleGroups.get(id)).filter(Boolean) || [],
    chapter:     (verse) => verse.fields.chapter?.map(id => maps.chapters.get(id)).filter(Boolean) || [],
    status:      (verse) => verse.fields.status,
    mdText:      (verse) => verse.fields.mdText,
    richText:    (verse) => verse.fields.richText,
    verseID:     (verse) => verse.fields.verseID,
    modified:    (verse) => verse.fields.modified,
    event:       (verse) => verse.fields.event?.map(id => maps.events.get(id)).filter(Boolean) || [],
  },

  Person: {
    personLookup:          (person) => person.fields.personLookup,
    personID:              (person) => person.fields.personID,
    name:                  (person) => person.fields.name,
    surname:               (person) => person.fields.surname,
    isProperName:          (person) => person.fields.isProperName,
    gender:                (person) => person.fields.gender,
    birthYear:             (person) => person.fields.birthYear || [],
    deathYear:             (person) => person.fields.deathYear || [],
    memberOf:              (person) => person.fields.memberOf?.map(id => maps.peopleGroups.get(id)).filter(Boolean) || [],
    birthPlace:            (person) => person.fields.birthPlace?.map(id => maps.places.get(id)).filter(Boolean) || [],
    deathPlace:            (person) => person.fields.deathPlace?.map(id => maps.places.get(id)).filter(Boolean) || [],
    dictionaryLink:        (person) => person.fields.dictionaryLink,
    dictionaryText:        (person) => person.fields.dictionaryText,
    events:                (person) => person.fields.events,
    verseCount:            (person) => person.fields.verseCount ?? person.fields.verses?.length ?? 0,
    verses:                (person) => person.fields.verses?.map(id => maps.verses.get(id)).filter(Boolean) || [],
    siblings:              (person) => person.fields.siblings?.map(id => maps.people.get(id)).filter(Boolean) || [],
    halfSiblingsSameMother:(person) => person.fields.halfSiblingsSameMother?.map(id => maps.people.get(id)).filter(Boolean) || [],
    halfSiblingsSameFather:(person) => person.fields.halfSiblingsSameFather?.map(id => maps.people.get(id)).filter(Boolean) || [],
    chaptersWritten:       (person) => person.fields.chaptersWritten?.map(id => maps.chapters.get(id)).filter(Boolean) || [],
    mother:                (person) => person.fields.mother?.map(id => maps.people.get(id)).filter(Boolean) || [],
    father:                (person) => person.fields.father?.map(id => maps.people.get(id)).filter(Boolean) || [],
    children:              (person) => person.fields.children?.map(id => maps.people.get(id)).filter(Boolean) || [],
    minYear:               (person) => person.fields.minYear,
    maxYear:               (person) => person.fields.maxYear,
    displayTitle:          (person) => person.fields.displayTitle,
    status:                (person) => person.fields.status,
    alphaGroup:            (person) => person.fields.alphaGroup,
    slug:                  (person) => person.fields.slug,
    partners:              (person) => person.fields.partners?.map(id => maps.people.get(id)).filter(Boolean) || [],
    alsoCalled:            (person) => person.fields.alsoCalled,
    ambiguous:             (person) => person.fields.ambiguous,
    eastons:               (person) => person.fields.eastons?.map(id => maps.easton.get(id)).filter(Boolean) || [],
    dictText:              (person) => person.fields.dictText ? [person.fields.dictText] : [],
    modified:              (person) => person.fields.modified,
    timeline:              (person) => person.fields.timeline?.map(id => maps.events.get(id)).filter(Boolean) || [],
  },

  PeopleGroup: {
    groupName: (group) => group.fields.groupName,
    members:   (group) => group.fields.members?.map(id => maps.people.get(id)).filter(Boolean) || [],
    verses:    (group) => group.fields.verses?.map(id => maps.verses.get(id)).filter(Boolean) || [],
    modified:  (group) => group.fields.modified,
    events:    (group) => group.fields.events,
    eventsDev: (group) => group.fields.events_dev?.map(id => maps.events.get(id)).filter(Boolean) || [],
    partOf:    (group) => group.fields.partOf?.map(id => maps.peopleGroups.get(id)).filter(Boolean) || [],
  },

  Place: {
    placeLookup:     (place) => place.fields.placeLookup,
    openBibleLat:    (place) => place.fields.openBibleLat,
    openBibleLong:   (place) => place.fields.openBibleLong,
    kjvName:         (place) => place.fields.kjvName,
    esvName:         (place) => place.fields.esvName,
    comment:         (place) => place.fields.comment,
    precision:       (place) => place.fields.precision,
    featureType:     (place) => place.fields.featureType,
    rootID:          (place) => place.fields.rootID || [],
    aliases:         (place) => place.fields.aliases,
    dictionaryLink:  (place) => place.fields.dictionaryLink,
    dictionaryText:  (place) => place.fields.dictionaryText,
    verseCount:      (place) => place.fields.verseCount ?? place.fields.verses?.length ?? 0,
    placeID:         (place) => place.fields.placeID,
    recogitoUri:     (place) => place.fields.recogitoUri,
    recogitoLat:     (place) => place.fields.recogitoLat,
    recogitoLon:     (place) => place.fields.recogitoLon,
    peopleBorn:      (place) => place.fields.peopleBorn?.map(id => maps.people.get(id)).filter(Boolean) || [],
    peopleDied:      (place) => place.fields.peopleDied?.map(id => maps.people.get(id)).filter(Boolean) || [],
    booksWritten:    (place) => place.fields.booksWritten?.map(id => maps.books.get(id)).filter(Boolean) || [],
    verses:          (place) => place.fields.verses?.map(id => maps.verses.get(id)).filter(Boolean) || [],
    recogitoStatus:  (place) => place.fields.recogitoStatus,
    recogitoType:    (place) => place.fields.recogitoType,
    recogitoComments:(place) => place.fields.recogitoComments,
    recogitoLabel:   (place) => place.fields.recogitoLabel,
    recogitoUID:     (place) => place.fields.recogitoUID,
    hasBeenHere:     (place) => place.fields.hasBeenHere,
    latitude:        (place) => place.fields.latitude,
    longitude:       (place) => place.fields.longitude,
    status:          (place) => place.fields.status,
    displayTitle:    (place) => place.fields.displayTitle,
    alphaGroup:      (place) => place.fields.alphaGroup,
    slug:            (place) => place.fields.slug,
    duplicateOf:     (place) => place.fields.duplicateOf?.map(id => maps.places.get(id)).filter(Boolean) || [],
    ambiguous:       (place) => place.fields.ambiguous,
    eastons:         (place) => place.fields.eastons?.map(id => maps.easton.get(id)).filter(Boolean) || [],
    dictText:        (place) => place.fields.dictText ? [place.fields.dictText] : [],
    modified:        (place) => place.fields.modified,
    eventsHere:      (place) => place.fields.eventsHere?.map(id => maps.events.get(id)).filter(Boolean) || [],
    featureSubType:  (place) => place.fields.featureSubType,
  },

  Event: {
    title:        (event) => event.fields.title,
    startDate:    (event) => event.fields.startDate,
    duration:     (event) => event.fields.duration,
    participants: (event) => event.fields.participants?.map(id => maps.people.get(id)).filter(Boolean) || [],
    locations:    (event) => event.fields.locations?.map(id => maps.places.get(id)).filter(Boolean) || [],
    verses:       (event) => event.fields.verses?.map(id => maps.verses.get(id)).filter(Boolean) || [],
    predecessor:  (event) => event.fields.predecessor?.map(id => maps.events.get(id)).filter(Boolean) || [],
    lag:          (event) => event.fields.lag,
    partOf:       (event) => event.fields.partOf?.map(id => maps.events.get(id)).filter(Boolean) || [],
    notes:        (event) => event.fields.notes,
    verseSort:    (event) => event.fields.verseSort,
    groups:       (event) => event.fields.groups?.map(id => maps.peopleGroups.get(id)).filter(Boolean) || [],
    modified:     (event) => event.fields.modified,
    sortKey:      (event) => event.fields.sortKey,
    rangeFlag:    (event) => event.fields.rangeFlag,
    lagType:      (event) => event.fields.lagType,
    eventID:      (event) => event.fields.eventID,
  },

  Easton: {
    dictLookup:   (easton) => easton.fields.dictLookup,
    termID:       (easton) => easton.fields.termID,
    termLabel:    (easton) => easton.fields.termLabel,
    defId:        (easton) => easton.fields.def_id,
    hasList:      (easton) => easton.fields.has_list,
    itemNum:      (easton) => easton.fields.itemNum,
    matchType:    (easton) => easton.fields.matchType,
    matchSlugs:   (easton) => easton.fields.matchSlugs,
    dictText:     (easton) => easton.fields.dictText,
    personLookup: (easton) => easton.fields.personLookup?.map(id => maps.people.get(id)).filter(Boolean) || [],
    placeLookup:  (easton) => easton.fields.placeLookup?.map(id => maps.places.get(id)).filter(Boolean) || [],
    index:        (easton) => easton.fields.index,
  },
};

// ── Apollo server ─────────────────────────────────────────────────────────────

let apolloServer;

const getApolloServer = async () => {
  if (!apolloServer) {
    apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    });
    await apolloServer.start();
  }
  return apolloServer;
};

exports.handler = async (event, context) => {
  try {
    const server = await getApolloServer();

    // Decode body: Netlify may base64-encode it; Apollo 4 needs a parsed object
    let body = event.body;
    if (event.isBase64Encoded && body) {
      body = Buffer.from(body, 'base64').toString('utf8');
    }
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) { /* leave as string, Apollo will error */ }
    }

    const response = await server.executeHTTPGraphQLRequest({
      httpGraphQLRequest: {
        method: event.httpMethod,
        headers: {
          get: (name) => event.headers[name.toLowerCase()] || event.headers[name],
        },
        body,
        search: event.queryStringParameters ? new URLSearchParams(event.queryStringParameters) : undefined,
      },
      context: async () => ({}),
    });
    return {
      statusCode: response.status || 200,
      headers: Object.fromEntries(response.headers.entries()),
      body: response.body.kind === 'complete' ? response.body.string : JSON.stringify(response.body),
    };
  } catch (err) {
    console.error('[graphql] handler error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errors: [{ message: err.message }] }),
    };
  }
};

const { ApolloServer, gql } = require('apollo-server-lambda');
const fs = require('fs');
const path = require('path');

const typeDefs = gql`
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

  type Query {
    books: [Book]
    chapters: [Chapter]
    verses: [Verse]
    people: [Person]
    places: [Place]
    events: [Event]
    peopleGroups: [PeopleGroup]
    easton: [Easton]
    searchVerses(input: String!): [Verse]
    searchPeople(input: String!): [Person]
    searchPlaces(input: String!): [Place]
  }
`;

// Load data
const dataDir = path.join(__dirname, '../../../json');
const data = {};
const maps = {};

const types = ['books', 'chapters', 'verses', 'people', 'places', 'events', 'peopleGroups', 'easton'];

types.forEach(type => {
  const filePath = path.join(dataDir, `${type}.json`);
  if (fs.existsSync(filePath)) {
    data[type] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    maps[type] = new Map(data[type].map(item => [item.id, item]));
  } else {
    data[type] = [];
    maps[type] = new Map();
  }
});

const resolvers = {
  Query: {
    books: () => data.books,
    chapters: () => data.chapters,
    verses: () => data.verses,
    people: () => data.people,
    places: () => data.places,
    events: () => data.events,
    peopleGroups: () => data.peopleGroups,
    easton: () => data.easton,
    searchVerses: (root, { input }) => {
      const lowerInput = input.toLowerCase();
      return data.verses.filter(v =>
        v.fields.osisRef.toLowerCase().includes(lowerInput) ||
        v.fields.verseText.toLowerCase().includes(lowerInput)
      );
    },
    searchPeople: (root, { input }) => {
      const lowerInput = input.toLowerCase();
      return data.people.filter(p =>
        p.fields.name?.toLowerCase().includes(lowerInput) ||
        p.fields.alsoCalled?.toLowerCase().includes(lowerInput) ||
        p.fields.personLookup?.toLowerCase().includes(lowerInput)
      );
    },
    searchPlaces: (root, { input }) => {
      const lowerInput = input.toLowerCase();
      return data.places.filter(p =>
        p.fields.kjvName?.toLowerCase().includes(lowerInput) ||
        p.fields.displayTitle?.toLowerCase().includes(lowerInput) ||
        p.fields.placeLookup?.toLowerCase().includes(lowerInput)
      );
    },
  },
  Book: {
    osisName: (book) => book.fields.osisName,
    bookName: (book) => book.fields.bookName,
    chapterCount: (book) => book.fields.chapterCount,
    bookDiv: (book) => book.fields.bookDiv,
    shortName: (book) => book.fields.shortName,
    bookOrder: (book) => book.fields.bookOrder,
    verses: (book) => book.fields.verses?.map(id => maps.verses.get(id)).filter(Boolean) || [],
    yearWritten: (book) => book.fields.yearWritten || [],
    placeWritten: (book) => book.fields.placeWritten?.map(id => maps.places.get(id)).filter(Boolean) || [],
    verseCount: (book) => book.fields.verseCount,
    chapters: (book) => book.fields.chapters?.map(id => maps.chapters.get(id)).filter(Boolean) || [],
    writers: (book) => book.fields.writers?.map(id => maps.people.get(id)).filter(Boolean) || [],
    testament: (book) => book.fields.testament,
    slug: (book) => book.fields.slug,
    peopleCount: (book) => book.fields.peopleCount,
    placeCount: (book) => book.fields.placeCount,
  },
  Chapter: {
    osisRef: (chapter) => chapter.fields.osisRef,
    book: (chapter) => chapter.fields.book?.map(id => maps.books.get(id)).filter(Boolean) || [],
    chapterNum: (chapter) => chapter.fields.chapterNum,
    writer: (chapter) => chapter.fields.writer?.map(id => maps.people.get(id)).filter(Boolean) || [],
    verses: (chapter) => chapter.fields.verses?.map(id => maps.verses.get(id)).filter(Boolean) || [],
    slug: (chapter) => chapter.fields.slug,
    peopleCount: (chapter) => chapter.fields.peopleCount,
    placesCount: (chapter) => chapter.fields.placesCount,
    modified: (chapter) => chapter.fields.modified,
    writerCount: (chapter) => chapter.fields.writerCount,
  },
  Verse: {
    osisRef: (verse) => verse.fields.osisRef,
    verseNum: (verse) => verse.fields.verseNum,
    verseText: (verse) => verse.fields.verseText,
    book: (verse) => verse.fields.book?.map(id => maps.books.get(id)).filter(Boolean) || [],
    people: (verse) => verse.fields.people?.map(id => maps.people.get(id)).filter(Boolean) || [],
    peopleCount: (verse) => verse.fields.peopleCount,
    places: (verse) => verse.fields.places?.map(id => maps.places.get(id)).filter(Boolean) || [],
    placesCount: (verse) => verse.fields.placesCount,
    yearNum: (verse) => verse.fields.yearNum,
    peopleGroups: (verse) => verse.fields.peopleGroups?.map(id => maps.peopleGroups.get(id)).filter(Boolean) || [],
    chapter: (verse) => verse.fields.chapter?.map(id => maps.chapters.get(id)).filter(Boolean) || [],
    status: (verse) => verse.fields.status,
    mdText: (verse) => verse.fields.mdText,
    richText: (verse) => verse.fields.richText,
    verseID: (verse) => verse.fields.verseID,
    modified: (verse) => verse.fields.modified,
    event: (verse) => verse.fields.event?.map(id => maps.events.get(id)).filter(Boolean) || [],
  },
  Person: {
    personLookup: (person) => person.fields.personLookup,
    personID: (person) => person.fields.personID,
    name: (person) => person.fields.name,
    surname: (person) => person.fields.surname,
    isProperName: (person) => person.fields.isProperName,
    gender: (person) => person.fields.gender,
    birthYear: (person) => person.fields.birthYear || [],
    deathYear: (person) => person.fields.deathYear || [],
    memberOf: (person) => person.fields.memberOf?.map(id => maps.peopleGroups.get(id)).filter(Boolean) || [],
    birthPlace: (person) => person.fields.birthPlace?.map(id => maps.places.get(id)).filter(Boolean) || [],
    deathPlace: (person) => person.fields.deathPlace?.map(id => maps.places.get(id)).filter(Boolean) || [],
    dictionaryLink: (person) => person.fields.dictionaryLink,
    dictionaryText: (person) => person.fields.dictionaryText,
    events: (person) => person.fields.events,
    verseCount: (person) => person.fields.verses?.length || 0,
    verses: (person) => person.fields.verses?.map(id => maps.verses.get(id)).filter(Boolean) || [],
    siblings: (person) => person.fields.siblings?.map(id => maps.people.get(id)).filter(Boolean) || [],
    halfSiblingsSameMother: (person) => person.fields.halfSiblingsSameMother?.map(id => maps.people.get(id)).filter(Boolean) || [],
    halfSiblingsSameFather: (person) => person.fields.halfSiblingsSameFather?.map(id => maps.people.get(id)).filter(Boolean) || [],
    chaptersWritten: (person) => person.fields.chaptersWritten?.map(id => maps.chapters.get(id)).filter(Boolean) || [],
    mother: (person) => person.fields.mother?.map(id => maps.people.get(id)).filter(Boolean) || [],
    father: (person) => person.fields.father?.map(id => maps.people.get(id)).filter(Boolean) || [],
    children: (person) => person.fields.children?.map(id => maps.people.get(id)).filter(Boolean) || [],
    minYear: (person) => person.fields.minYear,
    maxYear: (person) => person.fields.maxYear,
    displayTitle: (person) => person.fields.displayTitle,
    status: (person) => person.fields.status,
    alphaGroup: (person) => person.fields.alphaGroup,
    slug: (person) => person.fields.slug,
    partners: (person) => person.fields.partners?.map(id => maps.people.get(id)).filter(Boolean) || [],
    alsoCalled: (person) => person.fields.alsoCalled,
    ambiguous: (person) => person.fields.ambiguous,
    eastons: (person) => person.fields.eastons?.map(id => maps.easton.get(id)).filter(Boolean) || [],
    dictText: (person) => person.fields.dictText ? [person.fields.dictText] : [],
    modified: (person) => person.fields.modified,
    timeline: (person) => person.fields.timeline?.map(id => maps.events.get(id)).filter(Boolean) || [],
  },
  PeopleGroup: {
    groupName: (group) => group.fields.groupName,
    members: (group) => group.fields.members?.map(id => maps.people.get(id)).filter(Boolean) || [],
    verses: (group) => group.fields.verses?.map(id => maps.verses.get(id)).filter(Boolean) || [],
    modified: (group) => group.fields.modified,
    events: (group) => group.fields.events,
    eventsDev: (group) => group.fields.eventsDev?.map(id => maps.events.get(id)).filter(Boolean) || [],
    partOf: (group) => group.fields.partOf?.map(id => maps.peopleGroups.get(id)).filter(Boolean) || [],
  },
  Place: {
    placeLookup: (place) => place.fields.placeLookup,
    openBibleLat: (place) => place.fields.openBibleLat,
    openBibleLong: (place) => place.fields.openBibleLong,
    kjvName: (place) => place.fields.kjvName,
    esvName: (place) => place.fields.esvName,
    comment: (place) => place.fields.comment,
    precision: (place) => place.fields.precision,
    featureType: (place) => place.fields.featureType,
    rootID: (place) => place.fields.rootID || [],
    aliases: (place) => place.fields.aliases,
    dictionaryLink: (place) => place.fields.dictionaryLink,
    dictionaryText: (place) => place.fields.dictionaryText,
    verseCount: (place) => place.fields.verses?.length || 0,
    placeID: (place) => place.fields.placeID,
    recogitoUri: (place) => place.fields.recogitoUri,
    recogitoLat: (place) => place.fields.recogitoLat,
    recogitoLon: (place) => place.fields.recogitoLon,
    peopleBorn: (place) => place.fields.peopleBorn?.map(id => maps.people.get(id)).filter(Boolean) || [],
    peopleDied: (place) => place.fields.peopleDied?.map(id => maps.people.get(id)).filter(Boolean) || [],
    booksWritten: (place) => place.fields.booksWritten?.map(id => maps.books.get(id)).filter(Boolean) || [],
    verses: (place) => place.fields.verses?.map(id => maps.verses.get(id)).filter(Boolean) || [],
    recogitoStatus: (place) => place.fields.recogitoStatus,
    recogitoType: (place) => place.fields.recogitoType,
    recogitoComments: (place) => place.fields.recogitoComments,
    recogitoLabel: (place) => place.fields.recogitoLabel,
    recogitoUID: (place) => place.fields.recogitoUID,
    hasBeenHere: (place) => place.fields.hasBeenHere,
    latitude: (place) => place.fields.latitude,
    longitude: (place) => place.fields.longitude,
    status: (place) => place.fields.status,
    displayTitle: (place) => place.fields.displayTitle,
    alphaGroup: (place) => place.fields.alphaGroup,
    slug: (place) => place.fields.slug,
    duplicateOf: (place) => place.fields.duplicateOf?.map(id => maps.places.get(id)).filter(Boolean) || [],
    ambiguous: (place) => place.fields.ambiguous,
    eastons: (place) => place.fields.eastons?.map(id => maps.easton.get(id)).filter(Boolean) || [],
    dictText: (place) => place.fields.dictText ? [place.fields.dictText] : [],
    modified: (place) => place.fields.modified,
    eventsHere: (place) => place.fields.eventsHere?.map(id => maps.events.get(id)).filter(Boolean) || [],
    featureSubType: (place) => place.fields.featureSubType,
  },
  Event: {
    title: (event) => event.fields.title,
    startDate: (event) => event.fields.startDate,
    duration: (event) => event.fields.duration,
    participants: (event) => event.fields.participants?.map(id => maps.people.get(id)).filter(Boolean) || [],
    locations: (event) => event.fields.locations?.map(id => maps.places.get(id)).filter(Boolean) || [],
    verses: (event) => event.fields.verses?.map(id => maps.verses.get(id)).filter(Boolean) || [],
    predecessor: (event) => event.fields.predecessor?.map(id => maps.events.get(id)).filter(Boolean) || [],
    lag: (event) => event.fields.lag,
    partOf: (event) => event.fields.partOf?.map(id => maps.events.get(id)).filter(Boolean) || [],
    notes: (event) => event.fields.notes,
    verseSort: (event) => event.fields.verseSort,
    groups: (event) => event.fields.groups?.map(id => maps.peopleGroups.get(id)).filter(Boolean) || [],
    modified: (event) => event.fields.modified,
    sortKey: (event) => event.fields.sortKey,
    rangeFlag: (event) => event.fields.rangeFlag,
    lagType: (event) => event.fields.lagType,
    eventID: (event) => event.fields.eventID,
  },
  Easton: {
    dictLookup: (easton) => easton.fields.dictLookup,
    termID: (easton) => easton.fields.termID,
    termLabel: (easton) => easton.fields.termLabel,
    defId: (easton) => easton.fields.defId,
    hasList: (easton) => easton.fields.hasList,
    itemNum: (easton) => easton.fields.itemNum,
    matchType: (easton) => easton.fields.matchType,
    matchSlugs: (easton) => easton.fields.matchSlugs,
    dictText: (easton) => easton.fields.dictText,
    personLookup: (easton) => easton.fields.personLookup?.map(id => maps.people.get(id)).filter(Boolean) || [],
    placeLookup: (easton) => easton.fields.placeLookup?.map(id => maps.places.get(id)).filter(Boolean) || [],
    index: (easton) => easton.fields.index,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true,
});

exports.handler = server.createHandler();

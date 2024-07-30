interface Review {
  rating: number;
  reviewer: string;
  review: string;
}

interface Book {
  id: string;
  title: string;
  authors: string[];
  genre: string;
  price: number;
  publish_date: string;
  description: string;
  reviews: Review[];
  isPartOfACollection: boolean;
}

interface Collection {
  name: string;
  books: Book[];
}

const catalog: Collection[] = [
  {
    name: "Best Sellers",
    books: [
      {
        id: "bk101",
        title: "XML for Beginners",
        authors: ["John Smith", "Jane Doe"],
        genre: "Computer",
        price: 39.95,
        publish_date: "2000-10-01",
        description: "An introduction to XML.",
        reviews: [
          {
            rating: 4,
            reviewer: "Bob Johnson",
            review: "A great introduction to XML!",
          },
          {
            rating: 5,
            reviewer: "Alice Brown",
            review: "Excellent book for beginners!",
          },
        ],
        isPartOfACollection: true,
      },
      {
        id: "bk102",
        title: "XSLT: The Ultimate Guide",
        authors: ["Jane Doe"],
        genre: "Computer",
        price: 49.95,
        publish_date: "2001-05-01",
        description: "A comprehensive guide to XSLT.",
        reviews: [], // empty reviews array
        isPartOfACollection: true,
      },
      {
        id: "bk103",
        title: "XML Schema: The Basics",
        authors: ["Bob Johnson"],
        genre: "Computer",
        price: 29.95,
        publish_date: "2002-01-01",
        description: "An introduction to XML Schema.",
        reviews: [], // empty reviews array
        isPartOfACollection: true,
      },
    ],
  },
];

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// 1. Определяем схему GraphQL
const typeDefs = `#graphql
  type Author {
    id: ID!
    name: String!
    books: [Book!]!
  }

  type Book {
    id: ID!
    title: String!
    author: Author!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
    authors: [Author!]!
  }

  type Mutation {
    createAuthor(name: String!): Author!
    createBook(title: String!, authorId: ID!): Book!
  }
`;

// 2. Временные данные в памяти (массивы)
const authors = [
  { id: '1', name: 'Джордж Оруэлл' },
  { id: '2', name: 'Рэй Брэдбери' }
];

const books = [
  { id: '1', title: '1984', authorId: '1' },
  { id: '2', title: 'Скотный двор', authorId: '1' },
  { id: '3', title: '451 градус по Фаренгейту', authorId: '2' }
];

// 3. Определяем резолверы
const resolvers = {
  Query: {
    // Получение всех книг
    books: () => books,
    // Получение одной книги по id
    book: (_, { id }) => books.find(b => b.id === id),
    // Получение всех авторов
    authors: () => authors,
  },
  Mutation: {
    // Создание автора
    createAuthor: (_, { name }) => {
      const newAuthor = { id: String(authors.length + 1), name };
      authors.push(newAuthor);
      return newAuthor;
    },
    // Создание книги
    createBook: (_, { title, authorId }) => {
      const newBook = { id: String(books.length + 1), title, authorId };
      books.push(newBook);
      return newBook;
    }
  },
  // Вложенные резолверы для связей "один-ко-многим"
  Author: {
    books: (parent) => books.filter(b => b.authorId === parent.id),
  },
  Book: {
    // Поле author в типе Book
    author: (parent) => authors.find(a => a.id === parent.authorId),
  }
};

// 4. Запускаем сервер
const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`GraphQL Server ready at: ${url}`);
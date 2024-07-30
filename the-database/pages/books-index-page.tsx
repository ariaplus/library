import React from 'eact';
import { catalog } from './books';

interface BookProps {
  book: Book;
}

const BookComponent: React.FC<BookProps> = ({ book }) => {
  return (
    <div className="book">
      <h2>{book.title}</h2>
      <p>Authors: {book.authors.join(', ')}</p>
      <p>Genre: {book.genre}</p>
      <p>Price: ${book.price}</p>
      <p>Publish Date: {book.publish_date}</p>
      <p>Description: {book.description}</p>
      {book.reviews.length > 0 && (
        <div>
          <h3>Reviews:</h3>
          <ul>
            {book.reviews.map((review, index) => (
              <li key={index}>
                {review.rating} stars - {review.reviewer}: {review.review}
              </li>
            ))}
          </ul>
        </div>
      )}
      {book.isPartOfACollection && (
        <p>This book is part of a collection!</p>
      )}
    </div>
  );
};

const BookPage: React.FC = () => {
  return (
    <div className="book-page">
      <h1>Book Catalog</h1>
      {catalog[0].books.map((book, index) => (
        <BookComponent key={index} book={book} />
      ))}
    </div>
  );
};

export default BookPage;

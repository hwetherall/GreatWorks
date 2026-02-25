import bookData from "@/data/book1.json";

export interface PoetryLine {
  number: number;
  text: string;
}

export interface Book {
  title: string;
  book: number;
  year: number;
  author: string;
  lines: PoetryLine[];
}

export const book1: Book = bookData as Book;

export function getLine(lineNumber: number): PoetryLine | undefined {
  return book1.lines.find((l) => l.number === lineNumber);
}

export function getLineRange(start: number, end: number): PoetryLine[] {
  return book1.lines.filter((l) => l.number >= start && l.number <= end);
}

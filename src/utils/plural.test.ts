import { describe, expect, it } from "vitest";
import { countWords, plural } from "./plural";

const bookForms = { one: "книга", few: "книги", many: "книг" };

describe("plural", () => {
  it("выбирает форму «книга» для 1 и чисел с 1 в конце (кроме 11)", () => {
    expect(plural(1, bookForms)).toBe("книга");
    expect(plural(21, bookForms)).toBe("книга");
    expect(plural(101, bookForms)).toBe("книга");
  });

  it("выбирает форму «книги» для 2–4 (кроме 12–14)", () => {
    expect(plural(2, bookForms)).toBe("книги");
    expect(plural(4, bookForms)).toBe("книги");
    expect(plural(22, bookForms)).toBe("книги");
    expect(plural(104, bookForms)).toBe("книги");
  });

  it("выбирает форму «книг» для 0, 5 и 11–14", () => {
    expect(plural(0, bookForms)).toBe("книг");
    expect(plural(5, bookForms)).toBe("книг");
    expect(plural(11, bookForms)).toBe("книг");
    expect(plural(14, bookForms)).toBe("книг");
    expect(plural(114, bookForms)).toBe("книг");
  });

  it("countWords добавляет число перед формой", () => {
    expect(countWords(1, bookForms)).toBe("1 книга");
    expect(countWords(2, bookForms)).toBe("2 книги");
    expect(countWords(5, bookForms)).toBe("5 книг");
  });
});

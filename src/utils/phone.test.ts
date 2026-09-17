import { describe, expect, it } from "vitest";
import { extractDigits, isValidPhone, normalizePhone } from "./phone";

describe("phone", () => {
  it("извлекает цифры из номера с разделителями", () => {
    expect(extractDigits("+7 (908) 796-47-81")).toBe("79087964781");
    expect(extractDigits("abc")).toBe("");
  });

  it("нормализует +7 и 8 в международный формат без плюса", () => {
    expect(normalizePhone("+7 (908) 796-47-81")).toBe("79087964781");
    expect(normalizePhone("8-908-796-47-81")).toBe("79087964781");
    expect(normalizePhone("79087964781")).toBe("79087964781");
  });

  it("валидирует только 11-значные номера, начинающиеся с 7 или 8", () => {
    expect(isValidPhone("+79087964781")).toBe(true);
    expect(isValidPhone("89087964781")).toBe(true);
    expect(isValidPhone("79087964781")).toBe(true);
    expect(isValidPhone("7908796478")).toBe(false);
    expect(isValidPhone("69087964781")).toBe(false);
    expect(isValidPhone("7908796478123")).toBe(false);
  });
});

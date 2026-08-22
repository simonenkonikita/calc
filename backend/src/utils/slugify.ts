// backend/src/utils/slugify.ts
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/g, "") // Удаляем спецсимволы
    .replace(/\s+/g, "-") // Заменяем пробелы на -
    .replace(/-+/g, "-") // Убираем повторяющиеся -
    .replace(/^-+/, "") // Убираем - в начале
    .replace(/-+$/, ""); // Убираем - в конце
}

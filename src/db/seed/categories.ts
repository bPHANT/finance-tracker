import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite"
import { categoryTable } from "../schemas"
import { Category } from "../schemas/categories"

export async function seedCategories(db: ExpoSQLiteDatabase<any>) {
  const existingCategories = await db.select().from(categoryTable).limit(1)
  if (existingCategories.length > 0) {
    return false
  }

  const incomeId = 1
  const foodId = 10
  const freetimeId = 20
  const apartmentId = 30
  const travelId = 40
  const subscriptionId = 50
  const insuranceId = 60
  const universityId = 70
  const giftId = 80
  const clothesId = 90
  const techId = 100
  const drugstoreID = 110

  const categories = [
    // Income Categories
    {
      id: incomeId,
      name: "Einnahmen",
      parentCategoryId: null,
      color: "green",
      emoji: "💰",
    },
    {
      id: 2,
      name: "Werkstudentenjob",
      parentCategoryId: incomeId,
      color: "green",
      emoji: "💼",
    },
    {
      id: 3,
      name: "BaföG",
      parentCategoryId: incomeId,
      color: "turquoise",
      emoji: "🎓",
    },
    {
      id: 4,
      name: "Kindergeld",
      parentCategoryId: incomeId,
      color: "blue",
      emoji: "👶",
    },
    {
      id: 5,
      name: "Familie",
      parentCategoryId: incomeId,
      color: "orange",
      emoji: "🏡",
    },
    {
      id: 6,
      name: "Verkäufe",
      parentCategoryId: incomeId,
      color: "violet",
      emoji: "♻️",
    },

    // Food Categories
    {
      id: foodId,
      name: "Essen",
      parentCategoryId: null,
      color: "blue",
      emoji: "🍽️",
    },
    {
      id: 11,
      name: "Restaurant/Cafe",
      parentCategoryId: foodId,
      color: "turquoise",
      emoji: "☕",
    },
    {
      id: 12,
      name: "Fast Food",
      parentCategoryId: foodId,
      color: "gray",
      emoji: "🍔",
    },
    {
      id: 13,
      name: "Einkaufen",
      parentCategoryId: foodId,
      color: "pink",
      emoji: "🛒",
    },
    {
      id: 14,
      name: "Mensa",
      parentCategoryId: foodId,
      color: "green",
      emoji: "🧑‍🎓",
    },

    // Freetime Categories
    {
      id: freetimeId,
      name: "Freizeit",
      parentCategoryId: null,
      color: "orange",
      emoji: "🎉",
    },
    {
      id: 21,
      name: "Hobby",
      parentCategoryId: freetimeId,
      color: "orange",
      emoji: "🎨",
    },
    {
      id: 22,
      name: "Freunde/Familie",
      parentCategoryId: freetimeId,
      color: "yellow",
      emoji: "🫂",
    },
    {
      id: 23,
      name: "Partys/Konzerte",
      parentCategoryId: freetimeId,
      color: "blue",
      emoji: "🎵",
    },

    // apartment categories
    {
      id: apartmentId,
      name: "Wohnung",
      parentCategoryId: null,
      color: "gray",
      emoji: "🏠",
    },
    {
      id: 31,
      name: "Miete",
      parentCategoryId: apartmentId,
      color: "turquoise",
      emoji: "🏠",
    },
    {
      id: 32,
      name: "Internet",
      parentCategoryId: apartmentId,
      color: "violet",
      emoji: "🌐",
    },
    {
      id: 33,
      name: "Möbel",
      parentCategoryId: apartmentId,
      color: "pink",
      emoji: "🛋️",
    },

    // Travel Category
    {
      id: travelId,
      name: "Reisen",
      parentCategoryId: null,
      color: "pink",
      emoji: "✈️",
    },

    // Subscription Categories
    {
      id: subscriptionId,
      name: "Abo",
      parentCategoryId: null,
      color: "green",
      emoji: "🔄",
    },
    {
      id: 51,
      name: "Handyvertrag",
      parentCategoryId: subscriptionId,
      color: "pink",
      emoji: "📱",
    },
    {
      id: 52,
      name: "Streaming-Dienst",
      parentCategoryId: subscriptionId,
      color: "orange",
      emoji: "🎬",
    },

    // Insurance Categories
    {
      id: insuranceId,
      name: "Versicherung",
      parentCategoryId: null,
      color: "yellow",
      emoji: "🛡️",
    },
    {
      id: 61,
      name: "Krankversicherung/Pflegeversicherung",
      parentCategoryId: insuranceId,
      color: "turquoise",
      emoji: "🏥",
    },
    {
      id: 62,
      name: "Privathaftpflichtversicherung",
      parentCategoryId: insuranceId,
      color: "turquoise",
      emoji: "🤝",
    },

    // University Categories
    {
      id: universityId,
      name: "Uni",
      parentCategoryId: null,
      color: "violet",
      emoji: "🧑‍🎓",
    },
    {
      id: 71,
      name: "Semesterbeitrag",
      parentCategoryId: universityId,
      color: "violet",
      emoji: "💳",
    },
    {
      id: 72,
      name: "Equipment",
      parentCategoryId: universityId,
      color: "pink",
      emoji: "📚",
    },

    // Gift Categories
    {
      id: giftId,
      name: "Geschenke",
      parentCategoryId: null,
      color: "blue",
      emoji: "🎁",
    },
    {
      id: 81,
      name: "Geburtstage",
      parentCategoryId: giftId,
      color: "orange",
      emoji: "🎂",
    },
    {
      id: 82,
      name: "Weihnachten",
      parentCategoryId: giftId,
      color: "yellow",
      emoji: "🎄",
    },

    // Clothes Categories
    {
      id: clothesId,
      name: "Kleidung",
      parentCategoryId: null,
      color: "green",
      emoji: "⚽",
    },
    {
      id: 91,
      name: "Kleidung",
      parentCategoryId: clothesId,
      color: "green",
      emoji: "👕",
    },
    {
      id: 92,
      name: "Sportkleidung",
      parentCategoryId: clothesId,
      color: "green",
      emoji: "🏃‍♂️",
    },
    {
      id: 93,
      name: "Schuhe",
      parentCategoryId: clothesId,
      color: "turquoise",
      emoji: "👟",
    },

    // Tech Category
    {
      id: techId,
      name: "Technik",
      parentCategoryId: null,
      color: "pink",
      emoji: "💻",
    },
    {
      id: 101,
      name: "Gaming",
      parentCategoryId: techId,
      color: "orange",
      emoji: "🎮",
    },

    // Drugstore Categories
    {
      id: drugstoreID,
      name: "Gesundheit",
      parentCategoryId: null,
      color: "blue",
      emoji: "🩺",
    },
    {
      id: 111,
      name: "Medizin",
      parentCategoryId: drugstoreID,
      color: "turquoise",
      emoji: "💊",
    },
    {
      id: 112,
      name: "Körperpflege",
      parentCategoryId: drugstoreID,
      color: "pink",
      emoji: "🧴",
    },
    {
      id: 113,
      name: "Haushalt",
      parentCategoryId: drugstoreID,
      color: "blue",
      emoji: "🧹",
    },
  ] as Category[]

  await db.insert(categoryTable).values(categories)
  return true
}

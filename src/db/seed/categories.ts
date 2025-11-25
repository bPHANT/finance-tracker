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
  const drugstoreID = 200

  const categories = [
    // Income Categories
    {
      id: incomeId,
      name: "Einnahmen",
      parentCategoryId: null,
      color: "green",
      emoji: "💰",
    },

    { id: 2, name: "Werkstudentenjob", parentCategoryId: incomeId, color: "green", emoji: "💼" },
    { id: 3, name: "BaföG", parentCategoryId: incomeId, color: "turquoise", emoji: "🎓" },
    { id: 4, name: "Kindergeld", parentCategoryId: incomeId, color: "blue", emoji: "👶" },
    { id: 5, name: "Familie", parentCategoryId: incomeId, color: "orange", emoji: "🏡" },
    { id: 6, name: "Verkäufe", parentCategoryId: incomeId, color: "violet", emoji: "♻️" },

    // Food Categories
    {
      id: foodId,
      name: "Essen",
      parentCategoryId: null,
      color: "blue",
      emoji: "🍽️",
    },
    
    { id: 11, name: "Essen gehen", parentCategoryId: foodId, color: "turquoise", emoji: "☕" },
    { id: 111, name: "Cafe", parentCategoryId: 11, color: "orange", emoji: "☕" },
    { id: 112, name: "Restaurant", parentCategoryId: 11, color: "turquoise", emoji: "🍝" },
    
    { id: 12, name: "Fast Food", parentCategoryId: foodId, color: "gray", emoji: "🍔" },
      { id: 121, name: "Döner", parentCategoryId: 12, color: "pink", emoji: "🥙" },
      { id: 122, name: "Pizza", parentCategoryId: 12, color: "yellow", emoji: "🍕" },
      { id: 123, name: "Chinesisch", parentCategoryId: 12, color: "violet", emoji: "🍜" },
    
    { id: 13, name: "Einkaufen", parentCategoryId: foodId, color: "pink", emoji: "🛒" },
      { id: 131, name: "Fertigessen", parentCategoryId: 13, color: "gray", emoji: "🍱" },
      { id: 132, name: "Gemüse/Obst", parentCategoryId: 13, color: "green", emoji: "🥦" },
      { id: 133, name: "Comfort Food", parentCategoryId: 13, color: "orange", emoji: "🍫" },
      { id: 134, name: "Getränke", parentCategoryId: 13, color: "blue", emoji: "🥤" },

    { id: 14, name: "Mensa", parentCategoryId: foodId, color: "green", emoji: "🧑‍🎓" },

    // Freetime Categories
    {
      id: freetimeId,
      name: "Freizeit",
      parentCategoryId: null,
      color: "orange",
      emoji: "🎉",
    },

    { id: 21, name: "Hobbys", parentCategoryId: freetimeId, color: "orange", emoji: "🎨" },
    { id: 211, name: "Gaming", parentCategoryId: 21, color: "turquoise", emoji: "🎮" },
    { id: 212, name: "Sportaktivitäten", parentCategoryId: 21, color: "pink", emoji: "🏃‍♂️" },
    { id: 213, name: "Kreatives", parentCategoryId: 21, color: "violet", emoji: "🎨" },

    { id: 22, name: "Freunde & Familie", parentCategoryId: freetimeId, color: "yellow", emoji: "🫂" },
    
    { id: 23, name: "Musik", parentCategoryId: freetimeId, color: "blue", emoji: "🎵" },
    { id: 231, name: "Party", parentCategoryId: 23, color: "yellow", emoji: "🎉" },
    { id: 232, name: "Konzerte", parentCategoryId: 23, color: "gray", emoji: "🎤" },

    // Apartment categories
    {
      id: apartmentId,
      name: "Wohnung",
      parentCategoryId: null,
      color: "gray",
      emoji: "🏠",
    },
    
    { id: 31, name: "Miete", parentCategoryId: apartmentId, color: "turquoise", emoji: "🏠" },
    { id: 311, name: "Warmmiete", parentCategoryId: 31, color: "blue", emoji: "🔥" },
    { id: 312, name: "Nebenkosten", parentCategoryId: 31, color: "orange", emoji: "💡" },

    { id: 32, name: "DSL/Internet", parentCategoryId: apartmentId, color: "violet", emoji: "🌐" },

    { id: 33, name: "Möbel", parentCategoryId: apartmentId, color: "pink", emoji: "🛋️" },
    { id: 331, name: "WG Zimmer", parentCategoryId: 33, color: "green", emoji: "🛏️" },

    // Travel Category
    {
      id: travelId,
      name: "Reisen",
      parentCategoryId: null,
      color: "pink",
      emoji: "✈️",
    },

    { id: 41, name: "Transport", parentCategoryId: travelId, color: "pink", emoji: "🚌" },
    { id: 42, name: "Unterkunft", parentCategoryId: travelId, color: "green", emoji: "🏨" },
    { id: 43, name: "Reisen", parentCategoryId: travelId, color: "violet", emoji: "🌍" },
    { id: 44, name: "Essen vor Ort", parentCategoryId: travelId, color: "yellow", emoji: "🍽️" },
    
    // Subscription Categories
    {
      id: subscriptionId,
      name: "Abo",
      parentCategoryId: null,
      color: "green",
      emoji: "🔄",
    },
    
    { id: 51, name: "Handyvertrag", parentCategoryId: subscriptionId, color: "pink", emoji: "📱" },
    
    { id: 52, name: "Streaming-Dienst", parentCategoryId: subscriptionId, color: "orange", emoji: "🎬" },
    { id: 521, name: "Musik", parentCategoryId: 52, color: "gray", emoji: "🎵" },
    { id: 522, name: "Filme/Serien", parentCategoryId: 52, color: "blue", emoji: "🎬" },

    // Insurance Categories
    {
      id: insuranceId,
      name: "Versicherung",
      parentCategoryId: null,
      color: "yellow",
      emoji: "🛡️",
    },
    
    { id: 61, name: "Krankversicherung/Pflegeversicherung", parentCategoryId: insuranceId, color: "turquoise", emoji: "🏥" },
    { id: 62, name: "Privathaftpflichtversicherung", parentCategoryId: insuranceId, color: "violet", emoji: "🤝" },

    // University Categories
    {
      id: universityId,
      name: "Uni",
      parentCategoryId: null,
      color: "violet",
      emoji: "🧑‍🎓",
    },

    { id: 71, name: "Semesterbeitrag", parentCategoryId: universityId, color: "violet", emoji: "💳" },
    { id: 72, name: "Equipment", parentCategoryId: universityId, color: "pink", emoji: "📚" },

    // Gift Categories
    {
      id: giftId,
      name: "Geschenke",
      parentCategoryId: null,
      color: "blue",
      emoji: "🎁",
    },
   
    { id: 81, name: "Geburtstage", parentCategoryId: giftId, color: "orange", emoji: "🎂" },
    { id: 82, name: "Weihnachten", parentCategoryId: giftId, color: "yellow", emoji: "🎄" },


    // Clothes Categories
    {
      id: clothesId,
      name: "Kleidung",
      parentCategoryId: null,
      color: "green",
      emoji: "👕",
    },
    
    { id: 91, name: "Kleidung", parentCategoryId: clothesId, color: "green", emoji: "👕" },
    { id: 911, name: "Alltagskleidung", parentCategoryId: 91, color: "turquoise", emoji: "👚" },
    { id: 912, name: "Sportkleidung", parentCategoryId: 91, color: "pink", emoji: "🏋️‍♂️" },

    { id: 93, name: "Schuhe", parentCategoryId: clothesId, color: "turquoise", emoji: "👟" },

    // Tech Category
    {
      id: techId,
      name: "Technik",
      parentCategoryId: null,
      color: "pink",
      emoji: "💻",
    },
    
    { id: 101, name: "Laptop/PC", parentCategoryId: techId, color: "orange", emoji: "💻" },
    { id: 102, name: "Zubehör", parentCategoryId: techId, color: "green", emoji: "🔌" },
    { id: 103, name: "Kopfhörer", parentCategoryId: techId, color: "pink", emoji: "🎧" },
    { id: 104, name: "Apps & Software", parentCategoryId: techId, color: "turquoise", emoji: "🧩" },
    { id: 105, name: "Reparaturen", parentCategoryId: techId, color: "yellow", emoji: "🔧" },

    // Drugstore Categories
    {
      id: drugstoreID,
      name: "Gesundheit",
      parentCategoryId: null,
      color: "blue",
      emoji: "🩺",
    },
    
    { id: 201, name: "Medikamente", parentCategoryId: drugstoreID, color: "turquoise", emoji: "💊" },
    { id: 2011, name: "Erkältung", parentCategoryId: 201, color: "yellow", emoji: "🤧" },
    { id: 2012, name: "Vitaminpräparate", parentCategoryId: 201, color: "blue", emoji: "💊" },
    { id: 2013, name: "Schmerzmittel", parentCategoryId: 201, color: "gray", emoji: "😣" },

    { id: 202, name: "Haushalt", parentCategoryId: drugstoreID, color: "blue", emoji: "🧹" },
    { id: 2021, name: "Waschmittel", parentCategoryId: 202, color: "green", emoji: "🧽" },
    { id: 2022, name: "Reinigungsmittel", parentCategoryId: 202, color: "pink", emoji: "🧴" },

    { id: 203, name: "Körperpflege", parentCategoryId: drugstoreID, color: "pink", emoji: "🧴" },
    { id: 2031, name: "Cremes", parentCategoryId: 203, color: "turquoise", emoji: "🧴" },
    { id: 2032, name: "Shampoo/Duschgel", parentCategoryId: 203, color: "yellow", emoji: "🚿" },
    { id: 2033, name: "Zahnpflege", parentCategoryId: 203, color: "orange", emoji: "🦷" },
    { id: 2034, name: "Deodorant/Parfüms", parentCategoryId: 203, color: "violet", emoji: "🧴" },
  ] as Category[]

  await db.insert(categoryTable).values(categories)
  return true
}

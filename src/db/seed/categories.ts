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
      color: "Green",
      emoji: "💰",
    },

    { id: 2, name: "Werkstudentenjob", parentCategoryId: incomeId, color: "Green", emoji: "💼" },
    { id: 3, name: "BaföG", parentCategoryId: incomeId, color: "Turquoise", emoji: "🎓" },
    { id: 4, name: "Kindergeld", parentCategoryId: incomeId, color: "Blue", emoji: "👶" },
    { id: 5, name: "Familie", parentCategoryId: incomeId, color: "Orange", emoji: "🏡" },
    { id: 6, name: "Verkäufe", parentCategoryId: incomeId, color: "Violet", emoji: "♻️" },

    // Food Categories
    {
      id: foodId,
      name: "Essen",
      parentCategoryId: null,
      color: "Blue",
      emoji: "🍽️",
    },
    
    { id: 11, name: "Essen gehen", parentCategoryId: foodId, color: "Turquoise", emoji: "☕" },
    { id: 111, name: "Cafe", parentCategoryId: 11, color: "Orange", emoji: "☕" },
    { id: 112, name: "Restaurant", parentCategoryId: 11, color: "Turquoise", emoji: "🍝" },
    
    { id: 12, name: "Fast Food", parentCategoryId: foodId, color: "Gray", emoji: "🍔" },
      { id: 121, name: "Döner", parentCategoryId: 12, color: "Pink", emoji: "🥙" },
      { id: 122, name: "Pizza", parentCategoryId: 12, color: "Yellow", emoji: "🍕" },
      { id: 123, name: "Chinesisch", parentCategoryId: 12, color: "Violet", emoji: "🍜" },
    
    { id: 13, name: "Einkaufen", parentCategoryId: foodId, color: "Pink", emoji: "🛒" },
      { id: 131, name: "Fertigessen", parentCategoryId: 13, color: "Gray", emoji: "🍱" },
      { id: 132, name: "Gemüse/Obst", parentCategoryId: 13, color: "Green", emoji: "🥦" },
      { id: 133, name: "Comfort Food", parentCategoryId: 13, color: "Orange", emoji: "🍫" },
      { id: 134, name: "Getränke", parentCategoryId: 13, color: "Blue", emoji: "🥤" },

    { id: 14, name: "Mensa", parentCategoryId: foodId, color: "Green", emoji: "🧑‍🎓" },

    // Freetime Categories
    {
      id: freetimeId,
      name: "Freizeit",
      parentCategoryId: null,
      color: "Orange",
      emoji: "🎉",
    },

    { id: 21, name: "Hobbys", parentCategoryId: freetimeId, color: "Orange", emoji: "🎨" },
    { id: 211, name: "Gaming", parentCategoryId: 21, color: "Turquoise", emoji: "🎮" },
    { id: 212, name: "Sportaktivitäten", parentCategoryId: 21, color: "Pink", emoji: "🏃‍♂️" },
    { id: 213, name: "Kreatives", parentCategoryId: 21, color: "Violet", emoji: "🎨" },

    { id: 22, name: "Freunde & Familie", parentCategoryId: freetimeId, color: "Yellow", emoji: "🫂" },
    
    { id: 23, name: "Musik", parentCategoryId: freetimeId, color: "Blue", emoji: "🎵" },
    { id: 231, name: "Party", parentCategoryId: 23, color: "Yellow", emoji: "🎉" },
    { id: 232, name: "Konzerte", parentCategoryId: 23, color: "Gray", emoji: "🎤" },

    // Apartment categories
    {
      id: apartmentId,
      name: "Wohnung",
      parentCategoryId: null,
      color: "Gray",
      emoji: "🏠",
    },
    
    { id: 31, name: "Miete", parentCategoryId: apartmentId, color: "Turquoise", emoji: "🏠" },
    { id: 311, name: "Warmmiete", parentCategoryId: 31, color: "Blue", emoji: "🔥" },
    { id: 312, name: "Nebenkosten", parentCategoryId: 31, color: "Orange", emoji: "💡" },

    { id: 32, name: "DSL/Internet", parentCategoryId: apartmentId, color: "Violet", emoji: "🌐" },

    { id: 33, name: "Möbel", parentCategoryId: apartmentId, color: "Pink", emoji: "🛋️" },
    { id: 331, name: "WG Zimmer", parentCategoryId: 33, color: "Green", emoji: "🛏️" },

    // Travel Category
    {
      id: travelId,
      name: "Reisen",
      parentCategoryId: null,
      color: "Pink",
      emoji: "✈️",
    },

    { id: 41, name: "Transport", parentCategoryId: travelId, color: "Pink", emoji: "🚌" },
    { id: 42, name: "Unterkunft", parentCategoryId: travelId, color: "Green", emoji: "🏨" },
    { id: 43, name: "Reisen", parentCategoryId: travelId, color: "Violet", emoji: "🌍" },
    { id: 44, name: "Essen vor Ort", parentCategoryId: travelId, color: "Yellow", emoji: "🍽️" },
    
    // Subscription Categories
    {
      id: subscriptionId,
      name: "Abo",
      parentCategoryId: null,
      color: "Green",
      emoji: "🔄",
    },
    
    { id: 51, name: "Handyvertrag", parentCategoryId: subscriptionId, color: "Pink", emoji: "📱" },
    
    { id: 52, name: "Streaming-Dienst", parentCategoryId: subscriptionId, color: "Orange", emoji: "🎬" },
    { id: 521, name: "Musik", parentCategoryId: 52, color: "Gray", emoji: "🎵" },
    { id: 522, name: "Filme/Serien", parentCategoryId: 52, color: "Blue", emoji: "🎬" },

    // Insurance Categories
    {
      id: insuranceId,
      name: "Versicherung",
      parentCategoryId: null,
      color: "Yellow",
      emoji: "🛡️",
    },
    
    { id: 61, name: "Krankversicherung/Pflegeversicherung", parentCategoryId: insuranceId, color: "Turquoise", emoji: "🏥" },
    { id: 62, name: "Privathaftpflichtversicherung", parentCategoryId: insuranceId, color: "Violet", emoji: "🤝" },

    // University Categories
    {
      id: universityId,
      name: "Uni",
      parentCategoryId: null,
      color: "Violet",
      emoji: "🧑‍🎓",
    },

    { id: 71, name: "Semesterbeitrag", parentCategoryId: universityId, color: "Violet", emoji: "💳" },
    { id: 72, name: "Equipment", parentCategoryId: universityId, color: "Pink", emoji: "📚" },

    // Gift Categories
    {
      id: giftId,
      name: "Geschenke",
      parentCategoryId: null,
      color: "Blue",
      emoji: "🎁",
    },
   
    { id: 81, name: "Geburtstage", parentCategoryId: giftId, color: "Orange", emoji: "🎂" },
    { id: 82, name: "Weihnachten", parentCategoryId: giftId, color: "Yellow", emoji: "🎄" },


    // Clothes Categories
    {
      id: clothesId,
      name: "Kleidung",
      parentCategoryId: null,
      color: "Green",
      emoji: "👕",
    },
    
    { id: 91, name: "Kleidung", parentCategoryId: clothesId, color: "Green", emoji: "👕" },
    { id: 911, name: "Alltagskleidung", parentCategoryId: 91, color: "Turquoise", emoji: "👚" },
    { id: 912, name: "Sportkleidung", parentCategoryId: 91, color: "Pink", emoji: "🏋️‍♂️" },

    { id: 93, name: "Schuhe", parentCategoryId: clothesId, color: "Turquoise", emoji: "👟" },

    // Tech Category
    {
      id: techId,
      name: "Technik",
      parentCategoryId: null,
      color: "Pink",
      emoji: "💻",
    },
    
    { id: 101, name: "Laptop/PC", parentCategoryId: techId, color: "Orange", emoji: "💻" },
    { id: 102, name: "Zubehör", parentCategoryId: techId, color: "Green", emoji: "🔌" },
    { id: 103, name: "Kopfhörer", parentCategoryId: techId, color: "Pink", emoji: "🎧" },
    { id: 104, name: "Apps & Software", parentCategoryId: techId, color: "Turquoise", emoji: "🧩" },
    { id: 105, name: "Reparaturen", parentCategoryId: techId, color: "Yellow", emoji: "🔧" },

    // Drugstore Categories
    {
      id: drugstoreID,
      name: "Gesundheit",
      parentCategoryId: null,
      color: "Blue",
      emoji: "🩺",
    },
    
    { id: 201, name: "Medikamente", parentCategoryId: drugstoreID, color: "Turquoise", emoji: "💊" },
    { id: 2011, name: "Erkältung", parentCategoryId: 201, color: "Yellow", emoji: "🤧" },
    { id: 2012, name: "Vitaminpräparate", parentCategoryId: 201, color: "Blue", emoji: "💊" },
    { id: 2013, name: "Schmerzmittel", parentCategoryId: 201, color: "Gray", emoji: "😣" },

    { id: 202, name: "Haushalt", parentCategoryId: drugstoreID, color: "Blue", emoji: "🧹" },
    { id: 2021, name: "Waschmittel", parentCategoryId: 202, color: "Green", emoji: "🧽" },
    { id: 2022, name: "Reinigungsmittel", parentCategoryId: 202, color: "Pink", emoji: "🧴" },

    { id: 203, name: "Körperpflege", parentCategoryId: drugstoreID, color: "Pink", emoji: "🧴" },
    { id: 2031, name: "Cremes", parentCategoryId: 203, color: "Turquoise", emoji: "🧴" },
    { id: 2032, name: "Shampoo/Duschgel", parentCategoryId: 203, color: "Yellow", emoji: "🚿" },
    { id: 2033, name: "Zahnpflege", parentCategoryId: 203, color: "Orange", emoji: "🦷" },
    { id: 2034, name: "Deodorant/Parfüms", parentCategoryId: 203, color: "Violet", emoji: "🧴" },
  ] as Category[]

  await db.insert(categoryTable).values(categories)
  return true
}

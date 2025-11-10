import { GEMINI_API_KEY } from "@/api/GEMINI_API_KEY"
import { CameraCapturedPicture } from "expo-camera"
import { useTranslation } from "react-i18next"
import { storage } from "./storage"

export function useAi() {
  const { i18n } = useTranslation()

  async function getPrompt(categories: any) {
    return (
      "You are given an image that contains a financial record – such as a receipt, invoice, payroll statement, or similar document. Your task is to extract all recognizable individual items or line entries (e.g. products, services, income types) and return them in structured JSON format.\n" +
      "\n" +
      "Each extracted item must be represented as a separate JSON object with the following fields:\n" +
      `Use ${
        i18n.language === "de" ? "german" : "english"
      } in the return values.\n` +
      "\n" +
      "- specific: The exact label as it appears in the image.\n" +
      '- term: A more general, standardized term derived from the name (e.g., "Cappuccino Large" → "Coffee drink", or "Tax Advisor May 2024" → "Tax service").\n' +
      "- amount: The monetary amount in Euros. Use a negative value for expenses (e.g., -12.49), and a positive value for all income, discounts, and refunds (e.g., 2500.00 or 0.50).\n" +
      "- categoryId: The ID of that specific category (only the final selected category, not the entire path; always an integer).\n" +
      "\n" +
      "Classification Rules:\n" +
      "- Use only the category structure provided in the JSON below.\n" +
      "- Assign exactly one category to each item.\n" +
      "- Be creative and precise: select the most specific and appropriate category available in the tree – as deep as possible, without being speculative.\n" +
      "- Refunds and discounts count as income.\n" +
      "- In payslips: salaries, bonuses, and allowances are income; taxes, insurance, and deductions are expenses.\n" +
      "- If multiple subcategories match, choose the most relevant and descriptive one.\n" +
      "\n" +
      "Output format (JSON array):\n" +
      "[\n" +
      "  {\n" +
      '    "specific": "Original label from the image",\n' +
      '    "term": "Generalized product/service name",\n' +
      '    "amount": -12.49,\n' +
      '    "categoryId": 61\n' +
      "  },\n" +
      "  ...\n" +
      "]\n" +
      "\n" +
      "Important:\n" +
      "- Only return categoryId for the selected category, not the full hierarchy.\n" +
      "- Use only valid category IDs and names from the following tree:\n" +
      JSON.stringify(categories)
    )
  }

  async function categorizePicture(
    photo: CameraCapturedPicture,
    categories: any
  ) {
    if (!categories) {
      console.error("Categories not loaded.")
      categories = ""
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: await getPrompt(categories) },
                  {
                    inlineData: {
                      mimeType: photo.base64
                        ? "image/jpeg"
                        : "application/octet-stream",
                      data: photo.base64,
                    },
                  },
                ],
              },
            ],
          }),
        }
      )
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData}`
        )
      }

      const responseJson = await response.json()
      const text = responseJson.candidates[0].content.parts[0].text
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim()
      const data = JSON.parse(cleaned)

      await storage.setObject("aiResponse", data)
    } catch (error) {
      console.error("Error in categorizePicture:", error)
    }
  }

  async function getAnswer() {
    const data = (await storage.getObject("aiResponse")) as any
    console.log(JSON.stringify(data))
    return data
  }

  return {
    categorizePicture,
    getAnswer,
  }
}

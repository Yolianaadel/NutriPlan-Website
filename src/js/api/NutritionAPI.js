export class NutritionAPI {
  constructor(apiKey) {
    this.baseURL = 'https://nutriplan-api.vercel.app/api';
    this.apiKey = apiKey;
  }

  async analyzeIngredients(mealName, ingredients = []) {
    try {
      if (!Array.isArray(ingredients)) {
        console.warn('Ingredients is not an array:', ingredients);
        return this.fallbackNutrition(mealName);
      }

      const cleanedIngredients = ingredients
        .filter(i => i && i.ingredient && i.ingredient.trim())
        .map(i => `${i.measure || ''} ${i.ingredient}`.trim());

      if (cleanedIngredients.length === 0) {
        return this.fallbackNutrition(mealName);
      }

      const body = {
        recipeName: mealName || 'Meal Recipe',
        ingredients: cleanedIngredients
      };

      const res = await fetch(`${this.baseURL}/nutrition/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      return json.data?.perServing || this.fallbackNutrition(mealName);

    } catch (error) {
      console.warn('Nutrition API failed, using fallback', error);
      return this.fallbackNutrition(mealName);
    }
  }

fallbackNutrition(mealName) {
  const name =
    typeof mealName === 'string'
      ? mealName.toLowerCase()
      : '';

  if (name.includes('chicken')) {
    return { calories: 350, protein: 30, carbs: 10, fat: 15 };
  }
  if (name.includes('beef')) {
    return { calories: 400, protein: 28, carbs: 5, fat: 25 };
  }
  if (name.includes('cake') || name.includes('dessert')) {
    return { calories: 450, protein: 6, carbs: 60, fat: 20 };
  }

  return { calories: 300, protein: 15, carbs: 30, fat: 12 };
}

}

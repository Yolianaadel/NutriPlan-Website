export class NutritionAPI {
  constructor(apiKey) {
    this.baseURL = 'https://nutriplan-api.vercel.app/api';
    this.apiKey = apiKey;
  }

  async analyzeIngredients(mealName, ingredients = []) {
    try {
      if (!Array.isArray(ingredients)) {
        console.warn('Ingredients is not an array:', ingredients);
        return this.fallbackNutrition([]);
      }

      const cleanedIngredients = ingredients
        .filter(i => i && i.ingredient && i.ingredient.trim())
        .map(i => `${i.measure || ''} ${i.ingredient}`.trim());

      if (cleanedIngredients.length === 0) {
        return this.fallbackNutrition(ingredients);
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

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

      if (!json.success || !json.data) {
        return this.fallbackNutrition(ingredients);
      }

      const { servings, totals, perServing, totalWeight } = json.data;

      return {
        servings,
        totalWeight,
        totals,
        perServing,

        calories: perServing.calories,
        protein: perServing.protein,
        fat: perServing.fat,
        carbs: perServing.carbs,
        fiber: perServing.fiber,
        sugar: perServing.sugar,
        sodium: perServing.sodium,
        saturatedFat: perServing.saturatedFat,
        cholesterol: perServing.cholesterol
      };

    } catch (error) {
      console.warn('Nutrition API failed, using dynamic fallback', error);
      return this.fallbackNutrition(ingredients);
    }
  }

  fallbackNutrition(ingredients = []) {
    const INGREDIENTS_NUTRITION = {
      chicken: { calories: 165, protein: 31, carbs: 0, fat: 4, fiber: 0, sugar: 0, sodium: 74, saturatedFat: 1 },
      beef: { calories: 250, protein: 26, carbs: 0, fat: 20, fiber: 0, sugar: 0, sodium: 72, saturatedFat: 8 },
      rice: { calories: 130, protein: 3, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0, sodium: 1, saturatedFat: 0 },
      potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2, sugar: 0.8, sodium: 6, saturatedFat: 0 },
      egg: { calories: 78, protein: 6, carbs: 1, fat: 5, fiber: 0, sugar: 1, sodium: 62, saturatedFat: 1.6 },
      sugar: { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0, sugar: 100, sodium: 0, saturatedFat: 0 },
      oil: { calories: 120, protein: 0, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 0, saturatedFat: 2 }
    };

    const total = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      saturatedFat: 0
    };

    let matchedCount = 0;

    ingredients.forEach(item => {
      const text = `${item.measure || ''} ${item.ingredient || ''}`.toLowerCase();

      Object.keys(INGREDIENTS_NUTRITION).forEach(key => {
        if (text.includes(key)) {
          const n = INGREDIENTS_NUTRITION[key];
          matchedCount++;

          Object.keys(total).forEach(k => {
            total[k] += n[k] || 0;
          });
        }
      });
    });

    if (matchedCount === 0) {
      return {
        calories: 300,
        protein: 15,
        carbs: 30,
        fat: 12,
        fiber: 3,
        sugar: 5,
        sodium: 400,
        saturatedFat: 5
      };
    }

    Object.keys(total).forEach(k => {
      total[k] = Math.round(total[k] / matchedCount);
    });

    return total;
  }
}

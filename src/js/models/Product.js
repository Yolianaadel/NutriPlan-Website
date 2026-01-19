export class Product {
  constructor(data) {
    // Basic info (NutriPlan normalized response)
    this.barcode = data.barcode || '';
    this.name = data.name || '';
    this.brand = data.brand || '';
    this.image = data.image || '';

    // Scores
    this.nutriScore = data.nutriScore
      ? data.nutriScore.toUpperCase()
      : null;

    this.novaGroup = data.novaGroup || null;

    // Categories
    this.categories = data.categories || [];

    // Nutrition
    this.nutrition = this.parseNutrition(data.nutrition);
  }

  /**
   * Parse nutrition data from NutriPlan API
*/
  parseNutrition(nutrition = {}) {
    return {
      calories: Math.round(nutrition.calories || 0),
      protein: Math.round(nutrition.protein || 0),
      carbs: Math.round(nutrition.carbs || 0),
      fat: Math.round(nutrition.fat || 0),
      fiber: Math.round(nutrition.fiber || 0),
      sugar: Math.round(nutrition.sugar || 0),
      servingSize: nutrition.servingSize || null
    };
  }

  /**
   * Convert product to food log entry
   */
  toFoodLogEntry() {
    return {
      id: `product_${this.barcode}_${Date.now()}`,
      type: 'product',
      name: this.name,
      brand: this.brand,
      image: this.image,
      barcode: this.barcode,
      nutrition: this.nutrition,
      date: new Date().toISOString().split('T')[0]
    };
  }
}

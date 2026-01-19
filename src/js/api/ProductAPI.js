export class ProductAPI {
  constructor() {
    this.baseURL = 'https://nutriplan-api.vercel.app/api';
  }

  // Search packaged products by name
  async searchProductsByName(name, page = 1, limit = 24) {
    try {
      let response = await fetch(
        `${this.baseURL}/products/search?q=nutella&page=1&limit=24`
        ///products/search?q=${encodeURIComponent(name)}&page=${page}&limit=${limit}
      );
      let data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Lookup product by barcode
  async getProductByBarcode(barcode) {
    try {
      let response = await fetch(
        `${this.baseURL}/products/barcode/3017620422003`
        ///products/barcode/${barcode}
        //https://nutriplan-api.vercel.app/api/products/barcode/3017620422003
      );
      let data = await response.json();
      return data.product || null;
    } catch (error) {
      console.error('Error fetching product by barcode:', error);
      return null;
    }
  }

  // Get all product categories
  async getCategories() {
    try {
      let response = await fetch(
        `${this.baseURL}/products/categories`
      );
      let data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get products by category
  async getProductsByCategory(category, page = 1, limit = 24) {
    try {
      let response = await fetch(
        `${this.baseURL}/products/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`
      );
      let data = await response.json();
      console.log(data)
      return data.results || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  async searchByCategory(category, page = 1, limit = 24) {
    return this.getProductsByCategory(category, page, limit);
  }
}

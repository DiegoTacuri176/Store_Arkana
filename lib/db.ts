import { query, queryOne } from "./server/mysql"
import type { Product, Category, Review, User, Comment, Order, OrderItem } from "./types"
import { v4 as uuidv4 } from "uuid"

export class Database {
  // ===========================
  // PRODUCTS
  // ===========================
  static async getProducts(filters?: {
    categoryId?: string
    sellerId?: string
    status?: Product["status"]
    featured?: boolean
    search?: string
  }): Promise<Product[]> {
    let sql = "SELECT * FROM products WHERE 1=1"
    const params: any[] = []

    if (filters?.categoryId) {
      sql += " AND category_id = ?"
      params.push(filters.categoryId)
    }

    if (filters?.sellerId) {
      sql += " AND seller_id = ?"
      params.push(filters.sellerId)
    }

    if (filters?.status) {
      sql += " AND status = ?"
      params.push(filters.status)
    }

    if (filters?.featured !== undefined) {
      sql += " AND featured = ?"
      params.push(filters.featured ? 1 : 0)
    }

    if (filters?.search) {
      sql += " AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ?)"
      const search = `%${filters.search.toLowerCase()}%`
      params.push(search, search)
    }

    sql += " ORDER BY created_at DESC"

    const results = await query<Product>(sql, params)
    return results.map((p) => ({
      ...p,
      images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
    }))
  }

  static async getProduct(id: string): Promise<Product | null> {
    const sql = "SELECT * FROM products WHERE id = ?"
    const product = await queryOne<Product>(sql, [id])
    if (!product) return null

    return {
      ...product,
      images: typeof product.images === "string" ? JSON.parse(product.images) : product.images,
    }
  }

  static async createProduct(product: Omit<Product, "id" | "updatedAt">): Promise<Product> {
    const id = uuidv4()
    const sql = `
      INSERT INTO products (
        id,
        seller_id,
        category_id,
        title,
        description,
        price,
        images,
        status,
        featured,
        views,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
    `

    const params = [
      id,
      product.seller_id,
      product.categoryId,
      product.title,
      product.description,
      product.price,
      JSON.stringify(product.images || []),
      product.status || "pending",
      product.featured ? 1 : 0,
      product.created_at
    ]

    await query(sql, params)
    const newProduct = await this.getProduct(id)
    if (!newProduct) throw new Error("Error al crear el producto")
    return newProduct
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const fields: string[] = []
    const params: any[] = []

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        if (key === "images") {
          fields.push(`${key} = ?`)
          params.push(JSON.stringify(value))
        } else {
          fields.push(`${key} = ?`)
          params.push(value)
        }
      }
    }

    if (fields.length === 0) return this.getProduct(id)

    const sql = `
      UPDATE products 
      SET ${fields.join(", ")}, updated_at = NOW() 
      WHERE id = ?
    `
    params.push(id)

    await query(sql, params)
    return this.getProduct(id)
  }

  static async deleteProduct(id: string): Promise<boolean> {
    const sql = "DELETE FROM products WHERE id = ?"
    const result: any = await query(sql, [id])
    return result.affectedRows > 0
  }

  // ===========================
  // CATEGORIES
  // ===========================
  static async getCategories(): Promise<Category[]> {
    const sql = `
      SELECT id, name, slug, description, icon
      FROM categories
      ORDER BY name ASC
    `
    return await query<Category>(sql)
  }

  static async getCategory(id: string): Promise<Category | null> {
    const sql = "SELECT * FROM categories WHERE id = ?"
    return await queryOne<Category>(sql, [id])
  }

  //Productos con categoría y nombre del vendedor
  static async getProductsWithCategories(): Promise<
    (Product & { categoryName: string; sellerName: string })[]
  > {
    const sql = `
      SELECT 
        p.*, 
        c.name AS categoryName,
        u.name AS sellerName
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      ORDER BY p.created_at DESC
    `
    const results = await query<any>(sql)
    return results.map((p) => ({
      ...p,
      images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
    }))
  }

  // ===========================
  // REVIEWS
  // ===========================
  static async getReviews(productId: string): Promise<Review[]> {
    const sql = "SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC"
    return await query<Review>(sql, [productId])
  }

  static async createReview(review: Omit<Review, "id" | "createdAt">): Promise<Review> {
    const id = uuidv4()
    const sql = `
      INSERT INTO reviews (id, product_id, user_id, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `
    const params = [id, review.productId, review.userId, review.rating, review.comment]
    await query(sql, params)
    const newReview = await queryOne<Review>("SELECT * FROM reviews WHERE id = ?", [id])
    if (!newReview) throw new Error("Error al crear la reseña")
    return newReview
  }

  // ===========================
  // COMMENTS
  // ===========================
  static async getComments(productId: string): Promise<Comment[]> {
    const sql = "SELECT * FROM comments WHERE product_id = ? ORDER BY created_at DESC"
    return await query<Comment>(sql, [productId])
  }

  static async createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
    const id = uuidv4()
    const sql = `
      INSERT INTO comments (id, product_id, user_id, content, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `
    const params = [id, comment.productId, comment.userId, comment.content]
    await query(sql, params)
    const newComment = await queryOne<Comment>("SELECT * FROM comments WHERE id = ?", [id])
    if (!newComment) throw new Error("Error al crear el comentario")
    return newComment
  }

  // ===========================
  // USERS
  // ===========================
  static async getUser(userId?: string | number) {
    if (userId === undefined || userId === null) {
      console.warn("[Database] getUser llamado sin userId válido:", userId)
      return null
    }

    return await queryOne("SELECT * FROM users WHERE id = ?", [userId])
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const sql = "SELECT * FROM users WHERE email = ?"
    return await queryOne<User>(sql, [email])
  }

  static async getUsers(filters?: { excludeRole?: User["role"] }): Promise<User[]> {
    let sql = "SELECT * FROM users WHERE 1=1"
    const params: any[] = []
    
    // Lógica para excluir un rol
    if (filters?.excludeRole) {
        sql += " AND role != ?"
        params.push(filters.excludeRole)
    }

    sql += " ORDER BY created_at DESC"
    return await query<User>(sql, params)
  }

  static async deleteUser(id: string): Promise<boolean> {
    const sql = "DELETE FROM users WHERE id = ?"
    const result: any = await query(sql, [id])
    return result.affectedRows > 0
  }
  
  // ===========================
  // ORDERS
  // ===========================
  static async createOrder(orderData: {
    buyerId: string
    items: { productId: string; quantity: number; price: number }[]
    total: number
    status: string
  }): Promise<Order> {
    const orderId = uuidv4()
    
    const sqlOrder = `
      INSERT INTO orders (
        id, buyer_id, total, status, payment_method, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `
    
    await query(sqlOrder, [
      orderId,
      orderData.buyerId,
      orderData.total,
      orderData.status || 'pending',
      'stripe',
    ])

    // 2. Insertar los items de la orden
    for (const item of orderData.items) {
      const itemId = uuidv4()
      const sqlItem = `
        INSERT INTO order_items (id, order_id, product_id, seller_id, quantity, price, created_at)
        SELECT ?, ?, ?, seller_id, ?, ?, NOW()
        FROM products WHERE id = ?
      `
      await query(sqlItem, [
        itemId, 
        orderId, 
        item.productId, 
        item.quantity, 
        item.price, 
        item.productId
      ])
    }

    // 3. Devolver la orden creada
    const newOrder = await this.getOrder(orderId)
    if (!newOrder) throw new Error("Error al recuperar la orden creada")
    return newOrder
  }

  static async getOrder(id: string): Promise<Order | null> {
    // 1. Obtener datos de la orden
    const sqlOrder = "SELECT * FROM orders WHERE id = ?"
    const orderRaw = await queryOne<any>(sqlOrder, [id])
    
    if (!orderRaw) return null

    // 2. Obtener items con detalles del producto (título, imagen)
    const sqlItems = `
      SELECT 
        oi.*,
        p.title,
        p.images
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `
    const itemsRaw = await query<any>(sqlItems, [id])

    // 3. Formatear items
    const items: any[] = itemsRaw.map(item => ({
      id: item.product_id, // Usamos product_id como ID para la vista
      title: item.title,
      price: Number(item.price),
      quantity: item.quantity,
      image: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images)[0] : item.images[0]) : null
    }))

    // 4. Construir objeto Order completo
    return {
      id: orderRaw.id,
      buyerId: orderRaw.buyer_id,
      total: Number(orderRaw.total),
      status: orderRaw.status,
      createdAt: orderRaw.created_at,
      updatedAt: orderRaw.updated_at,
      items: items
    }
  }

  static async getOrdersByUser(userId: string): Promise<Order[]> {
    const sql = "SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC"
    const ordersRaw = await query<any>(sql, [userId])
    
    return ordersRaw.map(o => ({
      id: o.id,
      buyerId: o.buyer_id,
      total: Number(o.total),
      status: o.status,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      items: [] 
    }))
  }
}
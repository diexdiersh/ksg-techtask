import {sortByProperty} from './sort-by.util.js'

interface Product {
  id: number
  name: string
  price: number
  category: string
}

describe('sortByProperty', () => {
  const products: Product[] = [
    {id: 1, name: 'Product A', price: 100, category: 'electronics'},
    {id: 2, name: 'Product B', price: 200, category: 'clothing'},
    {id: 3, name: 'Product C', price: 150, category: 'electronics'},
    {id: 4, name: 'Product D', price: 50, category: 'clothing'},
  ]

  it('should sort by price in ascending order', () => {
    const result = sortByProperty(products, 'price', 'asc')
    expect(result).toEqual([
      {id: 4, name: 'Product D', price: 50, category: 'clothing'},
      {id: 1, name: 'Product A', price: 100, category: 'electronics'},
      {id: 3, name: 'Product C', price: 150, category: 'electronics'},
      {id: 2, name: 'Product B', price: 200, category: 'clothing'},
    ])
  })

  it('should sort by price in descending order', () => {
    const result = sortByProperty(products, 'price', 'desc')
    expect(result).toEqual([
      {id: 2, name: 'Product B', price: 200, category: 'clothing'},
      {id: 3, name: 'Product C', price: 150, category: 'electronics'},
      {id: 1, name: 'Product A', price: 100, category: 'electronics'},
      {id: 4, name: 'Product D', price: 50, category: 'clothing'},
    ])
  })

  it('should sort by name in ascending order', () => {
    const result = sortByProperty(products, 'name', 'asc')
    expect(result).toEqual([
      {id: 1, name: 'Product A', price: 100, category: 'electronics'},
      {id: 2, name: 'Product B', price: 200, category: 'clothing'},
      {id: 3, name: 'Product C', price: 150, category: 'electronics'},
      {id: 4, name: 'Product D', price: 50, category: 'clothing'},
    ])
  })

  it('should sort by name in descending order', () => {
    const result = sortByProperty(products, 'name', 'desc')
    expect(result).toEqual([
      {id: 4, name: 'Product D', price: 50, category: 'clothing'},
      {id: 3, name: 'Product C', price: 150, category: 'electronics'},
      {id: 2, name: 'Product B', price: 200, category: 'clothing'},
      {id: 1, name: 'Product A', price: 100, category: 'electronics'},
    ])
  })

  it('should handle an empty array', () => {
    const result = sortByProperty([], 'price', 'asc')
    expect(result).toEqual([])
  })

  it('should handle an array with a single item', () => {
    const singleProduct: Product[] = [
      {id: 1, name: 'Product A', price: 100, category: 'electronics'},
    ]
    const result = sortByProperty(singleProduct, 'price', 'asc')
    expect(result).toEqual(singleProduct)
  })
})

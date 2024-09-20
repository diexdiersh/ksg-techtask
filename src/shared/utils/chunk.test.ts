import {chunk} from './chunk.util.js'

describe('chunk', () => {
  it('should split an array into chunks of specified size', () => {
    const inputArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const chunkSize = 3
    const expectedOutput = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]

    const result = chunk(inputArray, chunkSize)
    expect(result).toEqual(expectedOutput)
  })

  it('should return an empty array when input array is empty', () => {
    const inputArray: number[] = []
    const chunkSize = 3
    const expectedOutput: number[][] = []

    const result = chunk(inputArray, chunkSize)
    expect(result).toEqual(expectedOutput)
  })

  it('should handle chunk size greater than array length', () => {
    const inputArray = [1, 2, 3]
    const chunkSize = 10
    const expectedOutput = [[1, 2, 3]]

    const result = chunk(inputArray, chunkSize)
    expect(result).toEqual(expectedOutput)
  })

  it('should handle chunk size of 1', () => {
    const inputArray = [1, 2, 3, 4]
    const chunkSize = 1
    const expectedOutput = [[1], [2], [3], [4]]

    const result = chunk(inputArray, chunkSize)
    expect(result).toEqual(expectedOutput)
  })

  it('should handle chunk size equal to array length', () => {
    const inputArray = [1, 2, 3, 4]
    const chunkSize = 4
    const expectedOutput = [[1, 2, 3, 4]]

    const result = chunk(inputArray, chunkSize)
    expect(result).toEqual(expectedOutput)
  })
})

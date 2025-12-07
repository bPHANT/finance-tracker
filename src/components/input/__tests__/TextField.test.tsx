import { render } from "@testing-library/react-native"
import React from "react"
import TextField from "../TextField"

describe("TextField Component", () => {
  it("renders correctly with title", () => {
    const { getByText } = render(<TextField title='Name' />)
    expect(getByText("Name")).toBeTruthy()
  })

  it("renders with value", () => {
    const { getByDisplayValue } = render(
      <TextField title='Amount' value='100.50' />
    )
    expect(getByDisplayValue("100.50")).toBeTruthy()
  })

  it("renders with placeholder", () => {
    const { getByPlaceholderText } = render(
      <TextField title='Description' placeholder='Enter description' />
    )
    expect(getByPlaceholderText("Enter description")).toBeTruthy()
  })

  it("renders with balance prop", () => {
    const { getByText } = render(<TextField title='Balance' balance />)
    expect(getByText("Balance")).toBeTruthy()
  })
})

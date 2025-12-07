import React from "react"
import renderer from "react-test-renderer"
import TextField from "../TextField"

describe("TextField Component", () => {
  it("renders correctly with title", () => {
    const tree = renderer.create(<TextField title='Name' />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("renders with value", () => {
    const tree = renderer
      .create(<TextField title='Amount' value='100.50' />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("renders with placeholder", () => {
    const tree = renderer
      .create(<TextField title='Description' placeholder='Enter description' />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("renders with balance prop", () => {
    const tree = renderer.create(<TextField title='Balance' balance />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})

import React from "react"
import renderer from "react-test-renderer"
import Button from "../Button"

describe("Button Component", () => {
  it("renders correctly with title", () => {
    const tree = renderer
      .create(<Button title='Click me' onPress={() => {}} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("renders with icon", () => {
    const tree = renderer
      .create(<Button title='With Icon' icon='add' onPress={() => {}} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("renders with emoji background", () => {
    const tree = renderer
      .create(
        <Button
          title='With Emoji'
          emojiWithBackground={{ emoji: "🎉", color: "orange" }}
          onPress={() => {}}
        />
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("renders with submit functional styling", () => {
    const tree = renderer
      .create(<Button title='Submit' functional='submit' onPress={() => {}} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("renders with cancel functional styling", () => {
    const tree = renderer
      .create(<Button title='Cancel' functional='cancel' onPress={() => {}} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("renders with arrow right", () => {
    const tree = renderer
      .create(<Button title='Next' arrowRight onPress={() => {}} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("renders with textLeft alignment", () => {
    const tree = renderer
      .create(<Button title='Left Aligned' textLeft onPress={() => {}} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})

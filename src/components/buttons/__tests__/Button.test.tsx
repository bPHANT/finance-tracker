import { fireEvent, render, waitFor } from "@testing-library/react-native"
import React from "react"
import Button from "../Button"

describe("Button Component", () => {
  it("renders correctly with title", async () => {
    const { getByText } = render(<Button title='Click me' onPress={() => {}} />)
    await waitFor(() => expect(getByText("Click me")).toBeTruthy())
  })

  it("renders with icon", async () => {
    const { getByText } = render(
      <Button title='With Icon' icon='add' onPress={() => {}} />
    )
    await waitFor(() => expect(getByText("With Icon")).toBeTruthy())
  })

  it("renders with emoji background", async () => {
    const { getByText } = render(
      <Button
        title='With Emoji'
        emojiWithBackground={{ emoji: "🎉", color: "orange" }}
        onPress={() => {}}
      />
    )
    await waitFor(() => expect(getByText("With Emoji")).toBeTruthy())
  })

  it("calls onPress when pressed", async () => {
    const onPressMock = jest.fn()
    const { getByText } = render(
      <Button title='Test Button' onPress={onPressMock} />
    )

    await waitFor(() => getByText("Test Button"))
    fireEvent.press(getByText("Test Button"))

    expect(onPressMock).toHaveBeenCalledTimes(1)
  })

  it("renders with submit functional styling", async () => {
    const { getByText } = render(
      <Button title='Submit' functional='submit' onPress={() => {}} />
    )
    await waitFor(() => expect(getByText("Submit")).toBeTruthy())
  })

  it("renders with cancel functional styling", async () => {
    const { getByText } = render(
      <Button title='Cancel' functional='cancel' onPress={() => {}} />
    )
    await waitFor(() => expect(getByText("Cancel")).toBeTruthy())
  })

  it("renders with arrow right", async () => {
    const { getByText } = render(
      <Button title='Next' arrowRight onPress={() => {}} />
    )
    await waitFor(() => expect(getByText("Next")).toBeTruthy())
  })

  it("renders with textLeft alignment", async () => {
    const { getByText } = render(
      <Button title='Left Aligned' textLeft onPress={() => {}} />
    )
    await waitFor(() => expect(getByText("Left Aligned")).toBeTruthy())
  })
})

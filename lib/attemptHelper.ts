export const getTestAttemptMap = (userId: any, testId: any) => {
  const attemptMapData = 'attempt_test_map_' + userId

  try {
    const attemptIDs = JSON.parse(localStorage.getItem(attemptMapData)!)

    return attemptIDs[testId]
  } catch (err) {}

  return null
}

export const getCachedAttemptTime = (attemptId: any) => {
  const currentAttemptTime = 'attempt_time_' + attemptId
  try {
    const savedTime: any = localStorage.getItem(currentAttemptTime)

    return JSON.parse(savedTime)
  } catch (ex) {
    return null
  }
}

export const getCacheAttemptQuestionPosition = (attemptId: any) => {
  const questionPosition = 'attempt_question_position_' + attemptId
  try {
    const savedData: any = localStorage.getItem(questionPosition)

    return JSON.parse(savedData)
  } catch (ex) {
    return null
  }
}

export const getCacheTestOfAttempt = (attemptId: any) => {
  const cachedTestData = 'test_data_of_attempt_' + attemptId
  try {
    const savedData: any = localStorage.getItem(cachedTestData)

    return JSON.parse(savedData)
  } catch (ex) {
    return null
  }
}

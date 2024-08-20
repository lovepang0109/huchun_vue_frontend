import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

interface TakeTestState {
  test: any
  user: any
  questionIndex: number
  question: any
  codingQuestion: any
  answersOfUser: any
  serverStartTime: any
  localStartTime: any
  clientData: any
  attempt: any
  isCoding: boolean
  previousUrl: string
  testStarted: boolean
  theTime: any
  init: (newTest: any) => void
  updateUserInfo: (data: any) => void
  updateTestStarted: (started: boolean) => void
  updateAnswersOfUser: (answers: any) => void
  updateServerStartTime: (time: any) => void
  updateLocalStartTime: (time: any) => void
  updateCodingQuestion: (question: any) => void
  updateClientData: (data: any) => void
  adjustLocalTime: (time: any) => void
  updateIsCoding: (isCode: any) => void
  updateAttempt: (atm: any) => void
  nextQuestion: () => void
  previousQuestion: () => void
  toQuestion: (idx: number) => void
  clear: () => void
}

export const useTakeTestStore = create<TakeTestState>()(
  devtools(
    persist(
      (set, get) => ({
        test: null,
        user: null,
        questionIndex: 0,
        question: {},
        attempt: {},
        codingQuestion: {
          stats: [],
          selectedLang: {
            language: '',
          },
          executeCode: () => { }
        },
        clientData: {},
        answersOfUser: { QA: [] },
        serverStartTime: '',
        localStartTime: '',
        previousUrl: '',
        isCoding: false,
        testStarted: false,
        theTime: '',
        init: (newTest) =>
          set((state) => ({
            test: newTest,
            questionIndex: 0,
            question: newTest.questions[0],
          })),
        updateUserInfo: (data) => set((state) => ({ ...state, user: data })),
        updateTestStarted: (started) => set((state) => ({ ...state, testStarted: started })),
        updateAnswersOfUser: (answers) => set((state) => ({ ...state, answersOfUser: answers })),
        updateServerStartTime: (time) => set((state) => ({ ...state, serverStartTime: time })),
        updateLocalStartTime: (time) => set((state) => ({ ...state, localStartTime: time })),
        updateCodingQuestion: (newQuestion) => set((state) => ({ ...state, codingQuestion: newQuestion })),
        adjustLocalTime: (time) => (() => {
          const serverTime = get().serverStartTime
          const localTime = get().localStartTime
          if (serverTime && localTime)
            return new Date(serverTime.getTime() + (time - localTime))
          return time
        }),
        updateClientData: (data) => set((state) => ({ ...state, clientData: data })),
        updateIsCoding: (isCode) => set((state) => ({ ...state, isCoding: isCode })),
        updateAttempt: (atm) => set((state) => ({ attempt: atm })),
        nextQuestion: () => {
          const idx = get().questionIndex
          if (idx < get().test.questions.length - 1) {
            set((state) => ({
              questionIndex: idx + 1,
              question: state.test.questions[idx + 1],
            }))
          }
        },
        previousQuestion: () => {
          const idx = get().questionIndex
          if (idx > 0) {
            set((state) => ({
              questionIndex: idx - 1,
              question: state.test.questions[idx - 1],
            }))
          }
        },
        toQuestion: (idx) =>
          set((state) => ({
            questionIndex: idx,
            question: state.test.questions[idx],
          })),
        clear: () =>
          set((state) => ({
            test: null,
            questionIndex: 0,
            question: {},
            attempt: {},
          })),
      }),
      {
        name: 'take-test-storage',
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
)

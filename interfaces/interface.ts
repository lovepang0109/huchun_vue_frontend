export interface contentSummeryProps {
  assessments: number;
  onlineSessions: number;
  totalItems: number;
  resources: number;
  quiz: number;
  video: number;
}

export interface CourseDataEntry {
  _id?: string;
  accessMode?: string;
  active?: boolean;
  brandName?: string;
  buyers?: [];
  countries?: CountryEntry[];
  courseCode?: string;
  currency?: string;
  certificate?: boolean;
  createdAt?: string;
  classroom?: [];
  discountValue?: number;
  disableAccess?: boolean;
  description?: string;
  enableOrdering?: boolean;
  enabledCodeLang?: [];
  gocart?: boolean;
  imageUrl?: string;
  instructors?: [];
  includes?: string;
  lastModifiedBy?: string;
  learningIncludes?: string;
  level?: string;
  locations?: string[];
  marketPlacePrice?: number;
  notificationMsg?: string;
  origin?: string;
  owner?: string;
  price?: number;
  quantity?: number;
  rating?: number;
  requirements?: string;
  reviewers?: [];
  sections?: [];
  startDate?: string;
  status?: string;
  statusChangedAt?: string;
  subjects?: SubjectEntry[];
  summary?: string;
  synced?: boolean;
  title?: string;
  totalRatings?: number;
  type?: string;
  typeItem?: string;
  user?: CourseUserEntry;
  updatedAt?: string;
  uid?: string;
}

export interface CourseUserEntry {
  _id?: string;
  name?: string;
}

export interface SubjectEntry {
  _id?: string;
  name?: string;
}

export interface CountryEntry {
  name?: string;
  code?: string;
  price?: number;
  currency?: string;
  discountValue?: number;
  enableMarketPlacePrice?: boolean;
  enablePrice?: boolean;
  marketPlacePrice?: number;
}

export interface QFeedbacksEntry {
  teacherId?: string;
  practicesetId?: string;
  questionid?: string;
  studentId?: string;
  feedbacks?: string[];
  comment?: string;
  isReviewing?: boolean;
}

export enum CourseStatusType {
  TEMPT = "tempt",
  DRAFT = "draft",
  PUBLISHED = "published",
  REVOKED = "revoked",
  EXPIRED = "expired",
}

export interface IDropdownSettings {
  singleSelection?: boolean;
  idField?: string;
  textField?: string;
  tooltipField?: string;
  disabledField?: string;
  enableCheckAll?: boolean;
  selectAllText?: string;
  unSelectAllText?: string;
  allowSearchFilter?: boolean;
  clearSearchFilter?: boolean;
  maxHeight?: number;
  itemsShowLimit?: number;
  limitSelection?: number;
  searchPlaceholderText?: string;
  noDataAvailablePlaceholderText?: string;
  noFilteredDataAvailablePlaceholderText?: string;
  closeDropDownOnSelection?: boolean;
  showSelectedItemsAtTop?: boolean;
  defaultOpen?: boolean;
  allowRemoteDataSearch?: boolean;
}
export interface User {
  role: string;
  _id: string;
}

export interface Value {
  title: string;
  slug?: string;
  canEdit?: boolean;
  instructors?: { _id: string }[];
  origin: string;
  user: { _id: string };
  owner: { _id: string };
}


export interface ChartOptions {
  series: any[];
  chart: {
    height: number;
    type: string;
  };
  fill: {
    colors: string[];
  };
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: boolean;
        };
      };
    };
  };
  legend: {
    show: boolean;
  };
  labels: string[];
}

export interface CkeOptionsWithToolbar {
  placeholder: string;
  simpleUpload: any;
}

export interface CkeOptionsWithToolbarAndNotes {
  placeholder: string;
  simpleUpload: any;
}

export interface CkeSectionConfig {
  placeholder: string;
  simpleUpload: {
    uploadUrl: string;
    withCredentials: boolean;
    headers: {
      "X-CSRF-TOKEN": string;
      Authorization: string;
    };
  };
}

export interface Params {
  reqAdditionalnfo: boolean;
  limit: number;
  page: number;
  absent: boolean;
  ready: boolean;
  started: boolean;
  finished: boolean;
  abandoned: boolean;
  admit: boolean;
  reject: boolean;
  classes: string[];
}

export interface IDropdownSettings {
  singleSelection?: boolean;
  idField?: string;
  textField?: string;
  tooltipField?: string;
  disabledField?: string;
  enableCheckAll?: boolean;
  selectAllText?: string;
  unSelectAllText?: string;
  allowSearchFilter?: boolean;
  clearSearchFilter?: boolean;
  maxHeight?: number;
  itemsShowLimit?: number;
  limitSelection?: number;
  searchPlaceholderText?: string;
  noDataAvailablePlaceholderText?: string;
  noFilteredDataAvailablePlaceholderText?: string;
  closeDropDownOnSelection?: boolean;
  showSelectedItemsAtTop?: boolean;
  defaultOpen?: boolean;
  allowRemoteDataSearch?: boolean;
}

export interface Feedbacks {
  comment?: string;
  chatComment?: string;
  classRooms?: [];
  studentId?: string;
  question?: string;
  _id?: string;
}

export interface CkeOptionswithToolbar {
  placeholder?: string;
  ckeOptions?: any;
}

export interface Stats {
  total?: number;
  resolved?: number;
}

export interface ParamsData {
  limit?: number;
  page?: number;
  sort?: string;
  includeCount?: boolean;
  classroom?: [];
}

export interface MenuItemSort {
  totalTimeTaken?: string;
  pecentCorrects?: string;
  studentName?: string;
  rollNumber?: string;
}

export enum QuestionComplexity {
  EASY = 'easy',
  MODERATE = 'moderate',
  HARD = 'hard'
}
export enum QuestionCategory {
  MCQ = 'mcq',
  FIB = 'fib',
  CODE = 'code',
  DESCRIPTIVE = 'descriptive',
  MIXMATCH = 'mixmatch'
}
export enum QuestionType {
  SINGLE = 'single',
  MULTIPLE = 'multiple'
}
export enum IsAllowReuse {
  GLOBAL = 'global',
  SELF = 'self',
  NONE = 'none',
  EVERYONE = 'everyone'
}
export interface Answer {
  answerText: string,
  answerTextArray: string[],
  isCorrectAnswer: boolean,
  // For coding question type. Use answerText for output
  input?: string,
  marks?: number,
  // Base data for Psychometric quetion
  score?: number,
  // mixmatch 
  userText?: string,
  correctMatch?: string,
  audioFiles?: string[]
}

export interface AnswerExplain {
  user: {
    _id: '',
    name: ''
  },
  explanation: '',
  isApproved: false
}

export interface TestCase {
  args: string,
  input: string,
  output: string,
  status?: boolean,
  isSample?: boolean,
  solutionOutput?: string
}

export interface Coding {
  display?: string,
  language: string,
  template: string,
  solution: string,
  timeLimit: number,
  memLimit: number
}

export interface Question {
  _id?: string,
  order?: number,
  user: string,
  practiceSets: string[],
  subject?: {
    _id: string,
    name: string
  },
  unit?: {
    _id: string,
    name: string
  },
  topic?: {
    _id: string,
    name: string
  },
  complexity?: QuestionComplexity,
  questionType: QuestionType,
  isAllowReuse?: IsAllowReuse,
  category: QuestionCategory,
  questionText: string,
  questionTextArray: string[],
  answerExplainArr?: string[],
  answerExplain?: string,
  prefferedLanguage: string[],
  questionHeader: string,
  answerNumber: number,
  minusMark: number,
  plusMark: number,
  createdAt: Date,
  updatedAt: Date,
  isActive: boolean,
  wordLimit?: number,
  partialMark: boolean,
  answers: Answer[],
  userInputDescription: string,
  hasUserInput: boolean,
  argumentDescription: string,
  hasArg: boolean,
  modelId?: number,
  tComplexity: number,
  coding: Coding[],
  testcases?: TestCase[],
  approveStatus: string,
  alternativeExplanations?: AnswerExplain[],
  tags: string[],
  selected?: boolean,
  audioFiles?: string[],
  answerExplainAudioFiles?: string[],
  section?: string,
}
export interface Topic {
  _id: string,
  name: string
}
export interface Unit {
  _id: string,
  name: string,
  topics: Topic[]
}
export interface Subject {
  _id: string,
  name: string,
  units: Unit[]
}
export interface Coding {
  display?: string,
  language: string,
  template: string,
  solution: string,
  timeLimit: number,
  memLimit: number
}
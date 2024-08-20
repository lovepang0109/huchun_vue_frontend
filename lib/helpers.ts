//@ts-ignore
import DOMPurify from "isomorphic-dompurify";
import base64url from "base64url";
import * as stripJs from "strip-js";
import clientApi from "./clientApi";
import * as alertify from "alertifyjs";

export enum ConfirmResult {
  OK = "OK",
  Cancel = 0,
}
const swearwords = [
  "ahole",
  "anus",
  "ash0le",
  "ash0les",
  "asholes",
  "ass",
  "Ass Monkey",
  "Assface",
  "assh0le",
  "assh0lez",
  "asshole",
  "assholes",
  "assholz",
  "asswipe",
  "azzhole",
  "bassterds",
  "bastard",
  "bastards",
  "bastardz",
  "basterds",
  "basterdz",
  "Biatch",
  "bitch",
  "bitches",
  "Blow Job",
  "boffing",
  "butthole",
  "buttwipe",
  "c0ck",
  "c0cks",
  "c0k",
  "Carpet Muncher",
  "cawk",
  "cawks",
  "Clit",
  "cnts",
  "cntz",
  "cock",
  "cockhead",
  "cock-head",
  "cocks",
  "CockSucker",
  "cock-sucker",
  "crap",
  "cum",
  "cunt",
  "cunts",
  "cuntz",
  "dick",
  "dild0",
  "dild0s",
  "dildo",
  "dildos",
  "dilld0",
  "dilld0s",
  "dominatricks",
  "dominatrics",
  "dominatrix",
  "dyke",
  "enema",
  "fuck",
  "fucker",
  "f u c k",
  "f u c k e r",
  "fag",
  "fag1t",
  "faget",
  "fagg1t",
  "faggit",
  "faggot",
  "fagit",
  "fags",
  "fagz",
  "faig",
  "faigs",
  "fart",
  "flipping the bird",
  "fuck",
  "fucker",
  "fuckin",
  "fucking",
  "fucks",
  "Fudge Packer",
  "fuk",
  "Fukah",
  "Fuken",
  "fuker",
  "Fukin",
  "Fukk",
  "Fukkah",
  "Fukken",
  "Fukker",
  "Fukkin",
  "g00k",
  "gay",
  "gayboy",
  "gaygirl",
  "gays",
  "gayz",
  "God-damned",
  "h00r",
  "h0ar",
  "h0re",
  "hells",
  "hoar",
  "hoor",
  "hoore",
  "jackoff",
  "jap",
  "japs",
  "jerk-off",
  "jisim",
  "jiss",
  "jizm",
  "jizz",
  "knob",
  "knobs",
  "knobz",
  "kunt",
  "kunts",
  "kuntz",
  "Lesbian",
  "Lezzian",
  "Lipshits",
  "Lipshitz",
  "masochist",
  "masokist",
  "massterbait",
  "masstrbait",
  "masstrbate",
  "masterbaiter",
  "masterbate",
  "masterbates",
  "MothaFucker",
  "MothaFuker",
  "MothaFukkah",
  "MothaFukker",
  "MotherFucker",
  "MotherFukah",
  "MotherFuker",
  "MotherFukkah",
  "MotherFukker",
  "mother-fucker",
  "Mutha Fucker",
  "Mutha Fukah",
  "Mutha Fuker",
  "Mutha Fukkah",
  "Mutha Fukker",
  "n1gr",
  "nastt",
  "nigger",
  "nigur",
  "niiger",
  "niigr",
  "orafis",
  "orgasim",
  "orgasm",
  "orgasum",
  "oriface",
  "orifice",
  "orifiss",
  "packi",
  "packie",
  "packy",
  "paki",
  "pakie",
  "paky",
  "pecker",
  "peeenus",
  "peeenusss",
  "peenus",
  "peinus",
  "pen1s",
  "penas",
  "penis",
  "penis-breath",
  "penus",
  "penuus",
  "Phuc",
  "Phuck",
  "Phuk",
  "Phuker",
  "Phukker",
  "polac",
  "polack",
  "polak",
  "Poonani",
  "pr1c",
  "pr1ck",
  "pr1k",
  "pusse",
  "pussee",
  "pussy",
  "puuke",
  "puuker",
  "queer",
  "queers",
  "queerz",
  "qweers",
  "qweerz",
  "qweir",
  "recktum",
  "rectum",
  "retard",
  "sadist",
  "scank",
  "schlong",
  "screwing",
  "semen",
  "sex",
  "sexy",
  "Sh!t",
  "sh1t",
  "sh1ter",
  "sh1ts",
  "sh1tter",
  "sh1tz",
  "shit",
  "shits",
  "shitter",
  "Shitty",
  "Shity",
  "shitz",
  "Shyt",
  "Shyte",
  "Shytty",
  "Shyty",
  "skanck",
  "skank",
  "skankee",
  "skankey",
  "skanks",
  "Skanky",
  "slut",
  "sluts",
  "Slutty",
  "slutz",
  "son-of-a-bitch",
  "tit",
  "turd",
  "va1jina",
  "vag1na",
  "vagiina",
  "vagina",
  "vaj1na",
  "vajina",
  "vullva",
  "vulva",
  "w0p",
  "wh00r",
  "wh0re",
  "whore",
  "xrated",
  "xxx",
  "b!+ch",
  "bitch",
  "blowjob",
  "clit",
  "arschloch",
  "fuck",
  "shit",
  "ass",
  "asshole",
  "b!tch",
  "b17ch",
  "b1tch",
  "bastard",
  "bi+ch",
  "boiolas",
  "buceta",
  "c0ck",
  "cawk",
  "chink",
  "cipa",
  "clits",
  "cock",
  "cum",
  "cunt",
  "dildo",
  "dirsa",
  "ejakulate",
  "fatass",
  "fcuk",
  "fuk",
  "fux0r",
  "hoer",
  "hore",
  "jism",
  "kawk",
  "l3itch",
  "3i+ch",
  "lesbian",
  "masturbate",
  "masterbat",
  "masterbat3",
  "motherfucker",
  "s.o.b.",
  "mofo",
  "nazi",
  "nigga",
  "nigger",
  "nutsack",
  "phuck",
  "pimpis",
  "pusse",
  "pussy",
  "scrotum",
  "sh!t",
  "shemale",
  "shi+",
  "sh!+",
  "slut",
  "smut",
  "teets",
  "tits",
  "boobs",
  "b00bs",
  "teez",
  "testical",
  "testicle",
  "titt",
  "w00se",
  "jackoff",
  "wank",
  "whoar",
  "whore",
  "damn",
  "dyke",
  "fuck",
  "shit",
  "@$$",
  "amcik",
  "andskota",
  "arse",
  "assrammer",
  "ayir",
  "bi7ch",
  "bitch",
  "bollock",
  "breasts",
  "butt-pirate",
  "cabron",
  "cazzo",
  "chraa",
  "chuj",
  "Cock",
  "cunt",
  "d4mn",
  "daygo",
  "dego",
  "dick",
  "dike",
  "dupa",
  "dziwka",
  "ejackulate",
  "Ekrem",
  "Ekto",
  "enculer",
  "faen",
  "fag",
  "fanculo",
  "fanny",
  "feces",
  "feg",
  "Felcher",
  "ficken",
  "fitt",
  "Flikker",
  "foreskin",
  "Fotze",
  "Fu",
  "fuk",
  "futkretzn",
  "gay",
  "gook",
  "guiena",
  "h0r",
  "h4x0r",
  "hell",
  "helvete",
  "hoer",
  "honkey",
  "Huevon",
  "hui",
  "injun",
  "jizz",
  "kanker",
  "kike",
  "klootzak",
  "kraut",
  "knulle",
  "kuk",
  "kuksuger",
  "Kurac",
  "kurwa",
  "kusi",
  "kyrpa",
  "lesbo",
  "mamhoon",
  "masturbat",
  "merd",
  "mibun",
  "monkleigh",
  "mouliewop",
  "muie",
  "mulkku",
  "muschi",
  "nazis",
  "nepesaurio",
  "nigger",
  "orospu",
  "paska",
  "perse",
  "picka",
  "pierdol",
  "pillu",
  "pimmel",
  "piss",
  "pizda",
  "poontsee",
  "poop",
  "porn",
  "p0rn",
  "pr0n",
  "preteen",
  "pula",
  "pule",
  "puta",
  "puto",
  "qahbeh",
  "queef",
  "rautenberg",
  "schaffer",
  "scheiss",
  "schlampe",
  "schmuck",
  "screw",
  "sh!t",
  "sharmuta",
  "sharmute",
  "shipal",
  "shiz",
  "skribz",
  "skurwysyn",
  "sphencter",
  "spic",
  "spierdalaj",
  "splooge",
  "suka",
  "b00b",
  "testicle",
  "titt",
  "twat",
  "vittu",
  "wank",
  "wetback",
  "wichser",
  "wop",
  "yed",
  "zabourah",
];

const swearWordPath = "/assets/badwords/en.json";

const calendarColors: any = {
  red: {
    primary: "#ad2121",
    secondary: "#FAE3E3",
  },
  blue: {
    primary: "#1e90ff",
    secondary: "#D1E8FF",
  },
  yellow: {
    primary: "#e3bc08",
    secondary: "#FDF1BA",
  },
};

const linkifyHtml = (inputText: any) => {
  // go through the process of linkify
  // Split text by </a> to exclude existing link from the search, then find url and linkify it

  const parts = inputText.split("</a>");

  let output = "";
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    // var idx = p.search(/<a[^>]*>([^<]+)<\/a>/)
    const idx = p.search(/<a[^>]*>([^<]+)/);

    if (idx > -1) {
      output += linkify(p.substring(0, idx)) + p.substring(idx) + "</a>";
    } else {
      output += linkify(p);
    }
  }

  return output;

  // var parser = new DOMParser();
  // var htmlDoc = parser.parseFromString('<div>' + inputText + '</div>', 'text/xml');
  // htmlDoc.querySelectorAll('*').forEach(function(e: HTMLElement) {
  //     if (e.tagName !== 'a' && e.tagName !== 'math' && e.innerText) {
  //         e.innerText = linkify(e.innerText)
  //     }
  // })
  // return htmlDoc.documentElement.innerHTML;
};

const removeLastSpace = (str: any) => {
  return str.replace(/\s+$/, "");
};

const linkify = (inputText: any) => {
  let replacedText;

  //URLs starting with http://, https://, or ftp://
  const replacePattern1 =
    /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  replacedText = inputText.replace(
    replacePattern1,
    '<a href="$1" target="_blank">$1 </a>'
  );

  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  const replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  replacedText = replacedText.replace(
    replacePattern2,
    '$1<a href="http://$2" target="_blank">$2 </a>'
  );

  //Change email addresses to mailto:: links.
  const replacePattern3 =
    /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
  replacedText = replacedText.replace(
    replacePattern3,
    '<a href="mailto:$1">$1 </a>'
  );

  return replacedText;
};

// IF input is handled by ckeditor and mediaEmbeded plugin is on (it is on by default), we should bypass linkify
export const compileDiscussion = (input: any, noLinkify = false) => {
  input = trimEmptySpace(input || "");
  let newInput = stripJs(input);
  newInput = replaceBadWords(newInput);
  if (!noLinkify) {
    newInput = linkifyHtml(newInput);
  }

  return newInput;
};

export const replaceBadWords = (input: any) => {
  let swearwords: any;
  if (localStorageIsEnabled()) {
    if (localStorage.getItem("localSwears") === null) {
      // stringify the array so that it can be stored in local storage
      localStorage.setItem(
        "localSwears",
        JSON.stringify(readJsonFromController(swearWordPath))
      );
    }
    //@ts-ignore
    swearwords = JSON.parse(localStorage.getItem("localSwears"));
  } else {
    swearwords = readJsonFromController(swearWordPath);
  }
  if (swearwords === null) {
    return input;
  }
  if (input) {
    for (let i = 0; i < swearwords.length; i++) {
      const swear = new RegExp("\\b" + swearwords[i] + "\\b", "gi");
      if (input.match(swear)) {
        const replacement = stringRepeat(swearwords[i].length, "*");
        input = input.replace(swear, replacement);
      }
    }
  }

  return input;
};

const stringRepeat = (num: any, replace: any) => {
  return new Array(num + 1).join(replace);
};

const localStorageIsEnabled = () => {
  const uid = new Date().toString();
  let result;

  try {
    localStorage.setItem("uid", uid);
    result = localStorage.getItem("uid") === uid;
    localStorage.removeItem("uid");
    return result && localStorage;
  } catch (e) {}
};

export const readJsonFromController = (file: any) => {
  const request = new XMLHttpRequest();
  request.open("GET", file, false);
  request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  request.send(null);
  try {
    return JSON.parse(request.responseText);
  } catch (e) {
    return "";
  }
};

export const trimEmptySpace = (data: any) => {
  data = data.trim().replace(/(\&nbsp\;|\s)*\<\/p\>/g, "&nbsp;</p>");

  //Parse using DOMParser native way
  const parser = new DOMParser();
  const hDoc = parser.parseFromString(data, "text/html");

  const subTags = hDoc.querySelectorAll("p");

  for (let i = subTags.length - 1; i >= 0; i--) {
    if (!subTags[i].innerHTML.replace(/\&nbsp\;*/g, "").trim()) {
      subTags[i].remove();
    }
  }
  // trim last empty paragraph
  // data = data.replace(/([\s\S]*)(\<p\>(\&nbsp\;|\s)*\<\/p\>)/, "$1")
  // replace trailing space in paragraph
  return hDoc.body.innerHTML;
};

export const embedVideo = (url: any) => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url?.match(regExp);

  if (match && match[2].length == 11) {
    const ycode = match[2];
    const videoUrl =
      "https://www.youtube.com/embed/" +
      ycode +
      "?enablejsapi=1&playerapiid=ytplayer&autoplay=0&controls=0&autohide=1&modestbranding=1&controls=0&frameborder=0&allow=accelerometer&autoplay&modestbranding;";
    return DOMPurify.sanitize(videoUrl);
  } else {
    return DOMPurify.sanitize(url);
  }
};

export const getElearningFullPath = (baseUrl: string, path: any) => {
  if (!path) {
    return "";
  }
  if (path.indexOf("http") == 0) {
    return path;
  }

  if (path.indexOf("uploads-v2") > -1) {
    return pathJoin(baseUrl, path);
  }

  return pathJoin(baseUrl, "uploads/elearning", path);
};

export const bypassSecurityTrustHtml = (html: any) => {
  return DOMPurify.sanitize(html);
};

export const pathJoin = (...args: any[]) => {
  const separator = "/";
  args = args.map((part, index) => {
    if (index) {
      part = part.replace(new RegExp("^" + separator), "");
    }
    if (index !== args.length - 1) {
      part = part.replace(new RegExp(separator + "$"), "");
    }
    return part;
  });
  return args.join(separator);
};

export const getTestAttemptMap = (userId: string, testId: string) => {
  const attemptMapData = "attempt_test_map_" + userId;

  try {
    const attemptIDs: any = JSON.parse(localStorage.getItem(attemptMapData)!);

    return attemptIDs[testId];
  } catch (err) {}

  return null;
};

export const getCacheAttemptQuestionPosition = (attemptId: string) => {
  const questionPosition = "attempt_question_position_" + attemptId;
  try {
    const savedData: any = localStorage.getItem(questionPosition);

    return JSON.parse(savedData);
  } catch (ex) {
    return null;
  }
};

export const cacheAttemptQuestionPosition = (attemptId: any, data: any) => {
  try {
    if (attemptId) {
      localStorage.setItem(
        "attempt_question_position_" + attemptId,
        JSON.stringify(data)
      );
    }
  } catch (ex) {}
};
export const getCachedAttemptTime = (attemptId: string) => {
  const currentAttemptTime = "attempt_time_" + attemptId;
  try {
    const savedTime: any = localStorage.getItem(currentAttemptTime);

    return JSON.parse(savedTime);
  } catch (ex) {
    return null;
  }
};

export const getCacheTestOfAttempt = (attemptId: string) => {
  const cachedTestData = "test_data_of_attempt_" + attemptId;
  try {
    const savedData: any = localStorage.getItem(cachedTestData);

    return JSON.parse(savedData);
  } catch (ex) {
    return null;
  }
};

export const getSectionTime = (totalTime?: any) => {
  // Adapt new and old section time
  if (totalTime && totalTime.length > 0) {
    // Old data
    if (typeof totalTime[0] == "string") {
      const oTotalTime = JSON.parse(totalTime[0]);
      const sectionTime = [];
      for (const k in oTotalTime) {
        let section: any = {};
        section[k] = oTotalTime[k];
        sectionTime.push(section);
      }

      return sectionTime;
    } else {
      return totalTime;
    }
  }
  return null;
};

export const cacheTestAttemptMap = (
  userId: any,
  testId: any,
  attemptId: any
) => {
  let attemptIDs: any = {};
  const existingAttemptIdStr = localStorage.getItem(
    `attempt_test_map_${userId}`
  );
  if (existingAttemptIdStr) {
    try {
      attemptIDs = JSON.parse(existingAttemptIdStr);
    } catch (err) {
      console.log("Fail to parse attempt_test_map_", err);
    }
  }
  attemptIDs[testId] = attemptId;
  localStorage.setItem(
    `attempt_test_map_${userId}`,
    JSON.stringify(attemptIDs)
  );
};

export const cacheTestDataOfAttempt = (attemptId: any, testData: any) => {
  try {
    if (attemptId) {
      localStorage.setItem(
        "test_data_of_attempt_" + attemptId,
        JSON.stringify(testData)
      );
    }
  } catch (ex) {}
};

export const getCacheAttemptFraudCheck = (attemptId: any) => {
  try {
    if (attemptId) {
      const savedData = localStorage.getItem("attempt_fraud_" + attemptId);
      return JSON.parse(savedData!);
    }
  } catch (ex) {}
  return null;
};

export const cacheQuestionOrder = (attemptId: any, data: any) => {
  try {
    if (attemptId) {
      localStorage.setItem(
        `attempt_question_order_${attemptId}`,
        JSON.stringify(data)
      );
    }
  } catch (ex) {}
};

export const getCacheUserAnswers = (attemptId: any) => {
  try {
    if (attemptId) {
      const savedData: any = localStorage.getItem(`attempt_data_${attemptId}`);

      return JSON.parse(savedData);
    }
  } catch (ex) {}
  return null;
};

export const cacheUserAnswers = (attemptId: any, testData: any) => {
  try {
    if (attemptId) {
      localStorage.setItem(
        "attempt_data_" + attemptId,
        JSON.stringify(testData)
      );
    }
  } catch (ex) {}
};

export const getCacheQuestionOrder = (attemptId: any) => {
  try {
    const savedData: any = localStorage.getItem(
      "attempt_question_order_" + attemptId
    );

    return JSON.parse(savedData);
  } catch (ex) {
    return null;
  }
};

export const getCacheTestCameraTime = (userId: string, testId: string) => {
  return localStorage.getItem(
    `current_attempt_camera_time_${userId}_${testId}`
  );
};

export const cacheTestCameraTime = (
  userId: any,
  testId: any,
  cameraTime: any
) => {
  localStorage.setItem(
    `current_attempt_camera_time_${userId}_${testId}`,
    cameraTime
  );
};

export const newQuestion = (
  question: any,
  questionIndex: any,
  answersOfUser: any,
  updateAnswersOfUser: any
) => {
  let newAnswersOfUser = answersOfUser;
  if (
    questionIndex > answersOfUser.QA.length - 1 &&
    answersOfUser.QA &&
    question
  ) {
    newAnswersOfUser.QA[questionIndex] = {
      question: question._id,
      oldAnswers: [],
      answers: [],
      timeEslapse: 0,
      topic: question.topic,
      subject: question.subject,
      unit: question.unit,
      isMissed: false,
      answerChanged: 0,
    };
  }
  if (
    !(
      question.category === "code" && newAnswersOfUser.QA[questionIndex].answers
    )
  ) {
    newAnswersOfUser.QA[questionIndex] = {
      ...newAnswersOfUser.QA[questionIndex],
      answers: [],
    };
  }
  updateAnswersOfUser(newAnswersOfUser);
};
export const createQARow = (
  question: any,
  questionIndex: any,
  answersOfUser: any,
  updateAnswersOfUser: any,
  adjustLocalTime: any
) => {
  newQuestion(question, questionIndex, answersOfUser, updateAnswersOfUser);
  let newAnswersOfUser = answersOfUser;
  for (const i in question.answers) {
    if (question.answers[i].isChecked) {
      if (!newAnswersOfUser.QA[questionIndex].createdAt) {
        newAnswersOfUser.QA[questionIndex].createdAt = adjustLocalTime(
          new Date()
        );
      }
      const answer: any = {
        answerId: question.answers[i]._id,
        answerText: "",
        userText: "",
      };
      if (question.category === "fib") {
        answer.answerText = question.answers[i].answeredText;
        answer.mathData = question.answers[i].mathData;
      } else if (question.category === "code") {
        answer.codeLanguage = question.answers[i].codeLanguage;
        answer.code = question.answers[i].code;
        answer.testcases = question.answers[i].testcases;
      } else if (question.category === "mixmatch") {
        answer.answerText = question.answers[i].answerText;
        answer.userText = question.answers[i].userText;
        answer.isChecked = question.answers[i].isChecked;
      }
      newAnswersOfUser.QA[questionIndex].answers.push(answer);
    }
  }
  updateAnswersOfUser(newAnswersOfUser);
};

export const getCacheOffscreenTime = (attemptId: any) => {
  if (attemptId) {
    return localStorage.getItem(`offscreen_${attemptId}`);
  }
  return null;
};

export const removeCacheOffscreenTime = (attemptId: any) => {
  if (attemptId) {
    localStorage.removeItem(`offscreen_${attemptId}`);
  }
};

export const cacheAttemptFraudCheck = (attemptId: any, data: any) => {
  try {
    if (attemptId) {
      localStorage.setItem("attempt_fraud_" + attemptId, JSON.stringify(data));
    }
  } catch (ex) {}
};

export const setElapseTime = async (
  practice: any,
  questionIndex: any,
  lastCheckpointTime: any,
  answersOfUser: any,
  updateAnswersOfUser: any
) => {
  if (answersOfUser.QA[questionIndex]) {
    let newAnswersOfUser: any = answersOfUser;
    let elapseTime = new Date().getTime() - lastCheckpointTime;
    let attemptedTime = 0;
    newAnswersOfUser.QA.forEach(
      (qa: any) => (attemptedTime += qa ? qa.timeEslapse : 0)
    );
    const totalTestTime =
      (practice.orgTotalTime ? practice.orgTotalTime : practice.totalTime) *
      60 *
      1000;
    if (attemptedTime + elapseTime > totalTestTime) {
      elapseTime = totalTestTime - attemptedTime;
      if (elapseTime < 0) {
        elapseTime = 0;
      }
    }
    newAnswersOfUser.QA[questionIndex].timeEslapse += elapseTime;
    updateAnswersOfUser(newAnswersOfUser);

    return new Date().getTime();
  }
  return lastCheckpointTime;
};

export const getUserAnswers = (
  practice: any,
  questionIndex: any,
  lastCheckpointTime: any,
  answersOfUser: any,
  updateAnswersOfUser: any,
  adjustLocalTime: any
) => {
  const questions = practice.questions;
  if (!answersOfUser.QA[questionIndex] && questions && questions.length > 0) {
    createQARow(
      questions[questionIndex],
      questionIndex,
      answersOfUser,
      updateAnswersOfUser,
      adjustLocalTime
    );
  }
  setElapseTime(
    practice,
    questionIndex,
    lastCheckpointTime,
    answersOfUser,
    updateAnswersOfUser
  );

  let reArrangeUserAnswer: any = [];
  questions.forEach((value: any, idx: number) => {
    for (let i = 0; i < answersOfUser.QA.length; i++) {
      if (
        answersOfUser?.QA[i] != null &&
        value._id === answersOfUser?.QA[i].question
      ) {
        reArrangeUserAnswer[idx] = answersOfUser?.QA[i];
        break;
      }
    }
  });
  updateAnswersOfUser({ ...answersOfUser, QA: reArrangeUserAnswer });
  return {
    answersOfUser: answersOfUser.QA,
    practiceId: practice._id,
  };
};

export const clearCachedAttempt = (
  userId: any,
  testId: any,
  attemptId: any
) => {
  try {
    localStorage.removeItem("attempt_" + attemptId);
    localStorage.removeItem("attempt_data_" + attemptId);
    localStorage.removeItem("attempt_question_order_" + attemptId);
    localStorage.removeItem("attempt_time_" + attemptId);
    localStorage.removeItem("attempt_question_position_" + attemptId);
    localStorage.removeItem("test_data_of_attempt_" + attemptId);
    localStorage.removeItem("attempt_fraud_" + attemptId);
    localStorage.removeItem(`offscreen_${attemptId}`);
    localStorage.removeItem(`current_attempt_camera_time_${userId}_${testId}`);

    const mappingData = JSON.parse(
      localStorage.getItem(`attempt_test_map_${userId}`)!
    );
    delete mappingData[testId];
    localStorage.setItem(
      `attempt_test_map_${userId}`,
      JSON.stringify(mappingData)
    );
  } catch (ex) {}
};

export const cacheAttemptSubmission = (attemptId: any, data: any) => {
  try {
    if (attemptId) {
      localStorage.setItem(`attempt_${attemptId}`, JSON.stringify(data));
    }
  } catch (ex) {}
};

export const getCacheAttemptSubmission = (attemptId: any) => {
  try {
    const savedData: any = localStorage.getItem("attempt_" + attemptId);

    return JSON.parse(savedData);
  } catch (ex) {
    return null;
  }
};

export const fullScreen = (turnOn: any, document: any) => {
  if (turnOn) {
    if (
      !document.fullscreenElement ||
      !document.mozFullScreenElement ||
      !document.msFullscreenElement ||
      !document.webkitFullscreenElement
    ) {
      const open =
        document.documentElement.requestFullscreen ||
        document.documentElement.mozRequestFullScreen ||
        document.documentElement.webkitRequestFullscreen ||
        document.documentElement.msRequestFullscreen;
      if (open) {
        open
          .call(document.documentElement, function () {})
          .then((err: any) => {
            console.log(err);
          });
      }
    }
  } else {
    if (
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      document.webkitFullscreenElement
    ) {
      const exit =
        document.exitFullscreen ||
        document.mozCancelFullScreen ||
        document.webkitExitFullscreen ||
        document.msExitFullscreen;
      if (exit) {
        exit.call(document, function () {});
      }
    }
  }
};

export const isFullscreen = (document: any) => {
  // Return true if fullscreen mode is not supported
  const isSupported =
    document.documentElement.requestFullscreen ||
    document.documentElement.mozRequestFullScreen ||
    document.documentElement.webkitRequestFullscreen ||
    document.documentElement.msRequestFullscreen;

  return (
    !isSupported ||
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    document.webkitFullscreenElement
  );
};

export const changeCachedAttemptId = (
  userId: any,
  testId: any,
  oldAttemptId: any,
  newAttemptId: any
) => {
  try {
    // clone data to new cache
    localStorage.setItem(
      "attempt_" + newAttemptId,
      localStorage.getItem("attempt_" + oldAttemptId)!
    );
    localStorage.setItem(
      "attempt_data_" + newAttemptId,
      localStorage.getItem("attempt_data_" + oldAttemptId)!
    );
    localStorage.setItem(
      "attempt_question_order_" + newAttemptId,
      localStorage.getItem("attempt_question_order_" + oldAttemptId)!
    );
    localStorage.setItem(
      "attempt_time_" + newAttemptId,
      localStorage.getItem("attempt_time_" + oldAttemptId)!
    );
    localStorage.setItem(
      "attempt_question_position_" + newAttemptId,
      localStorage.getItem("attempt_question_position_" + oldAttemptId)!
    );
    localStorage.setItem(
      "test_data_of_attempt_" + newAttemptId,
      localStorage.getItem("test_data_of_attempt_" + oldAttemptId)!
    );
    localStorage.setItem(
      "attempt_fraud_" + newAttemptId,
      localStorage.getItem("attempt_fraud_" + oldAttemptId)!
    );
    localStorage.setItem(
      `offscreen_${newAttemptId}`,
      localStorage.getItem("offscreen_" + oldAttemptId)!
    );

    // remove old attempt data
    localStorage.removeItem("attempt_" + oldAttemptId);
    localStorage.removeItem("attempt_data_" + oldAttemptId);
    localStorage.removeItem("attempt_question_order_" + oldAttemptId);
    localStorage.removeItem("attempt_time_" + oldAttemptId);
    localStorage.removeItem("attempt_question_position_" + oldAttemptId);
    localStorage.removeItem("test_data_of_attempt_" + oldAttemptId);
    localStorage.removeItem("attempt_fraud_" + oldAttemptId);
    localStorage.removeItem(`offscreen_${oldAttemptId}`);

    const mappingData = JSON.parse(
      localStorage.getItem(`attempt_test_map_${userId}`)!
    );
    mappingData[testId] = newAttemptId;
    localStorage.setItem(
      `attempt_test_map_${userId}`,
      JSON.stringify(mappingData)
    );
  } catch (ex) {}
};

export const cacheAttemptTime = (attemptId: any, data: any) => {
  try {
    if (attemptId) {
      localStorage.setItem(`attempt_time_${attemptId}`, JSON.stringify(data));
    }
  } catch (ex) {}
};

export const base64UrlEncode = (str: string) => {
  return base64url(str);
};

export const refreshCurrentUserData = async (func?: any) => {
  const token = localStorage.getItem("token");
  if (!!token) {
    const { data } = await clientApi.get("/api/users/me");
    localStorage.setItem("currentUser", JSON.stringify(data));
    func && func(data);
  }
};

export const isExpired = (object: any) => {
  if (!object.expiresOn) {
    return false;
  }
  if (object.status === "draft") {
    return false;
  }
  if (new Date(object.expiresOn).getTime() < new Date().getTime()) {
    return true;
  }
  return false;
};

export const runCode = async (
  codeData: any,
  code: any,
  inputs?: any,
  timeLimit?: any,
  memLimit?: any
) => {
  let codeToExec: any = {
    code: code,
    testcases: inputs,
    ...(timeLimit && { timeLimit }),
    ...(memLimit && { memLimit }),
  };

  const { data } = await clientApi.post(
    `/api/questions/exectueCode?type=${codeData.language}`,
    codeToExec
  );
  return data;
};

export const getYouTube = (url: any) => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url?.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  } else {
    return "";
  }
};

export const copyText = (text: string) => {
  const selBox = document.createElement("textarea");
  selBox.style.position = "fixed";
  selBox.style.left = "0";
  selBox.style.top = "0";
  selBox.style.opacity = "0";
  selBox.value = text;
  document.body.appendChild(selBox);
  selBox.focus();
  selBox.select();
  document.execCommand("copy");
  document.body.removeChild(selBox);
};

export const getCodeLanguages = () => {
  return [
    {
      display: "C",
      language: "c",
    },
    {
      display: "C++",
      language: "cpp",
    },
    {
      display: "Java",
      language: "java",
    },
    {
      display: "Python",
      language: "python",
    },
    {
      display: "Ruby",
      language: "ruby",
    },
    {
      display: "Javascript",
      language: "javascript",
    },
  ];
};
export const testcaseToString = (testcases: any) => {
  const items = testcases.map((t) => {
    return { args: t.args, input: t.input, output: t.output };
  });

  return JSON.stringify(items);
};

export const codeOuputCompare = (correctOutput: any, userOutput: any) => {
  const allOutputs = correctOutput.split("@@@@@");
  return allOutputs.findIndex((co) => co.trim() == userOutput.trim()) > -1;
};
export const getAudioDuration = (url, cb) => {
  try {
    const player = new Audio(url);

    const onDurationChange = () => {
      if (player.duration != Infinity) {
        console.log("duration", player.duration);
        cb(player.duration);
        player.removeEventListener("durationchange", onDurationChange);
        player.remove();
      }
    };
    player.addEventListener("durationchange", onDurationChange, false);
    player.load();
    player.currentTime = 1e101; //fake big time
    player.volume = 0;
    player.play();
  } catch (ex) {
    cb(0);
  }
};

export const trimEnd = (text: string) => {
  if (!text) {
    return "";
  }
  if (typeof text.trimEnd === "function") {
    return text.trimEnd();
  } else if (typeof text.trimRight === "function") {
    return text.trimRight();
  } else {
    while (
      text.lastIndexOf(" ") === text.length - 1 ||
      text.lastIndexOf("\n") === text.length - 1
    ) {
      text = text.substring(0, text.length - 1);
    }
    return text;
  }
};

export const asyncConfirm = async (title, message, options = {}) => {
  return new Promise((resolve) => {
    alertify
      .confirm(
        title,
        message,
        () => resolve("OK"),
        () => resolve("Cancel")
      )
      .set(
        Object.assign(
          {},
          {
            closableByDimmer: false,
            defaultFocus: "cancel",
            frameless: false,
            closable: false,
          },
          options
        )
      );
  });
};

const alert = (message, title = "Message") => {
  alertify
    .alert("Message", message)
    .setHeader(title)
    .set({
      onclose: function () {
        alertify.alert().setHeader("Message");
      },
    });
};

export const isValidEmail = (email) => {
  const re =
    /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
  if (re.test(email)) {
    const emailEnd = email.substring(email.length - 10, email.length);
    if (isNaN(emailEnd)) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
export const sortByName = (array) => {
  array?.sort((a, b) => a.name.localeCompare(b.name));
};

export const getPassword = () => {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  const string_length = 8;
  let randomPassword = "";
  for (let i = 0; i < string_length; i++) {
    const rnum = Math.floor(Math.random() * chars.length);
    randomPassword += chars.substring(rnum, rnum + 1);
  }
  const password = "p" + randomPassword + 0;
  return password;
};

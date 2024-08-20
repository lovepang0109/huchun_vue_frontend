import DOMPurify from "isomorphic-dompurify";
import jsPDF from "jspdf";

export const website = "https://newui.practiz.xyz";
const swearWordPath = "/assets/badwords/en.json";
export const codeLanguages: any[] = [
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

export const codemirrorOptions: any = {
  java: {
    mode: "text/x-java", // text/x-csrc (C), text/x-c++src (C++), text/x-java (Java) text/x-csharp
    fileExt: "java",
  },
  cpp: {
    mode: "text/x-csharp", // text/x-csrc (C), text/x-c++src (C++), text/x-java (Java) text/x-csharp
    fileExt: "cpp",
  },
  python: {
    mode: "text/x-python",
    fileExt: "py",
  },
  c: {
    mode: "text/x-c++src",
    fileExt: "c",
  },
  ruby: {
    mode: "text/x-ruby",
    fileExt: "ruby",
  },
  javascript: {
    mode: "text/javascript",
    fileExt: "js",
  },
};

export const accuracyCategory = [
  {
    label: "<50%",
    color: "#f15454",
  },
  {
    label: "50-75%",
    color: "#FF8000",
  },
  {
    label: "75-90%",
    color: "#08db62",
  },
  {
    label: ">=90%",
    color: "#107ebd",
  },
];

export const questionStatus = {
  CORRECT: 1,
  INCORRECT: 2,
  MISSED: 3,
  PENDING: 4,
  PARTIAL: 5,
};

export const download = (document: any, filename: any, href: string) => {
  const pom = document.createElement("a");
  pom.setAttribute("href", href);
  pom.setAttribute("download", filename);
  console.log(filename, "filemae");

  if (document.createEvent) {
    const event = document.createEvent("MouseEvents");
    event.initEvent("click", true, true);
    pom.dispatchEvent(event);
  } else {
    pom.click();
  }
};

export const deepCopy = (obj: any) => {
  if (!!obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  return;
};

export const localStorageIsEnabled = () => {
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

export const stringRepeat = (num: number, replace: string) => {
  return new Array(num + 1).join(replace);
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
    swearwords = JSON.parse(localStorage.getItem("localSwears")!);
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

export const coverMilisecondToTime = (millis: any, type: any, options: any) => {
  let seconds = 0;
  let minutes = 0;
  let hours = 0;
  let days = 0;
  let months = 0;
  let years = 0;
  if (type === "day") {
    seconds = Math.round((millis / 1000) % 60);
    minutes = Math.floor((millis / 60000) % 60);
    hours = Math.floor((millis / 3600000) % 24);
    days = Math.floor(millis / 3600000 / 24);
    months = 0;
    years = 0;
  } else if (type === "second") {
    seconds = Math.floor(millis / 1000);
    minutes = 0;
    hours = 0;
    days = 0;
    months = 0;
    years = 0;
  } else if (type === "minute") {
    if (options && options.fixed) {
      console.log("console");
      // seconds = (millis / 1000).toFixed(options.fixed);
    } else {
      seconds = Math.round((millis / 1000) % 60);
    }
    minutes = Math.floor(millis / 60000);
    hours = 0;
    days = 0;
    months = 0;
    years = 0;
  } else if (type === "hour") {
    seconds = Math.round((millis / 1000) % 60);
    minutes = Math.floor((millis / 60000) % 60);
    hours = Math.floor(millis / 3600000);
    days = 0;
    months = 0;
    years = 0;
  } else if (type === "month") {
    seconds = Math.round((millis / 1000) % 60);
    minutes = Math.floor((millis / 60000) % 60);
    hours = Math.floor((millis / 3600000) % 24);
    days = Math.floor((millis / 3600000 / 24) % 30);
    months = Math.floor(millis / 3600000 / 24 / 30);
    years = 0;
  } else if (type === "year") {
    seconds = Math.round((millis / 1000) % 60);
    minutes = Math.floor((millis / 60000) % 60);
    hours = Math.floor((millis / 3600000) % 24);
    days = Math.floor((millis / 3600000 / 24) % 30);
    months = Math.floor((millis / 3600000 / 24 / 30) % 12);
    years = Math.floor(millis / 3600000 / 24 / 365);
  }
  const secondsS = seconds < 2 ? "" : "s";
  const minutesS = minutes < 2 ? "" : "s";
  const hoursS = hours < 2 ? "" : "s";
  const daysS = days < 2 ? "" : "s";
  const monthsS = months < 2 ? "" : "s";
  const yearsS = years < 2 ? "" : "s";
  return {
    seconds: seconds,
    secondsS: secondsS,
    minutes: minutes,
    minutesS: minutesS,
    hours: hours,
    hoursS: hoursS,
    days: days,
    daysS: daysS,
    months: months,
    monthsS: monthsS,
    years: years,
    yearsS: yearsS,
  };
};

export const serialize = (obj: any) => {
  if (!obj) {
    return "";
  }
  let str = [];
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  }
  return str.join("&");
};

export const reArrangeAnswers = (arr: any) => {
  let array = arr;
  if (array != null) {
    const lastIdx = array.length - 1;
    array.forEach((value: any, key: number) => {
      const answer =
        value.answerTextArray && value.answerTextArray[0]
          ? value.answerTextArray[0]
          : value.answerText;
      let text = String(answer).replace(/<[^>]+>/gm, "");
      text = text.toUpperCase().trim();
      if (text === "ALL OF THE ABOVE") {
        array.splice(key, 0, array.splice(lastIdx, 1)[0]);
      } else if (text === "NONE OF THE ABOVE") {
        array.splice(key, 0, array.splice(lastIdx, 1)[0]);
      } else if (text === "NONE OF THESE") {
        array.splice(key, 0, array.splice(lastIdx, 1)[0]);
      } else if (text === "ALL OF THESE") {
        array.splice(key, 0, array.splice(lastIdx, 1)[0]);
      }
    });
  }
  return arr;
};

export const codeOuputCompare = (correctOutput: any, userOutput: any) => {
  const allOutputs = correctOutput.split("@@@@@");
  return allOutputs.findIndex((co: any) => co.trim() == userOutput.trim()) > -1;
};

export const saveBlobFromResponse = ({ fileName, blob }: any) => {
  const link = document.createElement("a");
  const url = window.URL.createObjectURL(
    new Blob([blob], { type: "application/pdf" })
  );
  link.href = url;
  link.target = "_blank";
  if (fileName) {
    link.download = fileName;
  }
  document.body.append(link);
  console.log(link);
  link.click();

  window.addEventListener(
    "focus",
    function (e) {
      URL.revokeObjectURL(link.href);
    },
    { once: true }
  );
};

export const getFileNameFromResponse = (response: any) => {
  const contentDispositionHeader = response.headers.get("content-disposition");
  if (contentDispositionHeader) {
    const result = contentDispositionHeader.split(";")[1].trim().split("=")[1];
    return result.replace(/"/g, "");
  }
  return "";
};

export const round = (num: number, fractionDigits: any) => {
  fractionDigits = fractionDigits ? fractionDigits * 10 : 1;
  return Math.round(num * fractionDigits) / fractionDigits;
};

export const jsonToCsv = (data: any, fileName: string) => {
  let csvContent = "data:text/csv;charset=utf-8,";
  data.forEach((infoArray: any, index: number) => {
    const dataArray: any = [];
    infoArray.forEach((entry: any) => {
      if (entry != undefined && isNaN(entry)) {
        dataArray.push(entry.toString().replace(",", ""));
      } else {
        dataArray.push(entry);
      }
    });
    const dataString = dataArray.join(",");
    csvContent += index < data.length ? dataString + "\n" : dataString;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  document.body.appendChild(link); // Required for FF
  link.click();
  document.body.removeChild(link);
};

export const getCodeLanguages = (): any[] => {
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

export const generateCoupon = () => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ";
  const string_length = 8;
  let coupon = "";
  for (let i = 0; i < string_length; i++) {
    const rnum = Math.floor(Math.random() * chars.length);
    coupon += chars.substring(rnum, rnum + 1);
  }
  return coupon;
};

import moment from "moment";
import { coverMilisecondToTime } from "./common";

export const replaceUserAnswer = (question: any, mode: string) => {
  let input = question.questionText;
  const regex = /\{{([^}]+)\}}/gm;
  let m = null;
  let idx = 0;

  while ((m = regex.exec(input)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    const answer: any = m[0];
    let userAnswer: any = "";
    let userAns: any = "";
    let userAnswerLength = 55 + "px";
    if (question.userAnswers && question.userAnswers.length > 0) {
      userAnswer = question.userAnswers[idx].answerText;
      if (question.userAnswers[idx].answerText) {
        userAns = question.userAnswers[idx].answerText.length;
        userAnswerLength = userAns * 12 + 10 + "px";
      }
    }

    const textId = question.answers[idx]._id;
    const anslength = question.answers[idx].answerText.length;
    const textwidth = anslength * 10 + 10 + "px";

    if (mode == "review") {
      input = input.replace(
        answer,
        ' <input style="width:' +
          userAnswerLength +
          ';text-decoration:line-through;" disabled="true" class="fib-answer" type="text" id="' +
          textId +
          '" value="' +
          userAnswer +
          '"/><input style="width:' +
          textwidth +
          ';" disabled="true" class="fib-answer" type="text" value="' +
          m[1] +
          '"/>'
      );
    } else {
      input = input.replace(
        answer,
        '  <input style="width:' +
          userAnswerLength +
          ';" disabled="true" class="fib-answer" type="text" id="' +
          textId +
          '" value="' +
          userAnswer +
          '"/>'
      );
    }
    idx++;
  }

  return input;
};

export const replaceQuestionText = (
  question: any,
  previewMode: any,
  hideAnswer?: boolean
) => {
  let input = question.questionText;

  if (question.category == "fib" && !!previewMode) {
    const regex = /\{{([^}]+)\}}/gm;
    let m = null;
    let idx = 0;

    while ((m = regex.exec(input)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      const answer = m[0];
      let textId = "";
      if (question.answers.length > 0) {
        textId = question.answers[idx]._id;
      }
      const anslength = m[0].length;

      const textwidth = anslength * 12 + 10 + "px";

      input = input.replace(
        answer,
        ' <input style="width:' +
          textwidth +
          '" disabled="true" class="fib-answer text-center" type="text" id="' +
          textId +
          '" value="' +
          (hideAnswer ? "" : m[1]) +
          '"/>'
      );
      idx++;
    }
  }

  return input;
};

export const round = (value: any) => {
  return !isNaN(value) ? Math.round(value) : value;
};

export const secondsToDateTime = (second: any, type?: any, fixed?: any) => {
  var defaultType = "minute";
  if (type) {
    defaultType = type;
  }
  let fix = "";
  if (fixed) {
    fix = fixed;
  }
  var string = "";
  const date = coverMilisecondToTime(second * 1000, defaultType, {
    fixed: fix,
  });
  string = date.seconds + " sec" + date.secondsS;
  if (date.minutes > 0) {
    string = date.minutes + " min" + date.minutesS + " " + string;
  }
  return string;
};

export const decimal = (input: any, places: number) => {
  if (!input) {
    return 0;
  }
  return !isNaN(input) ? parseFloat(input).toFixed(places) : input;
};

export const date = (value: any, dateType: string) => {
  if (dateType === "mediumDate") {
    let d = new Date(value).toDateString();
    return d.slice(d.indexOf(" "));
  } else if (dateType === "medium") {
    let d = new Date(value).toDateString();
    let t = new Date(value).toTimeString();
    return d.slice(d.indexOf(" ")) + " " + t.split(" ")[0];
  } else {
    const year = new Date(value).getFullYear();
    const month = new Date(value).getMonth() + 1;
    const day = new Date(value).getDate();
    const hour = new Date(value).getHours();
    const minutes = new Date(value).getMinutes();
    const second = new Date(value).getSeconds();
    if (dateType === "dd/MM") {
      return `${day}/${month}`;
    }
    if (dateType === "yyyy") {
      return year;
    }
    if (dateType === "dd/MM/yy") {
      return `${day}/${month}/${year}`;
    }
    if (dateType === "dd-MM-yyyy, hh:mma") {
      return `${day}-${month}-${year}, ${hour}:${minutes}`;
    }
  }
};

export const fromNow = (string: any, args?: any) => {
  return string !== undefined && string
    ? moment(string).fromNow(args == "true")
    : "";
};

export const millisecondsToTime = (time: any, args?: any) => {
  if (args == "short") {
    if (time == 0) {
      return "0 sec";
    }
    time = Math.floor(time / 1000);
    if (time == 0) {
      return "1 sec";
    }

    const hours = Math.floor(time / 60 / 60);
    const mins = Math.floor(time / 60);
    const secs = time % 60;

    if (hours > 0) {
      return hours + " hrs";
    }

    if (mins == 0) {
      return secs + " secs";
    }

    if (secs == 0) {
      return mins + " mins";
    }

    return mins + " mins " + secs + " secs";
  } else {
    const toFormat = moment()
      .utcOffset(0)
      .set({ h: 0, m: 0, s: 0, ms: 0 })
      .add(time, "ms");
    return toFormat.format("HH:mm:ss");
  }
};

export const getAvgTime = (data: any) => {
  var avg = 0;
  if (data && data.totalTime > 0) {
    if (data.QA) {
      if (data.QA.length > 0) {
        avg = data.totalTime / data.QA.length;
      }
    }
  }
  return avg;
};

export const numberToAlpha = (n: any) => {
  let string = "";

  switch (n.toString()) {
    case 0:
    case "0":
      string = "A";
      break;
    case 1:
    case "1":
      string = "B";
      break;
    case 2:
    case "2":
      string = "C";
      break;
    case 3:
    case "3":
      string = "D";
      break;
    case 4:
    case "4":
      string = "E";
      break;
    case 5:
    case "5":
      string = "F";
      break;
    case 6:
    case "6":
      string = "G";
      break;
  }
  return string;
};

export const formatQuestion = (url: string, value?: string) => {
  if (value && url) {
    let app = url;
    if (app.substring(app.length - 1) === "/") {
      app = app.substring(0, app.length - 1);
    }
    const prefix = '"/uploads';
    const replaceText = '"' + app + "/uploads";
    if (value.indexOf(prefix) > -1) {
      value = value.replace(/"\/uploads/gi, replaceText);
    }
    return value;
  }
};

export const ucFirst = (string: any) => {
  return string !== undefined && string
    ? string.charAt(0).toUpperCase() + string.slice(1)
    : "";
};

export const avatar = (user: any, thumb?: any) => {
  if (!user) {
    return "/assets/images/defaultProfile.png";
  }

  let defaultImg = "/assets/images/defaultProfile.png";
  if (!!user?.info?.gender) {
    switch (user.info.gender) {
      case "male":
        defaultImg = "/assets/images/ma-logo-20.png";
        break;
      case "female":
        defaultImg = "/assets/images/fe-logo-20.png";
        break;
      default:
        defaultImg = "/assets/images/defaultProfile.png";
        break;
    }
  }
  if (
    (!user?.info?.avatarUrl || !Object.keys(user?.info?.avatarUrl).length) &&
    (!user?.info?.avatar || !user?.info?.avatar?.fileUrl)
  ) {
    if (user?.info?.provider === "local") {
      return defaultImg;
    }
    if (
      user?.info?.provider === "google" &&
      user?.info?.google &&
      user?.info?.google.imageUrl
    ) {
      return user.info.google.imageUrl;
    }
    if (
      user?.info?.provider === "facebook" &&
      user?.info?.facebook &&
      user?.info?.facebook.avatar
    ) {
      return user.info.facebook.avatar;
    }
    return defaultImg;
  }

  if (user?.info?.avatarUrl) {
    const defaultURL = user.info.avatarUrl || defaultImg;
    switch (thumb) {
      case "sm":
        if (!user.info.avatarUrlSM) {
          return defaultURL;
        }
        return user.info.avatarUrlSM;
      case "md":
        if (!user.info.avatarUrlMD) {
          return defaultURL;
        }
        return user.info.avatarUrlMD;
      default:
        return user.info.avatarUrl;
    }
  }

  if (user?.info?.avatar) {
    return user?.info?.avatar?.fileUrl || defaultImg;
  }
};

export const limitTo = (value: any, limit: number, begin?: number) => {
  // let trail = '...';
  const sIdx = begin ? begin : 0;
  // return value.length > limit ? value.substring(sIdx, limit) : value;

  if (Array.isArray(value)) {
    return value.slice(sIdx, sIdx + limit);
  } else {
    return value.toString().substring(sIdx, limit);
  }
};

export const appendS = (num: any, args?: any) => {
  if (!num || num === 0) {
    return "";
  } else {
    if (args == "Quiz") {
      return num == 1 ? num + " " + args : num + " " + args + "zes";
    }
    return num == 1 ? num + " " + args : num + " " + args + "s";
  }
};

export const militoHour = (data: number, lessThanOne?: boolean) => {
  if (!data) {
    return "0";
  }
  const hour = data / (60 * 60 * 1000);

  if (lessThanOne && hour < 1) {
    return " < 1 ";
  }
  return hour.toFixed(0);
};

export const numberToK = (value: any) => {
  if (typeof value === "string") return value;
  if (!value) {
    return "0";
  }
  if (value.toString().length >= 4) {
    return Math.round(Number(value) / 1000) + "k";
  } else {
    return value;
  }
};

export const currencySymbol = (
  value: any,
  currencyCode?: string,
  revert?: boolean
) => {
  if (!currencyCode) {
    return value;
  }

  if (revert) {
    return value + getCurrencySymbol(currencyCode);
  } else {
    return getCurrencySymbol(currencyCode) + value;
  }
};

export const getCurrencySymbol = (currencyCode: any) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).formatToParts()[0].value;
  } catch (error) {
    console.error("Error getting currency symbol:", error);
    return "";
  }
};

export const arrayToString = (arr: any[], prop?: any) => {
  if (!arr) {
    return "";
  }
  if (!prop) {
    return arr.join(", ");
  }
  return arr.map((i) => i[prop]).join(", ");
};

export const elipsis = (string: any, count?: any, readMore?: boolean) => {
  if (string !== undefined && string) {
    if (readMore) {
      return string.length > count
        ? string.substring(0, count) + "..."
        : string;
    } else {
      return string;
    }
  } else {
    return "";
  }
};
export const transform = (time: any, args?: any): any => {
  if (args == "short") {
    if (time == 0) {
      return "0 sec";
    }
    time = Math.floor(time / 1000);
    if (time == 0) {
      return "1 sec";
    }

    const hours = Math.floor(time / 60 / 60);
    const mins = Math.floor(time / 60);
    const secs = time % 60;

    if (hours > 0) {
      return hours + " hrs";
    }

    if (mins == 0) {
      return secs + " secs";
    }

    if (secs == 0) {
      return mins + " mins";
    }

    return mins + " mins " + secs + " secs";
  } else {
    const toFormat = moment()
      .utcOffset(0)
      .set({ h: 0, m: 0, s: 0, ms: 0 })
      .add(time, "ms");
    return toFormat.format("HH:mm:ss");
  }
};
export const answerStatusToText = (status) => {
  switch (status) {
    case 1:
      return "correct";
    case 2:
      return "incorrect";
    case 3:
      return "";
    case 4:
      return "pending";
    case 5:
      return "partial";
    default:
      return "";
  }
};

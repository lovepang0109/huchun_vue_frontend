import alertify from "alertifyjs";

alertify.set("notifier", "position", "top-right");
alertify.set("alert", "title", "Message");
alertify.set("confirm", "title", "Message");

export const confirm = (msg: string) => {
  return new Promise<boolean>((resolve, reject) => {
    alertify.confirm(
      msg,
      (ok) => {
        resolve(true);
      },
      (cancel) => {
        resolve(false);
      }
    );
  });
};

export const alert = (title: string, msg: string) => {
  alertify.alert(title, msg);
};

export const success = (msg: string) => {
  alertify.success(msg);
};

export const error = (msg: string) => {
  alertify.error(msg);
};

export const warning = (msg: string) => {
  alertify.warning(msg);
};

import * as authSvc from "@/services/auth";
import * as socketSvc from "@/services/socket-service";
import { resolve } from "path";
import { Subject } from "rxjs";

const rooms: any = {};
const eventNotifier = new Subject<any>();
const messageObserver = new Subject<any>();

export const openChat = (id: string, name: any, avatar?: any) => {
  if (id.indexOf("class_") === -1) {
    invite(id);
  }
  // TODO: implement below feature
  // this.chatboxNotifier.next({ id, name, avatar })
};

export const invite = (userId: string) => {
  // TODO: integration websocket chat module
  // socketSvc.emit('chat.invite', userId)
};

export const getRoom = (locId, uid: string, name: string) => {
  return new Promise((resolve, reject) => {
    if (rooms[uid]) {
      return resolve(rooms[uid]);
    }

    uid = uid
      .replace(authSvc.userId() + "_", "")
      .replace("_" + authSvc.userId(), "");

    const query: any = { markRead: true, loc: locId };
    const isClass = uid.indexOf("class_") > -1;
    if (isClass) {
      query["class"] = uid.replace("class_", "");
    } else {
      query["user"] = uid;
    }

    socketSvc.emit("chat.get", query, (data: any) => {
      if (data.error) {
        return reject(data);
      }

      const cI = {
        uid: data.uid,
        name: name,
        messages: [],
      };

      const msg = data.msg;

      if (msg) {
        for (let i = 0; i < msg.length; i++) {
          const isOwner = msg[i].sender._id === authSvc.userId();
          if (!isClass && !isOwner) {
            cI.name = msg[i].sender.name;
          }
          cI.messages.push({
            isOwner: isOwner,
            canMerge: msg[i].canMerge,
            sender: msg[i].sender,
            name: msg[i].sender.name,
            time: msg[i].time,
            msg: msg[i].msg,
            type: msg[i].type,
            link: msg[i].link,
          });
        }
      }

      rooms[data.uid] = cI;
      resolve(cI);
      eventNotifier.next({ evt: "load.room", data: cI });
    });
  });
};

export const send = (
  id: string,
  message: string,
  type: string = "text",
  link: string = "",
  user: any
) => {
  if (message) {
    const room = rooms[id];
    // Replace this.common.replaceBadWords(message) with appropriate implementation
    message = message;

    // Replace with actual implementation
    const data: any = {
      id: id,
      msg: message,
      time: new Date(),
      type: type,
      sender: {
        _id: user?._id || "",
        name: user?.name || "",
        role: user?.role || "",
      },
    };

    if (type === "file" || type === "image") {
      data.link = link;
    }

    if (id.indexOf("class_") > -1) {
      data.toClass = true;
      data.class = id.replace("class_", "");
      data.className = room?.name || "";
    } else {
      data.user = id.replace(user?._id + "_", "").replace("_" + user?._id, "");
    }

    let canMerge = false;
    if (room.messages.length > 0) {
      let lastMsgIndex = room.messages.findIndex((msg) => !msg.canMerge);
      if (lastMsgIndex > -1) {
        const lastMsg = room.messages[lastMsgIndex];
        if (lastMsg.isOwner) {
          const diff =
            Math.abs(data.time.getTime() - new Date(lastMsg.time).getTime()) /
            1000;
          if (diff < 60) {
            canMerge = true;
          }
        }
      }
    }
    data.canMerge = canMerge;

    // Replace this.socketSvc.emit with actual implementation
    socketSvc.emit("new.message", data, user);

    message = "";
    room.messages.push({
      isOwner: true,
      canMerge: canMerge,
      sender: data.sender,
      time: data.time,
      msg: data.msg,
      type: type,
      link: data.link,
    });

    // Replace this.messageObserver.next with actual implementation
    messageObserver.next(room);
  }
};
export const message$ = messageObserver.asObservable();

export const userOnline = (userId: any) => {
  return new Promise((resolve, reject) => {
    socketSvc.emit("user.isOnline", userId, (isOnline: any) => {
      resolve(isOnline);
    });
  });
};

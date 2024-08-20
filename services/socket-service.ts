import { Socket } from "socket-io";
import {
  BehaviorSubject,
  filter,
  lastValueFrom,
  Subject,
  Subscription,
  take,
} from "rxjs";
import * as authSvc from "@/services/auth";

let soc: Socket;
const socketValue: BehaviorSubject<Socket> = new BehaviorSubject<Socket>(null);
let isConnected: boolean;
const isDisconnected = true;
const connecting = false;
const handlerCached: any = {};
let user;

export const getSocket = () => {
  //TODO implement logice
  return lastValueFrom(
    socketValue.pipe(
      filter((x) => !!x),
      take(1)
    )
  );
};
export const emit = async (eventName: string, ...args: any[]) => {
  if (!user) {
    return;
  }

  const socket = await getSocket();
  socket.emit(eventName, ...args);
};

export const on = async (
  eventName: string,
  callback: Function,
  uid?: string
) => {
  if (!user) {
    return;
  }

  const socket = await getSocket();
  socket.on(eventName, callback);
  if (uid) {
    if (!handlerCached[uid]) {
      handlerCached[uid] = [];
    }
    handlerCached[uid].push({
      e: eventName,
      c: callback,
    });
  }
};

export const off = async (uid: string) => {
  if (!user) {
    return;
  }

  if (handlerCached[uid]) {
    const socket = await getSocket();
    for (const cb of handlerCached[uid]) {
      socket.removeListener(cb.e, cb.c);
    }
  }
};

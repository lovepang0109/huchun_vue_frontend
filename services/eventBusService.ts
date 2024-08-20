import { map, filter } from "rxjs/operators";
import { Subject, Observable } from "rxjs";

let bus_val = new Subject<{ event: string; data: any }>();

export const emit = (event: string, data?: any) => {
  bus_val.next({ event: event, data: data });
};

export const listen = (event: string): Observable<any> => {
  return bus_val
    .asObservable()
    .pipe(
      filter((item) => {
        return item.event === event;
      })
    )
    .pipe(
      map((item) => {
        return item.data;
      })
    );
};

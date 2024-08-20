import { fromNow } from "@/lib/pipe";
import moment from "moment";

export function TimeFormat({ date }: { date: any }) {
  return (
    <>
      {moment(date).format('MMM D, YYYY')} &nbsp;
      {/* ({moment(new Date()).diff(moment(date), 'm') < 1 ? (
        <>
          {"in a few seconds"}
        </>
      ) : (
        <>
          {moment(new Date()).diff(moment(date), 'h') < 1 ? (
            <>
              {"an hour ago"}
            </>
          ) : (
            <>
              {moment(new Date()).diff(moment(date), 'h') < 24 ? (
                <>
                  {moment(new Date()).diff(moment(date), 'h') == 0 ? 1 : moment(new Date()).diff(moment(date), 'h')} {moment(new Date()).diff(moment(date), 'h') > 1 ? 'hours ago' : 'hour ago'}
                </>
              ) : (
                <>
                  {moment(new Date()).diff(moment(date), 'd') < 30 ? (
                    <>
                      {moment(new Date()).diff(moment(date), 'd') == 0 ? 1 : moment(new Date()).diff(moment(date), 'd')} {moment(new Date()).diff(moment(date), 'd') > 1 ? 'days ago' : 'day ago'}
                    </>
                  ) : (
                    <>
                      {moment(new Date()).diff(moment(date), 'M') == 0 ? 1 : moment(new Date()).diff(moment(date), 'M')} {moment(new Date()).diff(moment(date), 'M') > 1 ? 'months ago' : 'month ago'}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}) */}
      ({fromNow(date)})



    </>
  );
}
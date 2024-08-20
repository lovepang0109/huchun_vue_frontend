import moment from "moment";

export function GlobalDate({ date }: { date: any }) {
  return (
    <>
      {moment(date).format('MMM D, YYYY')}
    </>
  );
}
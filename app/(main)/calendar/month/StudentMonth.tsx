"use client"
import { useEffect, useState } from 'react';
// import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import clientApi, { uploadFile } from "@/lib/clientApi";
import alertify, { alert } from 'alertifyjs'
import { Calendar, Whisper, Popover, Badge } from 'rsuite';
import { toQueryString } from '@/lib/validator';


export default function CalendarMonthViewer() {
  const [monthName, setMonthName] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [viewEvents, setViewEvents] = useState([]);
  const [eventsByDay, setEventsByDay] = useState([]);
  const [loadedMonths, setLoadedMonth] = useState<any>({});
  const [calendarValue, setCalendarValue] = useState(new Date())

  useEffect(() => {
    setSelectedDay(new Date());
    getMonthName(new Date());
    getMonthEvents(new Date())
    getDayEvents(new Date())
  }, []);

  async function getMonthEvents(date: any) {
    const month = moment(date).year() + ' - ' + moment(date).month();
    if (loadedMonths[month]) {
      return; 
  }
    const monthStart = moment(date).startOf('month');
    const monthEnd = moment(date).endOf('month');
    const { data } = await clientApi.get(
      `/api/users/events${toQueryString(
        { timezoneOffset: (new Date()).getTimezoneOffset(), startDate: monthStart.toISOString(), endDate: monthEnd.toISOString() }
      )}`,
    )
    setLoadedMonth({...loadedMonths, month: data})
    setViewEvents(data)
    renderCell()
  }

  function preMonth() {
    const newDate = new Date(calendarValue);
    newDate.setMonth(newDate.getMonth() - 1);
    setCalendarValue(newDate);
    const select = moment(selectedDay).add(-1, 'months').toDate()
    setSelectedDay(select);
    getMonthName(select);
    getMonthEvents(select);
    getDayEvents(select)
  }

  function nextMonth() {
    const newDate = new Date(calendarValue);
    newDate.setMonth(newDate.getMonth() + 1);
    setCalendarValue(newDate);
    const select = moment(selectedDay).add(1, 'months').toDate()

    setSelectedDay(select);
    getMonthName(select);
    getMonthEvents(select);
    getDayEvents(select)

  }

  function selectDate(ev: any) {
    setSelectedDay(ev);
    getDayEvents(ev)
    getMonthName(ev);
    getMonthEvents(ev)
  }


  function getDayEvents(date: any) {
    let eventsByDay = viewEvents.filter((d: any) => {
      const sd = new Date((new Date(d.startDate)).setHours(0, 0, 0, 0))
      const ed = new Date((new Date(d.endDate)).setHours(23, 59, 59, 999))
      return date >= sd && date <= ed
    })
    setEventsByDay(eventsByDay)
  }

  function donothing() { }

  function getMonthName(date: any) {
    setMonthName(moment(date).format('MMMM'));
  }


  function renderCell(date?: any) {
    let events = viewEvents.filter((ev: any) => new Date(ev.startDate).getDate() == new Date(date).getDate() && new Date(ev.startDate).getMonth() == new Date(date).getMonth())
    // const list = getTodoList(date);
    const displayList = events.filter((item: any, index: number) => index < 4);

    if (events.length) {
      const moreCount = events.length - displayList.length;
      const moreItem = (
        <li>
          <Whisper
            placement="top"
            trigger="click"
            speaker={
              <Popover>
                {events.map((item: any, index: number) => (
                  <p key={index}>
                    <b>{item.startDate}</b> ~  <b>{item.endDate}</b> - {item.title}
                  </p>
                ))}
              </Popover>
            }
          >
            <a>{moreCount} more</a>
          </Whisper>
        </li>
      );

      return (
        <ul className="calendar-todo-list">
          <div className='d-flex '>
            {displayList.map((item: any, index) => {
              let color = 'yellow'
              switch (item.type) {
                case 'exam':
                  color = 'red'
                  break;
                case 'holidy':
                  color = 'blue'
                default:
                  break;
              }
              return (
                <li key={index}>
                  <Badge style={{ background: color }} />
                </li>
              )
            })}

          </div>
          {moreCount ? moreItem : null}
        </ul>
      );
    }

    return null;
  }


  return (
    <div className="calender-area dashboard-area mx-auto container">
      <div className="row">
        <div className="col-md-9">
          <div className="calender-area-top clearfix">
            <div className="select-month d-flex">
              <button className="btn p-0 mr-3 btn-prev" onClick={preMonth}>
                <figure>
                  <img src="/assets/images/icon-left-arr.png" alt="" />
                </figure>
              </button>

              <span>{monthName}</span>

              <button className="btn p-0 ml-3 btn-prev" onClick={nextMonth}>
                <figure>
                  <img src="/assets/images/icon-right-arr.png" alt="" />
                </figure>
              </button>
            </div>

            <ul className="nav">
              <li>
                <a className="active" onClick={donothing}>
                  Month
                </a>
              </li>
              <li>
                <a href="/calendar/week">Week</a>
              </li>
            </ul>
          </div>

          {/* Your calendar component here */}
          <Calendar bordered renderCell={renderCell} value={calendarValue} onSelect={selectDate} />
        </div>

        <div className="col-md-3">

          <div className="event-calender bg-white">
            <div className="title">
              <h4>{selectedDay.toDateString()}</h4>
            </div>
            <figure className="mx-auto">
              <img
                src="/assets/images/Womenday-rafiki1.png"
                alt=""
                className="mw-150px"
              />
            </figure>
            {
              eventsByDay.length > 0 ? (
                <div className="event-list">
                  {eventsByDay.map((e: any) => (
                    <div
                      key={e.id}
                      className={`event ${e.type === 'exam' ? 'purple' : ''} ${e.type === 'holiday' ? 'navyblue' : ''
                        }`}
                    >
                      <h4>{e.title}</h4>
                      {e.allDays ? (
                        <span>Full Day</span>
                      ) : (
                        <span>
                          {moment(e.startDate).format('h:mm a')} -{' '}
                          {moment(e.endDate).format('h:mm a')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div>

                  <div className="load-more mx-auto mt-2 text-center">
                    No Events To Show
                  </div>
                </div>
              )
            }

          </div>
        </div>
      </div>
    </div>
  );
}


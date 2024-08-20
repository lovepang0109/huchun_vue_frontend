"use client"
import { useEffect, useState, useRef } from 'react';
// import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import clientApi, { uploadFile } from "@/lib/clientApi";
import alertify, { alert } from 'alertifyjs'
import { Calendar, Whisper, Popover, Badge } from 'rsuite';
import { toQueryString } from '@/lib/validator';
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useParams, useRouter } from "next/navigation";


export default function CalendarWeekViewer() {

  const router = useRouter();

  const [monthName, setMonthName] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [events, setEvents] = useState<any>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>({});
  const [loadedMonths, setLoadedMonths] = useState<any>({});
  const calendarRef = useRef<any>(null);
  const [modalShow, setModalShow] = useState(false);

  useEffect(() => {
    setSelectedDay(new Date());
    getMonthName(new Date());
    getMonthEvents(new Date())
    
  }, []);


  async function getMonthEvents(date: any) {
    let month = moment(date).year() + ' - ' + moment(date).month()
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
    setLoadedMonths({ ...loadedMonths, month: data })


    setEvents(data.map((ev: any) => {
      let color = 'yellow'
      if (ev.type == 'exam') {
        color = 'red'
      } else if (ev.type == 'holiday') {
        color = 'blue'
      }
      return {
        start: new Date(ev.startDate),
        end: new Date(ev.endDate),
        title: ev.title,
        color: color,
        allDay: ev.allDays,
        meta: ev
      }
    }))
  }

  function onDateChanged(ev: any) {
    console.log(ev)
    let select = selectedDay
    if (ev === 'prev') {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
      select.setDate(select.getDate() - 7)
    } else {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
      select.setDate(select.getDate() + 7)

    }
    getMonthName(select);
    getMonthEvents(moment(select).startOf('week').toDate())
    getMonthEvents(moment(select).endOf('week').toDate())

  }

  function preMonth() {
    const calendarApi = calendarRef.current.getApi();
    const select = moment(selectedDay).add(-1, 'months').toDate()
    console.log(select)
    calendarApi.gotoDate(select);
    setSelectedDay(select);
    getMonthName(select);
    getMonthEvents(select);
  }

  function nextMonth() {
    const calendarApi = calendarRef.current.getApi();
    const select = moment(selectedDay).add(1, 'months').toDate()
    calendarApi.gotoDate(select);
    setSelectedDay(select);
    getMonthName(select);
    getMonthEvents(select);

  }


  function donothing() { }

  function getMonthName(date: any) {

    let m = moment(date)
    let ws = m.startOf('week').format('MMMM')
    let we = m.endOf('week').format('MMMM')
    setMonthName(ws == we ? ws : (ws + ' - ' + we));
  }

  function gotoEvent(event: any) {
    if (event.meta.type == 'exam') {
      if (event.meta.id) {
        router.push(`/student/assessments/${event.title}?id=${event.meta.id}`);
      } else {
        router.push(`/student/course/stage/${event.meta.courseID}?content=${event.meta.contentID}`);
      }
    } else if (event.meta.type == 'onlineSession') {
      if (event.meta.link) {
        window.open(event.meta.link, '_blank')
      } else {
        router.push(`/student/course/stage/${event.meta.courseID}?content=${event.meta.contentID}`);
      }
    }

  }

  function onEventClicked(ev: any) {
    console.log(ev.event)
    setSelectedEvent(ev)
    setModalShow(true)
  }


  return (
    <div className="calender-area dashboard-area mx-auto container">
      <div className='d-flex justify-content-between'>
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
              <a href="/calendar/month">
                Month
              </a>
            </li>
            <li>
              <a className="active" onClick={donothing}>Week</a>
            </li>
          </ul>
        </div>

        <div className="button-group">
          <ul className="nav px-0">
            <li className='cursor-pointer' onClick={() => onDateChanged('prev')}>
              <img src="/assets/images/angle-left-2.png" className='mr-4' alt="" />
            </li>

            <li className='cursor-pointer' onClick={() => onDateChanged('next')}>
              <img src="/assets/images/angle-right-2.png" alt="" />
            </li>
          </ul>
        </div>
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        dayHeaderFormat={{ weekday: 'long', month: 'short', day: 'numeric' }}
        events={events}
        nowIndicator
        dateClick={(e) => console.log(e.dateStr)}
        eventClick={(e) => {setSelectedEvent(e.event); setModalShow(true); console.log(e)}}
      />


      <Modal show={modalShow} onHide={() => setModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span>{moment(selectedEvent.start).format('MMM D, YYYY h:mm a')} - {moment(selectedEvent.end).format('hh:mm a')}</span>
          {
            selectedEvent?.meta?.courseName && <p>
              Course: {selectedEvent?.meta?.courseName}
            </p>
          }
         
          {
            selectedEvent?.meta?.type == 'onlineSession' || selectedEvent?.meta?.type == 'exam' && selectedEvent?.meta?.id &&
            <Button variant="primary" onClick={() => gotoEvent(selectedEvent)}>
              {selectedEvent?.meta?.type == 'onlineSession' ? 'Join' : 'View Details'}
            </Button>
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
            Close
          </Button>
      </Modal.Footer>
    </Modal>
    </div >
  );
}


import validator from 'validator'
import moment from 'moment'

export function validateUserId(userId: string) {
  if (!validator.isEmail(userId) && !validator.isMobilePhone(userId)) {
    return 'Invalid email or phone number'
  }
}

export function validatePassword(pw: string) {
  if (!validator.isLength(pw, { min: 8, max: 20 })) {
    return 'Password length must be within 8 and 20 chars'
  }

  let res = /(?=^.{8,20}$)((?=.*\d)(?=.*[A-Za-z])(?=.*[A-Za-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/
  if (!res.test(pw)) {
    return 'Invalid password'
  }
}

export function toQueryString(obj: any) {
  let query = ''
  if (obj) {
    const str = []
    for (const p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
      }
    }
    query = str.join('&')
  }

  if (query !== '') {
    query = '?' + query
  }

  return query
}

export function toPascalCase(str: string) {
  if (!!str) return str[0].toUpperCase() + str.slice(1).toLowerCase()
}

export function slugify(text: string, separator = '-') {
  if (!text) {
    return ''
  }
  text = text.toString().toLowerCase().trim()

  const sets = [
    { to: 'a', from: '[ÀÁÂÃÄÅÆĀĂĄẠẢẤẦẨẪẬẮẰẲẴẶ]' },
    { to: 'c', from: '[ÇĆĈČ]' },
    { to: 'd', from: '[ÐĎĐÞ]' },
    { to: 'e', from: '[ÈÉÊËĒĔĖĘĚẸẺẼẾỀỂỄỆ]' },
    { to: 'g', from: '[ĜĞĢǴ]' },
    { to: 'h', from: '[ĤḦ]' },
    { to: 'i', from: '[ÌÍÎÏĨĪĮİỈỊ]' },
    { to: 'j', from: '[Ĵ]' },
    { to: 'ij', from: '[Ĳ]' },
    { to: 'k', from: '[Ķ]' },
    { to: 'l', from: '[ĹĻĽŁ]' },
    { to: 'm', from: '[Ḿ]' },
    { to: 'n', from: '[ÑŃŅŇ]' },
    { to: 'o', from: '[ÒÓÔÕÖØŌŎŐỌỎỐỒỔỖỘỚỜỞỠỢǪǬƠ]' },
    { to: 'oe', from: '[Œ]' },
    { to: 'p', from: '[ṕ]' },
    { to: 'r', from: '[ŔŖŘ]' },
    { to: 's', from: '[ßŚŜŞŠ]' },
    { to: 't', from: '[ŢŤ]' },
    { to: 'u', from: '[ÙÚÛÜŨŪŬŮŰŲỤỦỨỪỬỮỰƯ]' },
    { to: 'w', from: '[ẂŴẀẄ]' },
    { to: 'x', from: '[ẍ]' },
    { to: 'y', from: '[ÝŶŸỲỴỶỸ]' },
    { to: 'z', from: '[ŹŻŽ]' },
    { to: '-', from: "[·/_,:;']" },
  ]

  sets.forEach(function (set) {
    text = text.replace(new RegExp(set.from, 'gi'), set.to)
  })

  text = text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text

  if (typeof separator !== 'undefined' && separator !== '-') {
    text = text.replace(/-/g, separator)
  }

  return text
}

export function randomColor() {
  return '#' + ((Math.random() * 0xffffff) << 0).toString(16)
}

export function handleExpired(object: any): boolean {
  if (!object.expiresOn) {
    return false
  }
  if (object.status === 'draft') {
    return false
  }
  if (new Date(object.expiresOn).getTime() < new Date().getTime()) {
    return true
  }
  return false
}

export function convertToMiliseconds(time: any, args?: any) {
  if (args == 'short') {
    if (time == 0) {
      return '0 sec'
    }
    time = Math.floor(time / 1000)
    if (time == 0) {
      return '1 sec'
    }

    const hours = Math.floor(time / 60 / 60)
    const mins = Math.floor(time / 60)
    const secs = time % 60

    if (hours > 0) {
      return hours + ' hrs'
    }

    if (mins == 0) {
      return secs + ' secs'
    }

    if (secs == 0) {
      return mins + ' mins'
    }

    return mins + ' mins ' + secs + ' secs'
  } else {
    const toFormat = moment()
      .utcOffset(0)
      .set({ h: 0, m: 0, s: 0, ms: 0 })
      .add(time, 'ms')
    return toFormat.format('HH:mm:ss')
  }
}

export const elipsisText = (string: any, count?: any, readMore?: boolean) => {
  if (string !== undefined && string) {
    if (readMore) {
      return string.length > count ? string.substring(0, count) + '...' : string
    } else {
      return string
    }
  } else {
    return ''
  }
}

export const numberToWord = (n: number) => {
  const words = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ]
  if (!!n) {
    return words[n][0].toUpperCase() + words[n].slice(1)
  }
  return ''
}

export const codeLanguageDisplay = (lang: string) => {
  switch (lang) {
    case 'java':
      return 'Java'
    case 'cpp':
      return 'C++'
    case 'python':
      return 'Python'
    case 'c':
      return 'C'
    case 'ruby':
      return 'Ruby'
    default:
      return lang
  }
}

export const shuffle = (a: number[]) => {
  let j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}

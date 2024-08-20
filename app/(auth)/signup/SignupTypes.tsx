export type FormDataType = {
  name?: string,
  role: string,
  month?: string,
  day?: string,
  year?: string,
  email?: string,
  password?: string
}
// Form Handling Type 
export type TargetValuesType = { name: string, value: string }
export type TargetType = { target: TargetValuesType }
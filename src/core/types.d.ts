export interface IUnauthenticatedRequests
  extends Omit<Request, "query" | "params" | "files"> {
  params: {
    [k: string]: number | string
  }
  query: {
    [k: string]: number | string | undefined | Date | boolean
  }

  files?: {
    [k: string]: UploadedFile | UploadedFile[] | undefined
  }
}
export interface IAuthenticatedRequest extends IUnauthenticatedRequests {
  id: string
  user: string
  email: string
  // isAdmin: boolean
  // role: "superAdmin" | "admin" | "operator"
  // rights?: {
  //   [key: string]: object | boolean
  //   $?: any
  // }
  // appRights?: {
  //   [k: string]: boolean | { [k: string]: boolean }
  // }
}

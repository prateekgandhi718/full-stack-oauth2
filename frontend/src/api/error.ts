export class ClientError extends Error {
    errors: string[]
    constructor(message: string | string[]) {
      if (!Array.isArray(message)) {
        super(message)
      } else {
        super()
      }
      if (Array.isArray(message)) {
        this.errors = message
      } else {
        this.errors = [message]
      }
      this.name = "ClientError"
    }
  }
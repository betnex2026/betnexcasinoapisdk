export class BetnexError extends Error {
  constructor(message = "Betnex Error", status = null, data = null) {
    super(message);

    this.name = "BetnexError";
    this.status = status;
    this.data = data;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BetnexError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      data: this.data,
    };
  }

  toString() {
    return `${this.name}: ${this.message}`;
  }
}

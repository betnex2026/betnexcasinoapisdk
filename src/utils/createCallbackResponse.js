export function createCallbackResponse({
  success = true,
  money = 0,
  msg = "Callback processed successfully",
  handle = true,
} = {}) {
  return {
    success,
    msg,
    handle,
    money: Number(money),
  };
}

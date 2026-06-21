export function calculateBalance(currentBalance, betAmount, winAmount) {
  return Number(currentBalance) - Number(betAmount) + Number(winAmount);
}

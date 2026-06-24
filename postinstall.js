#!/usr/bin/env node

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",

  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

const W = 62;

function pad(text, width) {
  const visibleLen = text.replace(/\x1b\[[0-9;]*m/g, "").length;
  return text + " ".repeat(Math.max(0, width - visibleLen));
}

function row(content = "", opts = {}) {
  const { center = false, indent = 2 } = opts;
  const stripped = content.replace(/\x1b\[[0-9;]*m/g, "");
  const inner = W - 2;
  let line;
  if (center) {
    const total = inner - stripped.length;
    const left = Math.floor(total / 2);
    const right = total - left;
    line = " ".repeat(left) + content + " ".repeat(right);
  } else {
    line = " ".repeat(indent) + pad(content, inner - indent);
  }
  console.error(`${c.cyan}║${c.reset}${line}${c.cyan}║${c.reset}`);
}

function divider(char = "─") {
  console.error(`${c.cyan}╠${"═".repeat(W)}╣${c.reset}`);
}

function blank() {
  row();
}

function section(label) {
  const inner = W - 2;
  const stripped = label.replace(/\x1b\[[0-9;]*m/g, "");
  const right = inner - 2 - stripped.length;
  console.error(
    `${c.cyan}╟─${c.reset}${label}${"─".repeat(Math.max(0, right))}${c.cyan}╢${
      c.reset
    }`
  );
}

// ── Top border ──────────────────────────────────────────────────────────────
console.error(`\n${c.cyan}╔${"═".repeat(W)}╗${c.reset}`);

blank();

// Brand line
row(
  `${c.bold}${c.yellow}  ✦  ${c.reset}` +
    `${c.bold}${c.white}BETNEX${c.reset}` +
    `${c.dim}${c.white} SDK${c.reset}` +
    `${c.bold}${c.yellow}  ✦${c.reset}`,
  { center: true }
);

row(
  `${c.dim}${c.cyan}@betnex/sdk${c.reset}` +
    `${c.dim}  ·  installed successfully${c.reset}`,
  { center: true }
);

blank();

// Thank-you message
row(
  `${c.green}✔${c.reset}  ${c.white}Thank you for installing ${c.bold}@betnex/sdk${c.reset}`,
  { indent: 3 }
);
row(`${c.dim}   Your gateway to the Betnex Casino API is ready.${c.reset}`, {
  indent: 3,
});

blank();

// ── Dashboard section ────────────────────────────────────────────────────────
section(`${c.bold}${c.cyan} DASHBOARD ${c.reset}${c.cyan}`);

blank();
row(
  `${c.dim}   🌐  ${c.reset}${c.bold}${c.cyan}https://casinoapi.betnex.co${c.reset}`,
  { indent: 0 }
);
blank();

// ── Support section ──────────────────────────────────────────────────────────
section(`${c.bold}${c.cyan} SUPPORT ${c.reset}${c.cyan}`);

blank();
row(
  `${c.dim}   📧  ${c.reset}${c.bold}${c.white}Production Access & Support${c.reset}`,
  { indent: 0 }
);
row(`${c.dim}       ${c.cyan}contact@betnex.co${c.reset}`, { indent: 0 });
blank();

// ── Imports section ──────────────────────────────────────────────────────────
section(`${c.bold}${c.cyan} IMPORTS ${c.reset}${c.cyan}`);

blank();

// ESM
row(`${c.dim}   // ESM (import)${c.reset}`, { indent: 0 });
row(
  `${c.magenta}   import${c.reset} ${c.dim}{${c.reset} ${c.white}Betnex${c.reset} ${c.dim}}${c.reset} ${c.magenta}from${c.reset} ${c.green}'@betnex/sdk'${c.reset}`,
  { indent: 0 }
);
blank();

// CommonJS
row(`${c.dim}   // CommonJS (require)${c.reset}`, { indent: 0 });
row(
  `${c.magenta}   const${c.reset} ${c.dim}{${c.reset} ${c.white}Betnex${c.reset} ${c.dim}}${c.reset} ${c.magenta}=${c.reset} ${c.cyan}require${c.reset}${c.dim}(${c.reset}${c.green}'@betnex/sdk'${c.reset}${c.dim})${c.reset}${c.dim};${c.reset}`,
  { indent: 0 }
);
blank();

// ── Footer ───────────────────────────────────────────────────────────────────
divider();

blank();
row(
  `${c.dim}Built with ${c.reset}${c.red}♥${c.reset}${c.dim}  ·  Happy Coding  ·  ${c.reset}${c.cyan}betnex.co${c.reset}`,
  { center: true }
);
blank();

// Bottom border
console.error(`${c.cyan}╚${"═".repeat(W)}╝${c.reset}\n`);

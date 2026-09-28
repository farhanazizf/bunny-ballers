const CDN = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.13/+esm';

function slug(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40) || 'kartu';
}

function fileBase(card, view) {
  const id = card.dataset.id || 'xxxx';
  const name = slug(card.dataset.name || 'pemain');
  const v = view === 'career' ? 'jejak' : `p${view}`;
  return `${id}-${name}-${v}`;
}

function downloadUrl(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

async function capture(card, type) {
  const lib = await import(CDN);
  const opts = {
    pixelRatio: 2,
    cacheBust: true,
    style: { transform: 'none' },
  };
  if (type === 'jpeg') {
    return lib.toJpeg(card, { ...opts, quality: 0.92, backgroundColor: '#0b0b0b' });
  }
  return lib.toPng(card, opts);
}

export async function downloadCard(card, type, view) {
  const url = await capture(card, type);
  const ext = type === 'jpeg' ? 'jpg' : 'png';
  downloadUrl(url, `${fileBase(card, view)}.${ext}`);
}

export async function downloadAll(cards, type, view, onStatus) {
  let i = 0;
  for (const card of cards) {
    i += 1;
    onStatus?.(`Mengunduh ${i}/${cards.length}`);
    await downloadCard(card, type, view);
    await new Promise((r) => setTimeout(r, 280));
  }
  onStatus?.('');
}

export function printCards(card) {
  if (card) {
    document.body.classList.add('print-one');
    card.classList.add('print-target');
  }
  const done = () => {
    document.body.classList.remove('print-one');
    document.querySelectorAll('.print-target').forEach((n) => n.classList.remove('print-target'));
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  window.print();
}

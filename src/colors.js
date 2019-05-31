import sha1 from 'hash.js/lib/hash/sha/1'

export default function (courseName) {
  const colors = [
    '#D32F2F',
    '#7B1FA2',
    '#303F9F',
    '#1976D2',
    '#689F38',
    '#FBC02D',
    '#FFA000',
    '#F57C00',
    '#E64A19',
    '#5D4037',
  ];
  return colors[parseInt(sha1().update(courseName).digest('hex').substr(0, 4), 16) % colors.length];
};
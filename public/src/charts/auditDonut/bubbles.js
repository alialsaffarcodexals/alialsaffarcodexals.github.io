export function generateFloatingBubbles(centerX, centerY, radius, startAngle, endAngle, color, count) {
  if (count === 0) return '';

  const bubbles = [];
  const bubbleCount = Math.min(count, 15);

  for (let i = 0; i < bubbleCount; i++) {
    const angle = startAngle + Math.random() * (endAngle - startAngle);
    const distance = radius * (0.9 + Math.random() * 0.1);
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    const bubbleRadius = 2 + Math.random() * 3;

    bubbles.push(`
      <circle cx="${x}" cy="${y}" r="${bubbleRadius}" fill="${color}" class="floating-bubble"
        style="opacity: 0.7; animation-delay: ${i * 0.2}s;">
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-4; 0,0" dur="3s" repeatCount="indefinite" />
      </circle>
    `);
  }

  return bubbles.join('');
}

export function generateCenterBubbles(centerX, centerY, maxRadius) {
  const bubbles = [];
  const bubbleCount = 5 + Math.floor(Math.random() * 3);

  for (let i = 0; i < bubbleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * maxRadius * 0.8;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    const bubbleRadius = 1.5 + Math.random() * 2;
    const color = i % 2 === 0 ? '#34d399' : '#f87171';

    bubbles.push(`
      <circle cx="${x}" cy="${y}" r="${bubbleRadius}" fill="${color}" class="floating-bubble"
        style="opacity: 0.5; animation-delay: ${i * 0.3}s;">
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-3; 0,0" dur="2.5s" repeatCount="indefinite" />
      </circle>
    `);
  }

  return bubbles.join('');
}

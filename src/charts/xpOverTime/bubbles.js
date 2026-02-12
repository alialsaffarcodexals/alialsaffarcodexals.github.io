/**
 * bubbles.js
 * Generates animated decorative SVG bubbles for the XP-over-time chart.
 */
export function generateAnimatedBubbles(points, scaleX, scaleY) {
  const bubbles = [];
  const totalPoints = points.length;

  for (let i = 0; i < totalPoints; i += Math.max(1, Math.floor(totalPoints / 8))) {
    const point = points[i];
    const cx = scaleX(point.x, i);
    const cy = scaleY(point.y);
    const radius = 6 + Math.random() * 4;

    bubbles.push(`
      <g class="floating-bubble-group" style="animation-delay: ${i * 0.3}s;">
        <circle cx="${cx}" cy="${cy}" r="${radius + 4}" fill="none" stroke="rgba(59, 130, 246, 0.2)" stroke-width="2">
          <animate attributeName="r" values="${radius + 2};${radius + 6};${radius + 2}" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="url(#bubbleGradient)" class="floating-bubble">
          <animateTransform attributeName="transform" type="translate"
            values="0,0; -2,-4; 0,0; 2,-4; 0,0" dur="4s" repeatCount="indefinite"
            calcMode="spline" keyTimes="0; 0.25; 0.5; 0.75; 1"
            keySplines="0.5 0 0.5 1; 0.5 0 0.5 1; 0.5 0 0.5 1; 0.5 0 0.5 1" />
        </circle>
        <circle cx="${cx - radius * 0.3}" cy="${cy - radius * 0.3}" r="${radius * 0.4}" fill="url(#innerBubbleGradient)" />
        <circle cx="${cx - radius * 0.2}" cy="${cy - radius * 0.2}" r="${radius * 0.15}" fill="#ffffff">
          <animate attributeName="opacity" values="0.6; 1; 0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
    `);
  }

  return bubbles.join('');
}

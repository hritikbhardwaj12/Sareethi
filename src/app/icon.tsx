import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#2E0229',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F59E0B',
          borderRadius: '9px',
          fontWeight: 'bold',
          fontFamily: 'serif',
          border: '1px solid #4A0A43',
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
